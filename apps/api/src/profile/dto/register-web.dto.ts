import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RegisterWebDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 32, { message: '账户名长度需在1-32个字符之间' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 64, { message: '密码长度至少 6 位' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: '昵称长度应在1-20个字符之间' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, {
    message: '昵称只能包含中文、英文、数字和空格',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString({}, { message: '生日格式不正确，请使用YYYY-MM-DD格式' })
  birthday: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '出生时辰必须是整数' })
  @Min(0, { message: '出生时辰必须在0-23之间' })
  @Max(23, { message: '出生时辰必须在0-23之间' })
  birthHour?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: '出生地长度不能超过255个字符' })
  birthplace?: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'], { message: '性别只能是male或female' })
  gender?: string;

  @IsOptional()
  @IsString()
  @Length(4, 255, { message: 'NFC ID 长度需大于 4 个字符' })
  nfcId?: string;
}
