<template>
  <view class="ai-generation-page">
    <view class="main-background">
      <image class="bg-main" :src="config.images.mainBackground" mode="aspectFill" />
    </view>

    <view v-if="showPagWaiting" class="pag-waiting-overlay">
      <view class="pag-waiting-content">
        <view class="pag-waiting-spinner" />
        <text class="pag-waiting-text"> 正在下载资源... </text>
      </view>
    </view>

    <view v-if="isLoading" class="loading-container">
      <view class="pag-animation-overlay">
        <PagLoadingCDN
          ref="pagLoadingRef"
          :fill-width="true"
          :auto-play="false"
          :loop="false"
          :manual-control="true"
          @download-complete="onPagDownloadComplete"
          @ready="onPagReady"
        />
      </view>

      <text class="loading-text">
        {{ loadingText }}
      </text>
    </view>

    <view v-else-if="aiRetryState.showRetry" class="ai-retry-container">
      <view class="retry-content">
        <view class="retry-icon"> 🔮 </view>
        <text class="retry-title"> 运势分析遇到问题 </text>
        <text class="retry-desc">
          {{ errorMessage || 'AI分析服务暂时不稳定，请重新分析获取更准确的运势' }}
        </text>

        <view class="retry-info">
          <text class="retry-count">
            已重试 {{ aiRetryState.retryCount }}/{{ aiRetryState.maxRetries }} 次
          </text>
        </view>

        <view class="retry-buttons">
          <button
            class="retry-btn primary"
            :disabled="
              aiRetryState.retryCount >= aiRetryState.maxRetries || aiRetryState.isRetrying
            "
            @click="handleRetry"
          >
            {{ aiRetryState.retryCount >= aiRetryState.maxRetries ? '使用基础运势' : '重新分析' }}
          </button>

          <button
            v-if="aiRetryState.retryCount < aiRetryState.maxRetries"
            class="retry-btn secondary"
            @click="handleFallback"
          >
            直接查看基础运势
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { onLoad, onHide, onUnload } from '@dcloudio/uni-app';
import PagLoadingCDN from '@/components/PagLoadingCDN.vue';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { fortuneService } from '@/api/fortune';
import { isPagCached } from '@/utils/pagPreloader';
import { getTheme, type FortunePageTheme } from '../fortune/config';

const config = ref<FortunePageTheme>(getTheme('default'));
const FORCE_RELOAD_FLAG_KEY = 'fortuneForceReload';

const authStore = useAuthStore();
const fortuneStore = useFortuneStore();

const isLoading = ref(true);
const isGenerating = ref(false);
const showPagWaiting = ref(false);
const pagDownloadComplete = ref(false);
const aiResponseComplete = ref(false);
const errorMessage = ref('');

const aiRetryState = ref({
  showRetry: false,
  retryCount: 0,
  maxRetries: 3,
  isRetrying: false,
});

const loadingText = ref('正在连接手链...');
const loadingMessages = ref([
  '正在连接手链...',
  '正在分析你的运势...',
  '正在计算年度指数...',
  '正在生成专属建议...',
  '握紧就会好...',
]);
const loadingTimer = ref<ReturnType<typeof setInterval> | null>(null);

const pagLoadingRef = ref<InstanceType<typeof PagLoadingCDN>>();
const PAG_CONFIG = {
  totalDuration: 25,
  loopStart: 13,
  loopEnd: 18,
  endingStart: 20,
  endingBufferMs: 500,
  componentCheckIntervalMs: 100,
  componentInitDelayMs: 300,
};

const pagAnimationState = ref({
  isPlaying: false,
  loopTimer: null as ReturnType<typeof setTimeout> | null,
  hasHandledReady: false,
});

onLoad(() => {
  authStore.initFromStorage();
  triggerGeneration();
});

onHide(() => {
  cleanupPagAnimation();
});

onUnload(() => {
  cleanupPagAnimation();
});

onBeforeUnmount(() => {
  cleanupPagAnimation();
});

async function triggerGeneration() {
  if (isGenerating.value) return;
  if (!authStore.isAuthenticated) {
    uni.showToast({ title: '请先完成绑定', icon: 'none' });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/bind/index' });
    }, 1500);
    isLoading.value = false;
    return;
  }

  isGenerating.value = true;
  isLoading.value = true;
  errorMessage.value = '';
  aiRetryState.value.showRetry = false;
  showPagWaiting.value = false;
  pagDownloadComplete.value = false;
  aiResponseComplete.value = false;
  pagAnimationState.value.hasHandledReady = false;
  pagAnimationState.value.isPlaying = false;

  try {
    const pagCached = await isPagCached();
    if (pagCached) {
      pagDownloadComplete.value = true;
    } else {
      showPagWaiting.value = true;
    }

    const response = await fortuneService.regenerateTodayFortune();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'AI生成失败，请稍后重试');
    }

    fortuneStore.setFortune(response.data);
    aiResponseComplete.value = true;
    aiRetryState.value.retryCount = 0;
    aiRetryState.value.showRetry = false;
    uni.removeStorageSync(FORCE_RELOAD_FLAG_KEY);

    await handlePagAnimationAfterAI();
    setTimeout(() => {
      navigateToFortune();
    }, 150);
  } catch (error) {
    console.error('AI 生成失败:', error);
    await stopLoadingAnimation();
    showPagWaiting.value = false;
    isLoading.value = false;
    errorMessage.value =
      error instanceof Error && error.message ? error.message : 'AI生成失败，请稍后重试';
    aiRetryState.value.showRetry = true;
  } finally {
    isGenerating.value = false;
  }
}

async function handleRetry() {
  if (
    aiRetryState.value.retryCount >= aiRetryState.value.maxRetries ||
    aiRetryState.value.isRetrying
  ) {
    return;
  }

  aiRetryState.value.retryCount += 1;
  aiRetryState.value.isRetrying = true;
  aiRetryState.value.showRetry = false;

  try {
    await triggerGeneration();
  } finally {
    aiRetryState.value.isRetrying = false;
  }
}

function handleFallback() {
  aiRetryState.value.showRetry = false;
  cleanupPagAnimation();
  fortuneStore.clearFortune();
  uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
}

function navigateToFortune() {
  cleanupPagAnimation();
  uni.redirectTo({
    url: '/pages/fortune/index?fromProfile=true&preloaded=true',
  });
}

function startLoadingAnimation() {
  if (loadingTimer.value) return;

  let messageIndex = 0;
  loadingText.value = loadingMessages.value[messageIndex];

  loadingTimer.value = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.value.length;
    loadingText.value = loadingMessages.value[messageIndex];
  }, 1500);

  startPagAnimation();
}

async function stopLoadingAnimation() {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
  loadingText.value = loadingMessages.value[0];

  await playPagEnding();
}

function onPagDownloadComplete() {
  pagDownloadComplete.value = true;
  showPagWaiting.value = false;
}

async function onPagReady() {
  if (pagAnimationState.value.hasHandledReady) {
    return;
  }

  pagAnimationState.value.hasHandledReady = true;

  if (aiResponseComplete.value) {
    await stopLoadingAnimation();
    isLoading.value = false;
  } else {
    startLoadingAnimation();
  }
}

async function handlePagAnimationAfterAI() {
  if (pagDownloadComplete.value) {
    await stopLoadingAnimation();
    isLoading.value = false;
  } else {
    console.log('等待 PAG 下载完成后播放结束动画');
  }
}

function startPagAnimation() {
  if (pagAnimationState.value.isPlaying) {
    return;
  }

  if (!pagLoadingRef.value) {
    setTimeout(() => startPagAnimation(), PAG_CONFIG.componentInitDelayMs);
    return;
  }

  if (!pagLoadingRef.value.checkReady()) {
    setTimeout(() => startPagAnimation(), PAG_CONFIG.componentCheckIntervalMs);
    return;
  }

  const pagInfo = pagLoadingRef.value.getPagInfo();
  if (!pagInfo) {
    return;
  }

  const totalDuration = pagInfo.duration;
  const loopStartProgress = PAG_CONFIG.loopStart / totalDuration;
  const loopEndProgress = PAG_CONFIG.loopEnd / totalDuration;

  pagAnimationState.value.isPlaying = true;
  pagLoadingRef.value.playInitialAnimation(loopStartProgress);

  pagAnimationState.value.loopTimer = setTimeout(() => {
    if (!pagLoadingRef.value) return;
    if (!pagAnimationState.value.isPlaying) {
      return;
    }
    pagLoadingRef.value.startMiddleLoop(loopStartProgress, loopEndProgress);
  }, PAG_CONFIG.loopStart * 1000);
}

function playPagEnding(): Promise<void> {
  return new Promise(resolve => {
    if (pagAnimationState.value.loopTimer) {
      clearTimeout(pagAnimationState.value.loopTimer);
      pagAnimationState.value.loopTimer = null;
    }

    if (!pagLoadingRef.value) {
      resolve();
      return;
    }

    pagAnimationState.value.isPlaying = false;
    const pagInfo = pagLoadingRef.value.getPagInfo();
    if (!pagInfo) {
      resolve();
      return;
    }

    const totalDuration = pagInfo.duration;
    const endingStartProgress = PAG_CONFIG.endingStart / totalDuration;
    const endingDuration = (totalDuration - PAG_CONFIG.endingStart) * 1000;

    pagLoadingRef.value.playEnding(endingStartProgress);
    setTimeout(() => resolve(), endingDuration + PAG_CONFIG.endingBufferMs);
  });
}

function cleanupPagAnimation() {
  if (pagAnimationState.value.loopTimer) {
    clearTimeout(pagAnimationState.value.loopTimer);
    pagAnimationState.value.loopTimer = null;
  }

  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }

  pagAnimationState.value.isPlaying = false;
  pagAnimationState.value.hasHandledReady = false;
  loadingText.value = loadingMessages.value[0];
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.ai-generation-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.main-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  .bg-main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.loading-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx;
  text-align: center;
}

.pag-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.loading-text {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  font-size: 32rpx;
  color: #ffffff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.ai-retry-container {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 60rpx 40rpx;
  text-align: center;
  color: #ffffff;
}

.retry-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600rpx;
}

.retry-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
  opacity: 0.8;
}

.retry-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.retry-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.retry-info {
  margin-bottom: 50rpx;
}

.retry-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.retry-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
}

.retry-btn {
  border: none;
  border-radius: 50rpx;
  padding: 28rpx 60rpx;
  font-size: 32rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
}

.retry-btn.primary:disabled {
  background: #cccccc;
  box-shadow: none;
  opacity: 0.6;
}

.retry-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.retry-btn:active {
  transform: translateY(2rpx);
}

.pag-waiting-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pag-waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
}

.pag-waiting-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: pag-spin 1s linear infinite;
  margin-bottom: 40rpx;
}

@keyframes pag-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.pag-waiting-text {
  font-size: 28rpx;
  color: #ffffff;
  text-align: center;
  line-height: 1.6;
  max-width: 500rpx;
}
</style>
