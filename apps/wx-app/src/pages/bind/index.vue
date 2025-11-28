<template>
  <view class="bind-container">
    <!-- 全屏背景，未就绪时展示预览与加载 -->
    <view class="pag-background-overlay">
      <image
        v-if="showPagLoading"
        class="pag-preview-bg"
        src="/static/pages/bind/preview.png"
        mode="aspectFill"
      />
      <view v-if="showPagLoading" class="pag-loading-mask">
        <view class="pag-loading-dot" />
        <text class="pag-loading-text"> 加载中 </text>
      </view>
      <PagLoadingCDN
        :fill-width="true"
        :auto-play="true"
        :loop="true"
        :pag-file-url="pagBackgroundUrl"
        @ready="onPagBackgroundReady"
      />
    </view>

    <!-- 蝴蝶 PAG 动画 - 位置在按钮上方 -->
    <view v-if="showButterfly" class="pag-butterfly-container">
      <PagLoadingCDN
        :width="400"
        :height="400"
        :auto-play="true"
        :loop="true"
        :scale-mode="2"
        :pag-file-url="pagButtonUrl"
        @ready="onPagButtonReady"
      />
    </view>

    <!-- 欢迎文案区域 -->
    <view v-if="pagReady" class="welcome-section">
      <text class="welcome-title"> 欢迎来到你的专属手链运势 </text>
      <text class="welcome-subtitle"> 在这里，每天为你开启好运 </text>
    </view>

    <!-- 绑定按钮区域 -->
    <view v-if="pagReady" class="bind-section">
      <view class="bind-button-container" @click="handleBindClick">
        <image class="button-bg" src="/static/pages/bind/button-bg.png" mode="aspectFit" />
        <view v-if="isBinding" class="button-loading">
          <view class="button-loading-spinner" />
          <text class="button-text"> 绑定中... </text>
        </view>
        <text v-else class="button-text"> 开始绑定 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import PagLoadingCDN from '@/components/PagLoadingCDN.vue';

const authStore = useAuthStore();

// 响应式状态
const isBinding = ref(false);
const nfcId = ref('');
const isH5Platform = process.env.UNI_PLATFORM === 'h5';
const PAG_CDN_BASE = 'https://yunshi-2sy.pages.dev';
const pagBackgroundUrl =
  process.env.UNI_PLATFORM === 'h5'
    ? `${PAG_CDN_BASE}/static/pag/Bind_animation.pag`
    : '/static/pag/Bind_animation.pag';
const pagButtonUrl =
  process.env.UNI_PLATFORM === 'h5'
    ? `${PAG_CDN_BASE}/static/pag/Bind_button.pag`
    : '/static/pag/Bind_button.pag';
const pagBackgroundReady = ref(false);
const pagButtonReady = ref(false);
const pagReady = computed(() => pagBackgroundReady.value && pagButtonReady.value);
const showPagLoading = computed(() => !pagReady.value);

// 控制蝴蝶动画的显示
const showButterfly = ref(false);

// 页面加载时获取NFC ID
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};

  // 获取 NFC ID
  // H5环境：优先从 URL 查询参数获取（因 hash 路由的问题）
  if (isH5Platform) {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcIdFromUrl = urlParams.get('nfcId');
    if (nfcIdFromUrl) {
      nfcId.value = nfcIdFromUrl;
      console.log('[Bind] 从 URL 获取 nfcId:', nfcIdFromUrl);
    } else {
      // 再从 localStorage 获取
      const storedNfcId = uni.getStorageSync('currentNfcId');
      if (storedNfcId) {
        nfcId.value = storedNfcId;
        console.log('[Bind] 从 localStorage 获取 nfcId:', storedNfcId);
      }
    }
  } else {
    // 小程序环境从 options 获取
    if (options.nfcId) {
      nfcId.value = options.nfcId;
    }
  }

  // 延迟1s显示蝴蝶动画，确保背景和DOM先完成渲染
  setTimeout(async () => {
    showButterfly.value = true;
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 1000);
});

const onPagBackgroundReady = () => {
  pagBackgroundReady.value = true;
};

const onPagButtonReady = () => {
  pagButtonReady.value = true;
};

const handleBindClick = async () => {
  if (isBinding.value) return;

  if (nfcId.value) {
    uni.setStorageSync('currentNfcId', nfcId.value);
  }

  if (isH5Platform) {
    const target = nfcId.value
      ? `/pages/verify-code/index?nfcId=${nfcId.value}`
      : '/pages/verify-code/index';
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
      throw new Error('微信登录授权失败');
    }

    const response = await authService.login(loginResult.code, nfcId.value || undefined);

    if (response.success) {
      const { status, token, user, previewScore, recommendation } = response.data;

      if (token) {
        authStore.login(token, user || {});
      }

      if (status === 'PROFILE_INCOMPLETE') {
        uni.redirectTo({ url: '/pages/profile/index' });
      } else if (status === 'AUTHENTICATED') {
        uni.redirectTo({ url: '/pages/fortune/index' });
      } else if (status === 'VISITOR_PREVIEW') {
        if (previewScore && recommendation) {
          uni.setStorageSync('previewData', { score: previewScore, recommendation });
        }
        uni.showToast({ title: '该手链已绑定，为你展示游客预览', icon: 'none', duration: 2000 });
        uni.redirectTo({ url: '/pages/fortune/index?mode=visitor&preview=true' });
      }
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('绑定流程异常:', error);
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
        errorMessage = message;
      }
    }
    uni.showToast({ title: errorMessage, icon: 'none', duration: 2500 });
  } finally {
    isBinding.value = false;
  }
};
</script>

<style lang="scss" scoped>
.bind-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #1a1a2e;
}

/* 全屏背景PAG容器 */
.pag-background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .pag-preview-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  :deep(.pag-loading-container),
  :deep(.pag-canvas) {
    width: 100%;
    height: 100%;
  }
}

/* 蝴蝶PAG动画容器 - 叠加在底部 */
.pag-butterfly-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 200;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  :deep(.pag-loading-container) {
    width: 400px;
    height: 400px;
    min-height: auto;
    margin-bottom: -30px;
  }

  :deep(.pag-canvas) {
    width: 400px !important;
    height: 400px !important;
  }
}

/* 欢迎文案区域 - 位置在按钮上方 */
.welcome-section {
  position: fixed;
  bottom: 250rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 590rpx;
  z-index: 100;
  text-align: center;

  .welcome-title {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 48rpx;
    color: #ffffff;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 20rpx;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .welcome-subtitle {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 36rpx;
    color: #ffffff;
    line-height: 1.4;
    opacity: 0.85;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }
}

/* 绑定按钮区域 */
.bind-section {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 668rpx;
  height: 115rpx;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bind-button-container {
  position: relative;
  width: 668rpx;
  height: 115rpx;
  z-index: 2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.button-text {
  position: relative;
  z-index: 2;
  font-family: 'PingFang SC', sans-serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #ffffff;
  line-height: 115rpx;
  text-align: center;
}

.button-loading {
  position: relative;
  z-index: 2;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* PAG 加载占位 */
.pag-loading-mask {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 500;
  pointer-events: none;
  background: radial-gradient(circle at 50% 30%, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.55));
}

.pag-loading-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: pag-bounce 1s ease-in-out infinite;
  margin-bottom: 12rpx;
}

.pag-loading-text {
  font-size: 28rpx;
  color: #ffffff;
  opacity: 0.9;
}

@keyframes pag-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12rpx);
  }
}
</style>
