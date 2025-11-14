import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import { AIService } from '../common/ai.service';
import type {
  UserForFortune,
  FortuneData,
  AIFortuneResponse,
} from '@shared/types';

@Injectable()
export class FortunesService {
  private readonly logger = new Logger(FortunesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly braceletsService: BraceletsService,
    private readonly aiService: AIService,
  ) {}

  /**
   * 获取今日运势
   * @param userId 用户ID
   * @returns 今日运势数据
   */
  async getTodayFortune(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // 检查用户是否绑定了手链
    const isAuth = await this.checkUserAuth(userId);

    // 使用唯一索引进行快速查找
    const existingFortune = await this.prisma.dailyFortune.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      include: {
        recommendation: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            douyinUrl: true,
          },
        },
      },
    });

    if (existingFortune) {
      this.logger.log(`Found existing fortune for user ${userId} on ${today}`);
      return this.formatFortuneResponse(existingFortune, isAuth);
    }

    // 没有记录，生成新的运势
    this.logger.log(`Generating new fortune for user ${userId} on ${today}`);

    // 获取用户信息用于运势计算（只获取必要字段）
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        birthday: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成运势数据
    const fortuneData = await this.generateFortuneData(user, today, isAuth);

    // 获取商品推荐（访客版和完整版都需要显示）
    const recommendation = await this.getRecommendation(
      fortuneData.overallScore,
    );

    // 保存到数据库（使用辅助方法避免重复代码）
    const newFortune = await this.prisma.dailyFortune.create({
      data: {
        userId,
        date: today,
        recommendationId: recommendation?.id,
        ...this.prepareFortuneDataPayload(fortuneData),
      },
      include: {
        recommendation: true,
      },
    });

    return this.formatFortuneResponse(newFortune, isAuth);
  }

  /**
   * 重新生成今日运势
   * @param userId 用户ID
   * @returns 重新生成的运势数据
   */
  async regenerateTodayFortune(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const isAuth = await this.checkUserAuth(userId);

    if (!isAuth) {
      // 预览版用户不支持重新生成
      throw new Error('预览版用户不支持重新生成运势');
    }

    // 获取用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        birthday: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 重新生成运势数据
    const fortuneData = await this.generateFortuneData(user, today, isAuth);

    // 获取商品推荐（重新生成时也需要更新推荐）
    const recommendation = await this.getRecommendation(
      fortuneData.overallScore,
    );

    // 准备运势数据（使用辅助方法避免重复代码）
    const fortuneDataPayload = this.prepareFortuneDataPayload(fortuneData);

    // 更新或创建运势记录
    const fortune = await this.prisma.dailyFortune.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        ...fortuneDataPayload,
        recommendationId: recommendation?.id,
      },
      create: {
        userId,
        date: today,
        recommendationId: recommendation?.id,
        ...fortuneDataPayload,
      },
      include: {
        recommendation: true,
      },
    });

    this.logger.log(`Regenerated fortune for user ${userId} on ${today}`);
    return this.formatFortuneResponse(fortune, isAuth);
  }

  /**
   * 获取历史运势
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 历史运势列表
   */
  async getHistoryFortunes(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // 检查用户是否绑定了手链
    const isAuth = await this.checkUserAuth(userId);

    const [fortunes, total] = await Promise.all([
      this.prisma.dailyFortune.findMany({
        where: { userId },
        include: { recommendation: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dailyFortune.count({
        where: { userId },
      }),
    ]);

    // 计算是否还有更多数据
    const totalLoaded = page * limit;
    const hasMore = totalLoaded < total;

    return {
      fortunes: fortunes.map((fortune) =>
        this.formatFortuneResponse(fortune, isAuth),
      ),
      total,
      page,
      limit,
      hasMore,
    };
  }

  /**
   * 获取指定日期的运势
   * @param userId 用户ID
   * @param date 日期
   * @returns 运势数据
   */
  async getFortuneByDate(userId: string, date: string) {
    // 检查用户是否绑定了手链
    const isAuth = await this.checkUserAuth(userId);

    const fortune = await this.prisma.dailyFortune.findFirst({
      where: {
        userId,
        date,
      },
      include: {
        recommendation: true,
      },
    });

    if (!fortune) {
      throw new NotFoundException('该日期没有运势记录');
    }

    return this.formatFortuneResponse(fortune, isAuth);
  }

  /**
   * 获取运势统计信息
   * @param userId 用户ID
   * @returns 统计数据
   */
  async getFortuneStats(userId: string) {
    const fortunes = await this.prisma.dailyFortune.findMany({
      where: { userId },
      select: {
        overallScore: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    if (fortunes.length === 0) {
      return {
        totalDays: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        streakDays: 0,
      };
    }

    const scores = fortunes.map((f) => f.overallScore);
    const totalDays = fortunes.length;
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / totalDays,
    );
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // 计算连续天数（从今天开始往前算）
    const today = new Date().toISOString().split('T')[0];
    let streakDays = 0;
    const currentDate = new Date(today);

    for (let i = 0; i < fortunes.length; i++) {
      const checkDate = currentDate.toISOString().split('T')[0];
      const hasFortune = fortunes.some((f) => f.date === checkDate);

      if (hasFortune) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalDays,
      averageScore,
      bestScore,
      worstScore,
      streakDays,
    };
  }

  /**
   * 生成运势数据（AI优先，失败时使用降级方案并保存）
   * @param user 用户信息
   * @param date 日期
   * @param isAuth 是否已认证
   * @returns 运势数据
   */
  private async generateFortuneData(
    user: UserForFortune,
    date: string,
    isAuth: boolean,
  ): Promise<Omit<FortuneData, 'isAuth' | 'recommendation'>> {
    if (!isAuth) {
      // 预览版：使用固定模板
      const previewData = this.generatePreviewFortune();
      return {
        date,
        ...previewData,
      };
    }

    // 完整版：尝试AI生成
    const aiResult = await this.tryAIGeneration(user, date);
    if (aiResult) {
      this.logger.log('Using AI-generated fortune');
      return {
        date,
        ...aiResult,
      };
    }

    // AI失败：使用降级方案（固定模板）并保存到数据库
    // 这样用户可以在历史记录中看到运势，而不是空白
    this.logger.warn('AI generation failed, using fallback fortune template');
    const fallbackData = this.generateFallbackFortune();
    return {
      date,
      ...fallbackData,
    };
  }

  /**
   * 尝试AI生成运势（70秒超时）
   * @param user 用户信息
   * @param date 日期
   * @returns AI生成的运势数据或null
   */
  private async tryAIGeneration(
    user: UserForFortune,
    date: string,
  ): Promise<Omit<FortuneData, 'date' | 'isAuth' | 'recommendation'> | null> {
    if (!this.aiService.isEnabled()) {
      this.logger.log('AI service disabled');
      return null;
    }

    try {
      // 构建AI输入数据
      const promptData = {
        birthday: user.birthday || undefined,
        date: date,
      };

      // 设置110秒超时（确保AI有足够时间生成，留10秒缓冲）
      const aiResult = (await Promise.race([
        this.aiService.generateFortune(promptData),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout after 110s')), 110000),
        ),
      ])) as { content?: string; duration?: number } | null;

      if (aiResult?.content) {
        const parsedResult = this.parseAIResponse(aiResult.content);
        if (parsedResult) {
          this.logger.log(
            `AI generation successful: ${aiResult.duration || 'unknown'}ms`,
          );
          return this.enrichFortuneData(parsedResult);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`AI generation failed: ${errorMessage}`);
    }

    return null;
  }

  /**
   * 解析AI响应内容
   * @param content AI返回的内容
   * @returns 解析后的运势数据或null
   */
  private parseAIResponse(content: string): AIFortuneResponse | null {
    // 优先尝试文本解析（符合prompt要求的格式）
    const textResult = this.parseTextResponse(content);
    if (textResult) {
      this.logger.log('Successfully parsed AI response as text format');
      return textResult;
    }

    // 如果文本解析失败，尝试JSON格式作为fallback
    try {
      this.logger.warn('Text parsing failed, trying JSON format as fallback');
      const parsed = JSON.parse(content);

      // 验证必要字段
      if (this.validateAIResponse(parsed)) {
        this.logger.log('Successfully parsed AI response as JSON format');
        return parsed;
      }
    } catch (error) {
      this.logger.error('Both text and JSON parsing failed', error);
    }

    return null;
  }

  /**
   * 验证AI响应数据（新版：验证详细运势字段）
   * @param data AI响应数据
   * @returns 是否有效
   */
  private validateAIResponse(data: unknown): data is AIFortuneResponse {
    if (data === null || typeof data !== 'object') {
      return false;
    }

    const response = data as any;

    // 验证综合分数
    if (
      typeof response.overallScore !== 'number' ||
      response.overallScore < 60 ||
      response.overallScore > 100
    ) {
      return false;
    }

    // 验证星数评分（可选，但如果存在必须是有效数字）
    if (
      response.careerStars !== undefined &&
      (typeof response.careerStars !== 'number' ||
        response.careerStars < 0 ||
        response.careerStars > 5)
    ) {
      return false;
    }

    if (
      response.wealthStars !== undefined &&
      (typeof response.wealthStars !== 'number' ||
        response.wealthStars < 0 ||
        response.wealthStars > 5)
    ) {
      return false;
    }

    if (
      response.loveStars !== undefined &&
      (typeof response.loveStars !== 'number' ||
        response.loveStars < 0 ||
        response.loveStars > 5)
    ) {
      return false;
    }

    // 至少需要有summary或comment之一
    if (!response.summary && !response.comment) {
      return false;
    }

    return true;
  }

  /**
   * 将星数转换为0-100分数
   * @param stars 星数（0-5）
   * @returns 分数（0-100）
   */
  private convertStarsToScore(stars: number = 3): number {
    return Math.round((stars / 5) * 100);
  }

  /**
   * 解析文本格式的AI响应（新版详细格式）
   * @param content 文本内容
   * @returns 解析后的数据或null
   */
  private parseTextResponse(content: string): AIFortuneResponse | null {
    try {
      const result: AIFortuneResponse = {
        overallScore: 75,
        careerStars: 3,
        wealthStars: 3,
        loveStars: 3,
      };

      // 提取星盘分析
      const astroMatch = content.match(
        /星盘分析[：:]\s*\n([\s\S]*?)(?=\n\n|事业运分析|$)/,
      );
      if (astroMatch) {
        result.astroAnalysis = astroMatch[1].trim();
      }

      // 提取事业运分析
      const careerAnalysisMatch = content.match(
        /事业运分析[：:]\s*\n([\s\S]*?)(?=\n\n|财富运分析|$)/,
      );
      if (careerAnalysisMatch) {
        result.careerAnalysis = careerAnalysisMatch[1].trim();
      }

      // 提取财富运分析
      const wealthAnalysisMatch = content.match(
        /财富运分析[：:]\s*\n([\s\S]*?)(?=\n\n|爱情运分析|$)/,
      );
      if (wealthAnalysisMatch) {
        result.wealthAnalysis = wealthAnalysisMatch[1].trim();
      }

      // 提取爱情运分析
      const loveAnalysisMatch = content.match(
        /爱情运分析[：:]\s*\n([\s\S]*?)(?=\n\n|总结和建议|$)/,
      );
      if (loveAnalysisMatch) {
        result.loveAnalysis = loveAnalysisMatch[1].trim();
      }

      // 提取星数评分（支持小数）
      const careerStarsMatch = content.match(/事业运星数[：:]\s*([\d.]+)/);
      if (careerStarsMatch) {
        result.careerStars = parseFloat(careerStarsMatch[1]);
      }

      const wealthStarsMatch = content.match(/财富运星数[：:]\s*([\d.]+)/);
      if (wealthStarsMatch) {
        result.wealthStars = parseFloat(wealthStarsMatch[1]);
      }

      const loveStarsMatch = content.match(/爱情运星数[：:]\s*([\d.]+)/);
      if (loveStarsMatch) {
        result.loveStars = parseFloat(loveStarsMatch[1]);
      }

      // 提取建议事项
      const suggestionMatch = content.match(
        /建议事项[：:]\s*\n([\s\S]*?)(?=\n避免事项|$)/,
      );
      if (suggestionMatch) {
        result.suggestion = suggestionMatch[1].trim();
      }

      // 提取避免事项
      const avoidanceMatch = content.match(
        /避免事项[：:]\s*\n([\s\S]*?)(?=\n\n|今日宜|$)/,
      );
      if (avoidanceMatch) {
        result.avoidance = avoidanceMatch[1].trim();
      }

      // 提取今日宜
      const suitableMatch = content.match(/今日宜[：:]\s*([^\n]+)/);
      if (suitableMatch) {
        result.suitable = suitableMatch[1].trim();
      }

      // 提取今日宜详细说明
      const suitableDetailMatch = content.match(
        /今日宜详细说明[：:]\s*([^\n]+)/,
      );
      if (suitableDetailMatch) {
        result.suitableDetail = suitableDetailMatch[1].trim();
      }

      // 提取今日喜用
      const unsuitableMatch = content.match(/今日喜用[：:]\s*([^\n]+)/);
      if (unsuitableMatch) {
        result.unsuitable = unsuitableMatch[1].trim();
      }

      // 提取今日喜用详细说明
      const unsuitableDetailMatch = content.match(
        /今日喜用详细说明[：:]\s*([^\n]+)/,
      );
      if (unsuitableDetailMatch) {
        result.unsuitableDetail = unsuitableDetailMatch[1].trim();
      }

      // 提取幸运色
      const luckyColorMatch = content.match(/今日幸运色[：:]\s*([^\n]+)/);
      if (luckyColorMatch) {
        result.luckyColor = luckyColorMatch[1].trim();
      }

      // 提取幸运数字
      const luckyNumberMatch = content.match(/今日幸运数字[：:]\s*(\d+)/);
      if (luckyNumberMatch) {
        result.luckyNumber = parseInt(luckyNumberMatch[1]);
      }

      // 提取幸运元素详细说明
      const luckyElementDetailMatch = content.match(
        /幸运元素详细说明[：:]\s*([^\n]+)/,
      );
      if (luckyElementDetailMatch) {
        result.luckyElementDetail = luckyElementDetailMatch[1].trim();
      }

      // 提取综合分数
      const overallScoreMatch = content.match(/今日运势综合数字[：:]\s*(\d+)/);
      if (overallScoreMatch) {
        result.overallScore = parseInt(overallScoreMatch[1]);
      }

      // 提取今日简要总结
      const summaryMatch = content.match(/今日简要总结[：:]\s*([^\n]+)/);
      if (summaryMatch) {
        result.summary = summaryMatch[1].trim();
      }

      // 验证是否解析出了有效内容
      if (result.summary || result.astroAnalysis || result.overallScore) {
        return result;
      }
    } catch (error) {
      this.logger.warn('Failed to parse text response:', error);
    }

    return null;
  }

  /**
   * 丰富运势数据（新版：直接使用AI返回的数据，不再随机生成）
   * @param aiData AI生成的基础数据
   * @returns 完整的运势数据
   */
  private enrichFortuneData(
    aiData: AIFortuneResponse,
  ): Omit<FortuneData, 'date' | 'isAuth' | 'recommendation'> {
    // 默认值
    const defaultComment = '今日运势平稳，适合稳步推进各项计划。';
    const defaultCareerStars = 3;
    const defaultWealthStars = 3;
    const defaultLoveStars = 3;

    // 获取星数（优先使用AI返回的值）
    const careerStars = aiData.careerStars ?? defaultCareerStars;
    const wealthStars = aiData.wealthStars ?? defaultWealthStars;
    const loveStars = aiData.loveStars ?? defaultLoveStars;

    return {
      // 综合分数
      overallScore: aiData.overallScore || 75,

      // 详细分析内容
      summary: aiData.summary || aiData.comment || defaultComment,
      astroAnalysis: aiData.astroAnalysis,
      careerAnalysis: aiData.careerAnalysis,
      wealthAnalysis: aiData.wealthAnalysis,
      loveAnalysis: aiData.loveAnalysis,

      // 星级评分（新版）
      careerStars,
      wealthStars,
      loveStars,

      // 建议和避免
      suggestion: aiData.suggestion || '保持积极心态，好运自然来。',
      avoidance: aiData.avoidance || '避免冲动决策。',

      // 今日宜、喜用和幸运元素
      suitable: aiData.suitable || '合作',
      unsuitable: aiData.unsuitable || '金水',
      luckyColor: aiData.luckyColor || '蓝色',
      luckyNumber: aiData.luckyNumber || 7,

      // 详细说明（用于弹窗显示）
      suitableDetail:
        aiData.suitableDetail ||
        '今日适合进行合作与沟通，有利于建立良好的人际关系。',
      unsuitableDetail:
        aiData.unsuitableDetail || '这些元素能够增强你的运势，带来正面能量。',
      luckyElementDetail:
        aiData.luckyElementDetail ||
        '幸运色和幸运数字能为你带来好运，建议多加运用。',

      // 兼容旧版字段（使用统一的转换方法）
      comment: aiData.summary || aiData.comment || defaultComment,
      careerLuck: aiData.careerLuck || this.convertStarsToScore(careerStars),
      wealthLuck: aiData.wealthLuck || this.convertStarsToScore(wealthStars),
      loveLuck: aiData.loveLuck || this.convertStarsToScore(loveStars),
    };
  }

  /**
   * 准备运势数据负载（避免重复代码）
   * @param fortuneData 运势数据
   * @returns 数据库负载对象
   */
  private prepareFortuneDataPayload(
    fortuneData: Omit<FortuneData, 'date' | 'isAuth' | 'recommendation'>,
  ) {
    return {
      overallScore: fortuneData.overallScore,
      comment: fortuneData.comment || '今日运势平稳',
      careerLuck: fortuneData.careerLuck || 75,
      wealthLuck: fortuneData.wealthLuck || 75,
      loveLuck: fortuneData.loveLuck || 75,
      luckyColor: fortuneData.luckyColor || '蓝色',
      luckyNumber: fortuneData.luckyNumber || 7,
      suggestion: fortuneData.suggestion || '保持积极心态',
      summary: fortuneData.summary,
      astroAnalysis: fortuneData.astroAnalysis,
      careerAnalysis: fortuneData.careerAnalysis,
      wealthAnalysis: fortuneData.wealthAnalysis,
      loveAnalysis: fortuneData.loveAnalysis,
      careerStars: fortuneData.careerStars,
      wealthStars: fortuneData.wealthStars,
      loveStars: fortuneData.loveStars,
      avoidance: fortuneData.avoidance,
      suitable: fortuneData.suitable,
      unsuitable: fortuneData.unsuitable,
      suitableDetail: fortuneData.suitableDetail,
      unsuitableDetail: fortuneData.unsuitableDetail,
      luckyElementDetail: fortuneData.luckyElementDetail,
    };
  }

  /**
   * 生成预览版运势（访客模式）
   * @returns 预览运势数据
   */
  private generatePreviewFortune(): Omit<
    FortuneData,
    'date' | 'isAuth' | 'recommendation'
  > {
    const score = Math.floor(Math.random() * 26) + 70; // 70-95分
    const previewComment =
      '今日运势不错，适合尝试新事物。购买专属手链，获取完整运势解读和个性化建议。';

    return {
      overallScore: score,
      comment: previewComment,
      careerLuck: Math.floor(Math.random() * 26) + 70,
      wealthLuck: Math.floor(Math.random() * 26) + 70,
      loveLuck: Math.floor(Math.random() * 26) + 70,
      luckyColor: '金色',
      luckyNumber: 8,
      suggestion:
        '保持积极心态，好运自然来。想要获得更准确的运势分析，请购买专属手链。',

      // 新增详细运势字段（访客模式使用简化版本）
      summary: previewComment,
      astroAnalysis: undefined,
      careerAnalysis: undefined,
      wealthAnalysis: undefined,
      loveAnalysis: undefined,
      careerStars: 3.5,
      wealthStars: 3.5,
      loveStars: 3.5,
      avoidance: '避免冲动决策。',
      suitable: '合作',
      unsuitable: '金水',
    };
  }

  /**
   * 生成降级运势（AI失败时使用）
   * @returns 降级运势数据
   */
  private generateFallbackFortune(): Omit<
    FortuneData,
    'date' | 'isAuth' | 'recommendation'
  > {
    return {
      overallScore: 78,
      comment:
        '今日运势平稳向上，适合稳步推进各项计划。保持积极心态，好运自然来。',
      careerLuck: 75,
      wealthLuck: 80,
      loveLuck: 76,
      luckyColor: '蓝色',
      luckyNumber: 7,
      suggestion:
        '今天适合穿蓝色系服装，数字7将为你带来好运。保持耐心，机会就在前方。',

      // 新增详细运势字段
      summary: '今日运势平稳，各方面发展稳健。',
      astroAnalysis: '星象平稳，适合稳步前进。',
      careerAnalysis: '工作运势良好，适合推进重要项目。',
      wealthAnalysis: '财运稳定，适合理性投资。',
      loveAnalysis: '感情运势平和，适合增进了解。',
      careerStars: 4,
      wealthStars: 4,
      loveStars: 4,
      avoidance: '避免冲动决策，保持理性思考。',
      suitable: '合作、沟通、学习',
      unsuitable: '冒险、投机、争执',
    };
  }

  /**
   * 计算运势（传统算法，保留作为备用）
   * @param user 用户信息
   * @param date 日期
   * @returns 运势数据
   */
  private async calculateFortune(
    user: UserForFortune,
    date: string,
  ): Promise<Omit<FortuneData, 'date' | 'isAuth' | 'recommendation'>> {
    // 基于用户生日和当前日期的运势算法
    const birthday = user.birthday ? new Date(user.birthday) : new Date();
    const currentDate = new Date(date);

    // 获取生日的月日作为种子
    const birthMonth = birthday.getMonth() + 1;
    const birthDay = birthday.getDate();

    // 获取当前日期信息

    const dayOfYear = Math.floor(
      (currentDate.getTime() -
        new Date(currentDate.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // 创建伪随机种子
    const seed = (birthMonth * 31 + birthDay) * 1000 + dayOfYear;

    // 伪随机数生成器
    const random = (min: number, max: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      const normalized = (x - Math.floor(x)) * (max - min) + min;
      return Math.floor(normalized);
    };

    // 计算各项运势分数 (60-95分)
    const overallScore = random(60, 96);
    const careerLuck = random(55, 96);
    const wealthLuck = random(55, 96);
    const loveLuck = random(55, 96);

    // 幸运色和数字
    const colors = [
      '红色',
      '橙色',
      '黄色',
      '绿色',
      '蓝色',
      '紫色',
      '粉色',
      '金色',
      '银色',
      '白色',
    ];
    const luckyColor = colors[random(0, colors.length)];
    const luckyNumber = random(1, 10);

    // 生成运势点评
    const comment = this.generateComment(
      overallScore,
      careerLuck,
      wealthLuck,
      loveLuck,
    );

    // 生成建议
    const suggestion = this.generateFallbackSuggestion(
      overallScore,
      luckyColor,
      luckyNumber,
    );

    return {
      overallScore,
      comment,
      careerLuck,
      wealthLuck,
      loveLuck,
      luckyColor,
      luckyNumber,
      suggestion,
    };
  }

  /**
   * 生成运势点评
   */
  private generateComment(
    overall: number,
    career: number,
    wealth: number,
    love: number,
  ): string {
    const comments: string[] = [];

    if (overall >= 85) {
      comments.push('今日运势极佳！');
    } else if (overall >= 75) {
      comments.push('今日运势不错！');
    } else if (overall >= 65) {
      comments.push('今日运势平稳。');
    } else {
      comments.push('今日需要谨慎行事。');
    }

    if (career >= 80) {
      comments.push('事业上有突破机会');
    } else if (career >= 70) {
      comments.push('工作进展顺利');
    }

    if (wealth >= 80) {
      comments.push('财运亨通');
    } else if (wealth >= 70) {
      comments.push('财运稳定');
    }

    if (love >= 80) {
      comments.push('爱情甜蜜');
    } else if (love >= 70) {
      comments.push('感情和谐');
    }

    return comments.join('，') + '。';
  }

  /**
   * 生成降级建议（传统算法）
   */
  private generateFallbackSuggestion(
    score: number,
    color: string,
    number: number,
  ): string {
    const suggestions = [
      `今天适合穿${color}的衣服，会带来好运。`,
      `幸运数字${number}将为你带来意外惊喜。`,
    ];

    if (score >= 85) {
      suggestions.push('把握机会，勇敢行动，今天是你的幸运日！');
    } else if (score >= 75) {
      suggestions.push('保持积极心态，好运自然来。');
    } else if (score >= 65) {
      suggestions.push('稳扎稳打，循序渐进。');
    } else {
      suggestions.push('低调行事，避免冲突。');
    }

    return suggestions.join(' ');
  }

  /**
   * 检查用户认证状态（是否绑定手链）
   * @param userId 用户ID
   * @returns 是否已认证
   */
  private async checkUserAuth(userId: string): Promise<boolean> {
    const userBracelets = await this.braceletsService.findByUserId(userId);
    return userBracelets.length > 0;
  }

  /**
   * 获取随机商品推荐（用于欢迎页面）
   * @returns 随机商品
   */
  async getRandomRecommendation(): Promise<any> {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        douyinUrl: true,
      },
      take: 5, // 获取5个商品
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (products.length === 0) {
      return null;
    }

    // 随机选择一个商品
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  /**
   * 获取商品推荐
   */
  private async getRecommendation(score: number) {
    // 根据分数推荐不同的商品
    let productQuery = {};

    if (score >= 85) {
      // 高分推荐高端商品
      productQuery = { price: { gte: 500 } };
    } else if (score >= 70) {
      // 中等分数推荐中端商品
      productQuery = { price: { gte: 200, lt: 500 } };
    } else {
      // 低分推荐入门商品
      productQuery = { price: { lt: 200 } };
    }

    // 优化查询：只获取必要字段，限制数量
    const products = await this.prisma.product.findMany({
      where: productQuery,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        douyinUrl: true,
      },
      take: 3, // 减少查询数量
      orderBy: {
        createdAt: 'desc', // 优先推荐新商品
      },
    });

    if (products.length === 0) {
      return null;
    }

    // 使用确定性随机选择（基于分数）
    const index = score % products.length;
    return products[index];
  }

  /**
   * 格式化运势响应（新版：包含详细字段）
   */
  private formatFortuneResponse(
    fortune: any,
    isAuth: boolean = true,
  ): FortuneData {
    const response: FortuneData = {
      date: fortune.date,
      overallScore: fortune.overallScore,
      isAuth,
      recommendation: fortune.recommendation
        ? {
            id: fortune.recommendation.id,
            name: fortune.recommendation.name,
            description: fortune.recommendation.description,
            imageUrl: fortune.recommendation.imageUrl,
            price: fortune.recommendation.price,
            douyinUrl: fortune.recommendation.douyinUrl,
          }
        : undefined,
    };

    // 对于已认证用户，返回完整的运势信息（包含新增字段）
    if (isAuth) {
      return {
        ...response,
        // 旧版字段（兼容）
        comment: fortune.comment || fortune.summary || undefined,
        careerLuck: fortune.careerLuck,
        wealthLuck: fortune.wealthLuck,
        loveLuck: fortune.loveLuck,
        luckyColor: fortune.luckyColor,
        luckyNumber: fortune.luckyNumber,
        suggestion: fortune.suggestion,
        // 新版详细字段
        summary: fortune.summary || undefined,
        astroAnalysis: fortune.astroAnalysis || undefined,
        careerAnalysis: fortune.careerAnalysis || undefined,
        wealthAnalysis: fortune.wealthAnalysis || undefined,
        loveAnalysis: fortune.loveAnalysis || undefined,
        careerStars: fortune.careerStars || undefined,
        wealthStars: fortune.wealthStars || undefined,
        loveStars: fortune.loveStars || undefined,
        avoidance: fortune.avoidance || undefined,
        suitable: fortune.suitable || undefined,
        unsuitable: fortune.unsuitable || undefined,
        suitableDetail: fortune.suitableDetail || undefined,
        unsuitableDetail: fortune.unsuitableDetail || undefined,
        luckyElementDetail: fortune.luckyElementDetail || undefined,
      };
    }

    // 对于访客用户，只返回基本信息（分数）
    return response;
  }
}
