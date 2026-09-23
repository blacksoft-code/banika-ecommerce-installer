import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InstallLockGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const settings = await this.prisma.settings.findFirst();

    if (settings?.isInstalled) {
      throw new ForbiddenException(
        'Installation is already complete. This route is locked.',
      );
    }

    return true;
  }
}