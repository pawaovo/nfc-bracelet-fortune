/**
 * 远程数据库种子数据脚本
 * 用于重置远程数据库并生成测试数据
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

// 远程数据库配置
const REMOTE_DATABASE_CONFIG = {
  // 外部连接（从本地电脑连接）
  external:
    'postgresql://bracelet-fortune:HvXFmwEwfntnScWZRJyB@47.239.179.9:15432/bracelet-fortune?schema=public',
  // 内部连接（从服务器内部连接）
  internal:
    'postgresql://bracelet-fortune:HvXFmwEwfntnScWZRJyB@1Panel-postgresql-0i7g:5432/bracelet-fortune?schema=public',
};

// 创建 readline 接口用于用户确认
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 询问用户确认
function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌱 远程数据库种子数据填充工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('⚠️  警告：此操作将会：');
  console.log('   1. 清空远程数据库的所有数据');
  console.log('   2. 重新生成测试数据');
  console.log('');
  console.log('📍 目标数据库：');
  console.log('   地址: 47.239.179.9:15432');
  console.log('   数据库: bracelet-fortune');
  console.log('   用户: bracelet-fortune');
  console.log('');

  // 询问用户确认
  const confirmed = await askConfirmation('❓ 确定要继续吗？(y/N): ');

  if (!confirmed) {
    console.log('');
    console.log('❌ 操作已取消');
    rl.close();
    process.exit(0);
  }

  console.log('');
  console.log('🔄 开始连接远程数据库...');

  // 使用外部连接地址
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: REMOTE_DATABASE_CONFIG.external,
      },
    },
  });

  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    console.log('');

    // 导入并执行种子数据逻辑
    console.log('🌱 开始种子数据填充...');
    console.log('');

    // 清理现有数据
    console.log('🗑️  清理现有数据...');
    await prisma.dailyFortune.deleteMany();
    console.log('   ✓ 清理运势记录');
    await prisma.bracelet.deleteMany();
    console.log('   ✓ 清理手链记录');
    await prisma.user.deleteMany();
    console.log('   ✓ 清理用户记录');
    await prisma.product.deleteMany();
    console.log('   ✓ 清理商品记录');
    console.log('');

    // 创建示例商品数据
    console.log('📦 创建商品数据...');
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: '蓝宝石手链',
          description: '五行属水，完美契合水象星座，提升财运与智慧',
          imageUrl: 'https://i.postimg.cc/cJm5Wjsf/shang-pin-tu.png',
          price: 299,
          douyinUrl: 'https://v.douyin.com/example-sapphire',
        },
      }),
      prisma.product.create({
        data: {
          name: '黄水晶手链',
          description: '五行属土，稳定心神，增强财富积累能力',
          imageUrl: 'https://i.postimg.cc/Cx60jmBq/huang-shui-jing.png',
          price: 599,
          douyinUrl: 'https://v.douyin.com/example-citrine',
        },
      }),
      prisma.product.create({
        data: {
          name: '红玛瑙手链',
          description: '五行属火，激发热情与活力，增强事业运势',
          imageUrl: 'https://i.postimg.cc/XvGbxdd8/hong-ma-nao.png',
          price: 199,
          douyinUrl: 'https://v.douyin.com/example-red-agate',
        },
      }),
      prisma.product.create({
        data: {
          name: '绿松石手链',
          description: '五行属木，促进成长与和谐，提升爱情运势',
          imageUrl: 'https://i.postimg.cc/KYk2QBth/lu-song-shi.jpg',
          price: 399,
          douyinUrl: 'https://v.douyin.com/example-turquoise',
        },
      }),
      prisma.product.create({
        data: {
          name: '白水晶手链',
          description: '五行属金，净化能量，提升整体运势平衡',
          imageUrl: 'https://i.postimg.cc/hGzBMTT5/bai-shui-jing.png',
          price: 159,
          douyinUrl: 'https://v.douyin.com/example-clear-quartz',
        },
      }),
    ]);
    console.log(`   ✓ 创建了 ${products.length} 个商品记录`);
    console.log('');

    // 创建测试用户
    console.log('👥 创建测试用户...');
    const users = await Promise.all([
      // 用户1：已认证用户（信息完整）- 小程序用户
      prisma.user.create({
        data: {
          wechatOpenId: 'dev_user_123',
          username: 'bracelet_master',
          password: 'bracelet123',
          name: '测试用户',
          birthday: new Date('1990-01-01'),
        },
      }),
      // 用户2：信息不完整用户
      prisma.user.create({
        data: {
          wechatOpenId: 'dev_user_456',
          username: null,
          password: null,
          name: null,
          birthday: null,
        },
      }),
      // 用户3：其他用户（用于测试"他人手链"场景）
      prisma.user.create({
        data: {
          wechatOpenId: 'dev_other_user_789',
          username: 'other_master',
          password: 'bracelet456',
          name: '其他用户',
          birthday: new Date('1985-06-15'),
        },
      }),
      // 用户4：网页版测试用户A
      prisma.user.create({
        data: {
          wechatOpenId: 'web_zhangsan',
          username: 'zhangsan',
          password: '123456',
          name: '张三',
          birthday: new Date('1990-01-01'),
        },
      }),
      // 用户5：网页版测试用户B
      prisma.user.create({
        data: {
          wechatOpenId: 'web_lisi',
          username: 'lisi',
          password: '654321',
          name: '李四',
          birthday: new Date('1995-05-05'),
        },
      }),
    ]);
    console.log(`   ✓ 创建了 ${users.length} 个测试用户`);
    console.log('');

    // 创建测试手链
    console.log('📿 创建测试手链...');
    const braceletConfigs = [
      // 小程序测试手链
      { nfcId: 'NFC_OWNED_BY_USER_123', userId: users[0].id },
      { nfcId: 'NFC_BOUND_TO_OTHER_001', userId: users[2].id },
      { nfcId: 'NFC_BOUND_TO_OTHER_002', userId: users[2].id },
      { nfcId: 'NFC_FRESH_2025_001', userId: null },
      { nfcId: 'NFC_FRESH_2025_002', userId: null },
      { nfcId: 'NFC_FRESH_2025_003', userId: null },
      // 网页版测试手链
      { nfcId: 'LOCAL_TEST1000', userId: null },
      { nfcId: 'LOCAL_TEST2000', userId: null },
      { nfcId: 'LOCAL_TEST3000', userId: null },
      { nfcId: 'WEB_BOUND_ZHANGSAN', userId: users[3].id },
      { nfcId: 'WEB_BOUND_LISI', userId: users[4].id },
    ];

    const bracelets = await Promise.all(
      braceletConfigs.map((config) =>
        prisma.bracelet.create({
          data: {
            nfcId: config.nfcId,
            userId: config.userId,
            boundAt: config.userId ? new Date() : null,
          },
        }),
      ),
    );
    console.log(`   ✓ 创建了 ${bracelets.length} 个测试手链`);
    console.log('');

    // 创建运势记录
    console.log('🔮 创建运势记录...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const fortunes = await Promise.all([
      // 为用户1创建昨日运势
      prisma.dailyFortune.create({
        data: {
          userId: users[0].id,
          date: yesterdayStr,
          overallScore: 72,
          comment: '运势平稳，宜静不宜动',
          careerLuck: 70,
          wealthLuck: 75,
          loveLuck: 68,
          luckyColor: '绿色',
          luckyNumber: 3,
          suggestion: '今天适合学习思考，不宜冒险',
          recommendationId: products[2].id,
          summary: '运势平稳，宜静不宜动',
          astroAnalysis:
            '今日星盘显示，土星与月亮形成和谐相位，适合内省与学习。',
          careerAnalysis: '事业运平稳，适合巩固现有成果，不宜冒进。',
          wealthAnalysis: '财运稳定，适合理财规划，避免投机。',
          loveAnalysis: '爱情运温和，适合深入交流，增进感情。',
          careerStars: 3.5,
          wealthStars: 3.5,
          loveStars: 3.0,
          avoidance: '避免冒险决策，避免冲动消费',
          suitable: '学习思考',
          unsuitable: '冒险投资',
        },
      }),
      // 为用户3创建今日运势
      prisma.dailyFortune.create({
        data: {
          userId: users[2].id,
          date: today,
          overallScore: 85,
          comment: '今日运势不错，适合尝试新事物',
          careerLuck: 80,
          wealthLuck: 85,
          loveLuck: 88,
          luckyColor: '红色',
          luckyNumber: 6,
          suggestion: '今天适合社交活动，多与朋友交流',
          recommendationId: products[1].id,
          summary: '今日运势不错，适合尝试新事物',
          astroAnalysis: '今日木星与太阳形成吉相，能量充沛，适合拓展新领域。',
          careerAnalysis: '事业运旺盛，适合主动出击，把握机遇。',
          wealthAnalysis: '财运亨通，适合投资理财，收益可期。',
          loveAnalysis: '爱情运极佳，单身者易遇良缘，有伴者感情升温。',
          careerStars: 4.0,
          wealthStars: 4.5,
          loveStars: 4.5,
          avoidance: '避免过度自信，避免忽视细节',
          suitable: '社交活动',
          unsuitable: '独处闭门',
        },
      }),
    ]);
    console.log(`   ✓ 创建了 ${fortunes.length} 条运势记录`);
    console.log('');

    console.log('✅ 种子数据填充完成！');
    console.log('');
    console.log('📊 数据统计：');
    console.log(`   - 商品: ${products.length} 条`);
    console.log(`   - 用户: ${users.length} 条`);
    console.log(`   - 手链: ${bracelets.length} 条`);
    console.log(`   - 运势: ${fortunes.length} 条`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('');
    console.error('❌ 种子数据填充失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
