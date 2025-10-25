import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BraceletsService } from '../bracelets/bracelets.service';

@Injectable()
export class FortunesService {
  private readonly logger = new Logger(FortunesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly braceletsService: BraceletsService,
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

    // 计算运势
    const fortuneData = await this.calculateFortune(user, today);

    // 获取商品推荐（访客版和完整版都需要显示）
    const recommendation = await this.getRecommendation(
      fortuneData.overallScore,
    );

    // 保存到数据库
    const newFortune = await this.prisma.dailyFortune.create({
      data: {
        userId,
        date: today,
        overallScore: fortuneData.overallScore,
        comment: fortuneData.comment,
        careerLuck: fortuneData.careerLuck,
        wealthLuck: fortuneData.wealthLuck,
        loveLuck: fortuneData.loveLuck,
        luckyColor: fortuneData.luckyColor,
        luckyNumber: fortuneData.luckyNumber,
        suggestion: fortuneData.suggestion,
        recommendationId: recommendation?.id,
      },
      include: {
        recommendation: true,
      },
    });

    return this.formatFortuneResponse(newFortune, isAuth);
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

    return {
      fortunes: fortunes.map((fortune) =>
        this.formatFortuneResponse(fortune, isAuth),
      ),
      total,
      page,
      limit,
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
   * 计算运势
   * @param user 用户信息
   * @param date 日期
   * @returns 运势数据
   */
  private async calculateFortune(user: any, date: string) {
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
    const suggestion = this.generateSuggestion(
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
   * 生成建议
   */
  private generateSuggestion(
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
   * 格式化运势响应
   */
  private formatFortuneResponse(fortune: any, isAuth: boolean = true) {
    const response = {
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
        : null,
    };

    // 对于已认证用户，返回完整的运势信息
    if (isAuth) {
      return {
        ...response,
        comment: fortune.comment,
        careerLuck: fortune.careerLuck,
        wealthLuck: fortune.wealthLuck,
        loveLuck: fortune.loveLuck,
        luckyColor: fortune.luckyColor,
        luckyNumber: fortune.luckyNumber,
        suggestion: fortune.suggestion,
      };
    }

    // 对于访客用户，只返回基本信息（分数）
    return response;
  }
}
