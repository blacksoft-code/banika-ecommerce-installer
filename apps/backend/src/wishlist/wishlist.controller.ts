import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthRequest = { user: { userId: string } };

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.wishlistService.findAll(req.user.userId);
  }

  @Post(':productId')
  add(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.wishlistService.add(req.user.userId, productId);
  }

  @Delete(':productId')
  remove(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.userId, productId);
  }
}