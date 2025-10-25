import { IsString, IsNotEmpty, IsOptional, Length, Matches, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: '称呼长度应在1-20个字符之间' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, { 
    message: '称呼只能包含中文、英文、数字和空格' 
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString({}, { message: '生日格式不正确，请使用YYYY-MM-DD格式' })
  birthday: string;
}

export class GetProfileResponseDto {
  @IsString()
  id: string;

  @IsString()
  wechatOpenId: string;

  @IsOptional()
  @IsString()
  name: string | null;

  @IsOptional()
  birthday: Date | null;
}
