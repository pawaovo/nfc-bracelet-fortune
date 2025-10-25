/**
 * AI Service 集成测试脚本
 * 测试 AIService 类的功能
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 手动读取.env文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  const envVars = {};

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          envVars[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.log('❌ 无法读取.env文件:', error.message);
    process.exit(1);
  }

  return envVars;
}

// 模拟 AIService 的核心功能
class MockAIService {
  constructor() {
    const envVars = loadEnvFile();
    this.apiKey = envVars.OPENAI_API_KEY;
    this.baseUrl = envVars.OPENAI_BASE_URL;
    this.model = envVars.OPENAI_MODEL;
    this.enabled = !!(this.apiKey && this.baseUrl);
  }

  isEnabled() {
    return this.enabled;
  }

  async generateFortune(data) {
    if (!this.enabled) {
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
      console.error('Failed to generate fortune with AI:', error.message);
      return null;
    }
  }

  async generateSuggestion(score, luckyColor, luckyNumber) {
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
      console.error('Failed to generate suggestion with AI:', error.message);
      return null;
    }
  }

  buildFortunePrompt(data) {
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

  async callAI(prompt, options = {}) {
    const { maxTokens = 200, temperature = 0.7, timeout = 10000 } = options;

    const startTime = Date.now();

    try {
      const response = await axios.post(
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

      return {
        content,
        tokens,
        duration,
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      throw new Error(`AI call failed after ${duration}ms: ${error.message}`);
    }
  }

  async testConnection() {
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
      console.error('AI connection test failed:', error.message);
      return false;
    }
  }
}

// 测试函数
async function testAIService() {
  console.log('🤖 AI Service 集成测试开始...\n');

  const aiService = new MockAIService();

  // 测试1: 检查服务状态
  console.log('📋 测试1: 服务状态检查');
  console.log(
    `   服务状态: ${aiService.isEnabled() ? '✅ 已启用' : '❌ 未启用'}`,
  );

  if (!aiService.isEnabled()) {
    console.log('❌ AI服务未启用，请检查配置');
    return;
  }

  // 测试2: 连接测试
  console.log('\n🔗 测试2: 连接测试');
  const connectionOk = await aiService.testConnection();
  console.log(`   连接状态: ${connectionOk ? '✅ 正常' : '❌ 异常'}`);

  if (!connectionOk) {
    console.log('❌ AI连接异常，请检查网络和配置');
    return;
  }

  // 测试3: 运势生成测试
  console.log('\n🔮 测试3: 运势生成测试');
  const fortuneData = {
    birthday: new Date('1990-03-15'),
    date: '2024-12-25',
    userName: '小明',
  };

  const fortuneResult = await aiService.generateFortune(fortuneData);

  if (fortuneResult) {
    console.log(
      `   ✅ 运势生成成功 (${fortuneResult.duration}ms, ${fortuneResult.tokens} tokens)`,
    );
    console.log(`   📝 生成内容:\n${fortuneResult.content}`);
  } else {
    console.log('   ❌ 运势生成失败');
  }

  // 测试4: 建议生成测试
  console.log('\n💡 测试4: 建议生成测试');
  const suggestionResult = await aiService.generateSuggestion(88, '金色', 6);

  if (suggestionResult) {
    console.log(
      `   ✅ 建议生成成功 (${suggestionResult.duration}ms, ${suggestionResult.tokens} tokens)`,
    );
    console.log(`   📝 生成建议: ${suggestionResult.content}`);
  } else {
    console.log('   ❌ 建议生成失败');
  }

  console.log('\n🎯 AI Service 集成测试完成！');
}

// 运行测试
if (require.main === module) {
  testAIService()
    .then(() => {
      console.log('✅ 所有测试完成');
    })
    .catch((error) => {
      console.error('💥 测试出错:', error);
      process.exit(1);
    });
}

module.exports = { testAIService };
