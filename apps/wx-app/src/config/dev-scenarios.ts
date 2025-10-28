import { useAuthStore } from '@/stores/auth';

// 用户状态枚举
export type UserState = 'UNAUTHENTICATED' | 'AUTHENTICATED' | 'PROFILE_INCOMPLETE';

// 场景配置接口
export interface DevScenario {
  name: string;
  userState: UserState;
  nfcId: string | null;
  mockUserData?: {
    id: string;
    name: string | null;
    birthday: string | null;
  };
  mockPreviewData?: {
    score: number;
    recommendation: string;
  };
}

// 开发场景配置
export const DEV_SCENARIOS: Record<string, DevScenario> = {
  // 场景1：新访客 + NFC手链（已被他人绑定）
  VISITOR_BOUND_NFC: {
    name: '新访客触碰已绑定手链',
    userState: 'UNAUTHENTICATED',
    nfcId: 'NFC_BOUND_TO_OTHER_001',
    mockPreviewData: {
      score: 85,
      recommendation: '今日运势不错，适合尝试新事物',
    },
  },

  // 场景2：新访客 + NFC手链（未被任何人绑定）
  VISITOR_FRESH_NFC: {
    name: '新访客触碰未绑定手链',
    userState: 'UNAUTHENTICATED',
    nfcId: 'NFC_FRESH_2025_001',
  },

  // 场景3：新访客 + 直接点击小程序图标
  VISITOR_DIRECT: {
    name: '新访客直接进入',
    userState: 'UNAUTHENTICATED',
    nfcId: null,
  },

  // 场景4：已认证用户 + NFC手链（已被他人绑定）
  AUTH_USER_OTHER_NFC: {
    name: '已认证用户触碰他人手链',
    userState: 'AUTHENTICATED',
    nfcId: 'NFC_BOUND_TO_OTHER_002',
    mockUserData: {
      id: 'dev_user_123', // 修正：使用与数据库中wechatOpenId匹配的ID
      name: '测试用户',
      birthday: '1990-01-01',
    },
  },

  // 场景5：已认证用户 + NFC手链（未被任何人绑定）
  AUTH_USER_FRESH_NFC: {
    name: '已认证用户触碰未绑定手链',
    userState: 'AUTHENTICATED',
    nfcId: 'NFC_FRESH_2025_002',
    mockUserData: {
      id: 'dev_user_123', // 修正：使用与数据库中wechatOpenId匹配的ID
      name: '测试用户',
      birthday: '1990-01-01',
    },
  },

  // 场景6：已认证用户 + NFC手链（自己的手链）
  AUTH_USER_OWN_NFC: {
    name: '已认证用户触碰自己手链',
    userState: 'AUTHENTICATED',
    nfcId: 'NFC_OWNED_BY_USER_123',
    mockUserData: {
      id: 'dev_user_123', // 使用与数据库中wechatOpenId匹配的ID
      name: '测试用户',
      birthday: '1990-01-01',
    },
  },

  // 场景7：已认证用户 + 直接点击小程序图标
  AUTH_USER_DIRECT: {
    name: '已认证用户直接进入',
    userState: 'AUTHENTICATED',
    nfcId: null,
    mockUserData: {
      id: 'dev_user_123', // 使用与数据库中wechatOpenId匹配的ID
      name: '测试用户',
      birthday: '1990-01-01',
    },
  },

  // 特殊场景：信息不完整用户
  INCOMPLETE_PROFILE: {
    name: '信息不完整用户',
    userState: 'PROFILE_INCOMPLETE',
    nfcId: 'NFC_FRESH_2025_003',
    mockUserData: {
      id: 'dev_user_456', // 修正：使用与数据库中wechatOpenId匹配的ID
      name: null,
      birthday: null,
    },
  },
};

// 开发配置 - 只需要修改这里切换场景！
export const DEV_CONFIG = {
  enabled: true, // 开发模式总开关
  currentScenario: 'AUTH_USER_OWN_NFC' as keyof typeof DEV_SCENARIOS, // 👈 修改这里切换场景
};

/**
 * 应用开发场景配置
 */
export function applyDevScenario(scenarioKey: keyof typeof DEV_SCENARIOS, options: any): any {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!DEV_CONFIG.enabled) {
    return options;
  }

  const scenario = DEV_SCENARIOS[scenarioKey];
  if (!scenario) {
    console.warn(`🧪 未找到开发场景: ${scenarioKey}`);
    return options;
  }

  console.log(`🧪 应用开发场景: ${scenario.name}`);

  // 1. 模拟用户状态
  const authStore = useAuthStore();

  if (scenario.userState === 'UNAUTHENTICATED') {
    // 清除认证状态，模拟未登录用户
    authStore.logout();
    uni.removeStorageSync('currentNfcId');
  } else if (
    (scenario.userState === 'AUTHENTICATED' || scenario.userState === 'PROFILE_INCOMPLETE') &&
    scenario.mockUserData
  ) {
    // 模拟已认证用户（完整或不完整信息）- 生成真实的JWT token
    // 后端会根据openid查找真实的用户ID
    applyAuthenticatedUserScenario(scenario.mockUserData, authStore);
  }

  // 2. 模拟NFC参数
  if (scenario.nfcId) {
    if (!options.query) {
      options.query = {};
    }
    options.query.nfcId = scenario.nfcId;
    uni.setStorageSync('currentNfcId', scenario.nfcId);
  }

  // 3. 模拟预览数据（用于访客预览场景）
  if (scenario.mockPreviewData) {
    uni.setStorageSync('previewData', scenario.mockPreviewData);
  }

  return options;
}

/**
 * 应用已认证用户场景（消除重复代码）
 * @param mockUserData 模拟用户数据
 * @param authStore 认证store
 */
function applyAuthenticatedUserScenario(mockUserData: any, authStore: any) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const openid = mockUserData.id; // 使用dev_user_123作为openid
  const realToken = generateDevJWT('placeholder', openid); // sub会被后端替换为真实UUID
  const userWithOpenId = {
    ...mockUserData,
    id: 'placeholder', // 这个会被后端查找到的真实UUID替换
    wechatOpenId: openid,
    birthday: mockUserData.birthday ? new Date(mockUserData.birthday) : null,
  };
  authStore.login(realToken, userWithOpenId);
  console.log('🧪 开发场景JWT token生成:', realToken.substring(0, 50) + '...');
}

/**
 * 生成开发环境用的真实JWT token
 * 注意：这个token只在开发环境下使用，与后端的开发模式配合
 */
function generateDevJWT(userId: string, openid: string): string {
  // 创建JWT payload
  const payload = {
    sub: userId,
    openid: openid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天过期
  };

  // 在开发环境下，我们使用一个简单的base64编码作为token
  // 后端在开发模式下会特殊处理这种token
  const header = { alg: 'DEV', typ: 'JWT' };
  const encodedHeader = base64Encode(JSON.stringify(header));
  const encodedPayload = base64Encode(JSON.stringify(payload));

  return `DEV.${encodedHeader}.${encodedPayload}`;
}

/**
 * 微信小程序兼容的base64编码函数
 */
function base64Encode(str: string): string {
  // 使用微信小程序的base64编码
  const uint8Array = new TextEncoder().encode(str);
  return uni.arrayBufferToBase64(uint8Array.buffer);
}
