import { apiRequest } from './request'
import type { ApiResponse, UpdateProfileDto, UserPartial } from '@shared/types'

/**
 * Profile API 服务类
 */
export class ProfileService {
  /**
   * 更新用户个人信息
   * @param profileData 用户信息数据
   * @returns 更新后的用户信息
   */
  async updateProfile(profileData: UpdateProfileDto): Promise<ApiResponse<UserPartial>> {
    return apiRequest.put<UserPartial>('profile', profileData)
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentProfile(): Promise<ApiResponse<UserPartial>> {
    return apiRequest.get<UserPartial>('profile')
  }
}

// 导出单例实例
export const profileService = new ProfileService()

/**
 * 辅助函数：验证用户信息是否完整
 * @param user 用户信息
 * @returns 是否完整
 */
export const isProfileComplete = (user: UserPartial | null): boolean => {
  if (!user) return false
  return !!(user.name && user.birthday)
}

/**
 * 辅助函数：格式化生日显示
 * @param birthday 生日字符串 (YYYY-MM-DD)
 * @returns 格式化后的生日字符串
 */
export const formatBirthday = (birthday: string): string => {
  if (!birthday) return ''
  
  try {
    const date = new Date(birthday)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } catch (error) {
    console.error('日期格式化失败:', error)
    return birthday
  }
}

/**
 * 辅助函数：验证生日格式
 * @param birthday 生日字符串
 * @returns 是否为有效格式
 */
export const validateBirthday = (birthday: string): boolean => {
  if (!birthday) return false
  
  // 检查格式 YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(birthday)) return false
  
  // 检查是否为有效日期
  const date = new Date(birthday)
  if (isNaN(date.getTime())) return false
  
  // 检查日期是否在合理范围内（1900年到当前年份）
  const year = date.getFullYear()
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear) return false
  
  return true
}

/**
 * 辅助函数：验证称呼格式
 * @param name 称呼
 * @returns 是否为有效格式
 */
export const validateName = (name: string): boolean => {
  if (!name) return false
  
  const trimmedName = name.trim()
  
  // 检查长度
  if (trimmedName.length < 1 || trimmedName.length > 20) return false
  
  // 检查是否包含特殊字符（可根据需要调整）
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/
  if (!nameRegex.test(trimmedName)) return false
  
  return true
}
