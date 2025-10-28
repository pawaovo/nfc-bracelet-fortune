<template>
  <view class="bind-container">
    <!-- 主背景容器 -->
    <view class="main-background">
      <!-- 主背景图片 -->
      <image class="bg-main" :src="themeConfig.images.mainBackground" mode="scaleToFill" />

      <!-- 星空背景图片 -->
      <image class="bg-stars" :src="themeConfig.images.starsBackground" mode="scaleToFill" />
    </view>

    <!-- 欢迎文案区域 -->
    <view class="welcome-section">
      <text class="welcome-title">
        {{ themeConfig.texts.welcome.title }}
      </text>
      <text class="welcome-subtitle">
        {{ themeConfig.texts.welcome.subtitle }}
      </text>
      <text class="welcome-description">
        {{ themeConfig.texts.welcome.description }}
      </text>
    </view>

    <!-- 手链展示区域 -->
    <view class="bracelet-section">
      <!-- 手链主图 -->
      <view class="bracelet-main">
        <!-- 手链图标（装饰性图片） -->
        <image class="bracelet-icon-img" :src="themeConfig.images.braceletIcon" mode="aspectFit" />
        <!-- 手链星星装饰 -->
        <image class="bracelet-star" :src="themeConfig.images.braceletStar" mode="aspectFit" />
      </view>

      <!-- 手链信息 -->
      <view class="bracelet-info">
        <text class="bracelet-name">
          {{ themeConfig.texts.bracelet.name }}
        </text>
        <text class="bracelet-desc">
          {{ themeConfig.texts.bracelet.description }}
        </text>
      </view>
    </view>

    <!-- 手链详情图片区域 -->
    <view class="bracelet-details">
      <image class="detail-img-1" :src="themeConfig.images.detailImage1" mode="aspectFit" />
      <image class="detail-img-2" :src="themeConfig.images.detailImage2" mode="aspectFit" />
    </view>

    <!-- 绑定按钮区域 -->
    <view class="bind-section">
      <image class="button-bg" :src="themeConfig.images.buttonBackground" mode="aspectFit" />
      <button
        class="bind-button"
        :class="{ loading: isBinding }"
        :disabled="isBinding"
        @click="handleBindClick"
      >
        <text v-if="!isBinding">
          {{ themeConfig.texts.button.normal }}
        </text>
        <text v-else>
          {{ themeConfig.texts.button.loading }}
        </text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { getTheme, type BindPageTheme } from './config';

// 页面配置
// 可以通过 URL 参数传入主题名称，例如：?theme=amethyst
// 默认使用 'default' 主题
const themeConfig = ref<BindPageTheme>(getTheme('default'));

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');

// 页面加载时获取NFC ID
onMounted(() => {
  // 从页面参数或全局状态获取nfcId和主题配置
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  // 获取 NFC ID
  if (options.nfcId) {
    nfcId.value = options.nfcId;
    console.log('获取到NFC ID:', nfcId.value);
  } else {
    console.warn('未获取到NFC ID参数');
  }

  // 获取主题配置（支持通过 URL 参数切换主题）
  // 例如：pages/bind/index?theme=amethyst
  if (options.theme) {
    const themeName = options.theme as string;
    themeConfig.value = getTheme(themeName);
    console.log('使用主题:', themeName);
  } else {
    console.log('使用默认主题');
  }
});

// 处理绑定按钮点击
const handleBindClick = async () => {
  if (isBinding.value) return;

  try {
    isBinding.value = true;

    // 调用微信登录
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    if (!loginResult.code) {
      throw new Error('微信授权失败');
    }

    console.log('微信登录成功，code:', loginResult.code);

    // 调用后端绑定接口（如果有NFC ID则传入，否则为undefined）
    const response = await authService.login(loginResult.code, nfcId.value || undefined);

    console.log('后端响应:', response);

    // 处理后端响应
    if (response.success) {
      const { status, token, user, previewScore, recommendation } = response.data;

      if (token) {
        // 更新 auth store（会自动设置 token 到存储和 API 请求）
        const authStore = useAuthStore();
        authStore.login(token, user || {});
      }

      if (status === 'PROFILE_INCOMPLETE') {
        // 跳转到个人信息补全页
        uni.redirectTo({
          url: '/pages/profile/index',
        });
      } else if (status === 'AUTHENTICATED') {
        // 跳转到运势页面
        uni.redirectTo({
          url: '/pages/fortune/index',
        });
      } else if (status === 'VISITOR_PREVIEW') {
        // 手链已被其他用户绑定，进入访客预览模式
        console.log('手链已被绑定，进入访客预览模式');

        // 保存预览数据到本地存储
        if (previewScore && recommendation) {
          uni.setStorageSync('previewData', {
            score: previewScore,
            recommendation: recommendation,
          });
          console.log('保存访客预览数据:', { previewScore, recommendation });
        }

        // 显示友好提示
        uni.showToast({
          title: '此手链已被绑定，为您展示访客预览',
          icon: 'none',
          duration: 2000,
        });

        // 延迟跳转到访客预览页面
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/fortune/index?mode=visitor&preview=true',
          });
        }, 2000);
      }
    } else {
      throw new Error(response.message || '绑定失败');
    }
  } catch (error) {
    console.error('绑定失败:', error);

    let errorMessage = '绑定失败，请重试';
    let showModal = false;

    if (error instanceof Error) {
      if (error.message.includes('授权')) {
        errorMessage = '微信授权失败，请重新点击绑定按钮';
      } else if (error.message.includes('网络') || error.message.includes('超时')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else if (error.message.includes('已被绑定') || error.message.includes('已绑定')) {
        errorMessage = '此手链已被其他用户绑定';
        showModal = true;
      } else if (error.message.includes('服务器')) {
        errorMessage = '服务暂时不可用，请稍后重试';
      }
    }

    if (showModal) {
      // 对于手链已被绑定的情况，显示模态框提供更多信息
      uni.showModal({
        title: '手链已被绑定',
        content: '此手链已被其他用户绑定。您可以尝试触碰其他未绑定的手链，或直接体验访客预览模式。',
        showCancel: true,
        cancelText: '返回',
        confirmText: '访客预览',
        success: res => {
          if (res.confirm) {
            // 跳转到访客预览页面
            uni.redirectTo({
              url: '/pages/fortune/index?mode=visitor',
            });
          }
        },
      });
    } else {
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000,
      });
    }
  } finally {
    isBinding.value = false;
  }
};
</script>

<style lang="scss" scoped>
.bind-container {
  position: relative;
  min-height: 100vh;
  height: 1627rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 主背景容器 */
.main-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  .bg-main {
    position: absolute;
    top: -5.69%;
    left: -52.38%;
    width: 159.69%;
    height: 107.94%;
    z-index: 1;
  }

  .bg-stars {
    position: absolute;
    top: 120rpx;
    left: 20rpx;
    width: 720rpx;
    height: 1280rpx;
    z-index: 100;
  }
}

/* 欢迎文案区域 */
.welcome-section {
  position: absolute;
  top: 279rpx;
  left: 151rpx;
  width: 420rpx;
  z-index: 200;

  .welcome-title {
    display: block;
    font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
    font-size: 35rpx;
    color: #ffffff;
    font-weight: 400;
    line-height: 51rpx;
    margin-bottom: 17rpx;
  }

  .welcome-subtitle {
    display: block;
    font-family: 'ABeeZee', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
    font-size: 35rpx;
    color: #ffffff;
    font-weight: 400;
    line-height: 51rpx;
    margin-bottom: 70rpx;
  }

  .welcome-description {
    display: block;
    font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
    font-size: 25rpx;
    color: #ffffff;
    font-weight: 400;
    line-height: 36rpx;
  }
}

/* 手链展示区域 */
.bracelet-section {
  position: absolute;
  top: 565rpx;
  left: 138rpx;
  width: 306rpx;
  z-index: 200;

  .bracelet-main {
    position: relative;
    width: 100%;
    height: 140rpx;
    margin-bottom: 29rpx;

    .bracelet-icon-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 306rpx;
      height: 140rpx;
    }

    .bracelet-star {
      position: absolute;
      top: 10rpx;
      right: 0;
      width: 21rpx;
      height: 24rpx;
      opacity: 0.84;
    }
  }

  .bracelet-info {
    .bracelet-name {
      display: block;
      font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
      font-size: 36rpx;
      color: #ffffff;
      font-weight: 400;
      line-height: 52rpx;
      margin-bottom: 5rpx;
    }

    .bracelet-desc {
      display: block;
      font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
      font-size: 24rpx;
      color: #bbbbbb;
      font-weight: 400;
      line-height: 35rpx;
    }
  }
}

/* 手链详情图片区域 */
.bracelet-details {
  position: absolute;
  top: 855rpx;
  left: 76rpx;
  width: 444rpx;
  height: 440rpx;
  z-index: 200;

  .detail-img-1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 444rpx;
    height: 440rpx;
  }

  .detail-img-2 {
    position: absolute;
    top: 87rpx;
    left: 236rpx;
    width: 378rpx;
    height: 374rpx;
  }
}

/* 绑定按钮区域 */
.bind-section {
  position: absolute;
  top: 1435rpx;
  left: 42rpx;
  width: 668rpx;
  height: 115rpx;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;

  .button-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .bind-button {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: 'ABeeZee', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
    font-size: 35rpx;
    font-weight: 400;
    line-height: 115rpx;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &.loading {
      opacity: 0.7;
    }

    &:active {
      opacity: 0.8;
    }
  }
}
</style>
