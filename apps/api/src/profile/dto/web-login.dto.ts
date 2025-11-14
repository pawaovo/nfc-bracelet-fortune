import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class WebLoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 32, { message: '用户名长度需在1-32个字符之间' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 64, { message: '密码长度至少 6 位' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: '昵称长度应在1-20个字符之间' })
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, {
    message: '昵称只能包含中文、英文、数字和空格',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '生日格式不正确，请使用YYYY-MM-DD格式',
  })
  birthday: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 255, { message: 'NFC ID 长度需大于 4 个字符' })
  nfcId: string;
}
