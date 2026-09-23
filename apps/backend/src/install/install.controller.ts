import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InstallService } from './install.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BusinessSetupDto } from './dto/business-setup.dto';
import { InstallLockGuard } from './guards/install-lock.guard';

@Controller('install')
export class InstallController {
  constructor(private readonly installService: InstallService) {}

  // status route-এ guard লাগবে না, কারণ frontend এটা দিয়েই ঠিক করে installed কিনা
  @Get('status')
  getStatus() {
    return this.installService.getStatus();
  }

  @UseGuards(InstallLockGuard)
  @Post('admin')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.installService.createAdmin(dto);
  }

  @UseGuards(InstallLockGuard)
  @Post('business')
  setupBusiness(@Body() dto: BusinessSetupDto) {
    return this.installService.setupBusiness(dto);
  }

  @UseGuards(InstallLockGuard)
  @Post('finalize')
  finalizeInstall() {
    return this.installService.finalizeInstall();
  }
}