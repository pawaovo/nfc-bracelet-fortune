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
  comment?: string;
  careerLuck?: number;
  wealthLuck?: number;
  loveLuck?: number;
  luckyColor?: string;
  luckyNumber?: number;
  suggestion?: string;
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

// AI Response interface
export interface AIFortuneResponse {
  overallScore?: number;
  comment?: string;
  careerLuck?: number;
  wealthLuck?: number;
  loveLuck?: number;
  suggestion?: string;
}

// Common API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
