import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { WeChatService } from '../common/wechat.service';
import { JwtService } from '../common/jwt.service';
import { UsersService } from '../users/users.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import type { LoginRequest, LoginResponse, User } from '@shared/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private wechatService: WeChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private braceletsService: BraceletsService,
  ) {}

  /**
   * 微信登录并处理NFC绑定
   * @param loginRequest 登录请求
   * @returns 登录响应
   */
  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { code, nfcId } = loginRequest;

    try {
      // 1. 通过微信code获取用户信息
      const wechatSession = await this.wechatService.code2Session(code);
      const { openid } = wechatSession;

      this.logger.log(`WeChat login for openid: ${openid.substring(0, 8)}...`);

      // 2. 查找或创建用户
      const user = await this.usersService.findOrCreate(openid);

      // 3. 处理NFC绑定逻辑
      if (nfcId) {
        return await this.handleNFCBinding(user, nfcId);
      }

      // 4. 普通登录（无NFC）
      return await this.handleNormalLogin(user);

    } catch (error) {
      this.logger.error('Login failed', error);
      
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * 处理NFC绑定逻辑
   * @param user 用户信息
   * @param nfcId NFC ID
   * @returns 登录响应
   */
  private async handleNFCBinding(user: User, nfcId: string): Promise<LoginResponse> {
    try {
      // 检查手链是否已存在
      const existingBracelet = await this.braceletsService.findByNfcId(nfcId);

      if (existingBracelet && existingBracelet.userId && existingBracelet.userId !== user.id) {
        // 手链已被其他用户绑定，返回访客预览状态
        this.logger.log(`NFC ${nfcId} belongs to another user, returning visitor preview`);
        
        return {
          status: 'VISITOR_PREVIEW',
          previewScore: this.generateRandomScore(),
          recommendation: await this.getRandomRecommendation()
        };
      }

      // 绑定手链到当前用户
      await this.braceletsService.bindToUser(nfcId, user.id);
      this.logger.log(`Successfully bound NFC ${nfcId} to user ${user.id}`);

      // 生成JWT token
      const token = this.jwtService.generateToken({
        sub: user.id,
        openid: user.wechatOpenId
      });

      // 检查用户资料完整性
      if (!this.usersService.isProfileComplete(user)) {
        return {
          status: 'PROFILE_INCOMPLETE',
          token,
          user: {
            id: user.id,
            wechatOpenId: user.wechatOpenId,
            name: user.name,
            birthday: user.birthday
          }
        };
      }

      return {
        status: 'AUTHENTICATED',
        token,
        user: {
          id: user.id,
          wechatOpenId: user.wechatOpenId,
          name: user.name,
          birthday: user.birthday
        }
      };

    } catch (error) {
      this.logger.error(`NFC binding failed for user ${user.id} and nfcId ${nfcId}`, error);
      throw new BadRequestException('Failed to bind NFC bracelet');
    }
  }

  /**
   * 处理普通登录（无NFC）
   * @param user 用户信息
   * @returns 登录响应
   */
  private async handleNormalLogin(user: User): Promise<LoginResponse> {
    // 生成JWT token
    const token = this.jwtService.generateToken({
      sub: user.id,
      openid: user.wechatOpenId
    });

    // 检查用户资料完整性
    if (!this.usersService.isProfileComplete(user)) {
      return {
        status: 'PROFILE_INCOMPLETE',
        token,
        user: {
          id: user.id,
          wechatOpenId: user.wechatOpenId,
          name: user.name,
          birthday: user.birthday
        }
      };
    }

    return {
      status: 'AUTHENTICATED',
      token,
      user: {
        id: user.id,
        wechatOpenId: user.wechatOpenId,
        name: user.name,
        birthday: user.birthday
      }
    };
  }

  /**
   * 验证NFC访问权限
   * @param userId 用户ID
   * @param nfcId NFC ID
   * @returns 验证结果
   */
  async verifyNFCAccess(userId: string, nfcId: string): Promise<{ status: string }> {
    try {
      const belongsToUser = await this.braceletsService.belongsToUser(nfcId, userId);
      
      if (belongsToUser) {
        return { status: 'AUTHENTICATED' };
      } else {
        return { status: 'VISITOR_PREVIEW' };
      }
    } catch (error) {
      this.logger.error(`NFC access verification failed for user ${userId} and nfcId ${nfcId}`, error);
      throw new BadRequestException('Failed to verify NFC access');
    }
  }

  /**
   * 生成随机运势分数（用于访客预览）
   * @returns 随机分数
   */
  private generateRandomScore(): number {
    return Math.floor(Math.random() * 41) + 60; // 60-100之间的随机数
  }

  /**
   * 获取随机商品推荐
   * @returns 随机商品
   */
  private async getRandomRecommendation(): Promise<any> {
    // 这里应该从数据库获取随机商品，暂时返回模拟数据
    return {
      id: 'sample-product-id',
      name: '开运水晶手链',
      description: '提升整体运势，带来好运',
      imageUrl: '/static/sample-product.jpg',
      douyinLink: 'https://v.douyin.com/sample'
    };
  }
}
