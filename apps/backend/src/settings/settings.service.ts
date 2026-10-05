import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreate() {
    let settings = await this.prisma.settings.findFirst();
    if (!settings) {
      settings = await this.prisma.settings.create({ data: {} });
    }
    return settings;
  }

  // Public — storefront header/footer-এ business name/logo দেখানোর জন্য
  async getPublic() {
    const settings = await this.getOrCreate();
    return {
      businessName: settings.businessName,
      businessLogo: settings.businessLogo,
      businessEmail: settings.businessEmail,
      businessPhone: settings.businessPhone,
      businessInfo: settings.businessInfo,
      activeTheme: settings.activeTheme,
    };
  }

  // Admin — সব ফিল্ড (isInstalled সহ) দেখতে পারবে
  async getAdmin() {
    return this.getOrCreate();
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.getOrCreate();
    return this.prisma.settings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}