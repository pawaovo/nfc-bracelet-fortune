import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, VerifyNfcDto } from './dto/login.dto';
import type { LoginResponse, ApiResponse } from '@shared/types';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  /**
   * 微信登录接口
   * @param loginRequest 登录请求
   * @returns 登录响应
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      this.logger.log('Login request received', { 
        hasCode: !!loginRequest.code,
        hasNfcId: !!loginRequest.nfcId 
      });

      const result = await this.authService.login(loginRequest);
      
      this.logger.log('Login successful', { 
        status: result.status,
        hasToken: !!result.token 
      });

      return {
        success: true,
        data: result,
        message: 'Login successful'
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        code: 'LOGIN_FAILED'
      };
    }
  }

  /**
   * 验证NFC访问权限接口
   * @param request 请求对象（包含用户信息）
   * @param body 请求体
   * @returns 验证结果
   */
  @Post('verify-nfc')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyNFC(
    @Request() request: any,
    @Body() body: VerifyNfcDto
  ): Promise<ApiResponse<{ status: string }>> {
    try {
      const userId = request.user.sub;
      const { nfcId } = body;

      this.logger.log('NFC verification request', { userId, nfcId });

      const result = await this.authService.verifyNFCAccess(userId, nfcId);
      
      this.logger.log('NFC verification successful', { 
        userId, 
        nfcId, 
        status: result.status 
      });

      return {
        success: true,
        data: result,
        message: 'NFC verification successful'
      };
    } catch (error) {
      this.logger.error('NFC verification failed', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'NFC verification failed',
        code: 'NFC_VERIFICATION_FAILED'
      };
    }
  }

  /**
   * 获取当前用户信息接口
   * @param request 请求对象（包含用户信息）
   * @returns 用户信息
   */
  @Post('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() request: any): Promise<ApiResponse<any>> {
    try {
      const userId = request.user.sub;
      
      this.logger.log('Get current user request', { userId });

      // 这里可以调用用户服务获取完整的用户信息
      // const user = await this.usersService.findById(userId);

      return {
        success: true,
        data: request.user,
        message: 'User information retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Get current user failed', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user information',
        code: 'GET_USER_FAILED'
      };
    }
  }

  /**
   * 刷新token接口
   * @param request 请求对象（包含用户信息）
   * @returns 新的token
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() request: any): Promise<ApiResponse<{ token: string }>> {
    try {
      const { sub: userId, openid } = request.user;
      
      this.logger.log('Token refresh request', { userId });

      // 生成新的token
      const token = this.authService['jwtService'].generateToken({
        sub: userId,
        openid
      });

      return {
        success: true,
        data: { token },
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED'
      };
    }
  }

  /**
   * 登出接口
   * @param request 请求对象（包含用户信息）
   * @returns 登出结果
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() request: any): Promise<ApiResponse<void>> {
    try {
      const userId = request.user.sub;
      
      this.logger.log('Logout request', { userId });

      // 这里可以添加token黑名单逻辑
      // 目前只是简单返回成功

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      this.logger.error('Logout failed', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        code: 'LOGOUT_FAILED'
      };
    }
  }
}
