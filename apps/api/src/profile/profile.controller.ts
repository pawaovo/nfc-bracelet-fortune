import {
  Controller,
  Put,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterWebDto } from './dto/register-web.dto';
import type { ApiResponse, UserPartial, JwtRequest } from '@shared/types';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private profileService: ProfileService) {}

  /**
   * 更新用户个人信息
   * @param request 请求对象（包含用户信息）
   * @param updateProfileDto 更新数据
   * @returns 更新后的用户信息
   */
  @Put()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() request: JwtRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse<UserPartial>> {
    try {
      const userId = request.user.sub;

      this.logger.log('Update profile request', {
        userId,
        name: updateProfileDto.name,
        hasBirthday: !!updateProfileDto.birthday,
      });

      const updatedUser = await this.profileService.updateProfile(
        userId,
        updateProfileDto,
      );

      this.logger.log('Profile updated successfully', {
        userId,
        updatedFields: Object.keys(updateProfileDto),
      });

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

  @Post('web-register')
  @HttpCode(HttpStatus.CREATED)
  async registerWeb(
    @Body() registerWebDto: RegisterWebDto,
  ): Promise<ApiResponse<UserPartial>> {
    try {
      const result = await this.profileService.registerWeb(registerWebDto);
      return {
        success: true,
        data: result,
        message: '注册并绑定成功',
      };
    } catch (error) {
      this.logger.error('Web register failed', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '注册失败',
        code: 'WEB_REGISTER_FAILED',
      };
    }
  }

  /**
   * 获取当前用户个人信息
   * @param request 请求对象（包含用户信息）
   * @returns 用户信息
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentProfile(
    @Request() request: JwtRequest,
  ): Promise<ApiResponse<UserPartial>> {
    try {
      const userId = request.user.sub;

      this.logger.log('Get current profile request', { userId });

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
