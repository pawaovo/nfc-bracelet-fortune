import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '@shared/types';

export interface FortuneData {
  date: string;
  overallScore: number;
  isAuth?: boolean;

  // 新版详细运势数据
  summary?: string; // 今日简要总结
  astroAnalysis?: string; // 星盘分析
  careerAnalysis?: string; // 事业运分析
  wealthAnalysis?: string; // 财富运分析
  loveAnalysis?: string; // 爱情运分析

  // 星级评分（支持小数）
  careerStars?: number; // 事业运星数 (0-5)
  wealthStars?: number; // 财富运星数 (0-5)
  loveStars?: number; // 爱情运星数 (0-5)

  // 建议和避免
  suggestion?: string; // 建议事项
  avoidance?: string; // 避免事项

  // 今日宜忌和幸运元素
  suitable?: string; // 今日宜
  unsuitable?: string; // 今日忌
  luckyColor?: string; // 今日幸运色
  luckyNumber?: number; // 今日幸运数字

  // 详细说明（用于弹窗显示）
  suitableDetail?: string; // 今日宜的详细说明
  unsuitableDetail?: string; // 今日喜用的详细说明
  luckyElementDetail?: string; // 幸运元素的详细说明

  // 兼容旧版字段
  comment?: string; // 旧版点评（映射到summary）
  time?: string; // 运势时间，如 "AM 8:30"
  careerLuck?: number; // 旧版事业运分数（0-100）
  wealthLuck?: number; // 旧版财运分数（0-100）
  loveLuck?: number; // 旧版爱情运分数（0-100）

  recommendation?: Product;
}

export const useFortuneStore = defineStore('fortune', () => {
  // 状态
  const todayFortune = ref<FortuneData | null>(null);
  const isLoading = ref(false);
  const error = ref<string>('');
  const lastUpdated = ref<string>('');

  // 计算属性
  const hasTodayFortune = computed(() => !!todayFortune.value);
  const isToday = computed(() => {
    if (!lastUpdated.value) return false;
    const today = new Date().toISOString().split('T')[0];
    return lastUpdated.value === today;
  });

  // 动作
  const setFortune = (fortune: FortuneData) => {
    todayFortune.value = fortune;
    lastUpdated.value = new Date().toISOString().split('T')[0];
    error.value = '';

    // 缓存到本地存储
    uni.setStorageSync('todayFortune', fortune);
    uni.setStorageSync('fortuneLastUpdated', lastUpdated.value);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string) => {
    error.value = errorMessage;
    isLoading.value = false;
  };

  const clearError = () => {
    error.value = '';
  };

  const clearFortune = () => {
    todayFortune.value = null;
    lastUpdated.value = '';
    error.value = '';

    // 清除本地存储
    uni.removeStorageSync('todayFortune');
    uni.removeStorageSync('fortuneLastUpdated');
  };

  const initFromStorage = () => {
    try {
      const storedFortune = uni.getStorageSync('todayFortune');
      const storedLastUpdated = uni.getStorageSync('fortuneLastUpdated');

      if (storedFortune && storedLastUpdated) {
        const today = new Date().toISOString().split('T')[0];

        // 只有当天的运势才从缓存加载
        if (storedLastUpdated === today) {
          todayFortune.value = storedFortune;
          lastUpdated.value = storedLastUpdated;
        } else {
          // 清除过期的缓存
          clearFortune();
        }
      }
    } catch (error) {
      console.error('Failed to init fortune from storage:', error);
    }
  };

  return {
    // 状态
    todayFortune,
    isLoading,
    error,
    lastUpdated,

    // 计算属性
    hasTodayFortune,
    isToday,

    // 动作
    setFortune,
    setLoading,
    setError,
    clearError,
    clearFortune,
    initFromStorage,
  };
});
