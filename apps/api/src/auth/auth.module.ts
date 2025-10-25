import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

import { PrismaService } from '../common/prisma.service';
import { WeChatService } from '../common/wechat.service';
import { JwtService as CustomJwtService } from '../common/jwt.service';
import { UsersService } from '../users/users.service';
import { BraceletsService } from '../bracelets/bracelets.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PrismaService,
    WeChatService,
    CustomJwtService,
    UsersService,
    BraceletsService,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
