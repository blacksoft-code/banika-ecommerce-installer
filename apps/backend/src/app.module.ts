import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstallModule } from './install/install.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';
import { MediaModule } from './media/media.module';
import { PaymentModule } from './payment/payment.module';
import { ShippingMethodsModule } from './shipping-methods/shipping-methods.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ThemesModule } from './themes/themes.module';

@Module({
  imports: [
    InstallModule, 
    PrismaModule, 
    AuthModule, 
    CategoriesModule, 
    ProductsModule, 
    OrdersModule,
    CartModule,
    CouponsModule,
    MediaModule,
    PaymentModule,
    ShippingMethodsModule,
    WishlistModule,
    ThemesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
