import { Module } from '@nestjs/common';
import { FortunesController } from './fortunes.controller';
import { FortunesService } from './fortunes.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '../common/jwt.service';

@Module({
  controllers: [FortunesController],
  providers: [FortunesService, PrismaService, JwtService],
  exports: [FortunesService],
})
export class FortunesModule {}
