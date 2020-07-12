import { Test, TestingModule } from '@nestjs/testing';
import { SystemsController } from './systems.controller';

describe('Systems Controller', () => {
  let controller: SystemsController;
  let service;

  beforeEach(async () => {
    service = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemsController],
      providers: [{ provide: 'SystemsService', useValue: service }],
    }).compile();

    controller = module.get<SystemsController>(SystemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
