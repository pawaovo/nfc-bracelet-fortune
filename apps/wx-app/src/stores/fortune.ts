import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DailyFortune, Product } from '@shared/types'

export interface FortuneData {
  date: string
  overallScore: number
  comment: string
  careerLuck: number
  wealthLuck: number
  loveLuck: number
  luckyColor: string
  luckyNumber: number
  suggestion: string
  recommendation?: Product
}

export const useFortuneStore = defineStore('fortune', () => {
  // 状态
  const todayFortune = ref<FortuneData | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const lastUpdated = ref<string>('')

  // 计算属性
  const hasTodayFortune = computed(() => !!todayFortune.value)
  const isToday = computed(() => {
    if (!lastUpdated.value) return false
    const today = new Date().toISOString().split('T')[0]
    return lastUpdated.value === today
  })

  // 动作
  const setFortune = (fortune: FortuneData) => {
    todayFortune.value = fortune
    lastUpdated.value = new Date().toISOString().split('T')[0]
    error.value = ''
    
    // 缓存到本地存储
    uni.setStorageSync('todayFortune', fortune)
    uni.setStorageSync('fortuneLastUpdated', lastUpdated.value)
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    isLoading.value = false
  }

  const clearError = () => {
    error.value = ''
  }

  const clearFortune = () => {
    todayFortune.value = null
    lastUpdated.value = ''
    error.value = ''
    
    // 清除本地存储
    uni.removeStorageSync('todayFortune')
    uni.removeStorageSync('fortuneLastUpdated')
  }

  const initFromStorage = () => {
    try {
      const storedFortune = uni.getStorageSync('todayFortune')
      const storedLastUpdated = uni.getStorageSync('fortuneLastUpdated')
      
      if (storedFortune && storedLastUpdated) {
        const today = new Date().toISOString().split('T')[0]
        
        // 只有当天的运势才从缓存加载
        if (storedLastUpdated === today) {
          todayFortune.value = storedFortune
          lastUpdated.value = storedLastUpdated
        } else {
          // 清除过期的缓存
          clearFortune()
        }
      }
    } catch (error) {
      console.error('Failed to init fortune from storage:', error)
    }
  }



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

  }
})
