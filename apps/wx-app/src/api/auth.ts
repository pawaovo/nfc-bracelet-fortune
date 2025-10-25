// 认证相关API服务
import apiRequest from './request'
import type { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse,
  UpdateProfileDto 
} from '@shared/types'

// 认证API服务类
export class AuthService {
  
  /**
   * 微信登录并绑定NFC手链
   * @param code 微信登录code
   * @param nfcId NFC手链ID（可选）
   * @returns 登录响应
   */
  async login(code: string, nfcId?: string): Promise<ApiResponse<LoginResponse>> {
    const requestData: LoginRequest = {
      code,
      nfcId
    }
    
    return apiRequest.post<LoginResponse>('auth/login', requestData)
  }

  /**
   * 验证NFC访问权限
   * @param nfcId NFC手链ID
   * @returns 验证响应
   */
  async verifyNFC(nfcId: string): Promise<ApiResponse<{ status: string }>> {
    return apiRequest.post<{ status: string }>('auth/verify-nfc', { nfcId })
  }

  /**
   * 刷新token
   * @returns 新的token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiRequest.post<{ token: string }>('auth/refresh')
  }

  /**
   * 登出
   * @returns 登出响应
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await apiRequest.post<void>('auth/logout')
    
    // 清除本地存储的token
    uni.removeStorageSync('token')
    apiRequest.clearAuthToken()
    
    return response
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiRequest.get('auth/me')
  }

  /**
   * 更新用户资料
   * @param profileData 用户资料数据
   * @returns 更新响应
   */
  async updateProfile(profileData: UpdateProfileDto): Promise<ApiResponse<any>> {
    return apiRequest.put('auth/profile', profileData)
  }
}

// 创建认证服务实例
export const authService = new AuthService()

// 导出默认实例
export default authService

// 便捷方法：设置认证token
export function setAuthToken(token: string) {
  uni.setStorageSync('token', token)
  apiRequest.setAuthToken(token)
}

// 便捷方法：清除认证token
export function clearAuthToken() {
  uni.removeStorageSync('token')
  apiRequest.clearAuthToken()
}

// 便捷方法：获取当前token
export function getAuthToken(): string | null {
  return uni.getStorageSync('token') || null
}

// 便捷方法：检查是否已登录
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
