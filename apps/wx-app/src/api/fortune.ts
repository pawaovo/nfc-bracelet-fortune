import { apiRequest } from './request';
import type { ApiResponse } from '@shared/types';
import type { FortuneData } from '@/stores/fortune';

/**
 * Fortune API 服务类
 */
export class FortuneService {
  /**
   * 获取今日运势
   * @returns 今日运势数据
   */
  async getTodayFortune(): Promise<ApiResponse<FortuneData>> {
    return apiRequest.get<FortuneData>('fortune/today');
  }

  /**
   * 重新生成今日运势
   * @returns 重新生成的运势数据
   */
  async regenerateTodayFortune(): Promise<ApiResponse<FortuneData>> {
    return apiRequest.post('fortune/today/regenerate');
  }

  /**
   * 获取历史运势
   * @param page 页码
   * @param limit 每页数量
   * @returns 历史运势列表
   */
  async getHistoryFortunes(
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      fortunes: FortuneData[];
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    }>
  > {
    return apiRequest.get(`fortune/history?page=${page}&limit=${limit}`);
  }

  /**
   * 获取指定日期的运势
   * @param date 日期 (YYYY-MM-DD)
   * @returns 指定日期的运势数据
   */
  async getFortuneByDate(date: string): Promise<ApiResponse<FortuneData>> {
    return apiRequest.get<FortuneData>(`fortune/date/${date}`);
  }

  /**
   * 获取运势统计信息
   * @returns 运势统计数据
   */
  async getFortuneStats(): Promise<
    ApiResponse<{
      totalDays: number;
      averageScore: number;
      bestScore: number;
      worstScore: number;
      streakDays: number;
    }>
  > {
    return apiRequest.get('fortune/stats');
  }
}

// 导出单例实例
export const fortuneService = new FortuneService();
