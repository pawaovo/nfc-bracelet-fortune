<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

onLaunch((options) => {
  console.log('App Launch', options);

  // 处理NFC启动参数
  handleNFCLaunch(options);
});

onShow((options) => {
  console.log('App Show', options);

  // 处理NFC唤醒参数
  if (options) {
    handleNFCLaunch(options);
  }
});

onHide(() => {
  console.log('App Hide');
});

// 处理NFC启动逻辑
function handleNFCLaunch(options: any) {
  console.log('处理启动参数:', options);

  // 检查是否包含NFC相关参数
  if (options.query && options.query.nfcId) {
    const nfcId = options.query.nfcId;
    console.log('检测到NFC ID:', nfcId);

    // 存储NFC ID到本地存储
    uni.setStorageSync('currentNfcId', nfcId);

    // 检查用户是否已登录
    const token = uni.getStorageSync('token');

    if (!token) {
      // 未登录，跳转到绑定页面
      console.log('用户未登录，跳转到绑定页面');
      uni.redirectTo({
        url: `/pages/bind/index?nfcId=${nfcId}`
      });
    } else {
      // 已登录，需要验证token有效性和处理不同场景
      console.log('用户已登录，验证token并处理NFC逻辑');
      handleAuthenticatedNFCAccess(nfcId, token);
    }
  } else if (options.scene) {
    // 处理其他场景码启动
    console.log('场景码启动:', options.scene);
    handleSceneLaunch(options.scene, options.query);
  }
}

// 处理已认证用户的NFC访问
async function handleAuthenticatedNFCAccess(nfcId: string, token: string) {
  try {
    // 调用后端验证接口
    const response = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: '/api/v1/auth/verify-nfc',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: { nfcId },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`验证失败: ${res.statusCode}`));
          }
        },
        fail: reject
      });
    });

    if (response.success) {
      const { status } = response.data;

      switch (status) {
        case 'AUTHENTICATED':
          // 用户自己的手链，跳转到运势页面
          uni.redirectTo({
            url: '/pages/fortune/index'
          });
          break;
        case 'VISITOR_PREVIEW':
          // 他人的手链，跳转到访客预览页面
          uni.redirectTo({
            url: '/pages/visitor/index'
          });
          break;
        default:
          console.warn('未知的验证状态:', status);
          break;
      }
    }
  } catch (error) {
    console.error('NFC验证失败:', error);
    // 验证失败，清除token并跳转到绑定页面
    uni.removeStorageSync('token');
    uni.redirectTo({
      url: `/pages/bind/index?nfcId=${nfcId}`
    });
  }
}

// 处理场景码启动
function handleSceneLaunch(scene: number, query: any) {
  console.log('场景码启动处理:', scene, query);

  // 根据不同场景码处理不同逻辑
  switch (scene) {
    case 1047: // 扫描小程序码
    case 1048: // 长按小程序码
    case 1049: // 手机相册选取小程序码
      // 处理小程序码相关逻辑
      break;
    default:
      console.log('其他场景启动:', scene);
      break;
  }
}
</script>
<style></style>
