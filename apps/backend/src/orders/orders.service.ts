import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber() {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${time}${rand}`;
  }

  // ---------------- CREATE ----------------
  async create(userId: string, dto: CreateOrderDto) {
    // একই প্রোডাক্ট দুইবার এলে quantity যোগ করে এক করে নিচ্ছি
    const merged = new Map<string, number>();
    for (const item of dto.items) {
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
    }

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...merged.keys()] }, isActive: true },
      });

      if (products.length !== merged.size) {
        throw new BadRequestException('One or more products are unavailable.');
      }

      let totalAmount = 0;
      const orderItems: { productId: string; quantity: number; price: number }[] = [];

      for (const product of products) {
        const quantity = merged.get(product.id)!;
        const unitPrice = product.discountPrice ?? product.price;
        totalAmount += unitPrice * quantity;
        orderItems.push({ productId: product.id, quantity, price: unitPrice });

        // stock কমানো — শর্তসহ, যাতে দুইজন একসাথে অর্ডার করলে stock মাইনাসে না যায়
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count === 0) {
          throw new BadRequestException(`Not enough stock for "${product.name}".`);
        }
      }

      return tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          totalAmount,
          shippingAddress: dto.shippingAddress,
          shippingPhone: dto.shippingPhone,
          paymentMethod: dto.paymentMethod,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });
    });
  }

  // ---------------- READ ----------------
  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { userId: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    // নিজের অর্ডার ছাড়া অন্যেরটা শুধু ADMIN দেখতে পারবে
    if (user.role !== 'ADMIN' && order.userId !== user.userId) {
      throw new ForbiddenException('You cannot access this order.');
    }
    return order;
  }

  // ---------------- UPDATE STATUS (admin) ----------------
  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found.');
      }
      if (order.status === status) {
        return order;
      }
      if (order.status === 'CANCELLED') {
        throw new BadRequestException('A cancelled order cannot be changed.');
      }

      // Cancel করলে stock ফেরত যাবে
      if (status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });
    });
  }

    // ---------------- CANCEL (customer, own order only) ----------------
  async cancelMyOrder(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found.');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('You cannot cancel this order.');
      }

      if (!['PENDING', 'PROCESSING'].includes(order.status)) {
        throw new BadRequestException(
          `Order cannot be cancelled once it is ${order.status.toLowerCase()}.`,
        );
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });
    });
  }

    // ---------------- Admin Dashboard Analytics ----------------
  async getStats() {
    const [totalOrders, pendingOrders, revenueAgg, statusGroups, lowStockCount] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.aggregate({
          where: { status: { not: 'CANCELLED' } },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.product.count({ where: { stock: { lt: 10 } } }),
      ]);

    const totalRevenue = revenueAgg._sum.totalAmount ?? 0;
    const nonCancelledCount = statusGroups
      .filter((g) => g.status !== 'CANCELLED')
      .reduce((sum, g) => sum + g._count._all, 0);
    const averageOrderValue = nonCancelledCount > 0 ? totalRevenue / nonCancelledCount : 0;

    // শেষ ৭ দিনের revenue — দিনভিত্তিক breakdown
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await this.prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
      select: { totalAmount: true, createdAt: true },
    });

    const revenueByDay: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);
      const total = recentOrders
        .filter((o) => o.createdAt.toISOString().slice(0, 10) === dayKey)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      revenueByDay.push({ date: dayKey, total });
    }

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      averageOrderValue,
      lowStockCount,
      ordersByStatus: statusGroups.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      revenueByDay,
    };
  }
  //last brac
}