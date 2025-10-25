import { 
  Controller, 
  Get, 
  UseGuards, 
  Request, 
  Query,
  Param,
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FortunesService } from './fortunes.service';
import type { ApiResponse } from '@shared/types';

@Controller('fortune')
@UseGuards(JwtAuthGuard)
export class FortunesController {
  private readonly logger = new Logger(FortunesController.name);

  constructor(private readonly fortunesService: FortunesService) {}

  /**
   * 获取今日运势
   * @param req 请求对象（包含用户信息）
   * @returns 今日运势数据
   */
  @Get('today')
  async getTodayFortune(@Request() req: any): Promise<ApiResponse<any>> {
    try {
      const userId = req.user.sub;
      this.logger.log(`Getting today's fortune for user ${userId}`);

      const fortune = await this.fortunesService.getTodayFortune(userId);

      return {
        success: true,
        data: fortune,
        message: '获取今日运势成功',
        code: '200'
      };
    } catch (error) {
      this.logger.error(`Failed to get today's fortune: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取今日运势失败',
        code: '500'
      };
    }
  }

  /**
   * 获取历史运势
   * @param req 请求对象
   * @param page 页码
   * @param limit 每页数量
   * @returns 历史运势列表
   */
  @Get('history')
  async getHistoryFortunes(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ): Promise<ApiResponse<any>> {
    try {
      const userId = req.user.sub;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('页码必须是大于0的整数');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('每页数量必须是1-100之间的整数');
      }

      this.logger.log(`Getting fortune history for user ${userId}, page ${pageNum}, limit ${limitNum}`);

      const result = await this.fortunesService.getHistoryFortunes(userId, pageNum, limitNum);

      return {
        success: true,
        data: result,
        message: '获取历史运势成功',
        code: '200'
      };
    } catch (error) {
      this.logger.error(`Failed to get fortune history: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取历史运势失败',
        code: '500'
      };
    }
  }

  /**
   * 获取指定日期的运势
   * @param req 请求对象
   * @param date 日期 (YYYY-MM-DD)
   * @returns 指定日期的运势数据
   */
  @Get('date/:date')
  async getFortuneByDate(
    @Request() req: any,
    @Param('date') date: string
  ): Promise<ApiResponse<any>> {
    try {
      const userId = req.user.sub;

      // 验证日期格式
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('日期格式必须为 YYYY-MM-DD');
      }

      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('无效的日期');
      }

      this.logger.log(`Getting fortune for user ${userId} on date ${date}`);

      const fortune = await this.fortunesService.getFortuneByDate(userId, date);

      return {
        success: true,
        data: fortune,
        message: '获取运势成功',
        code: '200'
      };
    } catch (error) {
      this.logger.error(`Failed to get fortune by date: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取运势失败',
        code: '500'
      };
    }
  }

  /**
   * 获取运势统计信息
   * @param req 请求对象
   * @returns 运势统计数据
   */
  @Get('stats')
  async getFortuneStats(@Request() req: any): Promise<ApiResponse<any>> {
    try {
      const userId = req.user.sub;
      this.logger.log(`Getting fortune stats for user ${userId}`);

      const stats = await this.fortunesService.getFortuneStats(userId);

      return {
        success: true,
        data: stats,
        message: '获取运势统计成功',
        code: '200'
      };
    } catch (error) {
      this.logger.error(`Failed to get fortune stats: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取运势统计失败',
        code: '500'
      };
    }
  }
}
