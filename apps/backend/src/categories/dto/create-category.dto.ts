import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fashion' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'fashion' })
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'https://example.com/category.png' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  @IsOptional()
  @IsString()
  parentId?: string;
}