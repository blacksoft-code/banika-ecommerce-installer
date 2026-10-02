import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ example: 'product-id-here' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}