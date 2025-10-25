<template>
  <view class="bind-container">
    <!-- 顶部装饰 -->
    <view class="header-decoration">
      <view class="decoration-circle" />
      <view class="decoration-circle" />
      <view class="decoration-circle" />
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 手链图标 -->
      <view class="bracelet-icon">
        <image
          src="../../static/bracelet-icon.png"
          mode="aspectFit"
          class="bracelet-image"
          @error="onImageError"
        />
      </view>

      <!-- 欢迎文案 -->
      <view class="welcome-text">
        <text class="title"> 欢迎来到专属运势世界 </text>
        <text v-if="nfcId" class="subtitle"> 您的NFC手链正在等待与您建立连接 </text>
        <text v-else class="subtitle"> 开启您的个性化运势体验 </text>
        <text class="description">
          通过微信授权，您将体验每日个性化运势， 让古老的智慧指引您的每一天
        </text>
      </view>

      <!-- 绑定按钮 -->
      <button
        class="bind-button"
        :class="{ loading: isBinding }"
        :disabled="isBinding"
        @click="handleBindClick"
      >
        <text v-if="!isBinding"> 微信授权并绑定 </text>
        <text v-else> 绑定中... </text>
      </button>

      <!-- 提示文案 -->
      <view class="tips">
        <text v-if="nfcId" class="tip-text"> 绑定后，您可以通过触碰手链快速查看运势 </text>
        <text v-else class="tip-text"> 授权后，您可以体验个性化运势预览 </text>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer-decoration">
      <view class="wave" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

// 响应式数据
const isBinding = ref(false);
const nfcId = ref('');

// 页面加载时获取NFC ID
onMounted(() => {
  // 从页面参数或全局状态获取nfcId
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.nfcId) {
    nfcId.value = options.nfcId;
    console.log('获取到NFC ID:', nfcId.value);
  } else {
    console.warn('未获取到NFC ID参数');
  }
});

// 图片加载失败处理
const onImageError = () => {
  console.warn('手链图片加载失败，使用默认样式');
};

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
      const { status, token, user } = response.data;

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
        // 这种情况不应该在绑定页面出现，但做容错处理
        uni.showToast({
          title: '此手链已被其他用户绑定',
          icon: 'none',
          duration: 2000,
        });
      }
    } else {
      throw new Error(response.message || '绑定失败');
    }
  } catch (error) {
    console.error('绑定失败:', error);

    let errorMessage = '绑定失败，请重试';
    if (error instanceof Error) {
      if (error.message.includes('授权')) {
        errorMessage = '微信授权失败，请重试';
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络';
      }
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000,
    });
  } finally {
    isBinding.value = false;
  }
};
</script>

<style lang="scss" scoped>
.bind-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 60rpx;
  right: 60rpx;
  display: flex;
  gap: 20rpx;

  .decoration-circle {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    animation: float 3s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 1s;
    }

    &:nth-child(3) {
      animation-delay: 2s;
    }
  }
}

.content {
  padding: 120rpx 60rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 180rpx);
}

.bracelet-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);

  .bracelet-image {
    width: 120rpx;
    height: 120rpx;
  }
}

.welcome-text {
  text-align: center;
  margin-bottom: 100rpx;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 20rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    display: block;
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 40rpx;
    line-height: 1.4;
  }

  .description {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    padding: 0 20rpx;
  }
}

.bind-button {
  width: 500rpx;
  height: 88rpx;
  background: linear-gradient(45deg, #ff6b6b, #ffa726);
  border: none;
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  margin-bottom: 60rpx;

  &:not(.loading):active {
    transform: translateY(2rpx);
    box-shadow: 0 5rpx 15rpx rgba(255, 107, 107, 0.4);
  }

  &.loading {
    opacity: 0.7;
    background: linear-gradient(45deg, #cccccc, #999999);
  }
}

.tips {
  .tip-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    line-height: 1.5;
  }
}

.footer-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;

  .wave {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 100% 100% 0 0;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}
</style>
