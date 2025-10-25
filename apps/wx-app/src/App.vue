<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { authService } from '@/api/auth';

onLaunch(options => {
  console.log('App Launch', options);

  // 初始化应用状态
  initializeApp();

  // 处理应用启动（NFC启动或直接启动）
  handleAppLaunch(options);
});

onShow(options => {
  console.log('App Show', options);

  // 处理应用启动（从后台切换回来时）
  handleAppLaunch(options);
});

onHide(() => {
  console.log('App Hide');
});

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

  // 🧪 开发测试：模拟NFC首次绑定流程
  const isDevelopmentNFCTest = true; // 开发测试开关
  const testNfcId = 'NFC_FRESH_2025_001'; // 全新的测试NFC ID

  if (isDevelopmentNFCTest) {
    console.log('🧪 开发模式：模拟NFC首次绑定流程');

    // 清除现有认证状态，模拟新用户
    authStore.logout();
    uni.removeStorageSync('currentNfcId');

    // 确保options.query存在
    if (!options.query) {
      options.query = {};
    }

    // 强制模拟NFC启动
    options.query.nfcId = testNfcId;
  }

  // 检查是否通过NFC启动
  if (options.query && options.query.nfcId) {
    const nfcId = options.query.nfcId;
    console.log('NFC启动，nfcId:', nfcId);

    // 存储当前NFC ID
    uni.setStorageSync('currentNfcId', nfcId);

    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      // 🧪 开发模式：对于新的NFC ID，直接跳转到绑定页面（符合首次绑定流程）
      console.log('🧪 未登录用户触碰NFC，跳转到绑定页面');
      uni.redirectTo({
        url: `/pages/bind/index?nfcId=${nfcId}`,
      });
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

    // 未登录，执行静默登录流程
    console.log('用户未登录，开始静默登录');
    await handleSilentLogin();
  } catch (error) {
    console.error('直接启动处理失败:', error);

    // 启动失败，跳转到绑定页面
    uni.redirectTo({
      url: '/pages/bind/index',
    });
  }
}

/**
 * 处理静默登录流程（仅使用微信code，无NFC）
 */
async function handleSilentLogin() {
  const authStore = useAuthStore();
  try {
    authStore.setLoading(true);

    // 设置超时时间为2秒，确保快速响应
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('静默登录超时')), 2000);
    });

    // 获取微信登录code
    const loginPromise = new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    const loginResult = (await Promise.race([loginPromise, timeoutPromise])) as UniApp.LoginRes;
    console.log('微信登录成功，code:', loginResult.code);

    // 调用后端登录接口（不带nfcId）
    const apiPromise = authService.login(loginResult.code);
    const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

    if (response.success) {
      const { status, token, user } = response.data;

      console.log('静默登录响应:', { status, hasToken: !!token, hasUser: !!user });

      if (token && user) {
        // 保存认证信息
        authStore.login(token, user);
      }

      // 根据状态跳转
      switch (status) {
        case 'AUTHENTICATED':
          // 已认证且信息完整，直接跳转到运势页面
          uni.redirectTo({
            url: '/pages/fortune/index',
          });
          break;

        case 'PROFILE_INCOMPLETE':
          // 信息不完整，跳转到个人信息补全页
          uni.redirectTo({
            url: '/pages/profile/index',
          });
          break;

        default:
          throw new Error(`Unknown login status: ${status}`);
      }
    } else {
      throw new Error(response.message || '静默登录失败');
    }
  } catch (error) {
    console.error('静默登录失败:', error);

    // 静默登录失败，跳转到绑定页面
    uni.redirectTo({
      url: '/pages/bind/index',
    });
  } finally {
    authStore.setLoading(false);
  }
}

/**
 * 处理自动登录流程
 */
async function handleAutoLogin(nfcId: string) {
  const authStore = useAuthStore();
  try {
    console.log('开始自动登录流程');
    authStore.setLoading(true);

    // 设置超时时间为1秒，确保快速响应
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('登录超时')), 1000);
    });

    // 获取微信登录code
    const loginPromise = new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    const loginResult = (await Promise.race([loginPromise, timeoutPromise])) as UniApp.LoginRes;
    console.log('微信登录成功，code:', loginResult.code);

    // 调用后端登录接口（带超时）
    const apiPromise = authService.login(loginResult.code, nfcId);
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
        // 保存认证信息
        authStore.login(token, user);
      }

      // 根据状态跳转
      switch (status) {
        case 'AUTHENTICATED':
          // 已认证且信息完整，直接跳转到运势页面
          uni.redirectTo({
            url: '/pages/fortune/index',
          });
          break;

        case 'PROFILE_INCOMPLETE':
          // 信息不完整，跳转到个人信息补全页
          uni.redirectTo({
            url: '/pages/profile/index',
          });
          break;

        case 'VISITOR_PREVIEW':
          // 访客预览模式，保存预览数据并跳转到运势页面（访客模式）
          if (previewScore && recommendation) {
            // 保存预览数据到本地存储
            uni.setStorageSync('previewData', {
              score: previewScore,
              recommendation: recommendation,
            });
            console.log('保存访客预览数据:', { previewScore, recommendation });
          }

          uni.redirectTo({
            url: '/pages/fortune/index?mode=visitor&preview=true',
          });
          break;

        default:
          throw new Error(`Unknown login status: ${status}`);
      }
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('自动登录失败:', error);

    // 登录失败，跳转到绑定页面
    uni.redirectTo({
      url: `/pages/bind/index?nfcId=${nfcId}`,
    });
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

    if (response.success) {
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

    // 验证失败可能是因为手链未绑定，尝试通过自动登录流程绑定
    console.log('尝试通过自动登录流程绑定未绑定的手链');

    try {
      await handleAutoLogin(nfcId);
    } catch (loginError) {
      console.error('自动登录绑定失败:', loginError);

      // 如果自动登录也失败，清除认证状态并跳转到绑定页面
      const authStore = useAuthStore();
      authStore.logout();
      uni.redirectTo({
        url: `/pages/bind/index?nfcId=${nfcId}`,
      });
    }
  }
}
</script>
<style></style>
