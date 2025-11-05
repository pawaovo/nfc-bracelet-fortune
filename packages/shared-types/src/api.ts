// packages/shared-types/src/api.ts
import { UserPartial } from './user';
import { DailyFortune, DailyFortuneSummary } from './dailyFortune';
import { Product } from './product';

// Auth API types
export interface LoginRequest {
  code: string;
  nfcId?: string;
}

export interface LoginResponse {
  status: 'AUTHENTICATED' | 'PROFILE_INCOMPLETE' | 'VISITOR_PREVIEW';
  token?: string;
  user?: UserPartial;
  // For VISITOR_PREVIEW status
  previewScore?: number;
  recommendation?: Product;
}

// Fortune API types
export interface FortuneResponse {
  fortune: DailyFortune;
  recommendation: Product;
  isAuth: boolean;
}

export interface HistoryResponse {
  items: DailyFortuneSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Fortune data interface for API responses
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

  // 今日宜、喜用和幸运元素
  suitable?: string; // 今日宜
  unsuitable?: string; // 今日喜用
  luckyColor?: string; // 今日幸运色
  luckyNumber?: number; // 今日幸运数字

  // 兼容旧版字段
  comment?: string; // 旧版点评（映射到summary）
  careerLuck?: number; // 旧版事业运分数（0-100）
  wealthLuck?: number; // 旧版财运分数（0-100）
  loveLuck?: number; // 旧版爱情运分数（0-100）

  recommendation?: Product;
}

// History response with FortuneData
export interface FortuneHistoryResponse {
  fortunes: FortuneData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Fortune stats response
export interface FortuneStatsResponse {
  totalDays: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  streakDays: number;
}

// JWT Request interface
export interface JwtRequest {
  user: {
    sub: string;
    iat?: number;
    exp?: number;
  };
}

// AI Response interface (新版详细运势数据)
export interface AIFortuneResponse {
  // 星盘和运势分析
  astroAnalysis?: string; // 星盘分析
  careerAnalysis?: string; // 事业运分析
  wealthAnalysis?: string; // 财富运分析
  loveAnalysis?: string; // 爱情运分析

  // 星级评分（支持小数，如4.5星）
  careerStars?: number; // 事业运星数 (0-5)
  wealthStars?: number; // 财富运星数 (0-5)
  loveStars?: number; // 爱情运星数 (0-5)

  // 建议和避免
  suggestion?: string; // 建议事项
  avoidance?: string; // 避免事项

  // 今日宜忌和幸运元素
  suitable?: string; // 今日宜 (10字内)
  unsuitable?: string; // 今日忌 (10字内)
  luckyColor?: string; // 今日幸运色
  luckyNumber?: number; // 今日幸运数字

  // 综合评分和总结
  overallScore?: number; // 今日运势综合数字 (0-100)
  summary?: string; // 今日简要总结

  // 兼容旧版字段
  comment?: string; // 旧版点评字段（映射到summary）
  careerLuck?: number; // 旧版事业运（映射到careerStars转换后的分数）
  wealthLuck?: number; // 旧版财运（映射到wealthStars转换后的分数）
  loveLuck?: number; // 旧版爱情运（映射到loveStars转换后的分数）
}

// Common API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
