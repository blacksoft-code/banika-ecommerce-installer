import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergeCartDto {
  @ApiProperty({ example: 'guest-token-from-frontend-storage' })
  @IsNotEmpty()
  guestToken: string;
}