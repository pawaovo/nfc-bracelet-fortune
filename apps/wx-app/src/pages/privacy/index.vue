<template>
  <view class="privacy-page">
    <view class="content">
      <view class="section">
        <text class="title"> 隐私政策 </text>
        <text class="update-time"> 更新日期：2025年1月 </text>
      </view>

      <view class="section">
        <text class="section-title"> 1. 我们收集的信息 </text>
        <text class="text"> 为了向您提供服务，我们会收集以下信息： </text>
        <text class="text"> • 微信授权信息：用于识别您的身份 </text>
        <text class="text"> • 姓名和生日：用于提供个性化内容 </text>
        <text class="text"> • NFC手链设备ID：用于绑定您的专属手链 </text>
      </view>

      <view class="section">
        <text class="section-title"> 2. 信息的使用 </text>
        <text class="text"> 我们收集的信息仅用于： </text>
        <text class="text"> • 提供小程序的基本功能 </text>
        <text class="text"> • 生成个性化内容推荐 </text>
        <text class="text"> • 改进和优化服务体验 </text>
      </view>

      <view class="section">
        <text class="section-title"> 3. 信息的存储 </text>
        <text class="text">
          您的信息将安全存储在我们的服务器中，我们采取合理的安全措施保护您的个人信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title"> 4. 第三方服务 </text>
        <text class="text"> 我们使用AI服务来生成内容，但不会向第三方分享您的个人身份信息。 </text>
      </view>

      <view class="section">
        <text class="section-title"> 5. 您的权利 </text>
        <text class="text"> 您可以随时： </text>
        <text class="text"> • 查看和修改您的个人信息 </text>
        <text class="text"> • 删除您的账号和数据 </text>
        <text class="text"> • 联系我们了解信息使用情况 </text>
      </view>

      <view class="section">
        <text class="section-title"> 6. 联系我们 </text>
        <text class="text"> 如有任何问题，请通过小程序内的反馈功能联系我们。 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 隐私政策页面
</script>

<style scoped>
.privacy-page {
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
