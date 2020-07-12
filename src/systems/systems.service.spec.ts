import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { System } from './system.entity';
import { SystemsService } from './systems.service';

describe('SystemsService', () => {
  let service: SystemsService;
  let repository;

  beforeEach(async () => {
    repository = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemsService, { provide: getRepositoryToken(System), useValue: repository }],
    }).compile();

    service = module.get<SystemsService>(SystemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
