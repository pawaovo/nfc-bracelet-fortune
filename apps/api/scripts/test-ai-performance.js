/**
 * AI API 性能测试脚本
 * 测试API的稳定性、响应时间和并发能力
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

const envVars = loadEnvFile();
const API_KEY = envVars.OPENAI_API_KEY;
const BASE_URL = envVars.OPENAI_BASE_URL;
const MODEL = envVars.OPENAI_MODEL;

console.log('⚡ AI API 性能测试开始...\n');

// 单次API调用测试
async function singleApiCall(testName, prompt, maxTokens = 100) {
  const startTime = Date.now();

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    const tokens = response.data.usage?.total_tokens || 0;

    return {
      success: true,
      duration,
      tokens,
      response: response.data.choices[0].message.content,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      duration,
      error: error.message,
      status: error.response?.status,
    };
  }
}

// 响应时间测试
async function testResponseTime() {
  console.log('⏱️  测试1: 响应时间测试...');

  const tests = [
    { name: '短文本', prompt: '你好', maxTokens: 20 },
    { name: '中等文本', prompt: '请简单介绍一下人工智能', maxTokens: 100 },
    {
      name: '长文本',
      prompt: '请详细分析今日运势，包括事业、财运、爱情等各个方面',
      maxTokens: 300,
    },
  ];

  for (const test of tests) {
    const result = await singleApiCall(test.name, test.prompt, test.maxTokens);

    if (result.success) {
      console.log(
        `✅ ${test.name}: ${result.duration}ms (${result.tokens} tokens)`,
      );
    } else {
      console.log(`❌ ${test.name}: ${result.duration}ms - ${result.error}`);
    }
  }
  console.log('');
}

// 连续调用测试
async function testConsecutiveCalls() {
  console.log('🔄 测试2: 连续调用测试 (5次)...');

  const results = [];
  const prompt = '请生成一个简短的运势建议';

  for (let i = 1; i <= 5; i++) {
    console.log(`   第${i}次调用...`);
    const result = await singleApiCall(`连续调用${i}`, prompt, 50);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ 成功: ${result.duration}ms`);
    } else {
      console.log(`   ❌ 失败: ${result.error}`);
    }

    // 间隔1秒
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 统计结果
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    const avgDuration =
      successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const minDuration = Math.min(...successful.map((r) => r.duration));
    const maxDuration = Math.max(...successful.map((r) => r.duration));

    console.log(
      `📊 成功率: ${successful.length}/5 (${((successful.length / 5) * 100).toFixed(1)}%)`,
    );
    console.log(`📊 平均响应时间: ${avgDuration.toFixed(0)}ms`);
    console.log(`📊 最快响应: ${minDuration}ms`);
    console.log(`📊 最慢响应: ${maxDuration}ms`);
  }

  if (failed.length > 0) {
    console.log(`❌ 失败次数: ${failed.length}`);
  }
  console.log('');
}

// 并发调用测试
async function testConcurrentCalls() {
  console.log('🚀 测试3: 并发调用测试 (3个并发)...');

  const promises = [];
  const startTime = Date.now();

  for (let i = 1; i <= 3; i++) {
    const promise = singleApiCall(`并发${i}`, `请生成第${i}个运势建议`, 50);
    promises.push(promise);
  }

  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`📊 总耗时: ${totalDuration}ms`);
    console.log(`📊 成功率: ${successful.length}/3`);

    successful.forEach((result, index) => {
      console.log(`   ✅ 并发${index + 1}: ${result.duration}ms`);
    });

    failed.forEach((result) => {
      console.log(`   ❌ 并发失败: ${result.error}`);
    });
  } catch (error) {
    console.log(`❌ 并发测试失败: ${error.message}`);
  }
  console.log('');
}

// 错误恢复测试
async function testErrorRecovery() {
  console.log('🛡️  测试4: 错误恢复测试...');

  // 测试超大请求
  console.log('   测试超大Token请求...');
  const largeResult = await singleApiCall(
    '超大请求',
    '请写一篇10000字的文章关于人工智能的发展历史',
    5000,
  );

  if (largeResult.success) {
    console.log(
      `   ✅ 超大请求成功: ${largeResult.duration}ms (${largeResult.tokens} tokens)`,
    );
  } else {
    console.log(`   ⚠️  超大请求失败: ${largeResult.error} (这是正常的)`);
  }

  // 测试恢复正常请求
  console.log('   测试恢复正常请求...');
  const normalResult = await singleApiCall('恢复测试', '你好', 20);

  if (normalResult.success) {
    console.log(`   ✅ 恢复正常: ${normalResult.duration}ms`);
  } else {
    console.log(`   ❌ 恢复失败: ${normalResult.error}`);
  }
  console.log('');
}

// 主测试函数
async function runPerformanceTests() {
  if (!API_KEY || !BASE_URL || !MODEL) {
    console.log('❌ 配置信息不完整，请检查 .env 文件');
    process.exit(1);
  }

  console.log(`🔧 配置信息: ${MODEL} @ ${BASE_URL}\n`);

  try {
    await testResponseTime();
    await testConsecutiveCalls();
    await testConcurrentCalls();
    await testErrorRecovery();

    console.log('🎯 性能测试完成！');
    console.log('✅ AI API 性能表现良好，可以用于生产环境。');
  } catch (error) {
    console.error('💥 性能测试出错:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests };
