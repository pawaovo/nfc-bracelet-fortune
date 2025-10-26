import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../common/jwt.service';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // 检查是否为开发模式的特殊token
      if (this.isDevMode() && token.startsWith('DEV.')) {
        const payload = await this.verifyDevToken(token);
        request.user = payload;
        return true;
      }

      // 正常的JWT验证
      const payload = this.jwtService.verifyToken(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isDevMode(): boolean {
    return this.configService.get<string>('NODE_ENV') !== 'production';
  }

  private async verifyDevToken(token: string): Promise<any> {
    try {
      // 解析开发模式token: DEV.header.payload
      const parts = token.split('.');
      if (parts.length !== 3 || parts[0] !== 'DEV') {
        throw new Error('Invalid dev token format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[2], 'base64').toString('utf-8'),
      );

      // 检查token是否过期
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Dev token expired');
      }

      // 在开发模式下，根据openid查找真实的用户ID
      if (payload.openid) {
        const user = await this.prisma.user.findUnique({
          where: { wechatOpenId: payload.openid },
        });

        if (user) {
          // 使用真实的用户ID替换payload中的sub
          payload.sub = user.id;
        }
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid dev token');
    }
  }
}
