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
        <!-- 今日开运手链标签 -->
        <image class="bracelet-label" :src="themeConfig.images.braceletLabel" mode="aspectFit" />
        <!-- 手链星星装饰 -->
        <image class="bracelet-star" :src="themeConfig.images.braceletStar" mode="aspectFit" />
      </view>

      <!-- 手链信息 -->
      <view class="bracelet-info">
        <text class="bracelet-name">
          {{ recommendedProduct?.name || themeConfig.texts.bracelet.name }}
        </text>
        <text class="bracelet-desc">
          {{ recommendedProduct?.description || themeConfig.texts.bracelet.description }}
        </text>
      </view>
    </view>

    <!-- 手链详情图片区域 -->
    <view class="bracelet-details">
      <image
        class="detail-img"
        :src="productImageSrc"
        mode="aspectFit"
        @error="handleProductImageError"
      />
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
        <view v-if="isBinding" class="button-loading">
          <view class="button-loading-spinner" />
          <text>{{ themeConfig.texts.button.loading }}</text>
        </view>
        <text v-else>
          {{ themeConfig.texts.button.normal }}
        </text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { authService } from '@/api/auth';
import { fortuneService } from '@/api/fortune';
import { useAuthStore } from '@/stores/auth';
import { getTheme, type BindPageTheme } from './config';

// 页面配置
// 可以通过 URL 参数传入主题名称，例如：?theme=amethyst
// 默认使用 'default' 主题
const themeConfig = ref<BindPageTheme>(getTheme('default'));
const authStore = useAuthStore();

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');
const isH5Platform = process.env.UNI_PLATFORM === 'h5';

// 动态商品数据
const recommendedProduct = ref<any>(null);
const useFallbackProductImage = ref(false);

const productImageSrc = computed(() => {
  const fallback = themeConfig.value.images.detailImage2;
  if (useFallbackProductImage.value) {
    return fallback;
  }
  return recommendedProduct.value?.imageUrl || fallback;
});

// 页面加载时获取NFC ID和随机商品
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  // 获取 NFC ID
  if (options.nfcId) {
    nfcId.value = options.nfcId;
  }

  // 获取主题配置（支持通过 URL 参数切换主题）
  if (options.theme) {
    themeConfig.value = getTheme(options.theme as string);
  }

  // 加载随机商品推荐（异步加载，不阻塞页面）
  loadRandomRecommendation();
});

/**
 * 加载随机商品推荐
 * 失败时自动使用config中的默认配置
 */
async function loadRandomRecommendation() {
  try {
    const response = await fortuneService.getRandomRecommendation();
    if (response.success && response.data) {
      recommendedProduct.value = response.data;
      useFallbackProductImage.value = false;
    }
  } catch (error) {
    console.warn('加载随机商品失败，使用默认配置');
  }
}

/**
 * 处理商品图片加载失败
 * 图片加载失败时，会自动使用 || 后的默认图片
 */
function handleProductImageError() {
  useFallbackProductImage.value = true;

  console.warn('商品图片加载失败，使用默认图片:', {
    imageUrl: recommendedProduct.value?.imageUrl,
    fallback: themeConfig.value.images.detailImage2,
  });
}

// 处理绑定按钮点击
const handleBindClick = async () => {
  if (isBinding.value) return;

  if (nfcId.value) {
    uni.setStorageSync('currentNfcId', nfcId.value);
  }

  if (isH5Platform) {
    // H5平台：直接跳转到个人信息页
    const target = nfcId.value
      ? `/pages/profile/index?nfcId=${nfcId.value}`
      : '/pages/profile/index';
    uni.navigateTo({ url: target });
    return;
  }

  try {
    isBinding.value = true;

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

    const response = await authService.login(loginResult.code, nfcId.value || undefined);

    if (response.success) {
      const { status, token, user, previewScore, recommendation } = response.data;

      if (token) {
        authStore.login(token, user || {});
      }

      // 根据状态跳转到不同页面
      if (status === 'PROFILE_INCOMPLETE') {
        // 跳转到个人信息页
        uni.redirectTo({ url: '/pages/profile/index' });
      } else if (status === 'AUTHENTICATED') {
        // 跳转到运势页
        uni.redirectTo({ url: '/pages/fortune/index' });
      } else if (status === 'VISITOR_PREVIEW') {
        if (previewScore && recommendation) {
          uni.setStorageSync('previewData', {
            score: previewScore,
            recommendation,
          });
        }

        uni.showToast({
          title: '该手链已被绑定，为您展示访客预览',
          icon: 'none',
          duration: 2000,
        });

        uni.redirectTo({
          url: '/pages/fortune/index?mode=visitor&preview=true',
        });
      }
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('绑定出错:', error);

    // 根据错误类型显示友好提示
    let errorMessage = '绑定失败，请重试';

    if (error instanceof Error && error.message) {
      const message = error.message;

      if (message.includes('网络') || message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (message.includes('超时') || message.includes('timeout')) {
        errorMessage = '请求超时，请重试';
      } else if (message.includes('授权') || message.includes('auth')) {
        errorMessage = '微信授权失败，请重试';
      } else {
        // 其他错误直接使用原始错误信息
        errorMessage = message;
      }
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2500,
    });
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
    top: 200rpx;
    left: 30rpx;
    width: 690rpx;
    height: 1140rpx;
    z-index: 100;
  }
}

/* 欢迎文案区域 */
.welcome-section {
  position: absolute;
  top: 279rpx;
  left: 80rpx;
  width: 590rpx;
  z-index: 200;

  .welcome-title {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 48rpx;
    color: #ffffff;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 10rpx;
  }

  .welcome-subtitle {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 48rpx;
    color: #ffffff;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 30rpx;
  }

  .welcome-description {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 600;
    line-height: 1.3;
  }
}

/* 手链展示区域 */
.bracelet-section {
  position: absolute;
  top: 490rpx;
  left: 80rpx;
  width: 590rpx;
  z-index: 200;

  .bracelet-main {
    position: relative;
    width: 380rpx;
    height: 180rpx;
    margin-bottom: 29rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .bracelet-icon-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 380rpx;
      height: 180rpx;
    }

    .bracelet-label {
      position: absolute;
      top: -10rpx;
      width: 380rpx;
      height: 180rpx;
      z-index: 10;
    }

    .bracelet-star {
      position: absolute;
      top: 25rpx;
      left: 250rpx;
      width: 26rpx;
      height: 30rpx;
      opacity: 0.84;
    }
  }

  .bracelet-info {
    .bracelet-name {
      display: block;
      font-family: 'PingFang SC', sans-serif;
      font-size: 40rpx;
      color: #ffffff;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 8rpx;
    }

    .bracelet-desc {
      display: block;
      font-family: 'PingFang SC', sans-serif;
      font-size: 24rpx;
      color: #bbbbbb;
      font-weight: 600;
      line-height: 1.3;
    }
  }
}

/* 手链详情图片区域 - 合并为单个大容器 */
.bracelet-details {
  position: absolute;
  top: 855rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 600rpx;
  height: 440rpx;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .detail-img {
    width: 100%;
    height: 100%;
    border-radius: 24rpx;
    object-fit: cover;
  }
}

/* 绑定按钮区域 */
.bind-section {
  position: absolute;
  top: 1380rpx;
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
    font-family: 'PingFang SC', sans-serif;
    font-size: 36rpx;
    font-weight: 400; /* 从600改为400，使用正常粗细 */
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

  .button-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
  }

  .button-loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
    border-top: 3rpx solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}
</style>
