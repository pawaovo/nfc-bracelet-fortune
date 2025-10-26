import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据填充...');

  // 清理现有数据（开发环境）
  await prisma.dailyFortune.deleteMany();
  await prisma.bracelet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // 创建示例商品数据
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '蓝宝石手链',
        description: '五行属水，完美契合水象星座，提升财运与智慧',
        imageUrl: 'https://example.com/images/sapphire-bracelet.jpg',
        price: 299,
        douyinUrl: 'https://v.douyin.com/example-sapphire',
      },
    }),
    prisma.product.create({
      data: {
        name: '红玛瑙手链',
        description: '五行属火，激发热情与活力，增强事业运势',
        imageUrl: 'https://example.com/images/red-agate-bracelet.jpg',
        price: 199,
        douyinUrl: 'https://v.douyin.com/example-red-agate',
      },
    }),
    prisma.product.create({
      data: {
        name: '绿松石手链',
        description: '五行属木，促进成长与和谐，提升爱情运势',
        imageUrl: 'https://example.com/images/turquoise-bracelet.jpg',
        price: 399,
        douyinUrl: 'https://v.douyin.com/example-turquoise',
      },
    }),
    prisma.product.create({
      data: {
        name: '黄水晶手链',
        description: '五行属土，稳定心神，增强财富积累能力',
        imageUrl: 'https://example.com/images/citrine-bracelet.jpg',
        price: 599,
        douyinUrl: 'https://v.douyin.com/example-citrine',
      },
    }),
    prisma.product.create({
      data: {
        name: '白水晶手链',
        description: '五行属金，净化能量，提升整体运势平衡',
        imageUrl: 'https://example.com/images/clear-quartz-bracelet.jpg',
        price: 159,
        douyinUrl: 'https://v.douyin.com/example-clear-quartz',
      },
    }),
  ]);

  console.log(`✅ 创建了 ${products.length} 个商品记录`);

  // 创建开发场景测试用户
  const users = await Promise.all([
    // 用户1：已认证用户（信息完整）
    prisma.user.create({
      data: {
        wechatOpenId: 'dev_user_123',
        name: '测试用户',
        birthday: new Date('1990-01-01'),
      },
    }),
    // 用户2：信息不完整用户
    prisma.user.create({
      data: {
        wechatOpenId: 'dev_user_456',
        name: null,
        birthday: null,
      },
    }),
    // 用户3：其他用户（用于测试"他人手链"场景）
    prisma.user.create({
      data: {
        wechatOpenId: 'dev_other_user_789',
        name: '其他用户',
        birthday: new Date('1985-06-15'),
      },
    }),
  ]);

  console.log(`✅ 创建了 ${users.length} 个测试用户`);

  // 创建开发场景测试手链
  const braceletConfigs = [
    // 已绑定手链
    {
      nfcId: 'NFC_OWNED_BY_USER_123',
      userId: users[0].id,
      comment: '已被用户1绑定（用于测试"已认证用户触碰自己手链"）',
    },
    {
      nfcId: 'NFC_BOUND_TO_OTHER_001',
      userId: users[2].id,
      comment: '已被其他用户绑定（用于测试"触碰他人手链"场景）',
    },
    {
      nfcId: 'NFC_BOUND_TO_OTHER_002',
      userId: users[2].id,
      comment: '已被其他用户绑定（用于测试"触碰他人手链"场景）',
    },
    // 未绑定手链
    {
      nfcId: 'NFC_FRESH_2025_001',
      userId: null,
      comment: '未绑定手链（用于测试"触碰未绑定手链"场景）',
    },
    {
      nfcId: 'NFC_FRESH_2025_002',
      userId: null,
      comment: '未绑定手链（用于测试"触碰未绑定手链"场景）',
    },
    {
      nfcId: 'NFC_FRESH_2025_003',
      userId: null,
      comment: '未绑定手链（用于测试"触碰未绑定手链"场景）',
    },
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

  console.log(`✅ 创建了 ${bracelets.length} 个测试手链`);

  // 创建开发场景运势记录
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const fortunes = await Promise.all([
    // 🚫 注意：故意不为用户1创建今日运势，以便测试AI生成功能
    // 这样场景6（已认证用户触碰自己手链）和场景2（新访客触碰未绑定手链后绑定）
    // 都会因为没有今日运势而触发AI生成流程

    // 为已认证用户（用户1）创建昨日运势（保留历史数据功能测试）
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
      },
    }),
    // 为其他用户（用户3）创建今日运势（用于访客预览场景1和场景4）
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
      },
    }),
  ]);

  console.log(`✅ 创建了 ${fortunes.length} 条运势记录`);
  console.log(
    '🤖 注意：用户1（dev_user_123）没有今日运势记录，将触发AI生成功能',
  );

  // 输出AI测试场景说明
  console.log('\n🧪 AI生成测试场景配置:');
  console.log('   场景2: 新访客触碰未绑定手链 (NFC_FRESH_2025_001)');
  console.log('   → 用户登录并绑定手链后，因无今日运势记录，将调用AI生成');
  console.log('   场景6: 已认证用户触碰自己手链 (NFC_OWNED_BY_USER_123)');
  console.log('   → 用户1因无今日运势记录，将调用AI生成');
  console.log('   场景5: 已认证用户触碰未绑定手链 (NFC_FRESH_2025_002)');
  console.log('   → 用户1绑定新手链后，因无今日运势记录，将调用AI生成');
  console.log('   场景7: 已认证用户直接进入');
  console.log('   → 用户1因无今日运势记录，将调用AI生成');
  console.log('\n💡 其他场景将使用预览模式或现有运势记录');

  console.log('\n🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
