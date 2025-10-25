import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  nfcId?: string;
}

export class VerifyNfcDto {
  @IsString()
  @IsNotEmpty()
  nfcId: string;
}
