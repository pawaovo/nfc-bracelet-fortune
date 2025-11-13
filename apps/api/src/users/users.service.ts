import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { User } from '@shared/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findByWechatOpenId(wechatOpenId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { wechatOpenId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find user by wechatOpenId: ${wechatOpenId}`,
        error,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${id}`, error);
      throw error;
    }
  }

  async create(wechatOpenId: string): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          wechatOpenId,
          username: null,
          password: null,
          name: null,
          birthday: null,
        },
      });

      this.logger.log(`Created new user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create user with wechatOpenId: ${wechatOpenId}`,
        error,
      );
      throw error;
    }
  }

  async findOrCreate(wechatOpenId: string): Promise<User> {
    let user = await this.findByWechatOpenId(wechatOpenId);

    if (!user) {
      user = await this.create(wechatOpenId);
    }

    return user;
  }

  isProfileComplete(user: User): boolean {
    return !!(user.name && user.birthday && user.username && user.password);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`Deleted user: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error);
      throw error;
    }
  }
}
