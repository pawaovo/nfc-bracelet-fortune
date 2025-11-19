<template>
  <view class="bind-container">
    <!-- 全屏背景PAG动画 -->
    <view class="pag-background-overlay">
      <PagLoadingCDN
        ref="pagBackgroundRef"
        :fill-width="true"
        :auto-play="true"
        :loop="true"
        :manual-control="false"
        pag-file-url="/static/pag/Bind_animation.pag"
      />
    </view>

    <!-- 欢迎文案区域 -->
    <view class="welcome-section">
      <text class="welcome-title"> 嗨！我是你的专属运势手链 </text>
      <text class="welcome-subtitle"> 绑定我，每天为你分析运势！ </text>
    </view>

    <!-- 绑定按钮区域 -->
    <view class="bind-section">
      <!-- 按钮上的蝴蝶PAG动画 - 保持正方形比例 -->
      <view class="pag-button-overlay">
        <PagLoadingCDN
          ref="pagButtonRef"
          :width="300"
          :height="300"
          :auto-play="true"
          :loop="true"
          :manual-control="false"
          pag-file-url="/static/pag/Bind_button.pag"
        />
      </view>

      <!-- 绑定按钮 -->
      <button
        class="bind-button"
        :class="{ loading: isBinding }"
        :disabled="isBinding"
        @click="handleBindClick"
      >
        <view v-if="isBinding" class="button-loading">
          <view class="button-loading-spinner" />
          <text>绑定中...</text>
        </view>
        <text v-else> 开始绑定 </text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import PagLoadingCDN from '@/components/PagLoadingCDN.vue';

const authStore = useAuthStore();

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');
const isH5Platform = process.env.UNI_PLATFORM === 'h5';

// PAG组件引用
const pagBackgroundRef = ref<InstanceType<typeof PagLoadingCDN>>();
const pagButtonRef = ref<InstanceType<typeof PagLoadingCDN>>();

// 页面加载时获取NFC ID
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

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
}

/* 欢迎文案区域 */
.welcome-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  height: 300rpx; /* 增加高度以容纳正方形的PAG动画 */
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end; /* 按钮靠底部对齐 */

  /* 按钮上的蝴蝶PAG动画 - 正方形容器 */
  .pag-button-overlay {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 300rpx; /* 正方形 */
    height: 300rpx; /* 正方形 */
    z-index: 1;
    pointer-events: none; /* 让点击事件穿透到按钮 */
  }

  .bind-button {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 115rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 58rpx;
    color: #ffffff;
    font-family: 'PingFang SC', sans-serif;
    font-size: 36rpx;
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &.loading {
      opacity: 0.7;
    }

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
