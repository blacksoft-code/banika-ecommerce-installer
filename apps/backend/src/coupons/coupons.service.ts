import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // ---------------- Admin CRUD ----------------
  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException('Coupon code already exists.');
    }
    return this.prisma.coupon.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found.');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  // ---------------- Validate + Compute discount (CartService এখান থেকে কল করবে) ----------------
  async validateAndCompute(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon code.');
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('This coupon is not active yet.');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('This coupon has expired.');
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit.');
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}.`,
      );
    }

    let discount = 0;
    let freeShipping = false;

    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'FREE_SHIPPING') {
      freeShipping = true;
    }

    return { coupon, discount, freeShipping };
  }

  // ---------------- Checkout-এর সময় usage count বাড়ানো (পরে Order conversion-এ কল হবে) ----------------
  incrementUsage(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }
}