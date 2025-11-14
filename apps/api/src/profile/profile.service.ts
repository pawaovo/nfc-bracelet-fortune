import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterWebDto } from './dto/register-web.dto';
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
        updateProfileDto.username,
        userId,
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
   * 网页版登录验证（场景B：已绑定nfcId的用户登录）
   * @param username 用户名
   * @param password 密码
   * @param name 昵称（可选，用于更新）
   * @param birthday 生日（可选，用于更新）
   * @param nfcId NFC ID
   * @returns 用户信息和token
   */
  async loginWeb(
    username: string,
    password: string,
    name: string,
    birthday: string,
    nfcId: string,
  ): Promise<UserPartial & { userType: 'bound' }> {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedNfcId = nfcId.trim();
    const validatedName = this.validateName(name);
    const validatedBirthday = this.validateBirthday(birthday);

    // 检查nfcId是否真实存在
    const nfcBindingStatus =
      await this.braceletsService.getBindingStatus(trimmedNfcId);

    if (!nfcBindingStatus.exists) {
      throw new BadRequestException('该手链不存在');
    }

    if (!nfcBindingStatus.isBound || !nfcBindingStatus.userId) {
      throw new BadRequestException('该手链未绑定任何用户');
    }

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { username: trimmedUsername },
      select: {
        id: true,
        wechatOpenId: true,
        username: true,
        name: true,
        birthday: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }

    // 验证密码
    if (user.password !== trimmedPassword) {
      throw new BadRequestException('用户名存在，密码错误');
    }

    // 验证该nfcId是否绑定给当前用户
    if (nfcBindingStatus.userId !== user.id) {
      throw new BadRequestException('该手链未绑定此用户');
    }

    // 更新用户信息（昵称和生日）
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedName,
        birthday: validatedBirthday,
      },
      select: {
        id: true,
        wechatOpenId: true,
        username: true,
        name: true,
        birthday: true,
      },
    });

    this.logger.log(
      `Web login success: user ${user.id} with NFC ${trimmedNfcId}, profile updated`,
    );

    return {
      id: updatedUser.id,
      wechatOpenId: updatedUser.wechatOpenId,
      username: updatedUser.username,
      name: updatedUser.name,
      birthday: updatedUser.birthday,
      userType: 'bound',
    };
  }

  async registerWeb(
    dto: RegisterWebDto,
  ): Promise<UserPartial & { userType: 'bound' | 'visitor' }> {
    const username = dto.username.trim();
    const password = dto.password.trim();
    const name = this.validateName(dto.name);
    const birthday = this.validateBirthday(dto.birthday);
    const nfcId = dto.nfcId?.trim();

    // 检查nfcId的真实性
    let isRealNfcId = false;

    if (nfcId) {
      const nfcBindingStatus =
        await this.braceletsService.getBindingStatus(nfcId);
      isRealNfcId = nfcBindingStatus.exists;

      this.logger.log(
        `NFC ID ${nfcId} - exists: ${nfcBindingStatus.exists}, isBound: ${nfcBindingStatus.isBound}`,
      );
    }

    // 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        wechatOpenId: true,
        username: true,
        name: true,
        birthday: true,
        password: true,
      },
    });

    if (!user) {
      // 创建新用户
      const created = await this.prisma.user.create({
        data: {
          wechatOpenId: `web_${username}`,
          username,
          password,
          name,
          birthday,
        },
        select: {
          id: true,
          wechatOpenId: true,
          username: true,
          name: true,
          birthday: true,
        },
      });
      user = { ...created, password };
      this.logger.log(`Created new web user: ${username}`);
    } else {
      // 用户已存在，验证密码
      if (user.password && user.password !== password) {
        throw new BadRequestException('用户名存在，密码错误');
      }

      // 更新用户信息
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password,
          name,
          birthday,
        },
        select: {
          id: true,
          wechatOpenId: true,
          username: true,
          name: true,
          birthday: true,
        },
      });
      user = { ...updated, password };
      this.logger.log(`Updated existing web user: ${username}`);
    }

    // 根据nfcId的真实性决定是否绑定手链
    let userType: 'bound' | 'visitor' = 'visitor';

    if (isRealNfcId && nfcId) {
      // 真实nfcId：绑定到bracelets表
      await this.braceletsService.bindToUser(nfcId, user.id);
      userType = 'bound';
      this.logger.log(`Bound real NFC ${nfcId} to user ${user.id}`);
    } else {
      // 虚假nfcId或无nfcId：不创建bracelets记录
      this.logger.log(`User ${user.id} registered as visitor (no real NFC)`);
    }

    return {
      id: user.id,
      wechatOpenId: user.wechatOpenId,
      username: user.username,
      name: user.name,
      birthday: user.birthday,
      userType,
    };
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
    username: string,
    currentUserId?: string,
  ): Promise<string> {
    const normalizedUsername = username.trim();
    if (!normalizedUsername) {
      throw new BadRequestException('Username is required');
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });

    if (existing && existing.id !== currentUserId) {
      throw new BadRequestException('Username already exists');
    }

    return normalizedUsername;
  }
}
