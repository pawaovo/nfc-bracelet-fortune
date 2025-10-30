<template>
  <view v-if="visible" class="privacy-modal">
    <view class="modal-mask" @tap="handleCancel" />
    <view class="modal-content">
      <view class="modal-header">
        <text class="modal-title"> 用户隐私保护提示 </text>
      </view>

      <view class="modal-body">
        <text class="modal-text"> 欢迎使用本小程序！ </text>
        <text class="modal-text"> 为了向您提供服务，我们需要收集以下信息： </text>

        <view class="info-list">
          <text class="info-item"> • 微信授权信息（用于身份识别） </text>
          <text class="info-item"> • 姓名和生日（用于个性化内容） </text>
          <text class="info-item"> • NFC手链设备ID（用于设备绑定） </text>
        </view>

        <text class="modal-text"> 我们承诺： </text>
        <text class="modal-text"> • 仅在必要范围内收集和使用您的信息 </text>
        <text class="modal-text"> • 采取安全措施保护您的个人信息 </text>
        <text class="modal-text"> • 不会向第三方分享您的个人身份信息 </text>

        <view class="link-section">
          <text class="link-text"> 详细了解： </text>
          <text class="link" @tap="openPrivacy"> 《隐私政策》 </text>
          <text class="link" @tap="openAgreement"> 《用户协议》 </text>
        </view>
      </view>

      <view class="modal-footer">
        <button class="btn btn-cancel" @tap="handleCancel">不同意</button>
        <button class="btn btn-confirm" @tap="handleConfirm">同意并继续</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  // 保存用户同意状态
  uni.setStorageSync('privacy_agreed', true);
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const openPrivacy = () => {
  uni.navigateTo({ url: '/pages/privacy/index' });
};

const openAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index' });
};
</script>

<style scoped>
.privacy-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx 40rpx 20rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.modal-body {
  padding: 20rpx 40rpx 40rpx;
  max-height: 800rpx;
  overflow-y: auto;
}

.modal-text {
  display: block;
  font-size: 26rpx;
  color: #666666;
  line-height: 40rpx;
  margin-bottom: 16rpx;
}

.info-list {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.info-item {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 36rpx;
  margin-bottom: 8rpx;
}

.link-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.link-text {
  font-size: 24rpx;
  color: #999999;
  margin-right: 12rpx;
}

.link {
  font-size: 24rpx;
  color: #576b95;
  text-decoration: underline;
  margin-right: 20rpx;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 28rpx;
  border: none;
  border-radius: 0;
  background-color: transparent;
}

.btn::after {
  border: none;
}

.btn-cancel {
  color: #999999;
  border-right: 1rpx solid #f0f0f0;
}

.btn-confirm {
  color: #576b95;
  font-weight: bold;
}
</style>
