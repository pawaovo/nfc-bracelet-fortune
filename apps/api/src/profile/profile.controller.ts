import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterWebDto } from './dto/register-web.dto';
import { WebLoginDto } from './dto/web-login.dto';
import type { ApiResponse, UserPartial, JwtRequest } from '@shared/types';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() request: JwtRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse<UserPartial>> {
    try {
      const userId = request.user.sub;
      const updatedUser = await this.profileService.updateProfile(
        userId,
        updateProfileDto,
      );

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      this.logger.error('Profile update failed', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Profile update failed',
        code: 'PROFILE_UPDATE_FAILED',
      };
    }
  }

  @Post('web-login')
  @HttpCode(HttpStatus.OK)
  async loginWeb(
    @Body() webLoginDto: WebLoginDto,
  ): Promise<ApiResponse<UserPartial & { userType: 'bound' }>> {
    try {
      const result = await this.profileService.loginWeb(
        webLoginDto.username,
        webLoginDto.password,
        webLoginDto.name,
        webLoginDto.birthday,
        webLoginDto.nfcId,
      );
      return {
        success: true,
        data: result,
        message: 'Web login success',
      };
    } catch (error) {
      this.logger.error('Web login failed', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Web login failed',
        code: 'WEB_LOGIN_FAILED',
      };
    }
  }

  @Post('web-register')
  @HttpCode(HttpStatus.CREATED)
  async registerWeb(
    @Body() registerWebDto: RegisterWebDto,
  ): Promise<ApiResponse<UserPartial & { userType: 'bound' | 'visitor' }>> {
    try {
      const result = await this.profileService.registerWeb(registerWebDto);
      return {
        success: true,
        data: result,
        message: 'Web register success',
      };
    } catch (error) {
      this.logger.error('Web register failed', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Web register failed',
        code: 'WEB_REGISTER_FAILED',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentProfile(
    @Request() request: JwtRequest,
  ): Promise<ApiResponse<UserPartial>> {
    try {
      const userId = request.user.sub;
      const user = await this.profileService.getCurrentProfile(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        };
      }

      return {
        success: true,
        data: user,
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Get profile failed', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to get profile',
        code: 'GET_PROFILE_FAILED',
      };
    }
  }
}
