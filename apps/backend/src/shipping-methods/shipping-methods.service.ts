import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingMethodsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({ data: dto });
  }

  // Admin — সব দেখাবে (active + inactive)
  findAllAdmin() {
    return this.prisma.shippingMethod.findMany({ orderBy: { rate: 'asc' } });
  }

  // Public — checkout-এ শুধু active গুলো দেখাবে
  findActive() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { rate: 'asc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Shipping method not found.');
    return method;
  }

  async update(id: string, dto: UpdateShippingMethodDto) {
    await this.findOne(id);
    return this.prisma.shippingMethod.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shippingMethod.delete({ where: { id } });
  }
}