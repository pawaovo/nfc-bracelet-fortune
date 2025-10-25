// API请求工具
import { buildApiUrl, API_CONFIG, HTTP_STATUS, ERROR_CODES } from './config'
import type { ApiResponse } from '@shared/types'

// 请求选项接口
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  timeout?: number
}

// 请求响应接口
export interface RequestResponse<T = any> {
  data: T
  statusCode: number
  header: Record<string, string>
}

// 创建请求实例
class ApiRequest {
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // 设置默认请求头
  setDefaultHeader(key: string, value: string) {
    this.defaultHeaders[key] = value
  }

  // 移除默认请求头
  removeDefaultHeader(key: string) {
    delete this.defaultHeaders[key]
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.setDefaultHeader('Authorization', `Bearer ${token}`)
  }

  // 清除认证token
  clearAuthToken() {
    this.removeDefaultHeader('Authorization')
  }

  // 发送请求
  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      header = {},
      timeout = API_CONFIG.TIMEOUT
    } = options

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : buildApiUrl(url)

    // 合并请求头
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...header
    }

    console.log(`[API] ${method} ${fullUrl}`, data)

    try {
      const response = await new Promise<RequestResponse<ApiResponse<T>>>((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method,
          data,
          header: mergedHeaders,
          timeout,
          success: (res) => {
            resolve(res as RequestResponse<ApiResponse<T>>)
          },
          fail: (error) => {
            reject(error)
          }
        })
      })

      console.log(`[API] Response:`, response)

      // 检查HTTP状态码
      if (response.statusCode !== HTTP_STATUS.OK) {
        throw new Error(`HTTP ${response.statusCode}: ${this.getStatusMessage(response.statusCode)}`)
      }

      // 返回响应数据
      return response.data

    } catch (error) {
      console.error(`[API] Request failed:`, error)
      
      // 处理不同类型的错误
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('请求超时，请检查网络连接')
        } else if (error.message.includes('network')) {
          throw new Error('网络连接失败，请检查网络设置')
        }
      }
      
      throw error
    }
  }

  // GET请求
  async get<T = any>(url: string, params?: any, header?: Record<string, string>): Promise<ApiResponse<T>> {
    let fullUrl = url
    if (params) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      fullUrl += `?${queryString}`
    }

    return this.request<T>({
      url: fullUrl,
      method: 'GET',
      header
    })
  }

  // POST请求
  async post<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      header
    })
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      header
    })
  }

  // DELETE请求
  async delete<T = any>(url: string, header?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      header
    })
  }

  // 获取状态码对应的消息
  private getStatusMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权访问',
      403: '禁止访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用'
    }
    
    return messages[statusCode] || '未知错误'
  }
}

// 创建默认请求实例
export const apiRequest = new ApiRequest()

// 初始化时设置token（如果存在）
const token = uni.getStorageSync('token')
if (token) {
  apiRequest.setAuthToken(token)
}

export default apiRequest
