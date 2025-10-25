/**
 * 性能测试脚本
 * 测试NFC拉起到页面显示的端到端时间
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// 模拟测试数据
const TEST_DATA = {
  wechatCode: 'test_code_123',
  nfcId: 'test_nfc_001',
  userId: null,
  token: null
};

/**
 * 测试登录接口性能
 */
async function testLoginPerformance() {
  console.log('🚀 测试登录接口性能...');
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      code: TEST_DATA.wechatCode,
      nfcId: TEST_DATA.nfcId
    }, {
      timeout: 2000 // 2秒超时
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 登录接口响应时间: ${duration}ms`);
    
    if (response.data.success && response.data.data.token) {
      TEST_DATA.token = response.data.data.token;
      console.log('✅ 登录成功，获取到token');
    }
    
    return duration;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ 登录接口失败: ${duration}ms`, error.message);
    return duration;
  }
}

/**
 * 测试运势接口性能
 */
async function testFortunePerformance() {
  console.log('🔮 测试运势接口性能...');
  
  if (!TEST_DATA.token) {
    console.log('❌ 没有有效token，跳过运势测试');
    return 0;
  }
  
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${API_BASE_URL}/fortune/today`, {
      headers: {
        'Authorization': `Bearer ${TEST_DATA.token}`
      },
      timeout: 2000 // 2秒超时
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 运势接口响应时间: ${duration}ms`);
    
    if (response.data.success) {
      console.log('✅ 运势数据获取成功');
    }
    
    return duration;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ 运势接口失败: ${duration}ms`, error.message);
    return duration;
  }
}

/**
 * 测试NFC验证接口性能
 */
async function testNFCVerificationPerformance() {
  console.log('🏷️ 测试NFC验证接口性能...');
  
  if (!TEST_DATA.token) {
    console.log('❌ 没有有效token，跳过NFC验证测试');
    return 0;
  }
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-nfc`, {
      nfcId: TEST_DATA.nfcId
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_DATA.token}`
      },
      timeout: 1000 // 1秒超时
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ NFC验证接口响应时间: ${duration}ms`);
    
    return duration;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ NFC验证接口失败: ${duration}ms`, error.message);
    return duration;
  }
}

/**
 * 运行完整的性能测试
 */
async function runPerformanceTest() {
  console.log('🎯 开始性能测试...\n');
  
  const results = {
    login: 0,
    nfcVerification: 0,
    fortune: 0,
    total: 0
  };
  
  // 测试登录性能
  results.login = await testLoginPerformance();
  console.log('');
  
  // 测试NFC验证性能
  results.nfcVerification = await testNFCVerificationPerformance();
  console.log('');
  
  // 测试运势获取性能
  results.fortune = await testFortunePerformance();
  console.log('');
  
  // 计算总时间
  results.total = results.login + results.nfcVerification + results.fortune;
  
  // 输出测试结果
  console.log('📊 性能测试结果:');
  console.log('================');
  console.log(`登录接口: ${results.login}ms`);
  console.log(`NFC验证: ${results.nfcVerification}ms`);
  console.log(`运势获取: ${results.fortune}ms`);
  console.log(`总时间: ${results.total}ms`);
  console.log('');
  
  // 验证是否满足性能要求
  const TARGET_TIME = 2000; // 2秒目标
  
  if (results.total <= TARGET_TIME) {
    console.log(`✅ 性能测试通过！总时间 ${results.total}ms <= ${TARGET_TIME}ms`);
  } else {
    console.log(`❌ 性能测试失败！总时间 ${results.total}ms > ${TARGET_TIME}ms`);
  }
  
  // 分析性能瓶颈
  console.log('\n🔍 性能分析:');
  if (results.login > 1000) {
    console.log('⚠️ 登录接口较慢，建议优化微信API调用');
  }
  if (results.nfcVerification > 500) {
    console.log('⚠️ NFC验证较慢，建议优化数据库查询');
  }
  if (results.fortune > 800) {
    console.log('⚠️ 运势获取较慢，建议优化运势计算逻辑');
  }
  
  return results;
}

/**
 * 批量性能测试
 */
async function runBatchTest(iterations = 5) {
  console.log(`🔄 运行批量测试 (${iterations} 次)...\n`);
  
  const allResults = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`--- 第 ${i} 次测试 ---`);
    const result = await runPerformanceTest();
    allResults.push(result);
    console.log('\n');
    
    // 等待1秒再进行下一次测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 计算平均值
  const avgResults = {
    login: Math.round(allResults.reduce((sum, r) => sum + r.login, 0) / iterations),
    nfcVerification: Math.round(allResults.reduce((sum, r) => sum + r.nfcVerification, 0) / iterations),
    fortune: Math.round(allResults.reduce((sum, r) => sum + r.fortune, 0) / iterations),
    total: Math.round(allResults.reduce((sum, r) => sum + r.total, 0) / iterations)
  };
  
  console.log('📈 批量测试平均结果:');
  console.log('==================');
  console.log(`登录接口: ${avgResults.login}ms`);
  console.log(`NFC验证: ${avgResults.nfcVerification}ms`);
  console.log(`运势获取: ${avgResults.fortune}ms`);
  console.log(`平均总时间: ${avgResults.total}ms`);
  
  return avgResults;
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  const iterations = args[0] ? parseInt(args[0]) : 1;
  
  if (iterations > 1) {
    runBatchTest(iterations).catch(console.error);
  } else {
    runPerformanceTest().catch(console.error);
  }
}

module.exports = {
  runPerformanceTest,
  runBatchTest
};
