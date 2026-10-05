import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findActive() {
    const theme = await this.prisma.theme.findFirst({ where: { isActive: true } });
    return theme ? { name: theme.name, config: theme.config } : null;
  }

  async create(dto: CreateThemeDto) {
    const existing = await this.prisma.theme.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('A theme with this name already exists.');
    return this.prisma.theme.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateThemeDto) {
    await this.findOne(id);
    return this.prisma.theme.update({ where: { id }, data: dto as any });
  }

  async findOne(id: string) {
    const theme = await this.prisma.theme.findUnique({ where: { id } });
    if (!theme) throw new NotFoundException('Theme not found.');
    return theme;
  }

  async activate(id: string) {
    const theme = await this.findOne(id);

    await this.prisma.$transaction([
      this.prisma.theme.updateMany({ data: { isActive: false } }),
      this.prisma.theme.update({ where: { id }, data: { isActive: true } }),
      this.prisma.settings.updateMany({ data: { activeTheme: theme.name } }),
    ]);

    return this.findOne(id);
  }

  async remove(id: string) {
    const theme = await this.findOne(id);
    if (theme.isActive) {
      throw new ConflictException('Cannot delete the active theme.');
    }
    return this.prisma.theme.delete({ where: { id } });
  }
}