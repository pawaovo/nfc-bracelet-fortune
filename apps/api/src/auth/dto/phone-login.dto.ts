import { IsString, IsOptional, Matches, Length } from 'class-validator';

/**
 * 发送验证码请求DTO
 */
export class SendCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

/**
 * 手机号验证码登录请求DTO
 */
export class PhoneLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: '验证码必须是6位数字' })
  code: string;

  @IsOptional()
  @IsString()
  nfcId?: string;
}

/**
 * 发送验证码响应
 */
export class SendCodeResponseDto {
  success: boolean;
  message: string;
}

/**
 * 手机号登录响应
 */
export class PhoneLoginResponseDto {
  userId: string;
  accessToken: string;
  userType: 'new' | 'existing';
  profileComplete: boolean;
}
