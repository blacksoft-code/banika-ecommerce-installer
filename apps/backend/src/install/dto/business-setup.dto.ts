import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BusinessSetupDto {
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @IsString()
  businessLogo?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  businessInfo?: string;

  @IsNotEmpty()
  activeTheme: string;
}