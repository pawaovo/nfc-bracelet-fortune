#!/usr/bin/env node

/**
 * 快速更新 cpolar URL 配置脚本
 *
 * 使用方法:
 * node scripts/update-cpolar-url.js https://abc123.cpolar.cn
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ 错误: 请提供 cpolar URL');
  console.log('');
  console.log('使用方法:');
  console.log('  node scripts/update-cpolar-url.js https://abc123.cpolar.cn');
  console.log('');
  process.exit(1);
}

const cpolarUrl = args[0];

// 验证 URL 格式
if (!cpolarUrl.startsWith('https://')) {
  console.error('❌ 错误: URL 必须以 https:// 开头');
  console.log('');
  console.log('示例:');
  console.log('  https://abc123.cpolar.cn');
  console.log('');
  process.exit(1);
}

// 配置文件路径
const configPath = path.join(__dirname, '../apps/wx-app/src/api/config.ts');

try {
  // 读取配置文件
  let content = fs.readFileSync(configPath, 'utf8');

  // 替换 TUNNEL_BASE_URL
  const tunnelUrlRegex = /TUNNEL_BASE_URL:\s*'[^']*'/;
  if (!tunnelUrlRegex.test(content)) {
    console.error('❌ 错误: 未找到 TUNNEL_BASE_URL 配置');
    process.exit(1);
  }

  content = content.replace(tunnelUrlRegex, `TUNNEL_BASE_URL: '${cpolarUrl}'`);

  // 替换 CURRENT_ENV 为 'tunnel'
  const currentEnvRegex = /const CURRENT_ENV: EnvType = '[^']*'/;
  if (!currentEnvRegex.test(content)) {
    console.error('❌ 错误: 未找到 CURRENT_ENV 配置');
    process.exit(1);
  }

  content = content.replace(currentEnvRegex, "const CURRENT_ENV: EnvType = 'tunnel'");

  // 写入文件
  fs.writeFileSync(configPath, content, 'utf8');

  console.log('✅ 配置更新成功！');
  console.log('');
  console.log('📝 已更新:');
  console.log(`   TUNNEL_BASE_URL: '${cpolarUrl}'`);
  console.log(`   CURRENT_ENV: 'tunnel'`);
  console.log('');
  console.log('🔄 下一步:');
  console.log('   1. 关闭开发模式: apps/wx-app/src/config/dev-scenarios.ts');
  console.log('      第112行: enabled: false');
  console.log('');
  console.log('   2. 编译小程序:');
  console.log('      cd apps/wx-app');
  console.log('      pnpm build:mp-weixin');
  console.log('');
  console.log('   3. 上传体验版');
  console.log('');
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}
