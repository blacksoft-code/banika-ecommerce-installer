import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Banika Store' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/logo.png' })
  @IsOptional()
  @IsString()
  businessLogo?: string;

  @ApiPropertyOptional({ example: 'contact@banika.com' })
  @IsOptional()
  @IsString()
  businessEmail?: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'A modern online store for everyday needs.' })
  @IsOptional()
  @IsString()
  businessInfo?: string;
}