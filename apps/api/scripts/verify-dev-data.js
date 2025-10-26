#!/usr/bin/env node

/**
 * 开发数据验证脚本
 * 用于验证种子数据是否正确生成，确保所有开发场景都有对应的数据支持
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDevData() {
  console.log('🔍 开始验证开发数据...\n');

  try {
    // 1. 验证用户数据
    console.log('📋 验证用户数据:');
    const users = await prisma.user.findMany({
      orderBy: { wechatOpenId: 'asc' },
    });

    const expectedUsers = [
      {
        wechatOpenId: 'dev_user_123',
        expectedName: '测试用户',
        shouldHaveProfile: true,
      },
      {
        wechatOpenId: 'dev_user_456',
        expectedName: null,
        shouldHaveProfile: false,
      },
      {
        wechatOpenId: 'dev_other_user_789',
        expectedName: '其他用户',
        shouldHaveProfile: true,
      },
    ];

    for (const expected of expectedUsers) {
      const user = users.find((u) => u.wechatOpenId === expected.wechatOpenId);
      if (!user) {
        console.log(`❌ 缺少用户: ${expected.wechatOpenId}`);
        continue;
      }

      // 检查姓名
      if (user.name !== expected.expectedName) {
        console.log(
          `❌ 用户 ${expected.wechatOpenId} 姓名不符合预期: 期望 ${expected.expectedName}, 实际 ${user.name}`,
        );
        continue;
      }

      // 检查信息完整性
      const hasProfile = !!(user.name && user.birthday);
      if (hasProfile !== expected.shouldHaveProfile) {
        console.log(
          `❌ 用户 ${expected.wechatOpenId} 信息完整性不符合预期: 期望 ${expected.shouldHaveProfile}, 实际 ${hasProfile}`,
        );
        continue;
      }

      console.log(
        `✅ 用户 ${expected.wechatOpenId}: ${user.name || '信息不完整'} (UUID: ${user.id.substring(0, 8)}...)`,
      );
    }

    // 2. 验证手链数据
    console.log('\n🔗 验证手链数据:');
    const bracelets = await prisma.bracelet.findMany({
      include: { user: true },
      orderBy: { nfcId: 'asc' },
    });

    const expectedBracelets = [
      {
        nfcId: 'NFC_BOUND_TO_OTHER_001',
        shouldBeBound: true,
        boundTo: 'dev_other_user_789',
      },
      {
        nfcId: 'NFC_BOUND_TO_OTHER_002',
        shouldBeBound: true,
        boundTo: 'dev_other_user_789',
      },
      { nfcId: 'NFC_FRESH_2025_001', shouldBeBound: false },
      { nfcId: 'NFC_FRESH_2025_002', shouldBeBound: false },
      { nfcId: 'NFC_FRESH_2025_003', shouldBeBound: false },
      {
        nfcId: 'NFC_OWNED_BY_USER_123',
        shouldBeBound: true,
        boundTo: 'dev_user_123',
      },
    ];

    for (const expected of expectedBracelets) {
      const bracelet = bracelets.find((b) => b.nfcId === expected.nfcId);
      if (!bracelet) {
        console.log(`❌ 缺少手链: ${expected.nfcId}`);
        continue;
      }

      if (expected.shouldBeBound) {
        if (!bracelet.user || bracelet.user.wechatOpenId !== expected.boundTo) {
          console.log(`❌ 手链 ${expected.nfcId} 绑定状态不正确`);
          continue;
        }
        console.log(
          `✅ 手链 ${expected.nfcId}: 已绑定给 ${bracelet.user.wechatOpenId}`,
        );
      } else {
        if (bracelet.user) {
          console.log(`❌ 手链 ${expected.nfcId} 应该未绑定但实际已绑定`);
          continue;
        }
        console.log(`✅ 手链 ${expected.nfcId}: 未绑定`);
      }
    }

    // 3. 验证运势数据
    console.log('\n🔮 验证运势数据:');
    const fortunes = await prisma.dailyFortune.findMany({
      include: { user: true },
      orderBy: [{ userId: 'asc' }, { date: 'desc' }],
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 检查主要用户的运势数据
    const mainUser = users.find((u) => u.wechatOpenId === 'dev_user_123');
    const otherUser = users.find(
      (u) => u.wechatOpenId === 'dev_other_user_789',
    );

    if (mainUser) {
      const todayFortune = fortunes.find(
        (f) => f.userId === mainUser.id && f.date === today,
      );
      const yesterdayFortune = fortunes.find(
        (f) => f.userId === mainUser.id && f.date === yesterdayStr,
      );

      if (todayFortune) {
        console.log(`✅ 主用户今日运势: 分数 ${todayFortune.overallScore}`);
      } else {
        console.log(`❌ 缺少主用户今日运势`);
      }

      if (yesterdayFortune) {
        console.log(`✅ 主用户历史运势: 分数 ${yesterdayFortune.overallScore}`);
      } else {
        console.log(`❌ 缺少主用户历史运势`);
      }
    }

    if (otherUser) {
      const otherTodayFortune = fortunes.find(
        (f) => f.userId === otherUser.id && f.date === today,
      );
      if (otherTodayFortune) {
        console.log(
          `✅ 其他用户今日运势: 分数 ${otherTodayFortune.overallScore} (用于访客预览)`,
        );
      } else {
        console.log(`❌ 缺少其他用户今日运势`);
      }
    }

    // 4. 验证商品数据
    console.log('\n🛍️ 验证商品数据:');
    const products = await prisma.product.findMany();
    if (products.length >= 5) {
      console.log(`✅ 商品数据: ${products.length} 个商品`);
    } else {
      console.log(`❌ 商品数据不足: 只有 ${products.length} 个商品`);
    }

    console.log('\n🎉 数据验证完成！');
    console.log('\n📝 开发场景测试指南:');
    console.log(
      '1. 修改 apps/wx-app/src/config/dev-scenarios.ts 中的 currentScenario',
    );
    console.log('2. 保存文件，前端会自动重新编译');
    console.log('3. 在微信开发者工具中查看效果');
    console.log('4. 观察前后端日志确认场景切换成功');
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  verifyDevData();
}

module.exports = { verifyDevData };
