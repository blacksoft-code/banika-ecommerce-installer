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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
