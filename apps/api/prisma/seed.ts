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
  // 统一使用抖音商城网页版链接（适配网页环境）
  const douyinShopUrl =
    'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1';

  // 商品数据配置
  const productConfigs = [
    {
      name: '蓝宝石手链',
      description: '五行属水，完美契合水象星座，提升财运与智慧',
      imageUrl: 'https://i.postimg.cc/cJm5Wjsf/shang-pin-tu.png',
      price: 299,
    },
    {
      name: '黄水晶手链',
      description: '五行属土，稳定心神，增强财富积累能力',
      imageUrl: 'https://i.postimg.cc/Cx60jmBq/huang-shui-jing.png',
      price: 599,
    },
    {
      name: '红玛瑙手链',
      description: '五行属火，激发热情与活力，增强事业运势',
      imageUrl: 'https://i.postimg.cc/XvGbxdd8/hong-ma-nao.png',
      price: 199,
    },
    {
      name: '绿松石手链',
      description: '五行属木，促进成长与和谐，提升爱情运势',
      imageUrl: 'https://i.postimg.cc/KYk2QBth/lu-song-shi.jpg',
      price: 399,
    },
    {
      name: '白水晶手链',
      description: '五行属金，净化能量，提升整体运势平衡',
      imageUrl: 'https://i.postimg.cc/hGzBMTT5/bai-shui-jing.png',
      price: 159,
    },
  ];

  const products = await Promise.all(
    productConfigs.map((config) =>
      prisma.product.create({
        data: {
          ...config,
          douyinUrl: douyinShopUrl,
        },
      }),
    ),
  );

  console.log(`✅ 创建了 ${products.length} 个商品记录`);

  // 创建开发场景测试用户
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
    // 用户4：网页版测试用户A（用于场景B测试）
    prisma.user.create({
      data: {
        wechatOpenId: 'web_zhangsan',
        username: 'zhangsan',
        password: '123456',
        name: '张三',
        birthday: new Date('1990-01-01'),
      },
    }),
    // 用户5：网页版测试用户B（用于场景B测试）
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

  console.log(`✅ 创建了 ${users.length} 个测试用户`);

  // 创建开发场景测试手链
  const braceletConfigs = [
    // ========== 小程序测试手链 ==========
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

    // ========== 网页版测试手链 ==========
    // 场景A：真实nfcId + 未绑定（首次绑定）
    {
      nfcId: 'LOCAL_TEST1000',
      userId: null,
      comment: '【网页版-场景A】未绑定手链，用于测试首次绑定流程',
    },
    {
      nfcId: 'LOCAL_TEST1001',
      userId: null,
      comment: '【网页版-场景A】未绑定手链，用于测试首次绑定流程',
    },
    {
      nfcId: 'LOCAL_TEST1002',
      userId: null,
      comment: '【网页版-场景A】未绑定手链，用于测试首次绑定流程',
    },

    // 场景B：真实nfcId + 已绑定（需要登录）
    {
      nfcId: 'LOCAL_TEST2000',
      userId: users[3].id, // 绑定给用户4（张三）
      comment: '【网页版-场景B】已绑定给张三，用于测试登录验证流程',
    },
    {
      nfcId: 'LOCAL_TEST2001',
      userId: users[4].id, // 绑定给用户5（李四）
      comment: '【网页版-场景B】已绑定给李四，用于测试登录验证流程',
    },

    // 额外的未绑定手链（用于测试一个用户绑定多个手链）
    {
      nfcId: 'LOCAL_TEST3000',
      userId: null,
      comment: '【网页版-扩展】未绑定手链，用于测试同一用户绑定多个手链',
    },
    {
      nfcId: 'LOCAL_TEST3001',
      userId: null,
      comment: '【网页版-扩展】未绑定手链，用于测试同一用户绑定多个手链',
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
        // 新增详细运势字段
        summary: '运势平稳，宜静不宜动',
        astroAnalysis: '今日星盘显示，土星与月亮形成和谐相位，适合内省与学习。',
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
        // 新增详细运势字段
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

  console.log(`✅ 创建了 ${fortunes.length} 条运势记录`);
  console.log(
    '🤖 注意：用户1（dev_user_123）没有今日运势记录，将触发AI生成功能',
  );

  // 输出小程序测试场景说明
  console.log('\n🧪 小程序AI生成测试场景配置:');
  console.log('   场景2: 新访客触碰未绑定手链 (NFC_FRESH_2025_001)');
  console.log('   → 用户登录并绑定手链后，因无今日运势记录，将调用AI生成');
  console.log('   场景6: 已认证用户触碰自己手链 (NFC_OWNED_BY_USER_123)');
  console.log('   → 用户1因无今日运势记录，将调用AI生成');
  console.log('   场景5: 已认证用户触碰未绑定手链 (NFC_FRESH_2025_002)');
  console.log('   → 用户1绑定新手链后，因无今日运势记录，将调用AI生成');
  console.log('   场景7: 已认证用户直接进入');
  console.log('   → 用户1因无今日运势记录，将调用AI生成');
  console.log('\n💡 其他场景将使用预览模式或现有运势记录');

  // 输出网页版测试场景说明
  console.log('\n\n🌐 网页版测试场景配置:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📌 场景A：真实nfcId + 未绑定（首次绑定）');
  console.log('   测试URL: http://localhost:5173/?nfcId=LOCAL_TEST1000');
  console.log('   操作步骤:');
  console.log('     1. 访问上述URL');
  console.log('     2. 填写表单（用户名、密码、生日）');
  console.log('     3. 点击保存');
  console.log('   预期结果:');
  console.log('     ✅ 创建新用户');
  console.log('     ✅ 绑定nfcId到bracelets表');
  console.log('     ✅ 保存登录状态（userType: bound）');
  console.log('     ✅ 跳转到AI生成页面');
  console.log('   可用nfcId: LOCAL_TEST1000, LOCAL_TEST1001, LOCAL_TEST1002');

  console.log('\n📌 场景B：真实nfcId + 已绑定（需要登录）');
  console.log('   测试URL: http://localhost:5173/?nfcId=LOCAL_TEST2000');
  console.log('   测试账号:');
  console.log('     用户名: zhangsan');
  console.log('     密码: 123456');
  console.log('     生日: 1990-01-01');
  console.log('   操作步骤:');
  console.log('     1. 访问上述URL');
  console.log('     2. 填写张三的用户名和密码');
  console.log('     3. 点击保存');
  console.log('   预期结果:');
  console.log('     ✅ 验证用户名+密码+nfcId匹配');
  console.log('     ✅ 登录成功');
  console.log('     ✅ 保存登录状态（userType: bound）');
  console.log('     ✅ 跳转到AI生成页面');
  console.log('   已绑定nfcId:');
  console.log('     - LOCAL_TEST2000 → 张三 (zhangsan/123456)');
  console.log('     - LOCAL_TEST2001 → 李四 (lisi/654321)');

  console.log('\n📌 场景C：虚假nfcId或无nfcId（访客用户）');
  console.log('   测试URL: http://localhost:5173/?nfcId=FAKE_ID_999');
  console.log('   或: http://localhost:5173/');
  console.log('   操作步骤:');
  console.log('     1. 访问上述URL');
  console.log('     2. 填写表单（用户名、密码、生日）');
  console.log('     3. 点击保存');
  console.log('   预期结果:');
  console.log('     ✅ 创建新用户');
  console.log('     ❌ 不绑定到bracelets表');
  console.log('     ✅ 保存登录状态（userType: visitor）');
  console.log('     ✅ 跳转到访客版运势页面（跳过AI生成）');

  console.log('\n📌 扩展测试：同一用户绑定多个手链');
  console.log('   操作步骤:');
  console.log('     1. 先用张三绑定 LOCAL_TEST1000');
  console.log('     2. 清除浏览器缓存');
  console.log('     3. 访问 http://localhost:5173/?nfcId=LOCAL_TEST3000');
  console.log('     4. 填写张三的用户名和密码');
  console.log('   预期结果:');
  console.log('     ✅ 张三可以绑定多个不同的nfcId');
  console.log('     ✅ 每个nfcId只能绑定一个用户');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🎉 种子数据填充完成！');
  console.log('\n💡 提示：运行 cd apps/api && pnpm db:seed 可重新初始化数据库');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
