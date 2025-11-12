<template>
  <view class="history-container">
    <!-- 星空背景 -->
    <image class="bg-stars" src="https://i.postimg.cc/HxJcqQx0/bg-stars.png" mode="aspectFill" />

    <!-- 额外背景图层 -->
    <image
      class="bg-overlay"
      src="https://i.postimg.cc/xdqq6NW0/tu-ceng-743.png"
      mode="aspectFill"
    />

    <!-- 顶部导航区域 -->
    <view class="top-nav-area">
      <!-- 返回按钮 -->
      <view class="navbar-back" @click="goBack">
        <text class="back-icon"> ‹ </text>
      </view>
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

    <!-- 顶部固定标题区域（不滚动） -->
    <view v-if="!isInitialLoading && !error" class="header-section">
      <!-- 标题 -->
      <text class="main-title"> 我的运势足迹 </text>

      <!-- 装饰线条 -->
      <image
        class="decoration-line"
        src="/static/pages/history/decoration-line.png"
        mode="widthFix"
      />

      <!-- 副标题 -->
      <text class="sub-title"> 最近更新 {{ latestUpdateDate }} 历史记录 </text>
    </view>

    <!-- 主内容 -->
    <view v-if="!isInitialLoading && !error" class="main-content">
      <!-- 空状态 -->
      <view v-if="historyList.length === 0" class="empty-container">
        <text class="empty-text"> 暂无历史记录 </text>
        <text class="empty-desc"> 开始使用手链，记录你的运势足迹吧！ </text>
      </view>

      <!-- 滚动区域容器 -->
      <view v-else class="scroll-wrapper">
        <!-- 当日运势标签 -->
        <text class="section-label"> 当日运势 </text>

        <!-- 时间轴列表 -->
        <scroll-view
          v-if="shouldEnableScroll"
          class="timeline-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="isRefreshing"
          @scrolltolower="loadMoreHistory"
          @refresherrefresh="onRefresh"
          @refresherrestore="onRefreshRestore"
        >
          <view class="timeline-container">
            <view class="timeline-line" />
            <template v-for="(item, index) in historyList" :key="item.date">
              <view class="timeline-item" @click="handleItemClick(item)">
                <view class="timeline-dot">
                  <view class="dot-outer" />
                  <view class="dot-inner" />
                </view>
                <text class="timeline-date">
                  {{ item.date }}
                </text>
                <view class="fortune-card">
                  <image
                    class="fortune-card-bg"
                    src="/static/pages/history/border.png"
                    mode="scaleToFill"
                  />
                  <image
                    class="fortune-card-flower"
                    src="/static/pages/history/flower.png"
                    mode="aspectFit"
                    :style="getFlowerStyle(item.date, index)"
                  />
                  <!-- 顶部标题行：左侧评语 + 右侧分数 -->
                  <view class="fortune-card-header">
                    <text class="fortune-card-title" :class="getTimeColorClass(item)">
                      {{ formatFortuneComment(item) }}
                    </text>
                    <text class="fortune-card-score">
                      {{ calculateOverallScore(item) }}
                    </text>
                  </view>
                  <!-- 底部总结信息 -->
                  <view class="fortune-card-info">
                    <text class="fortune-time">
                      {{ formatFortuneSummary(item) }}
                    </text>
                  </view>
                </view>
              </view>
            </template>
            <view v-if="isLoadingMore" class="load-more-container">
              <view class="loading-more">
                <view class="loading-more-spinner" />
                <text class="loading-more-text"> 正在加载... </text>
              </view>
            </view>
            <view v-if="shouldShowScrollIndicator" class="scroll-indicator">
              <text class="scroll-arrow"> ↓ </text>
              <text class="scroll-hint"> 向下滚动查看更多 </text>
            </view>
          </view>
        </scroll-view>

        <!-- 时间轴列表（不可滚动） -->
        <view v-else class="timeline-scroll">
          <view class="timeline-container">
            <view class="timeline-line" />
            <template v-for="(item, index) in historyList" :key="item.date">
              <view class="timeline-item" @click="handleItemClick(item)">
                <view class="timeline-dot">
                  <view class="dot-outer" />
                  <view class="dot-inner" />
                </view>
                <text class="timeline-date">
                  {{ item.date }}
                </text>
                <view class="fortune-card">
                  <image
                    class="fortune-card-bg"
                    src="/static/pages/history/border.png"
                    mode="scaleToFill"
                  />
                  <image
                    class="fortune-card-flower"
                    src="/static/pages/history/flower.png"
                    mode="aspectFit"
                    :style="getFlowerStyle(item.date, index)"
                  />
                  <!-- 顶部标题行：左侧评语 + 右侧分数 -->
                  <view class="fortune-card-header">
                    <text class="fortune-card-title" :class="getTimeColorClass(item)">
                      {{ formatFortuneComment(item) }}
                    </text>
                    <text class="fortune-card-score">
                      {{ calculateOverallScore(item) }}
                    </text>
                  </view>
                  <!-- 底部总结信息 -->
                  <view class="fortune-card-info">
                    <text class="fortune-time">
                      {{ formatFortuneSummary(item) }}
                    </text>
                  </view>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
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
const latestUpdateDate = ref('');

// 计算属性：是否启用滚动（当卡片数量 > 7 时才允许滚动）
const shouldEnableScroll = computed(() => {
  return historyList.value.length > 7;
});

// 计算属性：是否显示滚动指示器（有更多内容且未在加载时显示）
const shouldShowScrollIndicator = computed(() => {
  return hasMore.value && !isLoadingMore.value && historyList.value.length > 0;
});

// 页面生命周期
onLoad(() => {
  console.log('历史记录页面加载');
  loadHistory();
});

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack({
    delta: 1,
  });
}

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

      // 更新最近更新日期
      if (fortunes.length > 0) {
        latestUpdateDate.value = fortunes[0].date;
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
 * 计算综合分数
 * 综合分数 = (事业运分数 + 财富运分数 + 爱情运分数) / 3，保留整数
 */
function calculateOverallScore(item: FortuneData): number {
  const careerScore = Math.round((item.careerStars ?? 3) * 20);
  const wealthScore = Math.round((item.wealthStars ?? 3) * 20);
  const loveScore = Math.round((item.loveStars ?? 3) * 20);

  return Math.round((careerScore + wealthScore + loveScore) / 3);
}

/**
 * 格式化运势评语（只返回评语文字，不包含分数）
 * 格式：中等运势 / 中上运势 / 上等运势 / 上上运势
 * 分数范围：
 * - 上上运势：90-100分
 * - 上等运势：80-89分
 * - 中上运势：70-79分
 * - 中等运势：<70分
 */
function formatFortuneComment(item: FortuneData): string {
  const score = calculateOverallScore(item);
  let comment: string;

  if (score >= 90) {
    comment = '上上运势';
  } else if (score >= 80) {
    comment = '上等运势';
  } else if (score >= 70) {
    comment = '中上运势';
  } else {
    comment = '中等运势';
  }

  return comment;
}

/**
 * 格式化运势总结（用于正文）
 * 显示summary字段，只显示一行，过长时省略
 */
function formatFortuneSummary(item: FortuneData): string {
  // 优先使用summary字段，其次使用comment字段
  const summary = item.summary || item.comment || '今日运势平稳';
  return summary;
}

/**
 * 获取时间文字颜色类
 * 颜色等级与运势等级对应：
 * - time-excellent: 上上运势（90-100分）- 紫红色
 * - time-good: 上等运势（80-89分）- 浅紫色
 * - time-normal: 中上运势（70-79分）- 中紫色
 * - time-fair: 中等运势（<70分）- 深紫色
 */
function getTimeColorClass(item: FortuneData): string {
  const score = calculateOverallScore(item);
  if (score >= 90) return 'time-excellent'; // 上上运势
  if (score >= 80) return 'time-good'; // 上等运势
  if (score >= 70) return 'time-normal'; // 中上运势
  return 'time-fair'; // 中等运势
}

/**
 * 生成花朵装饰图片的随机样式
 * 每个卡片都有不同的水平偏移和旋转角度
 * 限制在卡片右半段区域内，不超出边界
 * 使用日期+索引作为种子确保样式稳定一致
 */
function getFlowerStyle(date: string, index: number): string {
  // 使用日期+索引生成稳定的哈希值（不使用Math.random()避免重复渲染）
  const seed = `${date}-${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // 限制水平偏移范围：12rpx 到 120rpx（从右边缘向左偏移）
  // 12rpx 是最小边距，120rpx 确保图标在卡片右半段
  // 图标宽度40rpx，所以 right: 12rpx 时图标右边缘距离卡片边缘12rpx
  const minRight = 12;
  const maxRight = 120;
  const offsetRange = maxRight - minRight; // 108rpx的偏移范围
  const rightPosition = minRight + (Math.abs(hash) % offsetRange); // 12 到 120

  // 生成随机旋转角度：-60到60度
  const rotation = (Math.abs(hash >> 8) % 121) - 60; // -60 到 60

  // 固定在右上角，只有水平偏移，垂直位置固定
  return `right: ${rightPosition}rpx; top: 12rpx; transform: rotate(${rotation}deg);`;
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

/* 容器 */
.history-container {
  min-height: 100vh;
  background: #000000;
  position: relative;
  overflow: hidden;
}

/* 背景图层通用样式 */
.bg-stars,
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bg-stars {
  opacity: 0.5;
  z-index: 0;
}

.bg-overlay {
  z-index: 1;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx;
  padding-top: 280rpx;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text,
.error-text {
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

/* 顶部导航区域 */
.top-nav-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100%; /* 占满整个屏幕高度，用于定位子元素 */
  z-index: 100;
  background: transparent;
  pointer-events: none; /* 允许点击穿透 */
}

/* 返回按钮 */
.navbar-back {
  position: absolute;
  top: 100rpx; /* 与微信状态按钮对齐 */
  left: 32rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
  pointer-events: auto; /* 恢复点击事件 */
  z-index: 101;
}

.back-icon {
  color: #ffffff;
  font-size: 48rpx;
  font-weight: 300;
  line-height: 1;
  margin-left: -4rpx;
}

/* 顶部固定标题区域 */
.header-section {
  position: fixed;
  top: 180rpx; /* 在返回按钮下方 */
  left: 32rpx;
  right: 32rpx;
  z-index: 99;
  background: transparent;
  pointer-events: none; /* 允许点击穿透 */
}

/* 主内容 */
.main-content {
  position: fixed;
  top: 350rpx; /* 在标题区域下方（180 + 标题约60 + 副标题约30 + 装饰线约60 + 间距20） */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 0 32rpx 32rpx 32rpx;
  overflow: hidden; /* 禁止主容器滚动 */
}

/* 标题 */
.main-title {
  color: #ffffff;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 48rpx; /* 从 80rpx 调整为 48rpx */
  font-weight: 600;
  line-height: 56rpx;
  display: block;
  margin-bottom: 8rpx;
}

.sub-title {
  color: rgba(187, 187, 187, 1);
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 36rpx;
  display: block;
  margin-bottom: 16rpx;
}

/* 装饰线条 */
.decoration-line {
  width: 480rpx;
  height: auto;
  opacity: 0.8;
  margin-top: -22rpx; /* 上移，与标题底部叠放 */
  margin-bottom: 16rpx; /* 与副标题的间距 */
  margin-left: -100rpx; /* 左移一段距离 */
  display: block;
}

/* 滚动区域容器 */
.scroll-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%; /* 占满剩余空间 */
}

/* 当日运势标签 */
.section-label {
  color: #ffffff;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 40rpx;
  display: block;
  flex-shrink: 0;
  margin-bottom: 16rpx; /* 与时间轴的间距 */
  pointer-events: auto; /* 恢复点击事件 */
}

/* 空状态 */
.empty-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 60rpx;
  text-align: center;
}

.empty-text {
  color: #ffffff;
  font-size: 28rpx;
  line-height: 1.5;
}

.empty-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  margin-top: 16rpx;
}

/* 时间轴滚动区域 */
.timeline-scroll {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

/* 时间轴容器 */
.timeline-container {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 垂直连续线 */
.timeline-line {
  position: absolute;
  left: 24rpx; /* 从 14rpx 右移到 24rpx */
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: rgba(223, 217, 255, 0.3);
  z-index: 0;
}

/* 时间轴项目 */
.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-left: 10rpx;
  z-index: 1;
}

/* 时间轴圆点 */
.timeline-dot {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  z-index: 2;
}

.dot-outer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #19131f;
  border: 6rpx solid #a78bfa; /* 改为紫色 */
}

.dot-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #19131f;
}

/* 时间轴日期 */
.timeline-date {
  color: rgba(187, 187, 187, 1);
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 36rpx;
  width: 140rpx; /* 从 180rpx 减小到 140rpx，为卡片腾出更多空间 */
  flex-shrink: 0;
  padding: 0 16rpx; /* 调整内边距 */
}

/* 运势卡片 */
.fortune-card {
  flex: 1;
  position: relative;
  border-radius: 16rpx;
  padding: 20rpx 28rpx;
  min-height: 100rpx;
  display: flex;
  flex-direction: column; /* 纵向布局 */
  justify-content: center;
  overflow: hidden;
}

.fortune-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.fortune-card-flower {
  position: absolute;
  width: 60rpx; /* 从40rpx放大到60rpx */
  height: 60rpx; /* 从40rpx放大到60rpx */
  z-index: 2;
  opacity: 0.9;
}

/* 顶部标题行：评语 + 分数 */
.fortune-card-header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.fortune-card-title {
  color: #ffffff;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 40rpx;
  flex: 1;

  /* 上上运势：90-100分 */
  &.time-excellent {
    color: #d946ef; /* 紫红色 */
  }

  /* 上等运势：80-89分 */
  &.time-good {
    color: #c084fc; /* 浅紫色 */
  }

  /* 中上运势：70-79分 */
  &.time-normal {
    color: #a78bfa; /* 中紫色 */
  }

  /* 中等运势：<70分 */
  &.time-fair {
    color: #8b5cf6; /* 深紫色 */
  }

  /* 保留备用（当前未使用） */
  &.time-poor {
    color: #9e9e9e; /* 灰色 */
  }
}

/* 右侧分数 */
.fortune-card-score {
  font-family: 'ABeeZee', sans-serif;
  font-size: 72rpx; /* 放大字体 */
  font-weight: 700; /* 加粗 */
  font-style: italic; /* 斜体 */
  line-height: 1;
  flex-shrink: 0;
  margin-left: 20rpx;
  align-self: flex-start; /* 允许独立定位 */
  transform: translateY(60rpx); /* 下移20rpx */
  color: #ffffff; /* 白色文字 */
  text-shadow: 0 0 20rpx rgba(255, 255, 255, 0.8); /* 白色高亮发光效果 */
}

.fortune-card-info {
  position: relative;
  z-index: 1;
  background: rgba(250, 226, 255, 0.05);
  border-radius: 12rpx;
  padding: 12rpx 20rpx;
  width: 65%; /* 宽度限制为80% */
}

.fortune-time {
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 26rpx;
  font-weight: 400;
  line-height: 36rpx;
  color: #bbbbbb;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 加载更多 */
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  margin-top: auto;
}

.loading-more {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.loading-more-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top: 3rpx solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-more-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

/* 滚动指示器 */
.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  gap: 8rpx;
}

.scroll-arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 40rpx;
  font-weight: 300;
  animation: bounce 2s ease-in-out infinite;
}

.scroll-hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 20rpx;
  text-align: center;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(10rpx);
    opacity: 1;
  }
}
</style>
