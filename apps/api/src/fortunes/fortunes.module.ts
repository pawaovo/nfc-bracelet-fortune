import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FortunesController } from './fortunes.controller';
import { FortunesService } from './fortunes.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '../common/jwt.service';
import { BraceletsService } from '../bracelets/bracelets.service';
import { AIService } from '../common/ai.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FortunesController],
  providers: [
    FortunesService,
    PrismaService,
    JwtService,
    BraceletsService,
    AIService,
  ],
  exports: [FortunesService],
})
export class FortunesModule {}
