import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据填充...');

  // 清理现有数据（开发环境）
  await prisma.dailyFortune.deleteMany();
  await prisma.bracelet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // 创建示例商品数据（基于product.md）
  const productConfigs = [
    {
      id: 'c9e6cc6b-96e0-4f97-8a46-48124b588d25',
      name: '财气叠加双面戴双层显脸小星币项链',
      description:
        '双层星币，星币也叫八芒星罗盘、罗盘玫瑰，事业的象征，上面那层是星币与孔雀石，孔雀石是事业的象征，下面那颗是星币与白贝母，财富的象征，这一款项链就是一条事业拉满的项链，在事业方面非常牛逼，同时双层的设计拉长脖颈线条，显得脸小 头小，非常老钱百搭，好看又功效拉满。',
      imageUrl: 'https://i.postimg.cc/1t6RHpgX/tu-pian3.png',
      price: 159,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300fa',
      name: '清冷贵气紫五花四叶草手链',
      description:
        '材质为天然紫玉髓，紫玉髓代表的是智慧，自律专注，感情与忠诚，在自生方面帮助你自律专注，帮助你想事情的头脑会直线上升，比如事业以及学习，在感情方面，让异性对你忠诚专注，"只有你"。事业学习感情与忠诚都推荐去戴紫玉髓。',
      imageUrl: 'https://i.postimg.cc/SxNsh252/tu-pian7.jpg',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'love'],
    },
    {
      id: 'c4e0cad5-25c4-4894-bcab-5ef480118765',
      name: '招财招桃花蝴蝶项链',
      description:
        '蝴蝶元素与绿松石材质相结合，蝴蝶本就寓意福气叠加，绿松石也被寓意为女性的幸运石；现在是九紫离火年，而蝴蝶属木，绿松石材质也属木，木旺火，且是蓝色的蝴蝶，蓝色为水，水又避免火过旺过燥，项链上还有一颗钻，钻为土元素，链条为电镀玫瑰金，集齐了金木水土四个元素，喜这几个元素或旺这几个元素的这条项链都是非常棒的选择；同时，由于这个项链戴绿松石材质以及蝴蝶元素，非常吸引优质男性的眼球，会帮助吸引优质大方的桃花，断绝不好店桃花',
      imageUrl: 'https://i.postimg.cc/d3YsSLrs/tu-pian1.png',
      price: 123,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['love'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300f3',
      name: '招财进宝八芒星罗盘星币手镯',
      description:
        '八芒星罗盘手镯，八方来财，它在专柜名称叫lucky罗盘，也叫罗盘玫瑰，罗盘代表是什么事业和方向，玫瑰代表是真爱。背面是澳大利亚进口的深海极光贝母，寓意着财富，且手镯是空心的软管，市面上2439独家，事业方面YYDS，一定是事业必冲款，适合所有做生意的人，有自己事儿在做的人戴，也适合想让家庭事业好的人戴，因为他不仅对你好，他会对你的家里人的事业也会好，玩股票，大牌打麻将的也可以带，会给你带来lucky。',
      imageUrl: 'https://i.postimg.cc/7Zh7v7N6/tu-pian4.png',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth', 'love'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300f1',
      name: '粉钻好运四叶草loop项链',
      description:
        '市面上找不到第二家有这种颜色的粉钻，也正因为这个钻的稀有所以对男人有致命的吸引力，会帮助吸引优质的有品位的男性，帮你来优质的桃花，loop意味着"圆环"，自古以来圆环就寓意着财富，属于这条项链想不招财都难，有钱又有爱。',
      imageUrl: 'https://i.postimg.cc/dt4dSnrH/tu-pian2.png',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth', 'love'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300f2',
      name: '招财进宝开口八芒星罗盘星币戒指',
      description: '事业必入款，推荐与星币手镯一套戴，双倍buff叠加',
      imageUrl: 'https://i.postimg.cc/nhr787GR/tu-pian3.png',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth', 'love'],
    },
    {
      id: 'c275a886-7b2c-4075-acad-8110325b9d08',
      name: '幸福之门满赚之门男女同款项链',
      description:
        '以纽约第五大道为原型，叫幸福之门，也叫满钻之门，寓意着家庭的幸福与美满，来的更多的是想与你结婚的优质异性，想要正缘的想结婚的必入',
      imageUrl: 'https://i.postimg.cc/Qt5NbpBy/tu-pian2.png',
      price: 199,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['love'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300fb',
      name: '限定天河间钻好运富贵净化能量五花手链',
      description:
        '采用珍稀材质天然老矿等级的天河石，全网独家天然没有酸洗注胶的对身体无害的天河石，天河石会帮助稳定情绪，治愈与平衡自己的能量，同时它是主攻喉轮的，会帮助增强语言表达能力，做主播的或者工作跟语言表达相关的非常推荐，并且这一款会让曾经的旧人回归，并且是对你很好的很优质的旧人回归，不好的不会回来，想要稳定自己情绪的，想让自己心心念念的旧人回来的可以选择天河，也是一款桃花方面的饰品，同时也是手链项链都有，推荐一套戴效果更好。同时这一款也是非常好看独特又有用。',
      imageUrl: 'https://i.postimg.cc/tg8CWrgH/tu-pian4.png',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['love', 'health'],
    },
    {
      id: '340f6471-a328-4701-85dd-d828baa2133a',
      name: '粉红蛋白招财进宝星币手链',
      description:
        '限量发售条的lucky罗盘，星币罗盘代表事业和方向；材质方面采用大自然的真材实料：俄罗斯进口粉红蛋石和澳大利亚进口的深海极光白贝母，粉红蛋白也叫粉欧泊，在五行中属火，它象征的是感情和事业，白贝母属水，水为财，也是一条在事业方面非常牛逼的手链',
      imageUrl: 'https://i.postimg.cc/HkZLsWDw/tu-pian6.png',
      price: 599,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth'],
    },
    {
      id: 'f636a4db-45f1-48d0-a632-7c400ad300fc',
      name: '招财招桃花绿松蝴蝶耳钉',
      description:
        '推荐与蝴蝶项链一套戴，招桃花方面会有1+1大于二的效果，且显白效果极佳',
      imageUrl: 'https://i.postimg.cc/cCWYPbFb/tu-pian1.png',
      price: 399,
      douyinUrl:
        'https://haohuo.jinritemai.com/ecommerce/trade/detail/index.html?id=3769553357765738866&origin_type=605&pd_hide_footer=1',
      fortuneTypes: ['career', 'wealth', 'love'],
    },
  ];

  const products = await Promise.all(
    productConfigs.map((config) =>
      prisma.product.create({
        data: config,
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
