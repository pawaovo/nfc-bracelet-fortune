<template>
  <view class="verify-page">
    <view class="background">
      <image class="bg-main" src="/static/pages/profile/bg-main.png" mode="scaleToFill" />
      <image class="bg-overlay" src="/static/pages/profile/rectangle-9.png" mode="scaleToFill" />
      <view class="backdrop" />
    </view>

    <view class="content">
      <text class="title"> 验证码登录/注册 </text>
      <text class="subtitle"> 未注册的手机号将自动注册并登录 </text>

      <view class="field">
        <view class="input-bg" />
        <image class="field-icon" src="/static/pages/profile/phone-icon.png" mode="aspectFit" />
        <input
          v-model="phone"
          class="input"
          type="number"
          :placeholder="'请输入手机号'"
          placeholder-style="color: rgba(255, 255, 255, 0.5); line-height: 96rpx;"
          placeholder-class="verify-input-placeholder"
          maxlength="11"
        />
      </view>

      <view class="field code-field">
        <view class="input-bg" />
        <image class="field-icon" src="/static/pages/profile/code-icon.png" mode="aspectFit" />
        <input
          v-model="code"
          class="input"
          type="number"
          :placeholder="'请输入验证码'"
          placeholder-style="color: rgba(255, 255, 255, 0.5); line-height: 96rpx;"
          placeholder-class="verify-input-placeholder"
          maxlength="6"
        />
        <view class="send-btn" :class="{ disabled: countdown > 0 }" @tap="startCountdown">
          <text>{{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}</text>
        </view>
      </view>

      <view class="submit-btn" @tap="handleSubmit">
        <text class="submit-text"> 登 录 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const currentNfcId = ref('');
let timer: number | undefined;

onLoad(options => {
  if (options?.nfcId) {
    currentNfcId.value = String(options.nfcId);
    uni.setStorageSync('currentNfcId', currentNfcId.value);
  }
});

const startCountdown = () => {
  if (countdown.value > 0) return;
  countdown.value = 59;

  timer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0;
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      return;
    }
    countdown.value -= 1;
  }, 1000) as unknown as number;
};

const handleSubmit = () => {
  const target = currentNfcId.value
    ? `/pages/profile/index?nfcId=${currentNfcId.value}`
    : '/pages/profile/index';
  uni.redirectTo({ url: target });
};

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.verify-page {
  position: relative;
  min-height: 100vh;
  background: #0b0b1a;
  overflow: hidden;
}

.background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-main {
  position: absolute;
  top: -5.69%;
  left: -52.38%;
  width: 159.69%;
  height: 107.94%;
  z-index: 1;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.95;
  z-index: 2;
}

.backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(120, 96, 255, 0.4), transparent 45%),
    radial-gradient(circle at 80% 30%, rgba(255, 120, 255, 0.25), transparent 40%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 3;
}

.content {
  position: relative;
  z-index: 4;
  padding: 200rpx 60rpx 80rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  color: #fff;
}

.title {
  text-align: center;
  font-size: 44rpx;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.field {
  position: relative;
  height: 96rpx;
  border-radius: 48rpx;
  overflow: hidden;
}

.input-bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 48rpx;
}

.field-icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  z-index: 2;
}

.input {
  position: absolute;
  inset: 0;
  padding: 0 30rpx 0 110rpx;
  font-size: 26rpx;
  color: #fff;
  line-height: 96rpx !important;
  height: 96rpx;
}

:deep(.verify-input-placeholder) {
  line-height: 96rpx !important;
  height: 96rpx;
  display: block;
}

.code-field {
  display: flex;
  align-items: center;
}

.send-btn {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  height: 60rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  z-index: 2;
}

.send-btn.disabled {
  opacity: 0.65;
}

.submit-btn {
  margin-top: 10rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #7c5df8 0%, #5c5cf8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 6rpx;
}
</style>
