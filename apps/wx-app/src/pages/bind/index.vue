<template>
  <view class="bind-container">
    <!-- 全屏背景PAG动画 -->
    <view class="pag-background-overlay">
      <PagLoadingCDN
        :fill-width="true"
        :auto-play="true"
        :loop="true"
        pag-file-url="/static/pag/Bind_animation.pag"
      />
    </view>

    <!-- 蝴蝶PAG动画 - 定位在按钮上方 -->
    <view v-if="showButterfly" class="pag-butterfly-container">
      <PagLoadingCDN
        :width="400"
        :height="400"
        :auto-play="true"
        :loop="true"
        :scale-mode="2"
        pag-file-url="/static/pag/Bind_button.pag"
      />
    </view>

    <!-- 欢迎文案区域 -->
    <view class="welcome-section">
      <text class="welcome-title"> 嗨！我是你的专属运势手链 </text>
      <text class="welcome-subtitle"> 绑定我，每天为你分析运势！ </text>
    </view>

    <!-- 绑定按钮区域 -->
    <view class="bind-section">
      <!-- 绑定按钮容器 - 与个人信息页面保持一致 -->
      <view class="bind-button-container" @click="handleBindClick">
        <!-- 按钮背景图 -->
        <image class="button-bg" src="/static/pages/bind/button-bg.png" mode="aspectFit" />
        <!-- 按钮内容 -->
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
import { ref, onMounted, nextTick } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import PagLoadingCDN from '@/components/PagLoadingCDN.vue';

const authStore = useAuthStore();

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');
const isH5Platform = process.env.UNI_PLATFORM === 'h5';

// 控制蝴蝶动画的显示
const showButterfly = ref(false);

// 页面加载时获取NFC ID
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};

  // 获取 NFC ID
  // H5环境：优先从 URL 查询参数获取（因为 hash 路由的问题）
  if (isH5Platform) {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcIdFromUrl = urlParams.get('nfcId');
    if (nfcIdFromUrl) {
      nfcId.value = nfcIdFromUrl;
      console.log('[Bind] 从 URL 获取 nfcId:', nfcIdFromUrl);
    } else {
      // 尝试从 localStorage 获取
      const storedNfcId = uni.getStorageSync('currentNfcId');
      if (storedNfcId) {
        nfcId.value = storedNfcId;
        console.log('[Bind] 从 localStorage 获取 nfcId:', storedNfcId);
      }
    }
  } else {
    // 小程序环境：从 options 获取
    if (options.nfcId) {
      nfcId.value = options.nfcId;
    }
  }

  // 延迟1秒显示蝴蝶动画，确保背景动画DOM已完全渲染
  setTimeout(async () => {
    showButterfly.value = true;
    // 等待DOM更新完成
    await nextTick();
    // 再等待一帧，确保uni-app的Canvas元素完全渲染
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 1000);
});

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
  width: 100%;
  overflow: hidden;
  background: #1a1a2e; /* 深色背景作为PAG动画的底色 */
}

/* 全屏背景PAG动画层 */
.pag-background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  :deep(.pag-loading-container),
  :deep(.pag-canvas) {
    width: 100%;
    height: 100%;
  }
}

/* 蝴蝶PAG动画容器 - 定位在底部按钮区域 */
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

/* 欢迎文案区域 - 定位在底部按钮上方 */
.welcome-section {
  position: fixed;
  bottom: 250rpx; /* 在按钮上方，按钮在100rpx，文案在250rpx */
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
    font-weight: 500;
    line-height: 1.4;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 绑定按钮区域 */
.bind-section {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 668rpx;
  height: 115rpx; /* 只需要按钮的高度 */
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 绑定按钮容器 - 与个人信息页面保持一致的样式 */
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

/* 按钮背景图 */
.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 按钮文字 */
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

/* 按钮loading状态 */
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
</style>
