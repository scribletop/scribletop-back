import { Test, TestingModule } from '@nestjs/testing';
import { WorldsController } from './worlds.controller';

describe('Worlds Controller', () => {
  let controller: WorldsController;
  let service;

  beforeEach(async () => {
    service = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorldsController],
      providers: [{ provide: 'WorldsService', useValue: service }],
    }).compile();

    controller = module.get<WorldsController>(WorldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
