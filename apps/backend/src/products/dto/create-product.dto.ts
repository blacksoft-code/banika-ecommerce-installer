import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'T-Shirt' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 't-shirt' })
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'A comfortable cotton t-shirt.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 599 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 499 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: ['https://example.com/tshirt1.png'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'category-id-here' })
  @IsNotEmpty()
  categoryId: string;
}