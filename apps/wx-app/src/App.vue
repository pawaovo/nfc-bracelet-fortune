<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { authService } from '@/api/auth';
import { DEV_CONFIG, applyDevScenario } from '@/config/dev-scenarios';

onLaunch(options => {
  console.log('App Launch', options);

  // 初始化应用状态
  initializeApp();

  // 检查隐私协议
  checkPrivacyAgreement(options);
});

onShow(options => {
  console.log('App Show', options);

  // 检查隐私协议
  checkPrivacyAgreement(options);
});

onHide(() => {
  console.log('App Hide');
});

/**
 * 检查隐私协议是否已同意
 */
function checkPrivacyAgreement(options: any) {
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
async function handleAppLaunch(options: any) {
  const authStore = useAuthStore();

  // 应用开发场景（替换原有的开发测试代码）
  if (DEV_CONFIG.enabled) {
    console.log('🧪 开发场景系统已启用');
    options = applyDevScenario(DEV_CONFIG.currentScenario, options);
  }

  // 检查是否通过NFC启动
  if (options.query && options.query.nfcId) {
    const nfcId = options.query.nfcId;
    console.log('NFC启动，nfcId:', nfcId);

    // 存储当前NFC ID（如果开发场景没有设置的话）
    if (!uni.getStorageSync('currentNfcId')) {
      uni.setStorageSync('currentNfcId', nfcId);
    }

    // 检查用户是否已登录
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
    console.log('直接启动小程序');
    await handleDirectLaunch();
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
function handleLoginResponseNavigation(status: string, nfcId?: string, previewData?: any) {
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
</script>

<style></style>
