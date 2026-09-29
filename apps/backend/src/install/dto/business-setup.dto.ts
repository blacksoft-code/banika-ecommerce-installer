import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessSetupDto {
  @ApiProperty({ example: 'Banika Store' })
  @IsNotEmpty()
  businessName: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
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

  @ApiProperty({ example: 'default' })
  @IsNotEmpty()
  activeTheme: string;
}