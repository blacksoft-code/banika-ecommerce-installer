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

  //last brac
}