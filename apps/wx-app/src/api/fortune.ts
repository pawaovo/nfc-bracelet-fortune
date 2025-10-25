import { apiRequest } from './request'
import type { ApiResponse } from '@shared/types'
import type { FortuneData } from '@/stores/fortune'

/**
 * Fortune API 服务类
 */
export class FortuneService {
  /**
   * 获取今日运势
   * @returns 今日运势数据
   */
  async getTodayFortune(): Promise<ApiResponse<FortuneData>> {
    return apiRequest.get<FortuneData>('fortune/today')
  }

  /**
   * 获取历史运势
   * @param page 页码
   * @param limit 每页数量
   * @returns 历史运势列表
   */
  async getHistoryFortunes(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    fortunes: FortuneData[]
    total: number
    page: number
    limit: number
  }>> {
    return apiRequest.get(`fortune/history?page=${page}&limit=${limit}`)
  }

  /**
   * 获取指定日期的运势
   * @param date 日期 (YYYY-MM-DD)
   * @returns 指定日期的运势数据
   */
  async getFortuneByDate(date: string): Promise<ApiResponse<FortuneData>> {
    return apiRequest.get<FortuneData>(`fortune/date/${date}`)
  }

  /**
   * 获取运势统计信息
   * @returns 运势统计数据
   */
  async getFortuneStats(): Promise<ApiResponse<{
    totalDays: number
    averageScore: number
    bestScore: number
    worstScore: number
    streakDays: number
  }>> {
    return apiRequest.get('fortune/stats')
  }
}

// 导出单例实例
export const fortuneService = new FortuneService()

/**
 * 辅助函数：格式化运势分数
 * @param score 分数 (0-100)
 * @returns 格式化后的分数字符串
 */
export const formatScore = (score: number): string => {
  return Math.round(score).toString()
}

/**
 * 辅助函数：获取分数对应的颜色
 * @param score 分数 (0-100)
 * @returns 颜色值
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#ff4757'  // 红色 - 极佳
  if (score >= 80) return '#ff6b35'  // 橙红色 - 很好
  if (score >= 70) return '#ffa726'  // 橙色 - 良好
  if (score >= 60) return '#ffeb3b'  // 黄色 - 一般
  if (score >= 50) return '#9e9e9e'  // 灰色 - 较差
  return '#607d8b'  // 蓝灰色 - 不佳
}

/**
 * 辅助函数：获取分数对应的等级文字
 * @param score 分数 (0-100)
 * @returns 等级文字
 */
export const getScoreLevel = (score: number): string => {
  if (score >= 90) return '极佳'
  if (score >= 80) return '很好'
  if (score >= 70) return '良好'
  if (score >= 60) return '一般'
  if (score >= 50) return '较差'
  return '不佳'
}

/**
 * 辅助函数：格式化日期显示
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  return `${year}年${month}月${day}日`
}

/**
 * 辅助函数：检查是否为今天
 * @param date 日期字符串
 * @returns 是否为今天
 */
export const isToday = (date: string): boolean => {
  const today = new Date().toISOString().split('T')[0]
  return date === today
}

/**
 * 辅助函数：获取星期几
 * @param date 日期字符串或Date对象
 * @returns 星期几的中文表示
 */
export const getWeekday = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${weekdays[dateObj.getDay()]}`
}

/**
 * 辅助函数：计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差
 */
export const getDaysDiff = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * 辅助函数：生成随机运势分数（用于访客模式）
 * @returns 随机分数 (60-85)
 */
export const generateRandomScore = (): number => {
  return Math.floor(Math.random() * 26) + 60  // 60-85分
}

/**
 * 辅助函数：生成随机幸运色
 * @returns 随机幸运色
 */
export const generateRandomLuckyColor = (): string => {
  const colors = ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色', '金色', '银色', '白色']
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 辅助函数：生成随机幸运数字
 * @returns 随机幸运数字 (1-9)
 */
export const generateRandomLuckyNumber = (): number => {
  return Math.floor(Math.random() * 9) + 1
}

/**
 * 辅助函数：验证运势数据完整性
 * @param fortune 运势数据
 * @returns 是否完整
 */
export const validateFortuneData = (fortune: any): fortune is FortuneData => {
  return !!(
    fortune &&
    typeof fortune.date === 'string' &&
    typeof fortune.overallScore === 'number' &&
    typeof fortune.comment === 'string' &&
    typeof fortune.careerLuck === 'number' &&
    typeof fortune.wealthLuck === 'number' &&
    typeof fortune.loveLuck === 'number' &&
    typeof fortune.luckyColor === 'string' &&
    typeof fortune.luckyNumber === 'number' &&
    typeof fortune.suggestion === 'string'
  )
}
