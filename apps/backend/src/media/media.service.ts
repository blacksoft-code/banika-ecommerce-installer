import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async saveRecord(file: Express.Multer.File) {
    const url = `/uploads/${file.filename}`;
    return this.prisma.media.create({
      data: {
        url,
        fileName: file.originalname,
        fileType: file.mimetype,
      },
    });
  }

  findAll() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }
}