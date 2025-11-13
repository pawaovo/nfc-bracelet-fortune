import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  openid: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  constructor(
    private jwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 生成JWT token
   * @param payload token载荷
   * @returns JWT token
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload);
  }

  /**
   * 验证JWT token
   * @param token JWT token
   * @returns 解析后的载荷
   */
  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  /**
   * 解析JWT token（不验证签名）
   * @param token JWT token
   * @returns 解析后的载荷
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * 检查token是否即将过期
   * @param token JWT token
   * @param thresholdMinutes 阈值（分钟）
   * @returns 是否即将过期
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 30): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const threshold = thresholdMinutes * 60;

    return payload.exp - now < threshold;
  }
}
