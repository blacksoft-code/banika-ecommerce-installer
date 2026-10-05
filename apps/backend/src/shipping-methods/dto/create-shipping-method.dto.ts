import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingMethodDto {
  @ApiProperty({ example: 'Inside Dhaka' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '2-3 business days' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}