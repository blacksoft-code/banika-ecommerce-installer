import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThemeDto {
  @ApiProperty({ example: 'default' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Default' })
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({
    example: { primaryColor: '#14213d', accentColor: '#e8a33d' },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}