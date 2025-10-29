#!/usr/bin/env node

/**
 * 测试运势生成的完整流程（包括AI调用）
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 加载环境变量
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  const envVars = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
  }

  return envVars;
}

/**
 * 直接测试AI生成运势
 */
async function testAIFortuneGeneration() {
  log('🚀 测试AI运势生成\n', 'blue');

  const envVars = loadEnvFile();
  const apiKey = envVars.OPENAI_API_KEY;
  const baseUrl = envVars.OPENAI_BASE_URL;
  const model = envVars.OPENAI_MODEL;

  // 构建运势生成的Prompt
  const today = new Date().toISOString().split('T')[0];
  const prompt = `你是一位专业的运势分析师，请为用户生成今日运势分析。

日期：${today}
用户生日：5月15日
用户称呼：测试用户

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

  log('📋 测试配置:', 'blue');
  log(`   模型: ${model}`, 'blue');
  log(`   API: ${baseUrl}\n`, 'blue');

  try {
    log('🔄 调用AI生成运势...', 'yellow');

    const startTime = Date.now();
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    log('✅ AI调用成功!\n', 'green');
    log('📊 响应信息:', 'blue');
    log(`   耗时: ${duration}ms`, 'blue');
    log(`   Token使用: ${response.data.usage?.total_tokens || 'N/A'}`, 'blue');

    const content = response.data.choices[0]?.message?.content || '';
    log('\n📝 AI生成的运势内容:', 'green');
    log('─'.repeat(60), 'blue');
    log(content, 'reset');
    log('─'.repeat(60), 'blue');

    // 尝试解析内容
    log('\n🔍 解析运势数据...', 'yellow');
    const parsed = parseFortuneContent(content);

    if (parsed) {
      log('✅ 解析成功!', 'green');
      log(`   总体运势: ${parsed.overallScore}分`, 'blue');
      log(`   事业运势: ${parsed.careerLuck}`, 'blue');
      log(`   财运状况: ${parsed.wealthLuck}`, 'blue');
      log(`   爱情运势: ${parsed.loveLuck}`, 'blue');
      log(`   运势点评: ${parsed.suggestion}`, 'blue');
    } else {
      log('⚠️  解析失败，AI返回格式可能不符合预期', 'yellow');
    }

    log('\n🎉 测试成功! AI运势生成功能正常', 'green');
    return true;
  } catch (error) {
    log('❌ AI调用失败!\n', 'red');

    if (error.response) {
      log('📋 错误详情:', 'red');
      log(`   状态码: ${error.response.status}`, 'red');
      log(
        `   错误信息: ${JSON.stringify(error.response.data, null, 2)}`,
        'red',
      );
    } else {
      log(`   错误: ${error.message}`, 'red');
    }

    return false;
  }
}

/**
 * 解析运势内容
 */
function parseFortuneContent(content) {
  try {
    const lines = content.split('\n');
    const result = {
      overallScore: 75,
      careerLuck: '',
      wealthLuck: '',
      loveLuck: '',
      suggestion: '',
    };

    for (const line of lines) {
      if (line.includes('总体运势：') || line.includes('综合运势：')) {
        const match = line.match(/(\d+)分/);
        if (match) {
          result.overallScore = parseInt(match[1]);
        }
      } else if (line.includes('事业运势：')) {
        result.careerLuck = line.replace('事业运势：', '').trim();
      } else if (line.includes('财运状况：') || line.includes('财运：')) {
        result.wealthLuck = line.replace(/财运状况：|财运：/, '').trim();
      } else if (line.includes('爱情运势：') || line.includes('爱情：')) {
        result.loveLuck = line.replace(/爱情运势：|爱情：/, '').trim();
      } else if (line.includes('运势点评：') || line.includes('建议：')) {
        result.suggestion = line.replace(/运势点评：|建议：/, '').trim();
      }
    }

    return result;
  } catch (error) {
    return null;
  }
}

// 运行测试
testAIFortuneGeneration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n💥 测试脚本异常: ${error.message}`, 'red');
    process.exit(1);
  });
