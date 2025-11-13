import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserPartial } from '@shared/types';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly braceletsService: BraceletsService,
  ) {}

  /**
   * �����û�������Ϣ��������NFC
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserPartial> {
    try {
      this.logger.log(`Updating profile for user ${userId}`, {
        hasNfcId: !!updateProfileDto.nfcId,
      });

      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const birthdayDate = this.validateBirthday(updateProfileDto.birthday);
      const trimmedName = this.validateName(updateProfileDto.name);
      const normalizedUsername = await this.ensureUsernameAvailable(
        userId,
        updateProfileDto.username,
      );

      const updatePayload: Record<string, unknown> = {
        username: normalizedUsername,
        name: trimmedName,
        birthday: birthdayDate,
        updatedAt: new Date(),
      };

      if (updateProfileDto.password) {
        updatePayload.password = updateProfileDto.password.trim();
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updatePayload,
        select: {
          id: true,
          wechatOpenId: true,
          username: true,
          name: true,
          birthday: true,
        },
      });

      if (updateProfileDto.nfcId) {
        this.logger.log(
          `Binding NFC ${updateProfileDto.nfcId} to user ${userId}`,
        );
        await this.braceletsService.bindToUser(updateProfileDto.nfcId, userId);
      }

      return {
        id: updatedUser.id,
        wechatOpenId: updatedUser.wechatOpenId,
        username: updatedUser.username,
        name: updatedUser.name,
        birthday: updatedUser.birthday,
      };
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * ��ȡ�û�������Ϣ
   */
  async getCurrentProfile(userId: string): Promise<UserPartial | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          wechatOpenId: true,
          username: true,
          name: true,
          birthday: true,
        },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        return null;
      }

      return {
        id: user.id,
        wechatOpenId: user.wechatOpenId,
        username: user.username,
        name: user.name,
        birthday: user.birthday,
      };
    } catch (error) {
      this.logger.error(`Failed to get profile for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * �����û���Ϣ�Ƿ�����
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          birthday: true,
          username: true,
          password: true,
        },
      });
      if (!user) {
        return false;
      }

      return !!(user.name && user.birthday && user.username && user.password);
    } catch (error) {
      this.logger.error(
        `Failed to check profile completeness for user ${userId}`,
        error,
      );
      return false;
    }
  }

  /**
   * ��ȡ�û�ͳ����Ϣ
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
        this.prisma.dailyFortune.count({ where: { userId } }),
      ]);

      return {
        profileComplete,
        braceletCount,
        fortuneCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats for user ${userId}`, error);
      throw error;
    }
  }

  private validateBirthday(birthday: string): Date {
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      throw new BadRequestException(
        'Invalid birthday format. Expected YYYY-MM-DD',
      );
    }

    const currentYear = new Date().getFullYear();
    const birthYear = birthdayDate.getFullYear();
    if (birthYear < 1900 || birthYear > currentYear) {
      throw new BadRequestException(
        'Birthday year must be between 1900 and current year',
      );
    }

    return birthdayDate;
  }

  private validateName(name: string): string {
    const trimmedName = name?.trim();
    if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 20) {
      throw new BadRequestException(
        'Name length must be between 1 and 20 characters',
      );
    }
    return trimmedName;
  }

  private async ensureUsernameAvailable(
    userId: string,
    username: string,
  ): Promise<string> {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      throw new BadRequestException('Username is required');
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('Username already exists');
    }

    return normalizedUsername;
  }
}
