<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useFortuneStore } from '@/stores/fortune'
import { authService } from '@/api/auth'

// 初始化stores
const authStore = useAuthStore()
const fortuneStore = useFortuneStore()

onLaunch((options) => {
  console.log('App Launch', options)

  // 初始化应用状态
  initializeApp()

  // 处理NFC启动
  handleNFCLaunch(options)
})

onShow((options) => {
  console.log('App Show', options)

  // 处理NFC启动（从后台切换回来时）
  handleNFCLaunch(options)
})

onHide(() => {
  console.log('App Hide')
})

/**
 * 初始化应用状态
 */
function initializeApp() {
  try {
    // 从本地存储恢复认证状态
    authStore.initFromStorage()

    // 从本地存储恢复运势数据
    fortuneStore.initFromStorage()

    console.log('App initialized', {
      isAuthenticated: authStore.isAuthenticated,
      isProfileComplete: authStore.isProfileComplete,
      hasTodayFortune: fortuneStore.hasTodayFortune
    })
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

/**
 * 处理NFC启动逻辑
 */
async function handleNFCLaunch(options: any) {
  // 检查是否通过NFC启动
  if (options.query && options.query.nfcId) {
    const nfcId = options.query.nfcId;
    console.log('NFC启动，nfcId:', nfcId);

    // 存储当前NFC ID
    uni.setStorageSync('currentNfcId', nfcId);

    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      // 未登录，执行自动登录流程
      await handleAutoLogin(nfcId);
    } else {
      // 已登录，验证NFC访问权限并跳转
      await handleAuthenticatedNFCAccess(nfcId);
    }
  }
}

/**
 * 处理自动登录流程
 */
async function handleAutoLogin(nfcId: string) {
  try {
    console.log('开始自动登录流程');
    authStore.setLoading(true);

    // 获取微信登录code
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });

    console.log('微信登录成功，code:', loginResult.code);

    // 调用后端登录接口
    const response = await authService.login(loginResult.code, nfcId);

    if (response.success) {
      const { status, token, user } = response.data;

      console.log('登录响应:', { status, hasToken: !!token, hasUser: !!user });

      if (token && user) {
        // 保存认证信息
        authStore.login(token, user);
      }

      // 根据状态跳转
      switch (status) {
        case 'AUTHENTICATED':
          // 已认证且信息完整，直接跳转到运势页面
          uni.redirectTo({
            url: '/pages/fortune/index'
          });
          break;

        case 'PROFILE_INCOMPLETE':
          // 信息不完整，跳转到个人信息补全页
          uni.redirectTo({
            url: '/pages/profile/index'
          });
          break;

        case 'VISITOR_PREVIEW':
          // 访客预览模式，跳转到运势页面（访客模式）
          uni.redirectTo({
            url: '/pages/fortune/index?mode=visitor'
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
      url: `/pages/bind/index?nfcId=${nfcId}`
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
          url: '/pages/fortune/index'
        });
      } else {
        // 不是自己的手链，跳转到访客预览
        uni.redirectTo({
          url: '/pages/fortune/index?mode=visitor'
        });
      }
    } else {
      throw new Error(response.message || 'NFC验证失败');
    }
  } catch (error) {
    console.error('NFC访问验证失败:', error);

    // 验证失败，清除认证状态并跳转到绑定页面
    authStore.logout();
    uni.redirectTo({
      url: `/pages/bind/index?nfcId=${nfcId}`
    });
  }
}
</script>
<style></style>
