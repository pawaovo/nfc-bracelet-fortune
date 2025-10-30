<template>
  <view class="page">
    <!-- 设置按钮 -->
    <view class="settings-btn" @tap="goToSettings">
      <text class="settings-icon"> ⚙️ </text>
    </view>

    <view class="content">
      <image class="logo" src="/static/logo.png" />
      <view class="text-area">
        <text class="title"> Hello </text>
      </view>

      <!-- 免责声明 -->
      <view class="disclaimer">
        <text class="disclaimer-text"> 本服务仅供娱乐参考 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' });
};
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
}

.settings-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-icon {
  font-size: 48rpx;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.disclaimer {
  margin-top: 80rpx;
  padding: 20rpx 40rpx;
  background-color: #fff3cd;
  border-radius: 12rpx;
}

.disclaimer-text {
  font-size: 24rpx;
  color: #856404;
}
</style>
