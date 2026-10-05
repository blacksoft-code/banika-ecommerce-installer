import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGatewayType } from '@prisma/client';

export class CreateGatewayDto {
  @ApiProperty({ enum: PaymentGatewayType, example: 'SSLCOMMERZ' })
  @IsEnum(PaymentGatewayType)
  type: PaymentGatewayType;

  @ApiProperty({
    example: { storeId: 'your_store_id', storePassword: 'your_store_password' },
    description: 'Gateway-specific credentials as key-value pairs',
  })
  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, string>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}