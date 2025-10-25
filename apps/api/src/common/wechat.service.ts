import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WeChatSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WeChatService {
  private readonly logger = new Logger(WeChatService.name);
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET') || '';

    if (!this.appId || !this.appSecret) {
      this.logger.warn('WeChat App ID or App Secret not configured');
    }
  }

  /**
   * 通过code获取微信用户session信息
   * @param code 微信登录code
   * @returns 用户session信息
   */
  async code2Session(code: string): Promise<WeChatSession> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    
    try {
      const response = await axios.get(url, {
        params: {
          appid: this.appId,
          secret: this.appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const data = response.data as WeChatSession;
      
      if (data.errcode) {
        this.logger.error(`WeChat code2session error: ${data.errcode} - ${data.errmsg}`);
        throw new Error(`WeChat authentication failed: ${data.errmsg}`);
      }

      if (!data.openid) {
        this.logger.error('WeChat code2session returned no openid');
        throw new Error('Failed to get user openid from WeChat');
      }

      this.logger.log(`Successfully got WeChat session for openid: ${data.openid.substring(0, 8)}...`);
      return data;

    } catch (error) {
      this.logger.error('Failed to call WeChat code2session API', error);
      
      if (axios.isAxiosError(error)) {
        throw new Error(`WeChat API request failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * 验证微信小程序数据签名
   * @param rawData 原始数据
   * @param signature 签名
   * @param sessionKey session key
   * @returns 验证结果
   */
  validateSignature(rawData: string, signature: string, sessionKey: string): boolean {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha1');
    hash.update(rawData + sessionKey);
    const calculatedSignature = hash.digest('hex');
    
    return calculatedSignature === signature;
  }

  /**
   * 解密微信小程序加密数据
   * @param encryptedData 加密数据
   * @param iv 初始向量
   * @param sessionKey session key
   * @returns 解密后的数据
   */
  decryptData(encryptedData: string, iv: string, sessionKey: string): any {
    const crypto = require('crypto');
    
    try {
      const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');
      
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
      decipher.setAutoPadding(true);
      
      let decrypted = decipher.update(encryptedDataBuffer, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Failed to decrypt WeChat data', error);
      throw new Error('Failed to decrypt WeChat data');
    }
  }
}
