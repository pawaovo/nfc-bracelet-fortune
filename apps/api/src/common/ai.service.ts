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
  userName?: string;
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
        maxTokens: 300,
        temperature: 0.8,
        timeout: 15000,
      });
    } catch (error) {
      this.logger.error('Failed to generate fortune with AI', error);
      return null;
    }
  }

  /**
   * 生成运势建议
   * @param score 运势分数
   * @param luckyColor 幸运色
   * @param luckyNumber 幸运数字
   * @returns AI生成的建议
   */
  async generateSuggestion(
    score: number,
    luckyColor: string,
    luckyNumber: number,
  ): Promise<AIResponse | null> {
    if (!this.enabled) {
      return null;
    }

    const prompt = `请根据以下信息生成简短的运势建议：
运势分数：${score}分
幸运色：${luckyColor}
幸运数字：${luckyNumber}

要求：
1. 建议要积极正面
2. 控制在50字以内
3. 结合幸运色和数字给出具体建议`;

    try {
      return await this.callAI(prompt, {
        maxTokens: 100,
        temperature: 0.7,
        timeout: 10000,
      });
    } catch (error) {
      this.logger.error('Failed to generate suggestion with AI', error);
      return null;
    }
  }

  /**
   * 构建运势生成的提示词
   */
  private buildFortunePrompt(data: FortunePromptData): string {
    const { birthday, date, userName } = data;

    let prompt = `你是一位专业的运势分析师，请为用户生成今日运势分析。

日期：${date}`;

    if (birthday) {
      const month = birthday.getMonth() + 1;
      const day = birthday.getDate();
      prompt += `\n用户生日：${month}月${day}日`;
    }

    if (userName) {
      prompt += `\n用户称呼：${userName}`;
    }

    prompt += `

请生成包含以下内容的运势分析：
1. 总体运势评价（60-95分之间）
2. 事业运势简述
3. 财运状况简述  
4. 爱情运势简述
5. 简短的运势点评（一句话）

要求：
- 内容积极正面，给人希望
- 语言简洁明了，每项不超过20字
- 符合中国传统运势文化
- 总字数控制在150字以内

请按以下格式输出：
总体运势：[分数]分
事业运势：[简述]
财运状况：[简述]
爱情运势：[简述]
运势点评：[一句话点评]`;

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
      timeout?: number;
    } = {},
  ): Promise<AIResponse> {
    const { maxTokens = 200, temperature = 0.7, timeout = 10000 } = options;

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

      this.logger.error(`AI call failed after ${duration}ms: ${error.message}`);

      if (error.response) {
        this.logger.error(
          `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`,
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
