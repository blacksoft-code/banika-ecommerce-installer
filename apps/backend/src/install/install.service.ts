import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BusinessSetupDto } from './dto/business-setup.dto';

@Injectable()
export class InstallService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------
  // Settings row সবসময় একটাই থাকবে, না থাকলে তৈরি করে দেয়
  // ------------------------------------------
  private async getOrCreateSettings() {
    let settings = await this.prisma.settings.findFirst();
    if (!settings) {
      settings = await this.prisma.settings.create({ data: {} });
    }
    return settings;
  }

  // ------------------------------------------
  // GET /install/status
  // ------------------------------------------
  async getStatus() {
    const settings = await this.getOrCreateSettings();
    return { isInstalled: settings.isInstalled };
  }

  // ------------------------------------------
  // POST /install/admin
  // ------------------------------------------
  async createAdmin(dto: CreateAdminDto) {
    const settings = await this.getOrCreateSettings();
    if (settings.isInstalled) {
      throw new BadRequestException('Application is already installed.');
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (existingAdmin) {
      throw new BadRequestException('Admin account already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Password কখনো response-এ ফেরত পাঠানো ঠিক না, তাই বাদ দিয়ে দিচ্ছি
    const { password, ...result } = admin;
    return result;
  }

  // ------------------------------------------
  // POST /install/business
  // ------------------------------------------
  async setupBusiness(dto: BusinessSetupDto) {
    const settings = await this.getOrCreateSettings();
    if (settings.isInstalled) {
      throw new BadRequestException('Application is already installed.');
    }

    const updated = await this.prisma.settings.update({
      where: { id: settings.id },
      data: {
        businessName: dto.businessName,
        businessLogo: dto.businessLogo,
        businessEmail: dto.businessEmail,
        businessPhone: dto.businessPhone,
        businessInfo: dto.businessInfo,
        activeTheme: dto.activeTheme,
      },
    });

    return updated;
  }

  // ------------------------------------------
  // POST /install/finalize
  // ------------------------------------------
  async finalizeInstall() {
    const settings = await this.getOrCreateSettings();

    if (settings.isInstalled) {
      throw new BadRequestException('Application is already installed.');
    }

    // Admin account তৈরি হয়েছে কিনা নিশ্চিত হও, finalize করার আগে
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!admin) {
      throw new BadRequestException(
        'Cannot finalize: no admin account has been created yet.',
      );
    }

    // Business info সেভ হয়েছে কিনা নিশ্চিত হও
    if (!settings.businessName) {
      throw new BadRequestException(
        'Cannot finalize: business setup is not complete.',
      );
    }

    const updated = await this.prisma.settings.update({
      where: { id: settings.id },
      data: { isInstalled: true },
    });

    return { message: 'Installation completed successfully.', settings: updated };
  }
}