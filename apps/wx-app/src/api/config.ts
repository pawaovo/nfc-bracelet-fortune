// API配置文件

// 环境类型
type EnvType = 'dev' | 'tunnel' | 'prod';

// API基础配置
export const API_CONFIG = {
  // 开发环境API地址（开发者工具）
  DEV_BASE_URL: 'http://localhost:3000',
  // 真机调试API地址（⚠️ 修改为你的电脑局域网IP）
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',
  // 内网穿透地址（⚠️ 使用 cpolar 时，修改为生成的 HTTPS 地址）
  TUNNEL_BASE_URL: 'https://720dcf1a.cpolar.io',
  // 生产环境API地址（⚠️ 备案通过后修改为你的域名）
  PROD_BASE_URL: 'https://your-api-domain.com',
  // 请求超时时间（120秒，因为AI生成需要较长时间）
  TIMEOUT: 120000,
  // API版本
  VERSION: 'v1',
};

// 当前环境配置
// ⚠️ 使用 cpolar 测试时，改为 'tunnel'
// ⚠️ 正式上线时，改为 'prod'
const CURRENT_ENV: EnvType = 'tunnel'; // dev | tunnel | prod

// 获取当前环境的API基础URL
export function getBaseURL(): string {
  // 手动指定环境优先
  if (CURRENT_ENV === 'tunnel') {
    console.log('🌐 内网穿透模式:', API_CONFIG.TUNNEL_BASE_URL);
    return API_CONFIG.TUNNEL_BASE_URL;
  }

  if (CURRENT_ENV === 'prod') {
    console.log('🚀 生产环境模式:', API_CONFIG.PROD_BASE_URL);
    return API_CONFIG.PROD_BASE_URL;
  }

  // 开发环境：判断是否为真机调试
  // 真机调试时，使用真机调试地址
  // 开发者工具时，使用localhost
  try {
    // 获取系统信息判断是否为真机
    const systemInfo = uni.getSystemInfoSync();
    const platform = systemInfo.platform;

    // 如果是真机（ios或android），使用真机调试地址
    if (platform === 'ios' || platform === 'android') {
      console.log('🔧 真机调试模式，使用局域网IP:', API_CONFIG.REAL_DEVICE_BASE_URL);
      return API_CONFIG.REAL_DEVICE_BASE_URL;
    }
  } catch (error) {
    console.warn('获取系统信息失败，使用默认地址:', error);
  }

  // 默认使用开发环境地址（开发者工具）
  console.log('🔧 开发者工具模式，使用localhost:', API_CONFIG.DEV_BASE_URL);
  return API_CONFIG.DEV_BASE_URL;
}

// 构建完整的API URL
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getBaseURL();
  const version = API_CONFIG.VERSION;

  // 移除endpoint开头的斜杠（如果有）
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  return `${baseUrl}/api/${version}/${cleanEndpoint}`;
}

// HTTP状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 错误码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_PARAMS: 'INVALID_PARAMS',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
