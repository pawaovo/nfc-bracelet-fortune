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
        <image class="bracelet-label" src="/static/pages/bind/今日开运手链.png" mode="aspectFit" />
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
        :src="recommendedProduct?.imageUrl || themeConfig.images.detailImage2"
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
import { fortuneService } from '@/api/fortune';
import { useAuthStore } from '@/stores/auth';
import { getTheme, type BindPageTheme } from './config';

// 页面配置
// 可以通过 URL 参数传入主题名称，例如：?theme=amethyst
// 默认使用 'default' 主题
const themeConfig = ref<BindPageTheme>(getTheme('default'));

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');

// 动态商品数据
const recommendedProduct = ref<any>(null);

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

  // 加载随机商品推荐
  await loadRandomRecommendation();
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
    }
  } catch (error) {
    console.warn('加载随机商品失败，使用默认配置');
  }
}

/**
 * 处理商品图片加载失败
 * 图片加载失败时，会自动使用 || 后的默认图片
 */
function handleProductImageError(e: any) {
  console.warn('商品图片加载失败，使用默认图片:', {
    imageUrl: recommendedProduct.value?.imageUrl,
  });
}

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

    // 调用后端绑定接口（如果有NFC ID则传入，否则为undefined）
    const response = await authService.login(loginResult.code, nfcId.value || undefined);

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
        // 保存预览数据到本地存储
        if (previewScore && recommendation) {
          uni.setStorageSync('previewData', {
            score: previewScore,
            recommendation: recommendation,
          });
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
    width: 306rpx;
    height: 140rpx;
    margin-bottom: 29rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .bracelet-icon-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 306rpx;
      height: 140rpx;
    }

    .bracelet-label {
      position: absolute;
      width: 260rpx;
      height: 130rpx;
      z-index: 10;
    }

    .bracelet-star {
      position: absolute;
      top: 20rpx;
      left: 200rpx;
      width: 21rpx;
      height: 24rpx;
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

/* 手链详情图片区域 */
.bracelet-details {
  position: absolute;
  top: 855rpx;
  left: 76rpx;
  width: 444rpx;
  height: 440rpx;
  z-index: 200;

  .detail-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    font-weight: 600;
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
