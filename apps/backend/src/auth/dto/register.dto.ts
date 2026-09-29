import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Sinbe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sinbe@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'sinbe123' })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @IsOptional()
  @IsString()
  phone?: string;
}