import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from '../../parties/party.entity';
import { PartiesService } from './parties.service';

describe('PartiesService', () => {
  let service: PartiesService;
  let repository;

  beforeEach(async () => {
    repository = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartiesService, { provide: getRepositoryToken(Party), useValue: repository }],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
