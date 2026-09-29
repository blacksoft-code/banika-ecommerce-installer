import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin User' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@banika.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123456' })
  @MinLength(6)
  password: string;
}