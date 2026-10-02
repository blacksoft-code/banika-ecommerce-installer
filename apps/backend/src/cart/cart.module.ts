import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { AuthModule } from '../auth/auth.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    AuthModule,
    CouponsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}