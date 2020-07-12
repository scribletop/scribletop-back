import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';

describe('Members Controller', () => {
  let controller: MembersController;
  let service;

  beforeEach(async () => {
    service = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: 'MembersService', useValue: service }],
    }).compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
