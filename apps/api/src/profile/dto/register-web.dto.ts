import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterWebDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 32, { message: '账户名长度需在4-32个字符之间' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 64, { message: '密码长度至少6位' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: '昵称长度需在1-20个字符之间' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, {
    message: '昵称仅支持中英文、数字和空格',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString({}, { message: '生日格式错误，请使用YYYY-MM-DD' })
  birthday: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 255, { message: 'NFC ID 长度需大于4个字符' })
  nfcId: string;
}
