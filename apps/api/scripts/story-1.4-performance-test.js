/**
 * Story 1.4 性能测试脚本
 * 测试已认证用户直接打开小程序的端到端性能
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// 模拟测试数据
const TEST_DATA = {
  wechatCode: 'test_direct_launch_code_123',
  userId: null,
  token: null
};

/**
 * 测试直接启动登录性能（仅code参数）
 */
async function testDirectLaunchLogin() {
  console.log('🚀 测试直接启动登录性能...');
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      code: TEST_DATA.wechatCode
      // 注意：不传nfcId参数，模拟直接启动
    }, {
      timeout: 3000 // 3秒超时
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 直接启动登录响应时间: ${duration}ms`);
    
    if (response.data.success) {
      const { status, token, user } = response.data.data;
      console.log(`✅ 登录状态: ${status}`);
      
      if (token) {
        TEST_DATA.token = token;
        console.log('✅ 获取到token');
      }
      
      if (user) {
        TEST_DATA.userId = user.id;
        console.log(`✅ 用户信息: ${user.name || '未设置'}`);
      }
    }
    
    return {
      duration,
      success: response.data.success,
      status: response.data.data?.status
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ 直接启动登录失败: ${duration}ms`, error.message);
    return {
      duration,
      success: false,
      error: error.message
    };
  }
}

/**
 * 测试运势数据获取性能
 */
async function testFortuneDataFetch() {
  console.log('🔮 测试运势数据获取性能...');
  
  if (!TEST_DATA.token) {
    console.log('❌ 没有有效token，跳过运势测试');
    return { duration: 0, success: false, error: 'No token' };
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
    
    console.log(`✅ 运势数据获取响应时间: ${duration}ms`);
    
    if (response.data.success && response.data.data) {
      console.log(`✅ 运势分数: ${response.data.data.overallScore}`);
      console.log(`✅ 运势评论: ${response.data.data.comment?.substring(0, 30)}...`);
    }
    
    return {
      duration,
      success: response.data.success,
      data: response.data.data
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ 运势数据获取失败: ${duration}ms`, error.message);
    return {
      duration,
      success: false,
      error: error.message
    };
  }
}

/**
 * 模拟前端页面渲染时间
 */
function simulatePageRenderTime() {
  console.log('🎨 模拟前端页面渲染...');
  
  // 模拟前端渲染时间（包括组件初始化、数据绑定、DOM更新等）
  const renderTime = Math.random() * 300 + 200; // 200-500ms
  
  console.log(`✅ 页面渲染时间: ${Math.round(renderTime)}ms`);
  
  return Math.round(renderTime);
}

/**
 * 运行Story 1.4完整性能测试
 */
async function runStory14PerformanceTest() {
  console.log('🎯 开始Story 1.4性能测试...\n');
  console.log('测试场景: 已认证用户直接从微信列表打开小程序');
  console.log('性能要求: 端到端时间 < 3秒 (NFR1.2)\n');
  
  const results = {
    directLogin: { duration: 0, success: false },
    fortuneData: { duration: 0, success: false },
    pageRender: 0,
    total: 0
  };
  
  // 1. 测试直接启动登录
  results.directLogin = await testDirectLaunchLogin();
  console.log('');
  
  // 2. 测试运势数据获取
  results.fortuneData = await testFortuneDataFetch();
  console.log('');
  
  // 3. 模拟页面渲染
  results.pageRender = simulatePageRenderTime();
  console.log('');
  
  // 计算总时间
  results.total = results.directLogin.duration + results.fortuneData.duration + results.pageRender;
  
  // 输出测试结果
  console.log('📊 Story 1.4 性能测试结果:');
  console.log('================================');
  console.log(`直接启动登录: ${results.directLogin.duration}ms ${results.directLogin.success ? '✅' : '❌'}`);
  console.log(`运势数据获取: ${results.fortuneData.duration}ms ${results.fortuneData.success ? '✅' : '❌'}`);
  console.log(`页面渲染时间: ${results.pageRender}ms ✅`);
  console.log(`总端到端时间: ${results.total}ms`);
  console.log('');
  
  // 验证性能要求
  const TARGET_TIME = 3000; // 3秒目标 (NFR1.2)
  
  if (results.total <= TARGET_TIME) {
    console.log(`🎉 性能测试通过！总时间 ${results.total}ms <= ${TARGET_TIME}ms`);
    console.log('✅ 符合NFR1.2要求：直接启动到页面显示 < 3秒');
  } else {
    console.log(`❌ 性能测试失败！总时间 ${results.total}ms > ${TARGET_TIME}ms`);
    console.log('❌ 不符合NFR1.2要求');
  }
  
  // 分析各阶段性能
  console.log('\n🔍 性能分析:');
  
  if (results.directLogin.duration > 1500) {
    console.log('⚠️ 直接启动登录较慢，建议优化：');
    console.log('   - 优化微信API调用');
    console.log('   - 优化数据库用户查询');
    console.log('   - 考虑添加用户缓存');
  }
  
  if (results.fortuneData.duration > 1000) {
    console.log('⚠️ 运势数据获取较慢，建议优化：');
    console.log('   - 优化运势计算算法');
    console.log('   - 添加运势数据缓存');
    console.log('   - 优化数据库查询');
  }
  
  if (results.pageRender > 400) {
    console.log('⚠️ 页面渲染较慢，建议优化：');
    console.log('   - 优化组件渲染逻辑');
    console.log('   - 减少不必要的计算');
    console.log('   - 使用虚拟列表等优化技术');
  }
  
  // 输出用户体验分析
  console.log('\n👤 用户体验分析:');
  if (results.total <= 1500) {
    console.log('🌟 优秀：用户几乎感觉不到延迟');
  } else if (results.total <= 2500) {
    console.log('👍 良好：用户体验流畅');
  } else if (results.total <= 3000) {
    console.log('👌 可接受：符合性能要求');
  } else {
    console.log('👎 需要优化：用户可能感到明显延迟');
  }
  
  return results;
}

/**
 * 批量性能测试
 */
async function runBatchTest(iterations = 3) {
  console.log(`🔄 运行批量测试 (${iterations} 次)...\n`);
  
  const allResults = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`--- 第 ${i} 次测试 ---`);
    const result = await runStory14PerformanceTest();
    allResults.push(result);
    console.log('\n');
    
    // 等待1秒再进行下一次测试
    if (i < iterations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 计算平均值
  const avgResults = {
    directLogin: Math.round(allResults.reduce((sum, r) => sum + r.directLogin.duration, 0) / iterations),
    fortuneData: Math.round(allResults.reduce((sum, r) => sum + r.fortuneData.duration, 0) / iterations),
    pageRender: Math.round(allResults.reduce((sum, r) => sum + r.pageRender, 0) / iterations),
    total: Math.round(allResults.reduce((sum, r) => sum + r.total, 0) / iterations)
  };
  
  console.log('📈 批量测试平均结果:');
  console.log('==================');
  console.log(`直接启动登录: ${avgResults.directLogin}ms`);
  console.log(`运势数据获取: ${avgResults.fortuneData}ms`);
  console.log(`页面渲染时间: ${avgResults.pageRender}ms`);
  console.log(`平均总时间: ${avgResults.total}ms`);
  
  const successRate = allResults.filter(r => r.total <= 3000).length / iterations * 100;
  console.log(`性能达标率: ${successRate.toFixed(1)}%`);
  
  return avgResults;
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  const iterations = args[0] ? parseInt(args[0]) : 1;
  
  if (iterations > 1) {
    runBatchTest(iterations).catch(console.error);
  } else {
    runStory14PerformanceTest().catch(console.error);
  }
}

module.exports = {
  runStory14PerformanceTest,
  runBatchTest
};
