import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';

// 验证码缓存结构
interface CodeCache {
  code: string;
  expireAt: number;
  sendAt: number;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly codeCache = new Map<string, CodeCache>();
  private readonly smsClient: InstanceType<
    typeof tencentcloud.sms.v20210111.Client
  >;

  // 验证码有效期（毫秒）- 5分钟
  private readonly CODE_EXPIRE_TIME = 5 * 60 * 1000;
  // 发送间隔（毫秒）- 60秒
  private readonly SEND_INTERVAL = 60 * 1000;

  constructor(private readonly configService: ConfigService) {
    const SmsClient = tencentcloud.sms.v20210111.Client;

    const clientConfig = {
      credential: {
        secretId: this.configService.get<string>('TENCENT_SMS_SECRET_ID'),
        secretKey: this.configService.get<string>('TENCENT_SMS_SECRET_KEY'),
      },
      region: 'ap-guangzhou',
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    };

    this.smsClient = new SmsClient(clientConfig);
    this.logger.log('腾讯云短信服务初始化完成');
  }

  /**
   * 生成6位数字验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码
   * @param phone 手机号
   * @returns 是否发送成功
   */
  async sendCode(
    phone: string,
  ): Promise<{ success: boolean; message: string }> {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    // 检查发送频率
    const cached = this.codeCache.get(phone);
    if (cached) {
      const timeSinceSend = Date.now() - cached.sendAt;
      if (timeSinceSend < this.SEND_INTERVAL) {
        const remainingSeconds = Math.ceil(
          (this.SEND_INTERVAL - timeSinceSend) / 1000,
        );
        throw new BadRequestException(`请${remainingSeconds}秒后再试`);
      }
    }

    // 生成验证码
    const code = this.generateCode();

    try {
      // 调用腾讯云短信API
      const params = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId:
          this.configService.get<string>('TENCENT_SMS_SDK_APP_ID') || '',
        SignName: this.configService.get<string>('TENCENT_SMS_SIGN_NAME') || '',
        TemplateId:
          this.configService.get<string>('TENCENT_SMS_TEMPLATE_ID') || '',
        TemplateParamSet: [code],
      };

      this.logger.log(
        `发送验证码到 ${phone.slice(0, 3)}****${phone.slice(-4)}`,
      );

      const response = await this.smsClient.SendSms(params);

      // 检查发送结果
      const sendStatus = response.SendStatusSet?.[0];
      if (sendStatus?.Code !== 'Ok') {
        this.logger.error(`短信发送失败: ${sendStatus?.Message}`);
        throw new BadRequestException(
          `短信发送失败: ${sendStatus?.Message || '未知错误'}`,
        );
      }

      // 缓存验证码
      this.codeCache.set(phone, {
        code,
        expireAt: Date.now() + this.CODE_EXPIRE_TIME,
        sendAt: Date.now(),
      });

      this.logger.log(
        `验证码发送成功: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
      );

      return { success: true, message: '验证码发送成功' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`短信发送异常: ${errorMessage}`, errorStack);
      throw new BadRequestException('短信发送失败，请稍后重试');
    }
  }

  /**
   * 验证验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否验证成功
   */
  verifyCode(phone: string, code: string): boolean {
    const cached = this.codeCache.get(phone);

    if (!cached) {
      this.logger.warn(`验证码不存在: ${phone}`);
      return false;
    }

    // 检查是否过期
    if (Date.now() > cached.expireAt) {
      this.logger.warn(`验证码已过期: ${phone}`);
      this.codeCache.delete(phone);
      return false;
    }

    // 验证码匹配
    if (cached.code !== code) {
      this.logger.warn(`验证码错误: ${phone}`);
      return false;
    }

    // 验证成功，删除缓存
    this.codeCache.delete(phone);
    this.logger.log(
      `验证码验证成功: ${phone.slice(0, 3)}****${phone.slice(-4)}`,
    );

    return true;
  }
}
