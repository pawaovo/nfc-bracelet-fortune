import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 32, { message: '�û����붼��4-32���ַ�' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '�������볤�Ȳ���С��6λ' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20, { message: '�ƺ�����Ӧ��1-20���ַ�֮��' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/, {
    message: '�ƺ�ֻ�ܰ������ġ�Ӣ�ġ����ֺͿո�',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString({}, { message: '���ո�ʽ����ȷ����ʹ��YYYY-MM-DD��ʽ' })
  birthday: string;

  @IsOptional()
  @IsString()
  nfcId?: string;
}

export class GetProfileResponseDto {
  @IsString()
  id: string;

  @IsString()
  wechatOpenId: string;

  @IsOptional()
  @IsString()
  username: string | null;

  @IsOptional()
  @IsString()
  name: string | null;

  @IsOptional()
  birthday: Date | null;
}
