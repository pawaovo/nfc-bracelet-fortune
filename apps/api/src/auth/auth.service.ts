import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { WeChatService } from '../common/wechat.service';
import { JwtService } from '../common/jwt.service';
import { UsersService } from '../users/users.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import { PrismaService } from '../common/prisma.service';
import { FortunesService } from '../fortunes/fortunes.service';
import { SmsService } from '../common/sms/sms.service';
import type { LoginRequest, LoginResponse, User } from '@shared/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private wechatService: WeChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private braceletsService: BraceletsService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => FortunesService))
    private fortunesService: FortunesService,
    private smsService: SmsService,
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

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
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
  private async handleNFCBinding(
    user: User,
    nfcId: string,
  ): Promise<LoginResponse> {
    try {
      // 检查手链是否已存在
      const existingBracelet = await this.braceletsService.findByNfcId(nfcId);

      if (
        existingBracelet &&
        existingBracelet.userId &&
        existingBracelet.userId !== user.id
      ) {
        // 手链已被其他用户绑定，返回访客预览状态
        this.logger.log(
          `NFC ${nfcId} belongs to another user ${existingBracelet.userId}, current user ${user.id}, returning visitor preview`,
        );

        return {
          status: 'VISITOR_PREVIEW',
          previewScore: this.generateRandomScore(),
          recommendation: await this.getRandomRecommendation(),
        };
      }

      // 如果手链已绑定给当前用户，跳过绑定步骤
      if (existingBracelet && existingBracelet.userId === user.id) {
        this.logger.log(
          `NFC ${nfcId} already bound to current user ${user.id}`,
        );
      } else {
        // 绑定手链到当前用户
        await this.braceletsService.bindToUser(nfcId, user.id);
        this.logger.log(`Successfully bound NFC ${nfcId} to user ${user.id}`);
      }

      // 生成JWT token
      const token = this.jwtService.generateToken({
        sub: user.id,
        openid: user.wechatOpenId,
      });

      // 检查用户资料完整性
      if (!this.usersService.isProfileComplete(user)) {
        return {
          status: 'PROFILE_INCOMPLETE',
          token,
          user: {
            id: user.id,
            wechatOpenId: user.wechatOpenId,
            username: user.username ?? null,
            name: user.name,
            birthday: user.birthday,
          },
        };
      }

      return {
        status: 'AUTHENTICATED',
        token,
        user: {
          id: user.id,
          wechatOpenId: user.wechatOpenId,
          username: user.username ?? null,
          name: user.name,
          birthday: user.birthday,
        },
      };
    } catch (error) {
      this.logger.error(
        `NFC binding failed for user ${user.id} and nfcId ${nfcId}`,
        error,
      );
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
      openid: user.wechatOpenId,
    });

    // 检查用户资料完整性
    if (!this.usersService.isProfileComplete(user)) {
      return {
        status: 'PROFILE_INCOMPLETE',
        token,
        user: {
          id: user.id,
          wechatOpenId: user.wechatOpenId,
          username: user.username ?? null,
          name: user.name,
          birthday: user.birthday,
        },
      };
    }

    return {
      status: 'AUTHENTICATED',
      token,
      user: {
        id: user.id,
        wechatOpenId: user.wechatOpenId,
        username: user.username ?? null,
        name: user.name,
        birthday: user.birthday,
      },
    };
  }

  /**
   * 验证NFC访问权限
   * 对于已认证用户：如果手链未绑定，自动绑定到该用户
   * @param userId 用户ID
   * @param nfcId NFC ID
   * @returns 验证结果
   */
  async verifyNFCAccess(
    userId: string,
    nfcId: string,
  ): Promise<{ status: string }> {
    try {
      // 一次查询获取手链信息，避免重复数据库调用
      const existingBracelet = await this.braceletsService.findByNfcId(nfcId);

      if (existingBracelet && existingBracelet.userId) {
        if (existingBracelet.userId === userId) {
          // 手链已属于当前用户
          this.logger.log(`NFC ${nfcId} already belongs to user ${userId}`);
          return { status: 'OWNER' };
        } else {
          // 手链已被其他用户绑定，返回访客状态
          this.logger.log(
            `NFC ${nfcId} belongs to another user ${existingBracelet.userId}, current user ${userId}`,
          );
          return { status: 'VISITOR' };
        }
      }

      // 手链未绑定或不存在，自动绑定到当前用户
      this.logger.log(`NFC ${nfcId} is unbound, binding to user ${userId}`);
      await this.braceletsService.bindToUser(nfcId, userId);
      this.logger.log(`Successfully bound NFC ${nfcId} to user ${userId}`);

      return { status: 'OWNER' };
    } catch (error) {
      this.logger.error(
        `NFC access verification failed for user ${userId} and nfcId ${nfcId}`,
        error,
      );
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
   * 获取随机商品推荐（复用 FortunesService 的方法，避免重复代码）
   * @returns 随机商品
   */
  private async getRandomRecommendation(): Promise<any> {
    return await this.fortunesService.getRandomRecommendation();
  }

  /**
   * 发送手机验证码
   * @param phone 手机号
   * @returns 发送结果
   */
  async sendVerificationCode(
    phone: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `发送验证码请求: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
    );
    return await this.smsService.sendCode(phone);
  }

  /**
   * 手机号验证码登录
   * @param phone 手机号
   * @param code 验证码
   * @param nfcId NFC ID（可选）
   * @returns 登录响应
   */
  async phoneLogin(
    phone: string,
    code: string,
    nfcId?: string,
  ): Promise<{
    userId: string;
    accessToken: string;
    userType: 'new' | 'existing';
    profileComplete: boolean;
  }> {
    // 1. 验证验证码
    const isValid = this.smsService.verifyCode(phone, code);
    if (!isValid) {
      throw new BadRequestException('验证码错误或已过期');
    }

    this.logger.log(
      `验证码验证成功: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
    );

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    let userType: 'new' | 'existing' = 'existing';

    if (!user) {
      // 创建新用户
      user = await this.prisma.user.create({
        data: {
          phone,
          wechatOpenId: `phone_${phone}`, // 兼容字段
        },
      });
      userType = 'new';
      this.logger.log(
        `创建新用户: ${user.id}, 手机号: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
      );
    } else {
      this.logger.log(
        `用户已存在: ${user.id}, 手机号: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
      );
    }

    // 3. 处理NFC绑定（如果提供了nfcId）
    if (nfcId) {
      try {
        const existingBracelet = await this.braceletsService.findByNfcId(nfcId);

        // 只有当手链未绑定或已绑定给当前用户时才处理
        if (!existingBracelet || !existingBracelet.userId) {
          await this.braceletsService.bindToUser(nfcId, user.id);
          this.logger.log(`绑定NFC ${nfcId} 到用户 ${user.id}`);
        } else if (existingBracelet.userId === user.id) {
          this.logger.log(`NFC ${nfcId} 已绑定到当前用户`);
        } else {
          this.logger.warn(`NFC ${nfcId} 已被其他用户绑定`);
        }
      } catch (error) {
        this.logger.error(
          `NFC绑定失败: ${error instanceof Error ? error.message : String(error)}`,
        );
        // 不阻断登录流程
      }
    }

    // 4. 生成JWT token
    const accessToken = this.jwtService.generateToken({
      sub: user.id,
      openid: user.wechatOpenId,
    });

    // 5. 检查用户资料完整性
    const profileComplete = !!(user.name && user.birthday);

    return {
      userId: user.id,
      accessToken,
      userType,
      profileComplete,
    };
  }
}
