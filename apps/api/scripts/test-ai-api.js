/**
 * AI API 连接测试脚本
 * 用于验证 DeepSeek API 是否能正常调用
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
          // 移除引号
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

// 加载环境变量
const envVars = loadEnvFile();
const API_KEY = envVars.OPENAI_API_KEY;
const BASE_URL = envVars.OPENAI_BASE_URL;
const MODEL = envVars.OPENAI_MODEL;

console.log('🤖 AI API 连接测试开始...\n');

// 验证环境变量
function validateConfig() {
  console.log('📋 检查配置信息:');
  console.log(
    `   API Key: ${API_KEY ? `${API_KEY.substring(0, 10)}...` : '❌ 未配置'}`,
  );
  console.log(`   Base URL: ${BASE_URL || '❌ 未配置'}`);
  console.log(`   Model: ${MODEL || '❌ 未配置'}\n`);

  if (!API_KEY || !BASE_URL || !MODEL) {
    console.log('❌ 配置信息不完整，请检查 .env 文件');
    process.exit(1);
  }
}

// 测试简单的AI调用
async function testSimpleCall() {
  console.log('🔍 测试1: 简单AI调用...');

  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: '你好，请简单回复一句话确认连接正常。',
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10秒超时
      },
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ 简单调用成功! 响应时间: ${duration}ms`);
    console.log(`📝 AI回复: ${response.data.choices[0].message.content}`);
    console.log(
      `🔢 Token使用: ${response.data.usage?.total_tokens || 'N/A'}\n`,
    );

    return true;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`❌ 简单调用失败! 响应时间: ${duration}ms`);
    console.log(`📄 错误信息: ${error.message}`);

    if (error.response) {
      console.log(`📊 HTTP状态: ${error.response.status}`);
      console.log(
        `📋 错误详情: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }
    console.log('');

    return false;
  }
}

// 测试运势相关的AI调用
async function testFortuneCall() {
  console.log('🔮 测试2: 运势生成AI调用...');

  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的运势分析师，请根据用户信息生成简短的运势分析。',
          },
          {
            role: 'user',
            content:
              '请为一个生日是3月15日的用户生成今日运势，包括总体运势、事业运、财运、爱情运的简短描述。',
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15秒超时
      },
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ 运势调用成功! 响应时间: ${duration}ms`);
    console.log(`🔮 运势内容: ${response.data.choices[0].message.content}`);
    console.log(
      `🔢 Token使用: ${response.data.usage?.total_tokens || 'N/A'}\n`,
    );

    return true;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`❌ 运势调用失败! 响应时间: ${duration}ms`);
    console.log(`📄 错误信息: ${error.message}`);

    if (error.response) {
      console.log(`📊 HTTP状态: ${error.response.status}`);
      console.log(
        `📋 错误详情: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }
    console.log('');

    return false;
  }
}

// 测试API限制和错误处理
async function testErrorHandling() {
  console.log('⚠️  测试3: 错误处理测试...');

  try {
    // 测试无效的API Key
    await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: 'Bearer invalid-key',
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    );

    console.log('❌ 错误处理测试失败: 应该返回认证错误');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ 错误处理正常: 正确返回认证错误');
    } else {
      console.log(`⚠️  错误处理异常: ${error.message}`);
    }
  }
  console.log('');
}

// 主测试函数
async function runTests() {
  validateConfig();

  const results = {
    simple: false,
    fortune: false,
    errorHandling: true,
  };

  // 执行测试
  results.simple = await testSimpleCall();
  results.fortune = await testFortuneCall();
  await testErrorHandling();

  // 输出测试结果
  console.log('📊 测试结果汇总:');
  console.log(`   简单调用: ${results.simple ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   运势调用: ${results.fortune ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   错误处理: ${results.errorHandling ? '✅ 通过' : '❌ 失败'}`);

  const allPassed = results.simple && results.fortune && results.errorHandling;

  console.log('\n🎯 总体结论:');
  if (allPassed) {
    console.log('✅ AI API 连接测试全部通过！可以正常使用AI功能。');
  } else {
    console.log('❌ AI API 连接测试存在问题，请检查配置或网络连接。');
  }

  return allPassed;
}

// 运行测试
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 测试脚本执行出错:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
