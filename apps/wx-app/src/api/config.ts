// API配置文件

// API基础配置
export const API_CONFIG = {
  // 开发环境API地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 生产环境API地址  
  PROD_BASE_URL: 'https://your-api-domain.com',
  // 请求超时时间
  TIMEOUT: 10000,
  // API版本
  VERSION: 'v1'
}

// 获取当前环境的API基础URL
export function getBaseURL(): string {
  // 在实际项目中，可以根据环境变量或其他方式判断环境
  // 这里简单使用开发环境地址
  return API_CONFIG.DEV_BASE_URL
}

// 构建完整的API URL
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getBaseURL()
  const version = API_CONFIG.VERSION
  
  // 移除endpoint开头的斜杠（如果有）
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  return `${baseUrl}/api/${version}/${cleanEndpoint}`
}

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 错误码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_PARAMS: 'INVALID_PARAMS',
  SERVER_ERROR: 'SERVER_ERROR'
} as const
