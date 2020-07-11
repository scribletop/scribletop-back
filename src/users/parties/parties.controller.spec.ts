import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { SessionData } from '../../auth/session/session.serializer';
import { PartyMember, Role } from '../../parties/party-member.entity';
import { Party } from '../../parties/party.entity';
import { PartiesController } from './parties.controller';

describe('Parties Controller', () => {
  let controller: PartiesController;
  let service, repository;

  beforeEach(async () => {
    service = {};
    repository = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [
        { provide: 'PartiesService', useValue: service },
        { provide: getRepositoryToken(PartyMember), useValue: repository },
      ],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    it('should add current user to party by default', async () => {
      const party = {} as Party;
      const partyMember = new PartyMember();
      repository.create = jest.fn().mockReturnValue(partyMember);
      service.createOne = jest.fn();

      await controller.createOne({} as CrudRequest, party, {
        passport: { user: { id: 1 } },
      } as SessionData);

      expect(party).toHaveProperty('members');
      expect(party.members).toHaveLength(1);
      expect(party.members[0]).toBe(partyMember);
      expect(partyMember.userId).toBe(1);
      expect(partyMember.role).toBe(Role.dm);
    });
  });
});
