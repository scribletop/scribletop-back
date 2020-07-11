import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';

describe('Parties Controller', () => {
  let controller: PartiesController;
  let service;

  beforeEach(async () => {
    service = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [{ provide: 'PartiesService', useValue: service }],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
