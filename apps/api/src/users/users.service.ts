import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { User, UpdateProfileDto } from '@shared/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 根据微信OpenID查找用户
   * @param wechatOpenId 微信OpenID
   * @returns 用户信息或null
   */
  async findByWechatOpenId(wechatOpenId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { wechatOpenId }
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by wechatOpenId: ${wechatOpenId}`, error);
      throw error;
    }
  }

  /**
   * 根据用户ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * 创建新用户
   * @param wechatOpenId 微信OpenID
   * @returns 创建的用户信息
   */
  async create(wechatOpenId: string): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          wechatOpenId,
          name: null,
          birthday: null
        }
      });

      this.logger.log(`Created new user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user with wechatOpenId: ${wechatOpenId}`, error);
      throw error;
    }
  }

  /**
   * 查找或创建用户
   * @param wechatOpenId 微信OpenID
   * @returns 用户信息
   */
  async findOrCreate(wechatOpenId: string): Promise<User> {
    let user = await this.findByWechatOpenId(wechatOpenId);
    
    if (!user) {
      user = await this.create(wechatOpenId);
    }

    return user;
  }



  /**
   * 检查用户资料是否完整
   * @param user 用户信息
   * @returns 资料是否完整
   */
  isProfileComplete(user: User): boolean {
    return !!(user.name && user.birthday);
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });

      this.logger.log(`Deleted user: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error);
      throw error;
    }
  }
}
