import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: CouponType, example: 'PERCENTAGE' })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10, description: 'PERCENTAGE হলে %, FIXED হলে টাকা' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}