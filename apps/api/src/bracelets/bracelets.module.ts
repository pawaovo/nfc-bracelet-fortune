import { Module } from '@nestjs/common';
import { BraceletsService } from './bracelets.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [BraceletsService, PrismaService],
  exports: [BraceletsService],
})
export class BraceletsModule {}
