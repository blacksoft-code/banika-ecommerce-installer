import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@banika.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123456' })
  @IsNotEmpty()
  password: string;
}