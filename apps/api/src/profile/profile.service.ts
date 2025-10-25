import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserPartial } from '@shared/types';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 更新用户个人信息
   * @param userId 用户ID
   * @param updateProfileDto 更新数据
   * @returns 更新后的用户信息
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserPartial> {
    try {
      this.logger.log(`Updating profile for user ${userId}`, updateProfileDto);

      // 验证用户是否存在
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // 验证生日格式
      let birthdayDate: Date | null = null;
      if (updateProfileDto.birthday) {
        birthdayDate = new Date(updateProfileDto.birthday);
        if (isNaN(birthdayDate.getTime())) {
          throw new BadRequestException('Invalid birthday format. Expected YYYY-MM-DD');
        }

        // 检查生日是否在合理范围内
        const currentYear = new Date().getFullYear();
        const birthYear = birthdayDate.getFullYear();
        if (birthYear < 1900 || birthYear > currentYear) {
          throw new BadRequestException('Birthday year must be between 1900 and current year');
        }
      }

      // 验证称呼
      if (updateProfileDto.name) {
        const trimmedName = updateProfileDto.name.trim();
        if (trimmedName.length < 1 || trimmedName.length > 20) {
          throw new BadRequestException('Name length must be between 1 and 20 characters');
        }
      }

      // 更新用户信息
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateProfileDto.name?.trim(),
          birthday: birthdayDate,
          updatedAt: new Date()
        },
        select: {
          id: true,
          wechatOpenId: true,
          name: true,
          birthday: true
        }
      });

      this.logger.log(`Profile updated successfully for user ${userId}`);

      return {
        id: updatedUser.id,
        wechatOpenId: updatedUser.wechatOpenId,
        name: updatedUser.name,
        birthday: updatedUser.birthday
      };
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * 获取用户个人信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getCurrentProfile(userId: string): Promise<UserPartial | null> {
    try {
      this.logger.log(`Getting profile for user ${userId}`);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          wechatOpenId: true,
          name: true,
          birthday: true
        }
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        return null;
      }

      return {
        id: user.id,
        wechatOpenId: user.wechatOpenId,
        name: user.name,
        birthday: user.birthday
      };
    } catch (error) {
      this.logger.error(`Failed to get profile for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * 检查用户信息是否完整
   * @param userId 用户ID
   * @returns 是否完整
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentProfile(userId);
      if (!user) return false;
      
      return !!(user.name && user.birthday);
    } catch (error) {
      this.logger.error(`Failed to check profile completeness for user ${userId}`, error);
      return false;
    }
  }

  /**
   * 获取用户统计信息
   * @param userId 用户ID
   * @returns 统计信息
   */
  async getUserStats(userId: string): Promise<{
    profileComplete: boolean;
    braceletCount: number;
    fortuneCount: number;
  }> {
    try {
      const [profileComplete, braceletCount, fortuneCount] = await Promise.all([
        this.isProfileComplete(userId),
        this.prisma.bracelet.count({ where: { userId } }),
        this.prisma.dailyFortune.count({ where: { userId } })
      ]);

      return {
        profileComplete,
        braceletCount,
        fortuneCount
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats for user ${userId}`, error);
      throw error;
    }
  }
}
