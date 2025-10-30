<template>
  <view class="settings-page">
    <view class="header">
      <text class="header-title"> 设置 </text>
    </view>

    <view class="content">
      <!-- 用户信息 -->
      <view v-if="authStore.isAuthenticated" class="info-section">
        <view class="info-item">
          <text class="info-label"> 姓名 </text>
          <text class="info-value">
            {{ authStore.user?.name || '未设置' }}
          </text>
        </view>
        <view class="info-item">
          <text class="info-label"> 生日 </text>
          <text class="info-value">
            {{ formatBirthday(authStore.user?.birthday) }}
          </text>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="menu-section">
        <view class="menu-item" @tap="navigateTo('/pages/privacy/index')">
          <text class="menu-text"> 隐私政策 </text>
          <text class="menu-arrow"> › </text>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/agreement/index')">
          <text class="menu-text"> 用户协议 </text>
          <text class="menu-arrow"> › </text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="authStore.isAuthenticated" class="action-section">
        <button class="logout-btn" @tap="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 格式化生日
const formatBirthday = (birthday: Date | string | null | undefined) => {
  if (!birthday) return '未设置';
  const date = new Date(birthday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 页面导航
const navigateTo = (url: string) => {
  uni.navigateTo({ url });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: res => {
      if (res.confirm) {
        authStore.logout();
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        });
        // 返回首页
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' });
        }, 1000);
      }
    },
  });
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #ffffff;
  padding: 40rpx;
  text-align: center;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.content {
  padding: 40rpx;
}

.info-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
}

.menu-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #cccccc;
}

.action-section {
  margin-top: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #ff4444;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
