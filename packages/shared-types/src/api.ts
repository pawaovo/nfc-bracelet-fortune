// packages/shared-types/src/api.ts
import { User, UserPartial } from './user';
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

// Common API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
