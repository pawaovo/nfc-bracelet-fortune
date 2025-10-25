import { Module } from '@nestjs/common';
import { FortunesController } from './fortunes.controller';
import { FortunesService } from './fortunes.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '../common/jwt.service';
import { BraceletsService } from '../bracelets/bracelets.service';

@Module({
  controllers: [FortunesController],
  providers: [FortunesService, PrismaService, JwtService, BraceletsService],
  exports: [FortunesService],
})
export class FortunesModule {}
