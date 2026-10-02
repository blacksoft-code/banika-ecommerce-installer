import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

type OptionalAuthRequest = { user?: { userId: string } };

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private resolveIdentity(
    req: OptionalAuthRequest,
    guestToken: string | undefined,
  ) {
    if (req.user?.userId) {
      return { userId: req.user.userId };
    }
    return { guestToken };
  }

  private attachGuestToken(res: Response, result: any) {
    if (result?.guestToken) {
      res.setHeader('x-guest-token', result.guestToken);
    }
    return result;
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getCart(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    const result = await this.cartService.getCart(identity);
    return this.attachGuestToken(res, result);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('items')
  async addItem(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Body() dto: AddCartItemDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    const result = await this.cartService.addItem(
      identity,
      dto.productId,
      dto.quantity,
    );
    return this.attachGuestToken(res, result);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('items/:productId')
  async updateItem(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    return this.cartService.updateItem(identity, productId, dto.quantity);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('items/:productId')
  async removeItem(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Param('productId') productId: string,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    return this.cartService.removeItem(identity, productId);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  async clearCart(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    return this.cartService.clearCart(identity);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('merge')
  mergeCart(@Req() req: { user: { userId: string } }, @Body() dto: MergeCartDto) {
    return this.cartService.mergeGuestCart(req.user.userId, dto.guestToken);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('coupon')
  applyCoupon(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
    @Body() dto: ApplyCouponDto,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    return this.cartService.applyCoupon(identity, dto.code);
  }

  @ApiHeader({ name: 'x-guest-token', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('coupon')
  removeCoupon(
    @Req() req: OptionalAuthRequest,
    @Headers('x-guest-token') guestToken: string | undefined,
  ) {
    const identity = this.resolveIdentity(req, guestToken);
    return this.cartService.removeCoupon(identity);
  }
}