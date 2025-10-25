<template>
  <view class="history-container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="decoration-circle decoration-circle-1" />
      <view class="decoration-circle decoration-circle-2" />
    </view>

    <!-- 加载状态 -->
    <view v-if="isInitialLoading" class="loading-container">
      <view class="loading-spinner" />
      <text class="loading-text"> 正在加载历史记录... </text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon"> ⚠️ </text>
      <text class="error-text">
        {{ error }}
      </text>
      <button class="retry-button" @click="loadHistory">重新加载</button>
    </view>

    <!-- 历史列表 -->
    <view v-else class="content">
      <!-- 空状态 -->
      <view v-if="historyList.length === 0" class="empty-container">
        <text class="empty-icon"> 📊 </text>
        <text class="empty-text"> 暂无历史记录 </text>
        <text class="empty-desc"> 开始使用手链，记录你的运势足迹吧！ </text>
      </view>

      <!-- 历史列表 -->
      <scroll-view
        v-else
        class="history-scroll"
        scroll-y
        @scrolltolower="loadMoreHistory"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
        @refresherrestore="onRefreshRestore"
      >
        <view class="history-list">
          <view
            v-for="item in historyList"
            :key="item.date"
            class="history-item"
            @click="handleItemClick(item)"
          >
            <view class="item-left">
              <text class="item-date">{{ formatDate(item.date) }}</text>
              <text class="item-weekday">{{ getWeekday(item.date) }}</text>
            </view>
            <view class="item-center">
              <text class="item-comment">{{ item.comment || '运势不错' }}</text>
            </view>
            <view class="item-right">
              <view class="score-badge" :class="getScoreClass(item.overallScore)">
                <text class="score-text">{{ item.overallScore }}</text>
                <text class="score-label">分</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多状态 -->
        <view class="load-more-container">
          <view v-if="isLoadingMore" class="loading-more">
            <view class="loading-more-spinner" />
            <text class="loading-more-text"> 正在加载... </text>
          </view>
          <view v-else-if="!hasMore && historyList.length > 0" class="no-more">
            <text class="no-more-text"> 没有更多了 </text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fortuneService } from '@/api/fortune';
import type { FortuneData } from '@/stores/fortune';

// 页面状态
const historyList = ref<FortuneData[]>([]);
const isInitialLoading = ref(false);
const isLoadingMore = ref(false);
const isRefreshing = ref(false);
const error = ref('');
const page = ref(1);
const limit = ref(20);
const hasMore = ref(true);

// 页面生命周期
onLoad(() => {
  console.log('历史记录页面加载');
  loadHistory();
});

/**
 * 加载历史记录
 */
async function loadHistory(isRefresh = false) {
  try {
    if (isRefresh) {
      isRefreshing.value = true;
      page.value = 1;
      hasMore.value = true;
    } else if (page.value === 1) {
      isInitialLoading.value = true;
    } else {
      isLoadingMore.value = true;
    }
    
    error.value = '';

    console.log(`加载历史记录 - 页码: ${page.value}, 每页: ${limit.value}`);

    const response = await fortuneService.getHistoryFortunes(page.value, limit.value);

    if (response.success && response.data) {
      const { fortunes, total } = response.data;
      
      if (isRefresh || page.value === 1) {
        historyList.value = fortunes;
      } else {
        historyList.value.push(...fortunes);
      }

      // 计算是否还有更多数据
      const totalLoaded = page.value * limit.value;
      hasMore.value = totalLoaded < total;

      console.log(`加载成功 - 当前页: ${page.value}, 总数: ${total}, 还有更多: ${hasMore.value}`);
    } else {
      throw new Error(response.message || '加载历史记录失败');
    }
  } catch (err) {
    console.error('加载历史记录失败:', err);
    error.value = err instanceof Error ? err.message : '加载历史记录失败，请重试';
  } finally {
    isInitialLoading.value = false;
    isLoadingMore.value = false;
    isRefreshing.value = false;
  }
}

/**
 * 加载更多历史记录
 */
async function loadMoreHistory() {
  if (isLoadingMore.value || !hasMore.value) {
    return;
  }

  page.value += 1;
  await loadHistory();
}

/**
 * 下拉刷新
 */
async function onRefresh() {
  await loadHistory(true);
}

/**
 * 刷新完成
 */
function onRefreshRestore() {
  isRefreshing.value = false;
}

/**
 * 点击历史项
 */
function handleItemClick(item: FortuneData) {
  console.log('点击历史项:', item.date);
  uni.navigateTo({
    url: `/pages/fortune/index?date=${item.date}`,
  });
}

/**
 * 格式化日期显示
 */
function formatDate(date: string): string {
  try {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch (error) {
    return date;
  }
}

/**
 * 获取星期几
 */
function getWeekday(date: string): string {
  try {
    const dateObj = new Date(date);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `星期${weekdays[dateObj.getDay()]}`;
  } catch (error) {
    return '';
  }
}

/**
 * 获取分数样式类
 */
function getScoreClass(score: number): string {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-normal';
  if (score >= 60) return 'score-fair';
  return 'score-poor';
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.history-container {
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
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.loading-container,
.error-container,
.empty-container {
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

/* 历史页面特有的加载动画样式 */
.loading-spinner {
  margin-bottom: 30rpx;
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
  height: 100vh;
}

.history-scroll {
  height: 100%;
  padding: 20rpx;
}

.history-list {
  padding-bottom: 100rpx;
}

.history-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 200rpx;
}

.item-date {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.item-weekday {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

.item-center {
  flex: 1;
}

.item-comment {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  line-height: 1.4;
}

.item-right {
  display: flex;
  align-items: center;
}

/* score-badge 样式已移至公共样式文件 */

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-more {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* loading-more-spinner 和文本样式已移至公共样式文件 */
</style>
