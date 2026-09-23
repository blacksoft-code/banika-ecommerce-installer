import { Test, TestingModule } from '@nestjs/testing';
import { InstallService } from './install.service';

describe('InstallService', () => {
  let service: InstallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallService],
    }).compile();

    service = module.get<InstallService>(InstallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
