import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PartyMember } from '../party-member.entity';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;
  let repository;

  beforeEach(async () => {
    repository = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: getRepositoryToken(PartyMember), useValue: repository },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
