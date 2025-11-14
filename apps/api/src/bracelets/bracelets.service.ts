import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { Bracelet } from '@shared/types';

@Injectable()
export class BraceletsService {
  private readonly logger = new Logger(BraceletsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 根据NFC ID查找手链
   * @param nfcId NFC ID
   * @returns 手链信息或null
   */
  async findByNfcId(nfcId: string): Promise<Bracelet | null> {
    try {
      const bracelet = await this.prisma.bracelet.findUnique({
        where: { nfcId },
        include: {
          user: true,
        },
      });

      return bracelet;
    } catch (error) {
      this.logger.error(`Failed to find bracelet by nfcId: ${nfcId}`, error);
      throw error;
    }
  }

  /**
   * 根据用户ID查找手链
   * @param userId 用户ID
   * @returns 手链列表
   */
  async findByUserId(userId: string): Promise<Bracelet[]> {
    try {
      const bracelets = await this.prisma.bracelet.findMany({
        where: { userId },
        include: {
          user: true,
        },
      });

      return bracelets;
    } catch (error) {
      this.logger.error(`Failed to find bracelets by userId: ${userId}`, error);
      throw error;
    }
  }

  /**
   * 创建新手链记录
   * @param nfcId NFC ID
   * @param userId 用户ID（可选）
   * @returns 创建的手链信息
   */
  async create(nfcId: string, userId?: string): Promise<Bracelet> {
    try {
      const bracelet = await this.prisma.bracelet.create({
        data: {
          nfcId,
          userId,
          boundAt: userId ? new Date() : null,
        },
        include: {
          user: true,
        },
      });

      this.logger.log(
        `Created new bracelet: ${bracelet.id} with nfcId: ${nfcId}`,
      );
      return bracelet;
    } catch (error) {
      this.logger.error(
        `Failed to create bracelet with nfcId: ${nfcId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 绑定手链到用户
   * @param nfcId NFC ID
   * @param userId 用户ID
   * @returns 更新后的手链信息
   */
  async bindToUser(nfcId: string, userId: string): Promise<Bracelet> {
    try {
      // 检查手链是否存在
      let bracelet = await this.findByNfcId(nfcId);

      if (!bracelet) {
        // 如果手链不存在，创建新的手链记录
        bracelet = await this.create(nfcId, userId);
      } else if (bracelet.userId && bracelet.userId !== userId) {
        // 如果手链已被其他用户绑定，抛出错误
        throw new BadRequestException('该手链已被其他用户绑定');
      } else if (!bracelet.userId) {
        // 如果手链存在但未绑定，更新绑定信息
        bracelet = await this.prisma.bracelet.update({
          where: { nfcId },
          data: {
            userId,
            boundAt: new Date(),
          },
          include: {
            user: true,
          },
        });
      }

      this.logger.log(`Bound bracelet ${nfcId} to user ${userId}`);
      return bracelet;
    } catch (error) {
      this.logger.error(
        `Failed to bind bracelet ${nfcId} to user ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 解绑手链
   * @param nfcId NFC ID
   * @returns 更新后的手链信息
   */
  async unbind(nfcId: string): Promise<Bracelet> {
    try {
      const bracelet = await this.prisma.bracelet.update({
        where: { nfcId },
        data: {
          userId: null,
          boundAt: null,
        },
        include: {
          user: true,
        },
      });

      this.logger.log(`Unbound bracelet: ${nfcId}`);
      return bracelet;
    } catch (error) {
      this.logger.error(`Failed to unbind bracelet: ${nfcId}`, error);
      throw error;
    }
  }

  /**
   * 检查手链是否已绑定
   * @param nfcId NFC ID
   * @returns 是否已绑定
   */
  async isBound(nfcId: string): Promise<boolean> {
    const bracelet = await this.findByNfcId(nfcId);
    return !!(bracelet && bracelet.userId);
  }

  /**
   * 检查手链是否属于指定用户
   * @param nfcId NFC ID
   * @param userId 用户ID
   * @returns 是否属于该用户
   */
  async belongsToUser(nfcId: string, userId: string): Promise<boolean> {
    const bracelet = await this.findByNfcId(nfcId);
    return !!(bracelet && bracelet.userId === userId);
  }

  /**
   * 检查nfcId是否在数据库中存在（真实nfcId）
   * @param nfcId NFC ID
   * @returns 是否存在
   */
  async exists(nfcId: string): Promise<boolean> {
    const bracelet = await this.findByNfcId(nfcId);
    return !!bracelet;
  }

  /**
   * 获取nfcId的绑定状态
   * @param nfcId NFC ID
   * @returns { exists: boolean, isBound: boolean, userId?: string }
   */
  async getBindingStatus(nfcId: string): Promise<{
    exists: boolean;
    isBound: boolean;
    userId?: string;
  }> {
    const bracelet = await this.findByNfcId(nfcId);

    if (!bracelet) {
      return { exists: false, isBound: false };
    }

    return {
      exists: true,
      isBound: !!bracelet.userId,
      userId: bracelet.userId || undefined,
    };
  }

  /**
   * 删除手链记录
   * @param nfcId NFC ID
   * @returns 删除结果
   */
  async delete(nfcId: string): Promise<void> {
    try {
      await this.prisma.bracelet.delete({
        where: { nfcId },
      });

      this.logger.log(`Deleted bracelet: ${nfcId}`);
    } catch (error) {
      this.logger.error(`Failed to delete bracelet: ${nfcId}`, error);
      throw error;
    }
  }
}
