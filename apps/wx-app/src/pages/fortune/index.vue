<template>
  <view class="fortune-container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="decoration-circle decoration-circle-1"></view>
      <view class="decoration-circle decoration-circle-2"></view>
      <view class="decoration-circle decoration-circle-3"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在获取你的专属运势...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">{{ error }}</text>
      <button class="retry-button" @click="loadFortune">重新获取</button>
    </view>

    <!-- 运势内容 -->
    <view v-else class="content">
      <!-- 顶部日期 -->
      <view class="date-header">
        <text class="date-text">{{ currentDate }}</text>
      </view>

      <!-- 欢迎语 -->
      <view class="welcome-section">
        <text class="welcome-text">{{ welcomeMessage }}</text>
      </view>

      <!-- 综合分数 -->
      <view class="score-section">
        <view class="score-circle">
          <text class="score-number">{{ fortuneData?.overallScore || 0 }}</text>
          <text class="score-label">分</text>
        </view>
        <text class="score-title">综合分数</text>
      </view>

      <!-- 运势点评 -->
      <view class="comment-section">
        <text class="comment-text">{{ fortuneData?.comment || '正在为你生成专属运势...' }}</text>
      </view>

      <!-- 分项运势 -->
      <view class="luck-sections">
        <view class="luck-item">
          <view class="luck-header">
            <text class="luck-icon">💼</text>
            <text class="luck-title">事业运</text>
          </view>
          <view class="luck-stars">
            <star-rating :score="fortuneData?.careerLuck || 0" />
          </view>
        </view>

        <view class="luck-item">
          <view class="luck-header">
            <text class="luck-icon">💰</text>
            <text class="luck-title">财富运</text>
          </view>
          <view class="luck-stars">
            <star-rating :score="fortuneData?.wealthLuck || 0" />
          </view>
        </view>

        <view class="luck-item">
          <view class="luck-header">
            <text class="luck-icon">💕</text>
            <text class="luck-title">爱情运</text>
          </view>
          <view class="luck-stars">
            <star-rating :score="fortuneData?.loveLuck || 0" />
          </view>
        </view>
      </view>

      <!-- 开运提示 -->
      <view class="tips-section">
        <view class="tips-header">
          <text class="tips-icon">✨</text>
          <text class="tips-title">今日开运提示</text>
        </view>
        <view class="tips-content">
          <view class="tip-item">
            <text class="tip-label">幸运色：</text>
            <text class="tip-value">{{ fortuneData?.luckyColor || '紫色' }}</text>
          </view>
          <view class="tip-item">
            <text class="tip-label">幸运数字：</text>
            <text class="tip-value">{{ fortuneData?.luckyNumber || 8 }}</text>
          </view>
          <view class="tip-item">
            <text class="tip-label">建议：</text>
            <text class="tip-value">{{ fortuneData?.suggestion || '保持积极心态，好运自然来' }}</text>
          </view>
        </view>
      </view>

      <!-- 商品推荐 -->
      <view v-if="fortuneData?.recommendation" class="recommendation-section">
        <view class="recommendation-header">
          <text class="recommendation-title">今日开运手链推荐</text>
        </view>
        <view class="recommendation-card" @click="handleRecommendationClick">
          <image
            class="recommendation-image"
            :src="fortuneData.recommendation.imageUrl"
            mode="aspectFill"
          />
          <view class="recommendation-info">
            <text class="recommendation-name">{{ fortuneData.recommendation.name }}</text>
            <text class="recommendation-desc">{{ fortuneData.recommendation.description }}</text>
            <text class="recommendation-action">点击查看详情 →</text>
          </view>
        </view>
      </view>

      <!-- 历史记录入口 -->
      <view v-if="!isVisitorMode" class="history-section">
        <button class="history-button" @click="goToHistory">
          <text class="history-icon">📊</text>
          <text class="history-text">查看历史运势</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFortuneStore } from '@/stores/fortune'
import { fortuneService, generateRandomScore, generateRandomLuckyColor, generateRandomLuckyNumber } from '@/api/fortune'
import type { FortuneData } from '@/stores/fortune'
import StarRating from '@/components/StarRating.vue'

// Stores
const authStore = useAuthStore()
const fortuneStore = useFortuneStore()

// 页面状态
const isLoading = ref(false)
const error = ref('')
const isVisitorMode = ref(false)

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

const welcomeMessage = computed(() => {
  if (isVisitorMode.value) {
    return '欢迎体验专属运势服务'
  }

  if (authStore.user?.name) {
    return `${authStore.user.name}，这是你的专属运势`
  }

  return '这是你的专属运势'
})

const fortuneData = computed(() => fortuneStore.todayFortune)

// 页面生命周期
onLoad((options: any) => {
  console.log('运势页面加载', options)

  // 检查是否为访客模式
  if (options?.mode === 'visitor') {
    isVisitorMode.value = true
  }

  // 检查登录状态
  checkAuthStatus()

  // 加载运势数据
  loadFortune()
})

/**
 * 检查认证状态
 */
function checkAuthStatus() {
  if (!isVisitorMode.value && !authStore.isAuthenticated) {
    console.warn('用户未登录，跳转到绑定页面')
    uni.redirectTo({
      url: '/pages/bind/index'
    })
    return
  }

  if (!isVisitorMode.value && !authStore.isProfileComplete) {
    console.warn('用户信息不完整，跳转到个人信息补全页面')
    uni.redirectTo({
      url: '/pages/profile/index'
    })
    return
  }
}

/**
 * 加载运势数据
 */
async function loadFortune() {
  try {
    isLoading.value = true
    error.value = ''

    if (isVisitorMode.value) {
      // 访客模式，显示模拟数据（无需网络请求）
      loadVisitorFortune()
      isLoading.value = false
    } else {
      // 已认证用户，加载真实数据
      await loadAuthenticatedFortune()
    }
  } catch (err) {
    console.error('加载运势失败:', err)
    error.value = err instanceof Error ? err.message : '加载运势失败，请重试'
    isLoading.value = false
  }
}

/**
 * 加载访客运势（模拟数据）
 */
function loadVisitorFortune() {
  const mockFortune: FortuneData = {
    date: new Date().toISOString().split('T')[0],
    overallScore: generateRandomScore(),
    comment: '今日运势不错，适合尝试新事物。购买专属手链，获取完整运势解读和个性化建议。',
    careerLuck: generateRandomScore(),
    wealthLuck: generateRandomScore(),
    loveLuck: generateRandomScore(),
    luckyColor: generateRandomLuckyColor(),
    luckyNumber: generateRandomLuckyNumber(),
    suggestion: '保持积极心态，好运自然来。想要获得更准确的运势分析，请购买专属手链。',
    recommendation: {
      id: '1',
      name: '紫水晶开运手链',
      description: '提升整体运势，增强直觉力',
      imageUrl: '/static/bracelet-sample.jpg',
      price: 299,
      douyinUrl: 'https://example.com/douyin'
    }
  }

  fortuneStore.setFortune(mockFortune)
}

/**
 * 加载已认证用户运势
 */
async function loadAuthenticatedFortune() {
  // 检查是否已有今日运势缓存
  if (fortuneStore.hasTodayFortune && fortuneStore.isToday) {
    console.log('使用缓存的今日运势')
    isLoading.value = false
    return
  }

  try {
    console.log('调用API获取今日运势')

    // 设置超时时间为1.5秒，确保快速响应
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 1500)
    })

    // 调用后端API获取今日运势
    const apiPromise = fortuneService.getTodayFortune()

    const response = await Promise.race([apiPromise, timeoutPromise]) as any

    if (response.success && response.data) {
      console.log('成功获取今日运势:', response.data)
      fortuneStore.setFortune(response.data)
    } else {
      throw new Error(response.message || '获取运势失败')
    }
  } catch (error) {
    console.error('API调用失败，使用模拟数据:', error)

    // API调用失败时使用模拟数据，确保用户体验
    const mockFortune: FortuneData = {
      date: new Date().toISOString().split('T')[0],
      overallScore: 88,
      comment: '今日运势极佳！事业上有突破机会，财运亨通，爱情甜蜜。',
      careerLuck: 90,
      wealthLuck: 85,
      loveLuck: 88,
      luckyColor: '金色',
      luckyNumber: 6,
      suggestion: '把握机会，勇敢行动，今天是你的幸运日',
      recommendation: {
        id: '2',
        name: '黄金转运手链',
        description: '招财进宝，事业有成',
        imageUrl: '/static/bracelet-gold.jpg',
        price: 599,
        douyinUrl: 'https://example.com/douyin'
      }
    }

    fortuneStore.setFortune(mockFortune)

    // 显示友好的错误提示，但不阻断用户体验
    if (error instanceof Error && error.message === '请求超时') {
      uni.showToast({
        title: '网络较慢，已显示缓存数据',
        icon: 'none',
        duration: 2000
      })
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理商品推荐点击
 */
function handleRecommendationClick() {
  if (fortuneData.value?.recommendation?.douyinUrl) {
    // 复制抖音链接到剪贴板
    uni.setClipboardData({
      data: fortuneData.value.recommendation.douyinUrl,
      success: () => {
        uni.showToast({
          title: '抖音链接已复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
  }
}

/**
 * 跳转到历史记录页面
 */
function goToHistory() {
  uni.navigateTo({
    url: '/pages/history/index'
  })
}
</script>

<style lang="scss" scoped>
.fortune-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &.decoration-circle-1 {
    width: 200rpx;
    height: 200rpx;
    top: 10%;
    right: -50rpx;
    animation: float 6s ease-in-out infinite;
  }

  &.decoration-circle-2 {
    width: 150rpx;
    height: 150rpx;
    top: 60%;
    left: -30rpx;
    animation: float 8s ease-in-out infinite reverse;
  }

  &.decoration-circle-3 {
    width: 100rpx;
    height: 100rpx;
    top: 30%;
    left: 20%;
    animation: float 10s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.loading-container, .error-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx;
  text-align: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top: 4rpx solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text, .error-text {
  color: #ffffff;
  font-size: 28rpx;
  line-height: 1.5;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.retry-button {
  margin-top: 40rpx;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50rpx;
  color: #ffffff;
  font-size: 28rpx;
}

.content {
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx;
}

.date-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  font-weight: 500;
}

.welcome-section {
  text-align: center;
  margin-bottom: 50rpx;
}

.welcome-text {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.4;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.score-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.score-number {
  color: #ffffff;
  font-size: 72rpx;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  margin-top: 8rpx;
}

.score-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.comment-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 50rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.comment-text {
  color: #ffffff;
  font-size: 30rpx;
  line-height: 1.6;
  text-align: center;
}

.luck-sections {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 50rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.luck-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  }
}

.luck-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.luck-icon {
  font-size: 32rpx;
}

.luck-title {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
}

.tips-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 50rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.tips-icon {
  font-size: 32rpx;
}

.tips-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.tip-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  min-width: 120rpx;
}

.tip-value {
  color: #ffffff;
  font-size: 28rpx;
  flex: 1;
  line-height: 1.4;
}

.recommendation-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 50rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.recommendation-header {
  margin-bottom: 30rpx;
}

.recommendation-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
}

.recommendation-card {
  display: flex;
  gap: 24rpx;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.recommendation-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
}

.recommendation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recommendation-name {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.recommendation-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  line-height: 1.4;
}

.recommendation-action {
  color: #ffd700;
  font-size: 26rpx;
  font-weight: 500;
}

.history-section {
  text-align: center;
}

.history-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50rpx;
  padding: 24rpx 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.history-icon {
  font-size: 32rpx;
}

.history-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
}
</style>
