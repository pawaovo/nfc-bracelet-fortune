<template>
  <view class="agreement-page">
    <view class="content">
      <view class="section">
        <text class="title"> 用户服务协议 </text>
        <text class="update-time"> 更新日期：2025年1月 </text>
      </view>

      <view class="section">
        <text class="section-title"> 1. 服务说明 </text>
        <text class="text">
          本小程序提供基于NFC手链的个性化内容推荐服务，所有内容仅供娱乐参考，不构成任何专业建议。
        </text>
      </view>

      <view class="section">
        <text class="section-title"> 2. 用户责任 </text>
        <text class="text"> 您在使用本服务时应： </text>
        <text class="text"> • 提供真实准确的个人信息 </text>
        <text class="text"> • 妥善保管您的NFC手链 </text>
        <text class="text"> • 遵守相关法律法规 </text>
      </view>

      <view class="section">
        <text class="section-title"> 3. 免责声明 </text>
        <text class="text">
          本服务提供的内容仅供娱乐参考，不应作为决策依据。我们不对因使用本服务而产生的任何后果承担责任。
        </text>
      </view>

      <view class="section">
        <text class="section-title"> 4. 知识产权 </text>
        <text class="text">
          本小程序的所有内容、设计、代码等知识产权归我们所有，未经授权不得复制或使用。
        </text>
      </view>

      <view class="section">
        <text class="section-title"> 5. 服务变更 </text>
        <text class="text"> 我们保留随时修改或终止服务的权利，重大变更将提前通知用户。 </text>
      </view>

      <view class="section">
        <text class="section-title"> 6. 争议解决 </text>
        <text class="text">
          因使用本服务产生的争议，双方应友好协商解决。协商不成的，可向我们所在地人民法院提起诉讼。
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 用户服务协议页面
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40rpx;
}

.content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.update-time {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 44rpx;
  margin-bottom: 12rpx;
}
</style>
