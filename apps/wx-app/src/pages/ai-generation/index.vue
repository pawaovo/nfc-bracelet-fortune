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

    <view v-if="isLoading" class="loading-container" :class="{ 'fade-out': isFadingOut }">
      <!-- 背景PAG动画 (loading_bmp.pag) -->
      <view class="pag-animation-overlay">
        <PagLoadingCDN
          ref="pagLoadingRef"
          :fill-width="true"
          :auto-play="false"
          :loop="false"
          :manual-control="true"
          pag-file-url="/static/pag/loading_bmp.pag"
          @download-complete="onPagDownloadComplete"
          @ready="onPagReady"
        />
      </view>

      <!-- 前景PAG动画 (loading.pag) -->
      <view class="pag-foreground-overlay">
        <PagLoadingCDN
          ref="pagForegroundRef"
          :width="300"
          :height="300"
          :auto-play="false"
          :loop="false"
          :manual-control="true"
          pag-file-url="/static/pag/loading.pag"
          @download-complete="onPagForegroundDownloadComplete"
          @ready="onPagForegroundReady"
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
import { PAG_CONFIG, LOADING_MESSAGES, LOADING_MESSAGE_INTERVAL } from '@/config/pag';

const config = ref<FortunePageTheme>(getTheme('default'));
const FORCE_RELOAD_FLAG_KEY = 'fortuneForceReload';

const authStore = useAuthStore();
const fortuneStore = useFortuneStore();

const isLoading = ref(true);
const isGenerating = ref(false);
const showPagWaiting = ref(false);
const pagDownloadComplete = ref(false);
const pagForegroundDownloadComplete = ref(false);
const aiResponseComplete = ref(false);
const errorMessage = ref('');
const isFadingOut = ref(false);

const aiRetryState = ref({
  showRetry: false,
  retryCount: 0,
  maxRetries: 3,
  isRetrying: false,
});

const loadingText = ref<string>(LOADING_MESSAGES[0]);
const loadingTimer = ref<ReturnType<typeof setInterval> | null>(null);

const pagLoadingRef = ref<InstanceType<typeof PagLoadingCDN>>();
const pagForegroundRef = ref<InstanceType<typeof PagLoadingCDN>>();

const pagAnimationState = ref({
  isPlaying: false,
  loopTimer: null as ReturnType<typeof setTimeout> | null,
  hasHandledReady: false,
});

const pagForegroundAnimationState = ref({
  isPlaying: false,
  hasHandledReady: false,
});

onLoad(() => {
  authStore.initFromStorage();
  triggerGeneration();
});

// 页面隐藏/卸载时清理资源（防止内存泄漏）
onHide(() => {
  cleanupAllPagResources();
});

onUnload(() => {
  cleanupAllPagResources();
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
  isFadingOut.value = false;
  errorMessage.value = '';
  aiRetryState.value.showRetry = false;
  showPagWaiting.value = false;
  pagDownloadComplete.value = false;
  pagForegroundDownloadComplete.value = false;
  aiResponseComplete.value = false;
  // 重置PAG动画状态
  pagAnimationState.value.hasHandledReady = false;
  pagAnimationState.value.isPlaying = false;
  pagForegroundAnimationState.value.hasHandledReady = false;
  pagForegroundAnimationState.value.isPlaying = false;

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

    // 开始淡出动画
    isFadingOut.value = true;

    // 在淡出动画期间提前清理PAG资源
    setTimeout(() => {
      cleanupAllPagResources();
    }, 300); // 淡出动画进行到一半时开始清理

    // 等待淡出动画完成后再跳转
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/fortune/index?fromProfile=true&preloaded=true',
      });
    }, 600);
  } catch (error) {
    console.error('AI 生成失败:', error);
    // 停止动画（如果PAG组件已就绪）
    if (pagLoadingRef.value?.checkReady() && pagForegroundRef.value?.checkReady()) {
      await stopLoadingAnimation();
    }
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

/**
 * 处理降级方案（跳转到访客模式）
 */
function handleFallback() {
  aiRetryState.value.showRetry = false;
  cleanupAllPagResources();
  fortuneStore.clearFortune();
  uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
}

function startLoadingAnimation() {
  if (loadingTimer.value) return;

  let messageIndex = 0;
  loadingText.value = LOADING_MESSAGES[messageIndex];

  loadingTimer.value = setInterval(() => {
    messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
    loadingText.value = LOADING_MESSAGES[messageIndex];
  }, LOADING_MESSAGE_INTERVAL);

  startPagAnimation();
}

async function stopLoadingAnimation() {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
  loadingText.value = LOADING_MESSAGES[0];

  // 只有在两个PAG组件都就绪时才播放结束动画
  if (pagLoadingRef.value?.checkReady() && pagForegroundRef.value?.checkReady()) {
    await playPagEnding();
  } else {
    console.warn('⚠️ PAG组件未就绪，跳过结束动画');
  }
}

function onPagDownloadComplete() {
  pagDownloadComplete.value = true;
  checkAllPagDownloadComplete();
}

function onPagForegroundDownloadComplete() {
  pagForegroundDownloadComplete.value = true;
  checkAllPagDownloadComplete();
}

function checkAllPagDownloadComplete() {
  if (pagDownloadComplete.value && pagForegroundDownloadComplete.value) {
    showPagWaiting.value = false;
  }
}

async function onPagReady() {
  if (pagAnimationState.value.hasHandledReady) {
    return;
  }

  pagAnimationState.value.hasHandledReady = true;
  checkBothPagReady();
}

async function onPagForegroundReady() {
  if (pagForegroundAnimationState.value.hasHandledReady) {
    return;
  }

  pagForegroundAnimationState.value.hasHandledReady = true;
  checkBothPagReady();
}

async function checkBothPagReady() {
  // 等待两个PAG都就绪
  if (
    !pagAnimationState.value.hasHandledReady ||
    !pagForegroundAnimationState.value.hasHandledReady
  ) {
    return;
  }

  if (aiResponseComplete.value) {
    // AI已完成，播放结束动画
    await stopLoadingAnimation();
  } else {
    // AI未完成，开始播放循环动画
    startLoadingAnimation();
  }
}

/**
 * AI完成后处理PAG动画
 * 等待结束动画播放完成
 */
async function handlePagAnimationAfterAI() {
  if (pagDownloadComplete.value && pagForegroundDownloadComplete.value) {
    await stopLoadingAnimation();
  } else {
    console.log('⚠️ 等待所有 PAG 下载完成后播放结束动画');
  }
}

function startPagAnimation() {
  if (pagAnimationState.value.isPlaying) {
    return;
  }

  if (!pagLoadingRef.value || !pagForegroundRef.value) {
    setTimeout(() => startPagAnimation(), PAG_CONFIG.componentInitDelayMs);
    return;
  }

  if (!pagLoadingRef.value.checkReady() || !pagForegroundRef.value.checkReady()) {
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
  pagForegroundAnimationState.value.isPlaying = true;

  // 同时播放两个PAG的初始动画
  pagLoadingRef.value.playInitialAnimation(loopStartProgress);
  pagForegroundRef.value.playInitialAnimation(loopStartProgress);

  pagAnimationState.value.loopTimer = setTimeout(() => {
    if (!pagLoadingRef.value || !pagForegroundRef.value) return;
    if (!pagAnimationState.value.isPlaying) {
      return;
    }
    // 同时播放两个PAG的循环动画
    pagLoadingRef.value.startMiddleLoop(loopStartProgress, loopEndProgress);
    pagForegroundRef.value.startMiddleLoop(loopStartProgress, loopEndProgress);
  }, PAG_CONFIG.loopStart * 1000);
}

function playPagEnding(): Promise<void> {
  return new Promise(resolve => {
    console.log('🎬 准备播放结束动画...');

    // 清除循环定时器（停止等待循环开始的定时器）
    if (pagAnimationState.value.loopTimer) {
      clearTimeout(pagAnimationState.value.loopTimer);
      pagAnimationState.value.loopTimer = null;
    }

    // 检查PAG组件引用
    if (!pagLoadingRef.value || !pagForegroundRef.value) {
      console.warn('⚠️ PAG组件引用不存在，跳过结束动画');
      resolve();
      return;
    }

    // 检查PAG组件是否就绪
    if (!pagLoadingRef.value.checkReady() || !pagForegroundRef.value.checkReady()) {
      console.warn('⚠️ PAG组件未就绪，跳过结束动画');
      resolve();
      return;
    }

    pagAnimationState.value.isPlaying = false;
    pagForegroundAnimationState.value.isPlaying = false;

    // 获取PAG信息
    const pagInfo = pagLoadingRef.value.getPagInfo();
    if (!pagInfo) {
      console.warn('⚠️ 无法获取PAG信息，跳过结束动画');
      resolve();
      return;
    }

    console.log('✅ PAG组件就绪，开始播放结束动画');
    const totalDuration = pagInfo.duration;
    const loopStartProgress = PAG_CONFIG.loopStart / totalDuration;
    const endingStartProgress = PAG_CONFIG.endingStart / totalDuration;
    const endingDuration = (PAG_CONFIG.endingEnd - PAG_CONFIG.endingStart) * 1000;

    // 检查当前进度，如果还在初始动画阶段，先快速播放到循环段
    const currentProgress = pagLoadingRef.value.getProgress() || 0;
    console.log(
      `📊 当前进度: ${(currentProgress * 100).toFixed(0)}%, 循环起点: ${(loopStartProgress * 100).toFixed(0)}%`
    );

    if (currentProgress < loopStartProgress) {
      console.log('⚡ 初始动画未完成，快速跳转到循环段再播放结束动画');
      // 先跳转到循环段起点（不调用flush，让playEnding自动渲染）
      pagLoadingRef.value.setProgress(loopStartProgress);
      pagForegroundRef.value.setProgress(loopStartProgress);

      // 短暂延迟后播放结束动画
      setTimeout(() => {
        pagLoadingRef.value.playEnding(endingStartProgress);
        pagForegroundRef.value.playEnding(endingStartProgress);
        console.log(
          `⏱️ 结束动画时长: ${endingDuration}ms (${PAG_CONFIG.endingStart}s - ${PAG_CONFIG.endingEnd}s)`
        );
      }, 50);
    } else {
      // 正常播放结束动画
      pagLoadingRef.value.playEnding(endingStartProgress);
      pagForegroundRef.value.playEnding(endingStartProgress);
      console.log(
        `⏱️ 结束动画时长: ${endingDuration}ms (${PAG_CONFIG.endingStart}s - ${PAG_CONFIG.endingEnd}s)`
      );
    }

    setTimeout(() => {
      console.log('✅ 结束动画播放完成');
      resolve();
    }, endingDuration + PAG_CONFIG.endingBufferMs);
  });
}

/**
 * 清理PAG动画相关的定时器和状态
 * 注意：这只清理父组件的定时器，不清理PAG组件内部的资源
 */
function cleanupPagAnimation() {
  // 清理循环定时器
  if (pagAnimationState.value.loopTimer) {
    clearTimeout(pagAnimationState.value.loopTimer);
    pagAnimationState.value.loopTimer = null;
  }

  // 清理文字轮播定时器
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }

  // 重置状态
  pagAnimationState.value.isPlaying = false;
  pagAnimationState.value.hasHandledReady = false;
  pagForegroundAnimationState.value.isPlaying = false;
  pagForegroundAnimationState.value.hasHandledReady = false;
  loadingText.value = LOADING_MESSAGES[0];
}

/**
 * 完整清理所有PAG资源（父组件 + 子组件）
 * 用于页面跳转前的资源清理
 */
function cleanupAllPagResources() {
  console.log('🧹 完整清理所有PAG资源');

  // 1. 清理父组件的定时器和状态
  cleanupPagAnimation();

  // 2. 清理PAG组件的WebGL资源
  try {
    pagLoadingRef.value?.cleanup();
    pagForegroundRef.value?.cleanup();
  } catch (error) {
    console.warn('⚠️ 清理PAG组件资源失败:', error);
  }
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
  opacity: 1;
  transition: opacity 0.5s ease-out;
}

.loading-container.fade-out {
  opacity: 0;
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

.pag-foreground-overlay {
  position: fixed;
  bottom: 230rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.loading-text {
  position: fixed;
  bottom: 400rpx;
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
