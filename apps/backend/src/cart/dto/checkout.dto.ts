import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ example: 'Dhaka, Bangladesh' })
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ example: '01700000000' })
  @IsNotEmpty()
  shippingPhone: string;

  @ApiPropertyOptional({ example: 'COD' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}