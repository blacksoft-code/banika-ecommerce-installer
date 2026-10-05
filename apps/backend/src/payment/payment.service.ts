import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  // ---------------- Admin: CRUD ----------------
  async create(dto: CreateGatewayDto) {
    const encrypted = this.encryption.encrypt(JSON.stringify(dto.credentials));

    if (dto.isActive) {
      // নতুন একটা active করলে বাকি সব গেটওয়ে automatically inactive হবে
      await this.prisma.paymentGateway.updateMany({ data: { isActive: false } });
    }

    const gateway = await this.prisma.paymentGateway.create({
      data: {
        type: dto.type,
        credentials: encrypted,
        isActive: dto.isActive ?? false,
      },
    });

    return this.toSafeResponse(gateway);
  }

  async findAll() {
    const gateways = await this.prisma.paymentGateway.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return gateways.map((g) => this.toSafeResponse(g));
  }

  async findOne(id: string) {
    const gateway = await this.prisma.paymentGateway.findUnique({ where: { id } });
    if (!gateway) throw new NotFoundException('Payment gateway not found.');
    return this.toSafeResponse(gateway);
  }

  async update(id: string, dto: UpdateGatewayDto) {
    await this.findOne(id);

    if (dto.isActive) {
      await this.prisma.paymentGateway.updateMany({ data: { isActive: false } });
    }

    const data: Record<string, unknown> = {};
    if (dto.type) data.type = dto.type;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.credentials) {
      data.credentials = this.encryption.encrypt(JSON.stringify(dto.credentials));
    }

    const gateway = await this.prisma.paymentGateway.update({ where: { id }, data });
    return this.toSafeResponse(gateway);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.paymentGateway.delete({ where: { id } });
    return { message: 'Payment gateway removed.' };
  }

  // ---------------- Internal: checkout-এর সময় decrypt করা credential লাগবে ----------------
  async getActiveGatewayCredentials() {
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: { isActive: true },
    });
    if (!gateway) return null;
    return {
      type: gateway.type,
      credentials: JSON.parse(this.encryption.decrypt(gateway.credentials)),
    };
  }

  // ---------------- কখনোই raw credential response-এ পাঠানো যাবে না ----------------
  private toSafeResponse(gateway: {
    id: string;
    type: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: gateway.id,
      type: gateway.type,
      isActive: gateway.isActive,
      createdAt: gateway.createdAt,
      updatedAt: gateway.updatedAt,
      // credentials ইচ্ছাকৃতভাবে বাদ
    };
  }
}