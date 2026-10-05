import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new ConflictException('Already in your wishlist.');
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: true },
    });
  }

  async remove(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) {
      throw new NotFoundException('Item not in your wishlist.');
    }
    await this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { message: 'Removed from wishlist.' };
  }

  // Cart-এ "move" করার ফিচার — wishlist থেকে সরিয়ে cart-এ (frontend cart API আলাদাভাবে কল করবে, এটা শুধু wishlist থেকে clear করবে)
  async moveToCart(userId: string, productId: string) {
    return this.remove(userId, productId);
  }
}