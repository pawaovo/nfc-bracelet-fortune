<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { authService } from '@/api/auth';
import { DEV_CONFIG, applyDevScenario, TEMP_NFC_BYPASS } from '@/config/dev-scenarios';
import type { Product } from '@shared/types';

const IS_H5 = process.env.UNI_PLATFORM === 'h5';

// H5环境下，防止onShow重复执行启动逻辑
let hasLaunched = false;

type LaunchOptions = {
  path?: string;
  query?: Record<string, string>;
  scene?: number;
  referrerInfo?: Record<string, unknown>;
  [key: string]: unknown;
};

interface VisitorPreviewPayload {
  previewScore?: number;
  recommendation?: Product;
}

onLaunch((options: LaunchOptions) => {
  console.log('App Launch', options);

  // 初始化应用状态
  initializeApp();

  // 标记已启动
  hasLaunched = true;

  // 检查隐私协议
  checkPrivacyAgreement(options);
});

onShow((options: LaunchOptions) => {
  console.log('App Show', options);

  // H5环境下，如果已经启动过，不再执行启动逻辑（避免标签页切换时重置路由）
  if (IS_H5 && hasLaunched) {
    console.log('H5环境：已启动过，跳过onShow启动逻辑');
    return;
  }

  // 小程序环境下，每次onShow都需要检查隐私协议和启动逻辑
  checkPrivacyAgreement(options);
});

onHide(() => {
  console.log('App Hide');
});

/**
 * 检查隐私协议是否已同意
 */
function checkPrivacyAgreement(options: LaunchOptions) {
  // H5网页端不显示隐私弹窗
  if (IS_H5) {
    handleAppLaunch(options);
    return;
  }

  const privacyAgreed = uni.getStorageSync('privacy_agreed');

  if (!privacyAgreed) {
    // 未同意隐私协议，延迟显示弹窗，先让页面加载
    setTimeout(() => {
      showPrivacyDialog(() => {
        // 用户同意
        uni.setStorageSync('privacy_agreed', true);
      });
    }, 1000);
  }

  // 无论是否同意，都继续处理应用启动（让小程序能正常运行）
  handleAppLaunch(options);
}

/**
 * 显示隐私协议弹窗
 */
function showPrivacyDialog(onConfirm: () => void) {
  uni.showModal({
    title: '用户隐私保护提示',
    content:
      '欢迎使用本小程序！\n\n为了向您提供服务，我们需要收集：\n• 微信授权信息\n• 姓名和生日\n• NFC手链设备ID\n\n我们承诺保护您的个人信息安全。\n\n详情请查看"设置-隐私政策"',
    confirmText: '同意并继续',
    cancelText: '不同意',
    success: res => {
      if (res.confirm) {
        onConfirm();
      } else {
        // 用户拒绝，再次提示
        setTimeout(() => {
          uni.showModal({
            title: '提示',
            content: '需要同意隐私政策才能使用小程序',
            showCancel: false,
            success: () => {
              showPrivacyDialog(onConfirm);
            },
          });
        }, 300);
      }
    },
  });
}

/**
 * 初始化应用状态
 */
function initializeApp() {
  try {
    // 在函数内部初始化stores
    const authStore = useAuthStore();
    const fortuneStore = useFortuneStore();

    // 从本地存储恢复认证状态
    authStore.initFromStorage();

    // 从本地存储恢复运势数据
    fortuneStore.initFromStorage();

    console.log('App initialized', {
      isAuthenticated: authStore.isAuthenticated,
      isProfileComplete: authStore.isProfileComplete,
      hasTodayFortune: fortuneStore.hasTodayFortune,
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

/**
 * 处理应用启动逻辑（NFC启动或直接启动）
 */
async function handleAppLaunch(options: LaunchOptions) {
  const authStore = useAuthStore();

  // 应用开发场景（替换原有的开发测试代码）
  if (DEV_CONFIG.enabled) {
    console.log('🧪 开发场景系统已启用');
    options = applyDevScenario(DEV_CONFIG.currentScenario, options);
  }

  // 🚨 临时NFC绕过逻辑：仅在小程序平台生效，H5平台不生成虚拟NFC ID
  if (TEMP_NFC_BYPASS.enabled && !IS_H5 && !options.query?.nfcId) {
    console.log('🔧 临时NFC绕过模式已启用（仅小程序），生成虚拟NFC ID');
    const virtualNfcId = generateVirtualNfcId();
    if (!options.query) {
      options.query = {};
    }
    options.query.nfcId = virtualNfcId;
    console.log('✅ 虚拟NFC ID:', virtualNfcId);
  }

  // 检查是否通过NFC启动
  if (options.query && options.query.nfcId) {
    const nfcId = options.query.nfcId;
    console.log('NFC启动，nfcId:', nfcId);

    // 存储当前NFC ID
    uni.setStorageSync('currentNfcId', nfcId);

    // H5平台特殊处理
    if (IS_H5) {
      await handleH5NfcLaunch(nfcId);
      return;
    }

    // 小程序平台逻辑
    if (!authStore.isAuthenticated) {
      // 未登录用户触碰NFC，先尝试自动登录判断手链状态
      console.log('未登录用户触碰NFC，尝试自动登录判断手链状态');
      await handleAutoLogin(nfcId);
    } else {
      // 已登录，验证NFC访问权限并跳转
      await handleAuthenticatedNFCAccess(nfcId);
    }
  } else {
    // 直接启动（无NFC参数）
    console.log('直接启动');

    if (IS_H5) {
      await handleH5DirectLaunch();
    } else {
      await handleDirectLaunch();
    }
  }
}

/**
 * H5平台：处理NFC启动
 */
async function handleH5NfcLaunch(nfcId: string) {
  const authStore = useAuthStore();

  console.log('[H5] NFC启动，nfcId:', nfcId);

  // 检查是否有该nfcId的登录状态
  const storedNfcId = authStore.nfcId;
  const storedUserType = authStore.userType;

  if (authStore.isAuthenticated && storedNfcId === nfcId) {
    // 场景A或B：已登录且是同一个nfcId，直接进入AI生成页面
    console.log('[H5] 检测到已登录状态，nfcId匹配，跳转到运势页面');

    if (storedUserType === 'bound') {
      // 绑定用户：跳转到运势页面（会自动触发AI生成）
      uni.redirectTo({ url: '/pages/fortune/index' });
    } else {
      // 访客用户：跳转到访客版运势页面
      uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
    }
    return;
  }

  // 未登录或不同的nfcId：跳转到绑定页面
  console.log('[H5] 未登录或nfcId不匹配，跳转到绑定页面');
  uni.redirectTo({ url: `/pages/bind/index?nfcId=${nfcId}` });
}

/**
 * H5平台：处理直接启动（无NFC参数）
 */
async function handleH5DirectLaunch() {
  const authStore = useAuthStore();

  console.log('[H5] 直接启动（无NFC参数）');

  // 检查是否有登录状态
  if (authStore.isAuthenticated) {
    const storedUserType = authStore.userType;

    if (storedUserType === 'bound') {
      // 绑定用户：跳转到运势页面
      console.log('[H5] 检测到绑定用户登录状态，跳转到运势页面');
      uni.redirectTo({ url: '/pages/fortune/index' });
    } else {
      // 访客用户：跳转到访客版运势页面
      console.log('[H5] 检测到访客用户登录状态，跳转到访客版运势页面');
      uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
    }
  } else {
    // 未登录：跳转到绑定页面
    console.log('[H5] 未登录，跳转到绑定页面');
    uni.redirectTo({ url: '/pages/bind/index' });
  }
}

/**
 * 处理直接启动逻辑（无NFC参数）
 */
async function handleDirectLaunch() {
  try {
    const authStore = useAuthStore();
    console.log('开始处理直接启动');

    // 检查是否已有有效的登录状态
    if (authStore.isAuthenticated && authStore.isProfileComplete) {
      console.log('用户已登录且信息完整，直接跳转到运势页面');
      uni.redirectTo({
        url: '/pages/fortune/index',
      });
      return;
    }

    // 如果已登录但信息不完整，跳转到个人信息补全页
    if (authStore.isAuthenticated && !authStore.isProfileComplete) {
      console.log('用户已登录但信息不完整，跳转到个人信息补全页');
      uni.redirectTo({
        url: '/pages/profile/index',
      });
      return;
    }

    // 未登录，执行静默登录
    console.log('用户未登录，执行静默登录');
    await handleSilentLogin();
  } catch (error) {
    console.error('直接启动处理失败:', error);
    // 出错时跳转到绑定页面，让用户手动操作
    uni.redirectTo({
      url: '/pages/bind/index',
    });
  }
}

/**
 * 处理静默登录（新访客直接打开小程序）
 */
async function handleSilentLogin() {
  try {
    console.log('开始静默登录');
    const authStore = useAuthStore();

    // 获取微信登录code
    const code = await getWeChatLoginCode(5000);

    // 调用后端登录接口（不传NFC ID）
    const response = await authService.login(code);

    if (response.success && response.data) {
      const { status, token, user } = response.data;

      console.log('静默登录成功，状态:', status);

      // 保存token和用户信息
      if (token && user) {
        authStore.login(token, user);
      }

      // 根据状态跳转
      handleLoginResponseNavigation(status);
    } else {
      throw new Error(response.message || '静默登录失败');
    }
  } catch (error) {
    console.error('静默登录失败:', error);
    // 静默登录失败，跳转到绑定页面
    uni.redirectTo({
      url: '/pages/bind/index',
    });
  }
}

/**
 * 获取微信登录code（通用函数）
 */
async function getWeChatLoginCode(timeoutMs: number): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('微信登录超时')), timeoutMs);
  });

  const loginPromise = new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: resolve,
      fail: reject,
    });
  });

  const loginResult = (await Promise.race([loginPromise, timeoutPromise])) as UniApp.LoginRes;
  console.log('微信登录成功，code:', loginResult.code);
  return loginResult.code;
}

/**
 * 处理登录响应的通用状态跳转
 */
function handleLoginResponseNavigation(
  status: string,
  nfcId?: string,
  previewData?: VisitorPreviewPayload
) {
  switch (status) {
    case 'AUTHENTICATED':
      uni.redirectTo({ url: '/pages/fortune/index' });
      break;
    case 'PROFILE_INCOMPLETE':
      uni.redirectTo({ url: '/pages/profile/index' });
      break;
    case 'VISITOR_PREVIEW':
      if (previewData?.previewScore && previewData?.recommendation) {
        uni.setStorageSync('previewData', {
          score: previewData.previewScore,
          recommendation: previewData.recommendation,
        });
        console.log('保存访客预览数据:', previewData);
      }
      uni.redirectTo({ url: '/pages/fortune/index?mode=visitor&preview=true' });
      break;
    default:
      throw new Error(`Unknown login status: ${status}`);
  }
}

/**
 * 处理自动登录流程（带NFC）
 */
async function handleAutoLogin(nfcId: string) {
  const authStore = useAuthStore();
  try {
    console.log('开始自动登录流程');
    authStore.setLoading(true);

    // 获取微信登录code（1秒超时）
    const code = await getWeChatLoginCode(1000);

    // 设置API超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('登录超时')), 1000);
    });

    // 调用后端登录接口（带NFC ID）
    const apiPromise = authService.login(code, nfcId);
    const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

    if (response.success) {
      const { status, token, user, previewScore, recommendation } = response.data;

      console.log('登录响应:', {
        status,
        hasToken: !!token,
        hasUser: !!user,
        hasPreviewData: !!(previewScore && recommendation),
      });

      if (token && user) {
        authStore.login(token, user);
      }

      // 使用通用状态处理函数
      handleLoginResponseNavigation(status, nfcId, { previewScore, recommendation });
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('自动登录失败:', error);
    // 自动登录失败时，跳转到绑定页面并带上NFC ID
    uni.redirectTo({ url: `/pages/bind/index?nfcId=${nfcId}` });
  } finally {
    authStore.setLoading(false);
  }
}

/**
 * 处理已认证用户的NFC访问
 */
async function handleAuthenticatedNFCAccess(nfcId: string) {
  try {
    console.log('验证已认证用户的NFC访问权限');

    const response = await authService.verifyNFC(nfcId);

    if (response.success && response.data) {
      const { status } = response.data;

      if (status === 'OWNER') {
        // 是自己的手链，跳转到完整运势页面
        uni.redirectTo({
          url: '/pages/fortune/index',
        });
      } else {
        // 不是自己的手链，跳转到访客预览
        uni.redirectTo({
          url: '/pages/fortune/index?mode=visitor',
        });
      }
    } else {
      throw new Error(response.message || 'NFC验证失败');
    }
  } catch (error) {
    console.error('NFC访问验证失败:', error);

    // 验证失败，清除认证状态并跳转到绑定页面
    const authStore = useAuthStore();
    authStore.logout();
    uni.redirectTo({
      url: `/pages/bind/index?nfcId=${nfcId}`,
    });
  }
}

/**
 * 🚨 临时函数：生成虚拟NFC ID
 * 基于用户的微信OpenID生成唯一的虚拟NFC ID
 * NFC功能恢复后，此函数将不再使用
 */
function generateVirtualNfcId(): string {
  // 尝试从本地存储获取已生成的虚拟NFC ID
  const storedVirtualNfcId = uni.getStorageSync('virtualNfcId');
  if (storedVirtualNfcId) {
    console.log('使用已存储的虚拟NFC ID:', storedVirtualNfcId);
    return storedVirtualNfcId;
  }

  // 生成新的虚拟NFC ID
  // 格式: VIRTUAL_NFC_{timestamp}_{random}
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const virtualNfcId = `VIRTUAL_NFC_${timestamp}_${random}`;

  // 存储到本地，确保同一用户始终使用相同的虚拟NFC ID
  uni.setStorageSync('virtualNfcId', virtualNfcId);
  console.log('生成新的虚拟NFC ID:', virtualNfcId);

  return virtualNfcId;
}
</script>

<style></style>
