import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface AIResponse {
  content: string;
  tokens: number;
  duration: number;
}

export interface FortunePromptData {
  birthday?: Date;
  date: string;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL') || '';
    this.model =
      this.configService.get<string>('OPENAI_MODEL') || 'deepseek-chat';
    this.enabled = !!(this.apiKey && this.baseUrl);

    if (!this.enabled) {
      this.logger.warn(
        'AI Service disabled: API key or base URL not configured',
      );
    } else {
      this.logger.log(
        `AI Service initialized: ${this.model} @ ${this.baseUrl}`,
      );
    }
  }

  /**
   * 检查AI服务是否可用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 生成运势内容
   * @param data 运势生成所需数据
   * @returns AI生成的运势内容
   */
  async generateFortune(data: FortunePromptData): Promise<AIResponse | null> {
    if (!this.enabled) {
      this.logger.warn('AI service not enabled, skipping fortune generation');
      return null;
    }

    const prompt = this.buildFortunePrompt(data);

    try {
      return await this.callAI(prompt, {
        maxTokens: 10000, // 增加到10000，支持详细运势分析的完整内容
        temperature: 1, // 设为1，增加输出多样性
        topP: 0.7, // 豆包AI模型推荐参数，控制采样范围
        timeout: 30000, // 增加到30秒，因为详细运势生成需要更多时间
      });
    } catch (error) {
      this.logger.error('Failed to generate fortune with AI', error);
      return null;
    }
  }

  /**
   * 构建运势生成的提示词（新版详细格式）
   */
  private buildFortunePrompt(data: FortunePromptData): string {
    const { birthday, date } = data;

    // 格式化生日
    let birthdayStr = '';
    if (birthday) {
      const month = birthday.getMonth() + 1;
      const day = birthday.getDate();
      birthdayStr = `${month}月${day}日`;
    }

    const prompt = `你是一位专业的运势分析师，你的任务是结合星盘、运势、玄学知识，根据当日时间和生日为客户生成今日详细运势分析。

【重要】输出格式要求：
- 必须严格按照下方指定的文本格式输出
- 禁止使用JSON格式
- 禁止使用其他任何格式
- 必须包含所有必需的章节标题和字段

今日的日期如下：
<today_date>
${date}
</today_date>
用户的生日如下：
<user_birthday>
${birthdayStr || '未提供'}
</user_birthday>

在进行运势分析时，请遵循以下要求：
1. 综合运用星盘、运势、玄学知识进行全面分析。详细且深入地阐述每个方面的运势情况。
2. 分析内容应包括事业、财富、爱情三方面。
3. 提供的运势分析要详细且具有一定的深度和专业性。
4. 根据分析结果进行总结，提供6项数据：事业运星数、财富运星数、爱情运星数、建议、避免事项、今日宜、今日喜用、今日幸运色和幸运数字、综合分数。
5. 语言表达要清晰、易懂，避免使用过于晦涩的术语。

【重要】星数格式要求：
- 星数满分5星，最低0星
- 星数必须是0.5的倍数，例如：1、1.5、2、2.5、3、3.5、4、4.5、5
- 严禁使用非半星格式，例如：3.7星、4.2星、4.3星等都是错误的
- 只允许整星或半星，如3星、3.5星、4星、4.5星

【重要】字数限制要求：
- 今日宜：必须不超过10个字，例如"合作"、"投资理财"
- 今日喜用：必须不超过5个字，例如"金"、"水"
- 今日幸运色：必须不超过10个字，例如"蓝色"、"金黄色"
- 今日幸运数字：必须是1-2位数字，例如"7"、"12"、"88"

【重要】建议和避免事项格式要求：
- 建议事项和避免事项：直接写内容，不要分类别（如"事业上"、"财富上"等）

请严格按照以下文本格式输出你的运势分析（不要使用JSON）：

星盘分析:
[在此写下星盘分析内容，至少100字]

事业运分析:
[在此写下事业运分析内容，至少80字]

财富运分析:
[在此写下财富运分析内容，至少80字]

爱情运分析:
[在此写下爱情运分析内容，至少80字]

总结和建议:
事业运星数:[0.5的倍数，如3.5]
财富运星数:[0.5的倍数，如4]
爱情运星数:[0.5的倍数，如4.5]

建议事项:
[直接写建议内容]

避免事项:
[直接写避免内容]

其他事项:
今日宜:[不超过10字]
今日喜用:[不超过10字]
今日幸运色:[不超过10字]
今日幸运数字:[1-2位数字]
今日运势综合数字:[0-100的整数]

今日简要总结:[一句话概括]`;

    return prompt;
  }

  /**
   * 调用AI API
   */
  private async callAI(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      timeout?: number;
    } = {},
  ): Promise<AIResponse> {
    const {
      maxTokens = 10000,
      temperature = 1,
      topP = 0.7,
      timeout = 30000,
    } = options;

    const startTime = Date.now();

    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          top_p: topP, // 豆包AI模型的Top P参数
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: timeout,
        },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      const content = response.data.choices[0]?.message?.content || '';
      const tokens = response.data.usage?.total_tokens || 0;

      this.logger.log(`AI call successful: ${duration}ms, ${tokens} tokens`);

      return {
        content,
        tokens,
        duration,
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`AI call failed after ${duration}ms: ${errorMessage}`);

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as {
          response?: { status?: number; data?: unknown };
        };
        this.logger.error(
          `HTTP ${httpError.response?.status}: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw error;
    }
  }

  /**
   * 测试AI连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await this.callAI('你好，请回复"连接正常"', {
        maxTokens: 20,
        timeout: 5000,
      });

      return (
        response.content.includes('连接正常') ||
        response.content.includes('正常')
      );
    } catch (error) {
      this.logger.error('AI connection test failed', error);
      return false;
    }
  }
}
