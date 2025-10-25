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

  // 创建示例用户（用于测试）
  const testUser = await prisma.user.create({
    data: {
      wechatOpenId: 'test_openid_12345',
      name: '测试用户',
      birthday: new Date('1990-05-15'),
    },
  });

  console.log(`✅ 创建了测试用户: ${testUser.name}`);

  // 创建示例手链
  const testBracelet = await prisma.bracelet.create({
    data: {
      nfcId: 'NFC_TEST_001',
      userId: testUser.id,
      boundAt: new Date(),
    },
  });

  console.log(`✅ 创建了测试手链: ${testBracelet.nfcId}`);

  // 创建示例运势记录
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const fortunes = await Promise.all([
    prisma.dailyFortune.create({
      data: {
        userId: testUser.id,
        date: today,
        overallScore: 88,
        comment: '今日运势极佳，适合开展新项目',
        careerLuck: 85,
        wealthLuck: 80,
        loveLuck: 90,
        luckyColor: '蓝色',
        luckyNumber: 8,
        suggestion: '今天适合开展新项目，把握合作机会',
        recommendationId: products[0].id,
      },
    }),
    prisma.dailyFortune.create({
      data: {
        userId: testUser.id,
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
  ]);

  console.log(`✅ 创建了 ${fortunes.length} 条运势记录`);

  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
