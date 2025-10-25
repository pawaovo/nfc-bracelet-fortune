import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService as CustomJwtService } from '../common/jwt.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, CustomJwtService],
  exports: [ProfileService],
})
export class ProfileModule {}
