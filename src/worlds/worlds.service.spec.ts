import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { World } from './world.entity';
import { WorldsService } from './worlds.service';

describe('WorldsService', () => {
  let service: WorldsService;
  let repository;

  beforeEach(async () => {
    repository = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorldsService, { provide: getRepositoryToken(World), useValue: repository }],
    }).compile();

    service = module.get<WorldsService>(WorldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
