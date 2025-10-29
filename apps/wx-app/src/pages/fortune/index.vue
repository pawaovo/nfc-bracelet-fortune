<template>
  <view class="fortune-container">
    <!-- 主背景容器 -->
    <view class="main-background">
      <!-- 主背景图片 -->
      <image class="bg-main" :src="config.images.mainBackground" mode="aspectFill" />
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner" />
      <text class="loading-text">
        {{ loadingText }}
      </text>
    </view>

    <!-- AI重试界面 -->
    <view v-else-if="aiRetryState.showRetry" class="ai-retry-container">
      <view class="retry-content">
        <view class="retry-icon"> 🔮 </view>
        <text class="retry-title"> 运势分析遇到问题 </text>
        <text class="retry-desc"> AI分析服务暂时不稳定，请重新分析获取更准确的运势 </text>

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
            @click="handleAIRetry"
          >
            {{ aiRetryState.retryCount >= aiRetryState.maxRetries ? '使用基础运势' : '重新分析' }}
          </button>

          <button
            v-if="aiRetryState.retryCount < aiRetryState.maxRetries"
            class="retry-btn secondary"
            @click="handleUseFallback"
          >
            直接查看基础运势
          </button>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon"> ⚠️ </text>
      <text class="error-text">
        {{ error }}
      </text>
      <button class="retry-button" @click="loadFortune">重新获取</button>
    </view>

    <!-- 运势内容 - 使用绝对定位精确还原设计图 -->
    <view v-else class="fortune-content">
      <!-- 运势卡片背景图 - 对应Figma node 1:307-310 -->
      <image
        class="card-bg-image"
        src="../../static/pages/fortune/card-main-bg.svg"
        mode="scaleToFill"
      />

      <!-- 数字装饰图 - 位于卡片右上角 -->
      <image
        class="card-number-decoration"
        src="../../static/pages/fortune/number.png"
        mode="aspectFit"
      />

      <!-- 底部装饰图 - 对应Figma node 1:311 -->
      <image
        class="bottom-decoration"
        src="../../static/pages/fortune/decoration-bottom-new.png"
        mode="aspectFill"
      />

      <!-- 顶部装饰图片 - 根据模式显示不同图片 -->
      <!-- 访客模式：显示解锁图标 -->
      <image
        v-if="isVisitorMode"
        class="top-lock-icon"
        src="../../static/pages/fortune/unlock.png"
        mode="aspectFit"
      />
      <!-- 完整版模式：显示呼吸动态装饰图 -->
      <image
        v-else
        class="phone-decoration-detail"
        src="../../static/pages/fortune/decoration-phone-detail.png"
        mode="aspectFit"
      />

      <!-- 内容区域 - 使用绝对定位 -->
      <view class="content-wrapper">
        <!-- 用户头像 - 对应Figma node 1:325 - 保持清晰可见 -->
        <view class="user-avatar" />

        <!-- 用户名字 - 对应Figma node 1:326 - 保持清晰可见 -->
        <text class="user-name-text"> {{ authStore.user?.name || 'YANG' }}阳有点痩 </text>

        <!-- 今日点评标题 - 带查看详情图标 -->
        <view class="comment-title-row">
          <text class="comment-title-text"> 今日点评 </text>
          <image
            class="comment-detail-icon"
            src="../../static/pages/fortune/flower.png"
            mode="aspectFit"
            @click="showDetailModal"
          />
        </view>

        <!-- 今日点评内容 - 可点击查看详情，超出显示省略号 -->
        <text class="comment-content-text" @click="showDetailModal">
          {{ fortuneData?.summary || fortuneData?.comment || '绑定生辰信息，查看专属运势分析' }}
        </text>

        <!-- 综合分数标签 - 保持清晰可见 -->
        <text class="score-label-text"> 综合分数 </text>

        <!-- 综合分数数字 - 保持清晰可见 -->
        <text class="score-number-text">
          {{ fortuneData?.overallScore || 88 }}
        </text>

        <!-- 运势详情区域 - 访客模式下此区域会被模糊 -->
        <view class="fortune-details-area" :class="{ 'visitor-blur': isVisitorMode }">
          <!-- 三项运势容器 - 对应Figma设计图 -->
          <view class="luck-sections-container">
            <!-- 事业运区域 - 使用星数而非分数 -->
            <view class="luck-section">
              <text class="luck-name-text"> 事业运 </text>
              <view class="luck-stars-row">
                <star-rating
                  :key="`career-${fortuneData?.careerStars || 0}`"
                  :stars="fortuneData?.careerStars ?? 3"
                  size="small"
                  color="#4CAF50"
                />
              </view>
            </view>

            <!-- 财富运区域 - 使用星数而非分数 -->
            <view class="luck-section">
              <text class="luck-name-text"> 财富运 </text>
              <view class="luck-stars-row">
                <star-rating
                  :key="`wealth-${fortuneData?.wealthStars || 0}`"
                  :stars="fortuneData?.wealthStars ?? 3"
                  size="small"
                  color="#FFD700"
                />
              </view>
            </view>

            <!-- 爱情运区域 - 使用星数而非分数 -->
            <view class="luck-section">
              <text class="luck-name-text"> 爱情运 </text>
              <view class="luck-stars-row">
                <star-rating
                  :key="`love-${fortuneData?.loveStars || 0}`"
                  :stars="fortuneData?.loveStars ?? 3"
                  size="small"
                  color="#FF69B4"
                />
              </view>
            </view>
          </view>

          <!-- 建议和避免区域 - 可点击查看详情 -->
          <view class="advice-container" @click="showAdviceModal">
            <!-- 建议 -->
            <view class="advice-item">
              <text class="advice-label-text"> 建议 </text>
              <view class="advice-content-wrapper">
                <text class="advice-content-text">
                  {{ fortuneData?.suggestion || '保持积极心态，好运自然来' }}
                </text>
              </view>
            </view>

            <!-- 避免 -->
            <view class="advice-item">
              <text class="advice-label-text"> 避免 </text>
              <view class="advice-content-wrapper">
                <text class="advice-content-text">
                  {{ fortuneData?.avoidance || '避免冲动决策' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 幸运卡片容器 - 重新布局 -->
          <view class="lucky-cards-container">
            <!-- 宜卡片 -->
            <view class="lucky-card">
              <text class="lucky-label-text"> 宜 </text>
              <text class="lucky-value-text">
                {{ fortuneData?.suitable || '合作' }}
              </text>
            </view>

            <!-- 忌卡片 -->
            <view class="lucky-card">
              <text class="lucky-label-text"> 忌 </text>
              <text class="lucky-value-text">
                {{ fortuneData?.unsuitable || '争执' }}
              </text>
            </view>

            <!-- 幸运色/数字卡片 -->
            <view class="lucky-card">
              <text class="lucky-label-text"> 幸运色/数字 </text>
              <text class="lucky-value-text">
                {{ fortuneData?.luckyColor || '蓝色' }}/{{ fortuneData?.luckyNumber || 7 }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 历史记录区域 - 带外框效果，访客模式下模糊 -->
      <view
        class="history-container"
        :class="{ 'visitor-blur': isVisitorMode }"
        @click="handleHistoryNavigation"
      >
        <image
          class="history-bg-image"
          src="../../static/pages/fortune/detail-image-1.png"
          mode="scaleToFill"
        />
        <text class="history-text"> 快来查看你的历史记录吧！ </text>
      </view>

      <!-- 商品推荐文字区域 -->
      <view class="recommendation-text-container">
        <!-- 手链标题 -->
        <text class="recommendation-card-title">
          {{ config.texts.recommendation.cardTitle }}
        </text>

        <!-- 手链信息 -->
        <view class="recommendation-bracelet-info">
          <text class="recommendation-bracelet-name">
            {{ config.texts.bracelet.name }}
          </text>
          <text class="recommendation-bracelet-desc">
            {{ config.texts.bracelet.description }}
          </text>
        </view>
      </view>

      <!-- 右下角手链图片 - 大图展示 -->
      <image
        class="bottom-right-bracelet-image"
        src="../../static/pages/fortune/detail-image-2.png"
        mode="aspectFill"
      />

      <!-- 抖音店铺按钮 - 对应Figma node 1:421-422 -->
      <view class="shop-button-wrapper" @click="handleShopClick">
        <view class="shop-button-border-wrapper">
          <image class="shop-icon-img" :src="config.images.shopIcon" mode="aspectFit" />
          <text class="shop-button-text"> 去抖音店铺看看 </text>
        </view>
      </view>
    </view>

    <!-- 详细运势弹窗 -->
    <view v-if="detailModalVisible" class="modal-overlay" @click="hideDetailModal">
      <view class="modal-content detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title"> 详细运势分析 </text>
          <text class="modal-close" @click="hideDetailModal"> ✕ </text>
        </view>

        <view class="modal-body">
          <!-- 今日简要总结 - 不显示标题 -->
          <view v-if="fortuneData?.summary || fortuneData?.comment" class="modal-section">
            <text class="modal-section-content">
              {{ fortuneData?.summary || fortuneData?.comment || '暂无总结' }}
            </text>
          </view>

          <!-- 星盘分析 -->
          <view v-if="fortuneData?.astroAnalysis" class="modal-section">
            <text class="modal-section-title"> 🌟 星盘分析 </text>
            <text class="modal-section-content">
              {{ fortuneData.astroAnalysis }}
            </text>
          </view>

          <!-- 事业运分析 -->
          <view v-if="fortuneData?.careerAnalysis" class="modal-section">
            <text class="modal-section-title"> 💼 事业运分析 </text>
            <text class="modal-section-content">
              {{ fortuneData.careerAnalysis }}
            </text>
          </view>

          <!-- 财富运分析 -->
          <view v-if="fortuneData?.wealthAnalysis" class="modal-section">
            <text class="modal-section-title"> 💰 财富运分析 </text>
            <text class="modal-section-content">
              {{ fortuneData.wealthAnalysis }}
            </text>
          </view>

          <!-- 爱情运分析 -->
          <view v-if="fortuneData?.loveAnalysis" class="modal-section">
            <text class="modal-section-title"> 💕 爱情运分析 </text>
            <text class="modal-section-content">
              {{ fortuneData.loveAnalysis }}
            </text>
          </view>

          <!-- 总结和建议 -->
          <view v-if="fortuneData" class="modal-section">
            <text class="modal-section-title"> 📋 总结和建议 </text>
            <view class="summary-content">
              <!-- 星数显示：标题黄色，数值白色 -->
              <view class="summary-stars-row">
                <text class="summary-stars-label"> 事业运星数: </text>
                <text class="summary-stars-value"> {{ fortuneData.careerStars || 3 }}星 </text>
              </view>
              <view class="summary-stars-row">
                <text class="summary-stars-label"> 财富运星数: </text>
                <text class="summary-stars-value"> {{ fortuneData.wealthStars || 3 }}星 </text>
              </view>
              <view class="summary-stars-row">
                <text class="summary-stars-label"> 爱情运星数: </text>
                <text class="summary-stars-value"> {{ fortuneData.loveStars || 3 }}星 </text>
              </view>

              <text class="summary-subtitle"> 建议事项: </text>
              <text class="summary-text">
                {{ fortuneData.suggestion || '保持积极心态，好运自然来' }}
              </text>

              <text class="summary-subtitle"> 避免事项: </text>
              <text class="summary-text">
                {{ fortuneData.avoidance || '避免冲动决策' }}
              </text>

              <text class="summary-subtitle"> 其他事项: </text>
              <text class="summary-item"> 今日宜: {{ fortuneData.suitable || '合作' }} </text>
              <text class="summary-item"> 今日忌: {{ fortuneData.unsuitable || '争执' }} </text>
              <text class="summary-item"> 今日幸运色: {{ fortuneData.luckyColor || '蓝色' }} </text>
              <text class="summary-item"> 今日幸运数字: {{ fortuneData.luckyNumber || 7 }} </text>
              <text class="summary-item">
                今日运势综合数字: {{ fortuneData.overallScore || 75 }}分
              </text>
            </view>
          </view>

          <!-- 如果没有任何详细分析，显示提示 -->
          <view
            v-if="
              !fortuneData?.astroAnalysis &&
              !fortuneData?.careerAnalysis &&
              !fortuneData?.wealthAnalysis &&
              !fortuneData?.loveAnalysis
            "
            class="modal-section"
          >
            <text
              class="modal-section-content"
              style="text-align: center; color: rgba(255, 255, 255, 0.6)"
            >
              暂无详细运势分析
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 建议和避免弹窗 -->
    <view v-if="adviceModalVisible" class="modal-overlay" @click="hideAdviceModal">
      <view class="modal-content advice-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title"> 今日建议 </text>
          <text class="modal-close" @click="hideAdviceModal"> ✕ </text>
        </view>

        <view class="modal-body">
          <!-- 建议事项 - 不显示标题 -->
          <view class="modal-section">
            <text class="modal-section-content">
              {{ fortuneData?.suggestion || '保持积极心态，好运自然来' }}
            </text>
          </view>

          <!-- 避免事项 - 不显示标题 -->
          <view class="modal-section">
            <text class="modal-section-content">
              {{ fortuneData?.avoidance || '避免冲动决策' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { fortuneService } from '@/api/fortune';
import type { FortuneData } from '@/stores/fortune';
import StarRating from '@/components/StarRating.vue';
import { getTheme, type FortunePageTheme } from './config';

// 页面配置
const config = ref<FortunePageTheme>(getTheme('default'));

// Stores
const authStore = useAuthStore();
const fortuneStore = useFortuneStore();

// 页面状态
const isLoading = ref(false);
const error = ref('');
const isVisitorMode = ref(false);
const isHistoryMode = ref(false);
const historyDate = ref('');
const isPreviewMode = ref(false);
const fromProfile = ref(false); // 标识是否从个人信息页面跳转过来

// 弹窗状态
const detailModalVisible = ref(false);
const adviceModalVisible = ref(false);

// AI重试相关状态
const aiRetryState = ref({
  showRetry: false,
  retryCount: 0,
  maxRetries: 3,
  isRetrying: false,
});

// 加载文案
const loadingText = ref(config.value.texts.loading.fortune);

// 加载消息数组（用于轮播显示）
const loadingMessages = ref([
  '正在连接星象...',
  '正在分析你的运势...',
  '正在计算幸运指数...',
  '正在生成专属建议...',
  '马上就好...',
]);

// 计算属性
const fortuneData = computed(() => fortuneStore.todayFortune);

// 页面生命周期
onLoad((options: Record<string, unknown>) => {
  console.log('运势页面加载', options);

  // 检查是否为访客模式
  if (options?.mode === 'visitor') {
    isVisitorMode.value = true;
  }

  // 检查是否为预览模式
  if (options?.preview === 'true') {
    isPreviewMode.value = true;
    console.log('访客预览模式');
  }

  // 检查是否从个人信息页面跳转过来
  if (options?.fromProfile === 'true') {
    fromProfile.value = true;
  }

  // 检查是否为历史查看模式
  if (options?.date) {
    isHistoryMode.value = true;
    historyDate.value = options.date;
    console.log('历史查看模式，日期:', options.date);
  }

  // 检查登录状态（从个人信息页面跳转过来的情况跳过检查）
  if (!isHistoryMode.value && !isPreviewMode.value && !fromProfile.value) {
    checkAuthStatus();
  }

  // 加载运势数据
  loadFortune();
});

/**
 * 检查认证状态
 */
function checkAuthStatus() {
  if (!isVisitorMode.value && !authStore.isAuthenticated) {
    console.warn('用户未登录，跳转到绑定页面');
    uni.redirectTo({
      url: '/pages/bind/index',
    });
    return;
  }

  if (!isVisitorMode.value && !authStore.isProfileComplete) {
    console.warn('用户信息不完整，跳转到个人信息补全页面');
    uni.redirectTo({
      url: '/pages/profile/index',
    });
    return;
  }
}

/**
 * 加载运势数据
 */
async function loadFortune() {
  try {
    isLoading.value = true;
    error.value = '';

    if (isHistoryMode.value) {
      // 历史查看模式，加载指定日期的运势
      await loadHistoryFortune();
    } else if (isPreviewMode.value) {
      // 访客预览模式，使用登录接口返回的预览数据
      loadPreviewFortune();
      isLoading.value = false;
    } else if (isVisitorMode.value) {
      // 访客模式，显示模拟数据（无需网络请求）
      loadVisitorFortune();
      isLoading.value = false;
    } else {
      // 已认证用户，加载真实数据
      await loadAuthenticatedFortune();
    }
  } catch (err) {
    console.error('加载运势失败:', err);
    error.value = err instanceof Error ? err.message : '加载运势失败，请重试';
    isLoading.value = false;
  }
}

/**
 * 加载访客预览运势（使用登录接口返回的预览数据）
 */
function loadPreviewFortune() {
  try {
    // 从本地存储获取预览数据
    const previewData = uni.getStorageSync('previewData');

    if (previewData && previewData.score && previewData.recommendation) {
      console.log('使用预览数据:', previewData);

      const mockFortune: FortuneData = {
        date: new Date().toISOString().split('T')[0],
        overallScore: previewData.score,
        isAuth: false,
        // 访客版只显示基本信息，详细信息用于模糊显示
        comment: '这是运势预览，购买专属手链获取完整运势解读。',
        careerLuck: Math.floor(Math.random() * 41) + 60,
        wealthLuck: Math.floor(Math.random() * 41) + 60,
        loveLuck: Math.floor(Math.random() * 41) + 60,
        luckyColor: ['红色', '蓝色', '绿色', '金色', '紫色'][Math.floor(Math.random() * 5)],
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        suggestion: '想要获得更准确的运势分析，请购买专属手链。',
        recommendation: previewData.recommendation,
      };

      fortuneStore.setFortune(mockFortune);

      // 清除预览数据（一次性使用）
      uni.removeStorageSync('previewData');
    } else {
      console.warn('未找到预览数据，使用默认访客数据');
      loadVisitorFortune();
    }
  } catch (error) {
    console.error('加载预览数据失败:', error);
    loadVisitorFortune();
  }
}

/**
 * 加载访客运势（模拟数据）
 */
function loadVisitorFortune() {
  // 生成随机分数 (60-85)
  const generateScore = () => Math.floor(Math.random() * 26) + 60;

  // 随机幸运色
  const colors = ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色', '金色'];
  const luckyColor = colors[Math.floor(Math.random() * colors.length)];

  // 随机幸运数字 (1-9)
  const luckyNumber = Math.floor(Math.random() * 9) + 1;

  const mockFortune: FortuneData = {
    date: new Date().toISOString().split('T')[0],
    overallScore: generateScore(),
    isAuth: false,
    // 访客版只显示基本信息，详细信息用于模糊显示
    comment: '今日运势不错，适合尝试新事物。购买专属手链，获取完整运势解读和个性化建议。',
    careerLuck: generateScore(),
    wealthLuck: generateScore(),
    loveLuck: generateScore(),
    luckyColor,
    luckyNumber,
    suggestion: '保持积极心态，好运自然来。想要获得更准确的运势分析，请购买专属手链。',
    recommendation: {
      id: '1',
      name: '紫水晶开运手链',
      description: '提升整体运势，增强直觉力',
      imageUrl: '/static/bracelet-sample.jpg',
      price: 299,
      douyinUrl: 'https://example.com/douyin',
    },
  };

  fortuneStore.setFortune(mockFortune);
}

/**
 * 加载历史运势
 */
async function loadHistoryFortune() {
  try {
    console.log('调用API获取历史运势:', historyDate.value);

    const response = await fortuneService.getFortuneByDate(historyDate.value);

    if (response.success && response.data) {
      console.log('成功获取历史运势:', response.data);
      fortuneStore.setFortune(response.data);

      // 历史模式下根据API返回的isAuth字段更新访客模式状态
      if (response.data.isAuth === false) {
        isVisitorMode.value = true;
        console.log('历史运势API返回isAuth=false，切换到访客模式');
      }
    } else {
      throw new Error(response.message || '获取历史运势失败');
    }
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 加载已认证用户运势
 */
async function loadAuthenticatedFortune() {
  // 检查是否已有今日运势缓存
  if (fortuneStore.hasTodayFortune && fortuneStore.isToday) {
    console.log('使用缓存的今日运势');
    isLoading.value = false;
    return;
  }

  try {
    console.log('调用API获取今日运势');

    // 启动加载动画
    startLoadingAnimation();

    // 调用后端API获取今日运势（移除前端超时，让后端AI处理）
    const response = await fortuneService.getTodayFortune();

    if (response.success && response.data) {
      console.log('成功获取今日运势');
      fortuneStore.setFortune(response.data);

      // 根据API返回的isAuth字段更新访客模式状态
      if (response.data.isAuth === false) {
        isVisitorMode.value = true;
        console.log('API返回isAuth=false，切换到访客模式');
      }
    } else {
      throw new Error(response.message || '获取运势失败');
    }
  } catch (error) {
    console.error('API调用失败:', error);
    handleFortuneError(error);
  } finally {
    stopLoadingAnimation();
    isLoading.value = false;
  }
}

/**
 * 处理运势获取错误
 */
function handleFortuneError(error: unknown) {
  if (
    error?.response?.data?.code === 'AI_FAILED' ||
    (error instanceof Error && error.message.includes('AI生成失败'))
  ) {
    // AI生成失败，显示重试界面
    aiRetryState.value.showRetry = true;
    console.log('AI生成失败，显示重试界面');
  } else {
    // 其他错误，使用降级方案
    loadFallbackFortune();
  }
}

/**
 * 处理AI重试
 */
async function handleAIRetry() {
  if (aiRetryState.value.retryCount >= aiRetryState.value.maxRetries) {
    // 达到最大重试次数，使用降级方案
    handleUseFallback();
    return;
  }

  try {
    aiRetryState.value.retryCount++;
    aiRetryState.value.isRetrying = true;
    aiRetryState.value.showRetry = false;
    isLoading.value = true;

    console.log(`AI重试第${aiRetryState.value.retryCount}次`);

    // 启动加载动画
    startLoadingAnimation();

    // 调用重新生成API
    const response = await fortuneService.regenerateTodayFortune();

    if (response.success && response.data) {
      console.log('AI重试成功:', response.data);
      fortuneStore.setFortune(response.data);

      // 重置重试状态
      aiRetryState.value.showRetry = false;
      aiRetryState.value.retryCount = 0;

      uni.showToast({
        title: '运势分析成功！',
        icon: 'success',
        duration: 2000,
      });
    } else {
      throw new Error(response.message || '重新生成失败');
    }
  } catch (error) {
    console.error('AI重试失败:', error);

    if (aiRetryState.value.retryCount >= aiRetryState.value.maxRetries) {
      // 达到最大重试次数，自动降级
      handleUseFallback();
      uni.showToast({
        title: '已为您提供基础运势',
        icon: 'none',
        duration: 2000,
      });
    } else {
      // 还可以继续重试
      aiRetryState.value.showRetry = true;
      uni.showToast({
        title: `重试失败，还可重试${aiRetryState.value.maxRetries - aiRetryState.value.retryCount}次`,
        icon: 'none',
        duration: 2000,
      });
    }
  } finally {
    stopLoadingAnimation();
    aiRetryState.value.isRetrying = false;
    isLoading.value = false;
  }
}

/**
 * 使用降级方案
 */
function handleUseFallback() {
  aiRetryState.value.showRetry = false;
  loadFallbackFortune();
}

/**
 * 加载降级运势
 */
function loadFallbackFortune() {
  const fallbackFortune: FortuneData = {
    date: new Date().toISOString().split('T')[0],
    overallScore: 78,
    comment: '今日运势平稳向上，适合稳步推进各项计划。保持积极心态，好运自然来。',
    careerLuck: 75,
    wealthLuck: 80,
    loveLuck: 76,
    luckyColor: '蓝色',
    luckyNumber: 7,
    suggestion: '今天适合穿蓝色系服装，数字7将为你带来好运。保持耐心，机会就在前方。',
    recommendation: {
      id: 'fallback',
      name: '智慧运势手链',
      description: '提升洞察力，把握机遇',
      imageUrl: '/static/bracelet-wisdom.jpg',
      price: 299,
      douyinUrl: 'https://example.com/douyin',
    },
  };

  fortuneStore.setFortune(fallbackFortune);

  // 显示友好提示
  uni.showToast({
    title: '已为您提供基础运势分析',
    icon: 'none',
    duration: 3000,
  });
}

/**
 * 启动加载动画
 */
function startLoadingAnimation() {
  let messageIndex = 0;

  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.value.length;
    loadingText.value = loadingMessages.value[messageIndex];
  }, 1500);

  // 保存定时器引用以便清理
  loadingTimer.value = messageInterval;
}

/**
 * 停止加载动画
 */
function stopLoadingAnimation() {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
  loadingText.value = loadingMessages.value[0];
}

// 加载定时器引用
const loadingTimer = ref<number | null>(null);

/**
 * 显示详细运势弹窗
 */
function showDetailModal() {
  detailModalVisible.value = true;
}

/**
 * 隐藏详细运势弹窗
 */
function hideDetailModal() {
  detailModalVisible.value = false;
}

/**
 * 显示建议和避免弹窗
 */
function showAdviceModal() {
  adviceModalVisible.value = true;
}

/**
 * 隐藏建议和避免弹窗
 */
function hideAdviceModal() {
  adviceModalVisible.value = false;
}

/**
 * 处理抖音店铺按钮点击
 */
function handleShopClick() {
  const recommendation = fortuneData.value?.recommendation;
  if (recommendation?.douyinUrl) {
    copyDouyinLink(recommendation.douyinUrl);
  } else {
    uni.showToast({
      title: '暂无店铺链接',
      icon: 'none',
      duration: 2000,
    });
  }
}

/**
 * 复制抖音链接到剪贴板
 */
function copyDouyinLink(url: string) {
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({
        title: '抖音店铺链接已复制，请打开抖音查看',
        icon: 'none',
        duration: 3000,
      });
    },
    fail: () => {
      uni.showToast({
        title: '复制失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    },
  });
}

/**
 * 处理历史导航（查看历史或返回列表）
 */
function handleHistoryNavigation() {
  if (isHistoryMode.value) {
    // 历史模式下，返回历史列表页
    console.log('历史模式，返回上一页');
    uni.navigateBack();
  } else {
    // 正常模式下，跳转到历史页面
    console.log('正常模式，跳转到历史页面');
    uni.navigateTo({
      url: '/pages/history/index',
    });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.fortune-container {
  position: relative;
  height: 100vh; /* 固定高度为一屏 */
  overflow: hidden; /* 禁止滚动 */
}

/* 主背景容器 - 全屏覆盖 */
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
    z-index: 1;
  }

  .bg-stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
}

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
  text-align: center;
}

/* 运势页面特有的加载动画样式 */
.loading-spinner {
  margin-bottom: 30rpx;
}

/* loading-text 和 error-text 样式已移至公共样式文件 */

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

/* 运势内容容器 - 固定高度，使用绝对定位 */
.fortune-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100vh; /* 固定高度为一屏 */
  overflow: hidden; /* 禁止滚动 */
}

/* 运势卡片背景图 - 对应Figma node 1:307-310 */
.card-bg-image {
  position: absolute;
  left: 23rpx; /* 12px * 1.953 */
  top: 420rpx; /* 调整到合适位置 */
  width: 701rpx; /* 359px * 1.953 */
  height: 787rpx; /* 403px * 1.953 */
  z-index: 1;
  opacity: 0.9;
}

/* 数字装饰图 - 位于卡片右上角 */
.card-number-decoration {
  position: absolute;
  right: 40rpx; /* 距离右边缘的距离 */
  top: 430rpx; /* 卡片顶部420rpx + 内边距10rpx */
  width: 240rpx; /* 数字图片宽度，放大2倍：120rpx * 2 */
  height: 240rpx; /* 数字图片高度，放大2倍：120rpx * 2 */
  z-index: 10; /* 在卡片背景之上，但在文字之下 */
  opacity: 0.9;
}

/* 底部装饰图 - 对应Figma node 1:311 */
.bottom-decoration {
  position: absolute;
  left: 16rpx; /* 8px * 1.953 */
  bottom: 20rpx;
  width: 718rpx; /* 367.925px * 1.953 */
  height: 330rpx; /* 168.956px * 1.953 */
  z-index: 2;
}

/* 完整版顶部呼吸动态装饰图 */
.phone-decoration-detail {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 100rpx; /* 下移，让底部嵌入卡片顶部 */
  width: 400rpx;
  height: 400rpx;
  z-index: 3;
  opacity: 0.6;
  animation: breathe 3s ease-in-out infinite;
}

/* 呼吸动画效果 */
@keyframes breathe {
  0%,
  100% {
    opacity: 0.4;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1.05);
  }
}

/* 访客模式顶部锁图标 */
.top-lock-icon {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 60rpx; /* 稍微下移以适应更大的图标 */
  width: 380rpx; /* 放大图标宽度 */
  height: 380rpx; /* 放大图标高度 */
  z-index: 3;
  opacity: 0.4; /* 半透明效果 */
  filter: drop-shadow(0 0 30rpx rgba(255, 255, 255, 0.6)); /* 增强阴影 */
}

/* 内容包装器 */
.content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 10;
}

/* 用户头像 - 对应Figma node 1:325 */
.user-avatar {
  position: absolute;
  left: 86rpx; /* 44px * 1.953 */
  top: 480rpx; /* 246px * 1.953 */
  width: 100rpx; /* 51px * 1.953 */
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  z-index: 11;
}

/* 用户名字 - 对应Figma node 1:326 */
.user-name-text {
  position: absolute;
  left: 200rpx; /* 102px * 1.953 */
  top: 510rpx; /* 261px * 1.953 */
  color: #ffffff;
  font-size: 32rpx; /* 16px * 1.953 */
  font-weight: 600;
  z-index: 11;
}

/* 今日点评标题行 - 包含标题和图标 */
.comment-title-row {
  position: absolute;
  left: 86rpx; /* 44px * 1.953 */
  top: 630rpx; /* 用户名下方，留出更多空间 */
  display: flex;
  align-items: center;
  gap: 10rpx;
  z-index: 11;
}

.comment-title-text {
  color: #ffffff;
  font-size: 28rpx; /* 14px * 1.953 */
  font-weight: 600;
}

.comment-detail-icon {
  width: 32rpx;
  height: 32rpx;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.comment-detail-icon:active {
  transform: scale(1.2);
}

/* 今日点评内容 - 对应Figma node 1:328 */
.comment-content-text {
  position: absolute;
  left: 86rpx; /* 44px * 1.953 */
  top: 680rpx; /* 紧跟标题行 */
  width: 450rpx;
  color: rgba(187, 187, 187, 1);
  font-size: 24rpx; /* 12px * 1.953 */
  line-height: 36rpx;
  z-index: 11;

  /* 文本截断 - 最多显示2行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 72rpx;
}

/* 综合分数标签 - 位于数字装饰图内下方 */
.score-label-text {
  position: absolute;
  right: 42rpx; /* 与数字装饰图右对齐 */
  top: 610rpx; /* 数字装饰图顶部430rpx + 装饰图高度240rpx/2 + 偏移量40rpx */
  color: #d8d1fa;
  font-size: 24rpx; /* 稍微缩小字体 */
  text-align: center;
  z-index: 12; /* 在装饰图之上 */
  width: 240rpx; /* 与装饰图宽度一致 */
}

/* 综合分数数字 - 位于数字装饰图内圆正中央 */
.score-number-text {
  position: absolute;
  right: 42rpx; /* 与数字装饰图右对齐 */
  top: 530rpx; /* 数字装饰图顶部430rpx + 装饰图高度240rpx/2 - 数字高度的一半，使其垂直居中 */
  color: #ffffff;
  font-size: 56rpx; /* 稍微放大以适应更大的装饰图 */
  font-weight: bold;
  font-family: 'ABeeZee', sans-serif;
  text-align: center;
  z-index: 12; /* 在装饰图之上 */
  width: 240rpx; /* 与装饰图宽度一致，确保居中 */
  line-height: 56rpx; /* 与字体大小一致 */
}

/* 三项运势容器 - 根据Figma设计图 */
.luck-sections-container {
  position: absolute;
  left: 50%; /* 改为居中定位 */
  transform: translateX(-50%); /* 水平居中 */
  top: 800rpx; /* 调整到点评内容下方，留出更多空间 */
  display: flex;
  gap: 40rpx; /* 减小间距，从90rpx改为40rpx */
  z-index: 11;
  width: 600rpx; /* 增加宽度，从580rpx改为600rpx */
  justify-content: space-between; /* 均匀分布 */
}

/* 分项运势区域 */
.luck-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  flex: 1; /* 平均分配空间 */
}

.luck-name-text {
  color: #ffffff;
  font-size: 24rpx; /* 12px * 1.953 */
  font-weight: 500;
  margin-bottom: 8rpx;
}

.luck-stars-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 建议和避免区域 - 共用一个透明外框 */
.advice-container {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  top: 930rpx; /* 调整到三项运势下方 */
  width: 580rpx;
  padding: 16rpx 20rpx;
  background: rgba(139, 92, 246, 0.15);
  border: 2rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 16rpx;
  backdrop-filter: blur(10rpx);
  z-index: 11;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  cursor: pointer; /* 添加点击提示 */
}

.advice-item {
  display: flex;
  gap: 12rpx;
  align-items: center; /* 修改为center，确保单行对齐 */
  width: 100%;
  height: 28rpx; /* 限制高度为1行 */
}

.advice-label-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 28rpx; /* 固定行高 */
}

/* 新增：内容包装器，用于控制宽度 */
.advice-content-wrapper {
  flex: 1;
  min-width: 0; /* 关键：允许flex子元素收缩 */
  overflow: hidden;
  height: 28rpx; /* 限制高度为1行 */
}

.advice-content-text {
  display: block;
  color: rgba(187, 187, 187, 1);
  font-size: 20rpx;
  line-height: 28rpx;
  /* 强制单行截断 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 幸运卡片容器 - 水平居中 */
.lucky-cards-container {
  position: absolute;
  left: 86rpx;
  top: 1060rpx; /* 调整到建议区域下方 */
  width: 580rpx;
  display: flex;
  justify-content: center;
  gap: 30rpx;
  z-index: 11;
}

/* 幸运卡片 - 横向三项 */
.lucky-card {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 20rpx;
  padding: 15rpx 10rpx;
  text-align: center;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  width: 150rpx;
  flex-shrink: 0;
}

.lucky-label-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 600;
}

.lucky-value-text {
  color: rgba(255, 255, 255, 0.8); /* 修复颜色，确保可见 */
  font-size: 22rpx;
  font-weight: 400;
  text-align: center;
  word-break: break-all; /* 防止长文本溢出 */
}

/* 历史记录区域 - 带外框效果 */
.history-container {
  position: absolute;
  left: 23rpx;
  top: 1210rpx; /* 稍微上移（卡片底部1207rpx + 间距8rpx） */
  width: 701rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;
  cursor: pointer;
}

.history-bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.history-text {
  position: relative;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 400;
  z-index: 2;
}

/* 商品推荐文字区域 */
.recommendation-text-container {
  position: absolute;
  left: 60rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  z-index: 11;
}

.recommendation-card-title {
  display: block;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 28rpx;
  color: #a78bfa;
  font-weight: 400;
  line-height: 40rpx;
}

.recommendation-bracelet-info {
  .recommendation-bracelet-name {
    display: block;
    font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 400;
    line-height: 40rpx;
    margin-bottom: 2rpx;
  }

  .recommendation-bracelet-desc {
    display: block;
    font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
    font-size: 20rpx;
    color: #bbbbbb;
    font-weight: 400;
    line-height: 28rpx;
  }
}

/* 右下角手链图片 - 大图展示，占据右下角主要空间 */
.bottom-right-bracelet-image {
  position: absolute;
  right: 30rpx;
  bottom: 25rpx;
  width: 320rpx;
  height: 320rpx;
  z-index: 50;
}

/* 抖音店铺按钮 - 对应Figma node 1:421-422 */
.shop-button-wrapper {
  position: absolute;
  left: 40rpx;
  bottom: 50rpx;
  display: flex;
  align-items: center;
  z-index: 11;
}

.shop-button-border-wrapper {
  background: #000000;
  border: 2rpx solid rgba(0, 229, 250, 0.2);
  border-radius: 40rpx;
  padding: 4rpx 16rpx 4rpx 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 30rpx;
  box-shadow:
    0 0 12rpx rgba(0, 229, 250, 0.3),
    inset 0 0 8rpx rgba(0, 229, 250, 0.15);
}

.shop-icon-img {
  width: 60rpx; /* 33.583px * 1.953 */
  height: 60rpx; /* 33.869px * 1.953 */
  flex-shrink: 0;
  z-index: 12;
  margin-top: -20rpx;
  margin-left: -8rpx;
}

.shop-button-text {
  color: #00e5fa;
  font-size: 24rpx; /* 12px * 1.953 */
  font-weight: 400;
  text-shadow: 0 0 8rpx rgba(0, 229, 250, 0.6);
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 100%;
}

/* 运势详情区域 - 作为模糊容器 */
.fortune-details-area {
  position: relative;
  width: 100%;
  height: auto;
}

/* 访客模式模糊效果 - 应用于运势详情区域和历史记录区域 */
.fortune-details-area.visitor-blur,
.history-container.visitor-blur {
  filter: blur(10rpx);
  pointer-events: none;
}

/* AI重试界面样式 */
.ai-retry-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 60rpx 40rpx;
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
  color: #ffffff;
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

/* 重复样式已删除 - 使用上方1014-1059行的定义 */

/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 弹窗内容 */
.modal-content {
  width: 90%;
  max-width: 600rpx; /* 减小最大宽度，确保内容不会太宽 */
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(103, 58, 183, 0.95) 0%, rgba(81, 45, 168, 0.95) 100%);
  border-radius: 30rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  box-sizing: border-box; /* 确保padding计算在宽度内 */
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close:active {
  color: #ffffff;
}

/* 弹窗主体 */
.modal-body {
  padding: 30rpx 40rpx;
  max-height: 60vh;
  box-sizing: border-box;
}

.detail-modal .modal-body {
  /* 使用CSS滚动，滚动条显示在最外层容器右侧 */
  overflow-y: auto;
  overflow-x: hidden;
}

.advice-modal .modal-body {
  overflow: visible;
  max-height: none; /* 建议弹窗不需要滚动 */
}

/* 弹窗章节 */
.modal-section {
  margin-bottom: 30rpx;
  width: 100%; /* 确保章节宽度不超过容器 */
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 15rpx;
  width: 100%; /* 确保标题不超出容器 */
  box-sizing: border-box;
}

.modal-section-content {
  display: block;
  font-size: 26rpx;
  line-height: 40rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: justify;
  width: 100%; /* 确保内容不超出容器 */
  box-sizing: border-box;
  word-wrap: break-word; /* 自动换行 */
  word-break: break-word; /* 改为break-word，更温和的换行方式 */
  overflow-wrap: break-word; /* 兼容性更好的自动换行 */
  white-space: normal; /* 确保允许换行 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 总结和建议部分的特殊样式 */
.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 星数行容器 - 使用flex布局实现换行效果 */
.summary-stars-row {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  width: 100%;
}

/* 星数标题 - 黄色 */
.summary-stars-label {
  display: block;
  font-size: 24rpx;
  color: #ffd700;
  font-weight: 600;
  line-height: 32rpx;
}

/* 星数数值 - 白色 */
.summary-stars-value {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  line-height: 32rpx;
  padding-left: 20rpx; /* 缩进，视觉上与标题区分 */
}

.summary-subtitle {
  display: block;
  font-size: 26rpx;
  color: #ffd700;
  font-weight: 600;
  margin-top: 16rpx;
  margin-bottom: 8rpx;
  line-height: 36rpx;
  word-wrap: break-word;
}

.summary-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 36rpx;
  text-align: justify;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap; /* 保留换行 */
}

.summary-item {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 36rpx;
  word-wrap: break-word;
}
</style>
