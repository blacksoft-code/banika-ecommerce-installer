import { Test, TestingModule } from '@nestjs/testing';
import { InstallController } from './install.controller';

describe('InstallController', () => {
  let controller: InstallController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallController],
    }).compile();

    controller = module.get<InstallController>(InstallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
