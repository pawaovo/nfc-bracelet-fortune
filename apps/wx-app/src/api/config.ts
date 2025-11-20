// API 配置文件

// 环境类型
export type EnvType = 'dev' | 'tunnel' | 'prod';

const STORAGE_KEY = 'API_ENV_OVERRIDE';
const ENV_VALUES: EnvType[] = ['dev', 'tunnel', 'prod'];

// API 运行时配置
export const API_CONFIG = {
  // 开发者工具 / 浏览器本地 API 地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 真机调试时使用的局域网地址（请按需修改）
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',
  // 内网穿透地址（cpolar / ngrok 等）
  TUNNEL_BASE_URL: 'https://4473789e.r9.cpolar.cn',
  // 生产环境 API 地址（使用 HTTPS 域名）
  PROD_BASE_URL: 'https://yunshi.autopia.chat',
  // 请求超时时间（120s，兼容 AI 渲染）
  TIMEOUT: 120000,
  // API 版本
  VERSION: 'v1',
};

function normalizeEnv(value?: string | null): EnvType | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return ENV_VALUES.includes(normalized as EnvType) ? (normalized as EnvType) : null;
}

function getEnvFromUrl(): EnvType | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return normalizeEnv(params.get('apiEnv'));
}

function getEnvFromStorage(): EnvType | null {
  try {
    if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') {
      return null;
    }
    return normalizeEnv(uni.getStorageSync(STORAGE_KEY));
  } catch {
    return null;
  }
}

function persistEnv(env: EnvType) {
  try {
    if (typeof uni === 'undefined' || typeof uni.setStorageSync !== 'function') {
      return;
    }
    uni.setStorageSync(STORAGE_KEY, env);
  } catch {
    // ignore storage errors
  }
}

function getEnvFromVite(): EnvType | null {
  try {
    return normalizeEnv(
      (import.meta as Record<string, any>)?.env?.VITE_API_ENV as string | undefined
    );
  } catch {
    return null;
  }
}

function detectCurrentEnv(): EnvType {
  const fromUrl = getEnvFromUrl();
  if (fromUrl) {
    persistEnv(fromUrl);
    console.log('[API] 使用 URL 指定环境:', fromUrl);
    return fromUrl;
  }

  const fromStorage = getEnvFromStorage();
  if (fromStorage) {
    console.log('[API] 使用存储的环境:', fromStorage);
    return fromStorage;
  }

  const fromEnv = getEnvFromVite();
  if (fromEnv) {
    console.log('[API] 使用 VITE_API_ENV:', fromEnv);
    return fromEnv;
  }

  // 根据域名自动检测环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[API] 检测到本地开发环境，使用 dev');
      return 'dev';
    }

    // 生产环境域名
    if (hostname === 'yunshi.autopia.chat') {
      console.log('[API] 检测到生产域名，使用 prod');
      return 'prod';
    }
  }

  // 默认使用内网穿透环境（用于开发调试）
  console.log('[API] 默认使用 tunnel 环境');
  return 'tunnel';
}

let CURRENT_ENV: EnvType = detectCurrentEnv();

export function getCurrentEnv(): EnvType {
  return CURRENT_ENV;
}

export function setCurrentEnv(env: EnvType) {
  CURRENT_ENV = env;
  persistEnv(env);
}

function getDevBaseUrl(): string {
  // H5浏览器环境：优先使用localhost
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[API] H5浏览器开发环境，使用 localhost:', API_CONFIG.DEV_BASE_URL);
      return API_CONFIG.DEV_BASE_URL;
    }
  }

  // 小程序真机环境：使用局域网地址
  try {
    if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
      const systemInfo = uni.getSystemInfoSync();
      const platform = systemInfo.platform;
      if (platform === 'ios' || platform === 'android') {
        console.log('[API] 真机开发模式，使用局域网地址:', API_CONFIG.REAL_DEVICE_BASE_URL);
        return API_CONFIG.REAL_DEVICE_BASE_URL;
      }
    }
  } catch (error) {
    console.warn('获取系统信息失败，使用默认地址:', error);
  }

  console.log('[API] 开发者工具 / 浏览器，使用 localhost:', API_CONFIG.DEV_BASE_URL);
  return API_CONFIG.DEV_BASE_URL;
}

// 获取当前环境的 API 基础地址
export function getBaseURL(): string {
  const env = getCurrentEnv();

  if (env === 'tunnel') {
    console.log('[API] 内网穿透模式:', API_CONFIG.TUNNEL_BASE_URL);
    return API_CONFIG.TUNNEL_BASE_URL;
  }

  if (env === 'prod') {
    console.log('[API] 生产模式:', API_CONFIG.PROD_BASE_URL);
    return API_CONFIG.PROD_BASE_URL;
  }

  return getDevBaseUrl();
}

// 构造最终 API URL
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getBaseURL();
  const version = API_CONFIG.VERSION;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/api/${version}/${cleanEndpoint}`;
}

// HTTP 状态码常量
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
