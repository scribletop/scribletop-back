import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { PartyMember, Role } from '../party-member.entity';
import { Party } from '../party.entity';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;
  let userRepo, partyRepo, partyMemberRepo;

  beforeEach(async () => {
    userRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    partyRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    partyMemberRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Party), useValue: partyRepo },
        { provide: getRepositoryToken(PartyMember), useValue: partyMemberRepo },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPartyMember', () => {
    const username = 'username';
    const slug = 'slug';

    it('throws BadRequest when user does not exist', async () => {
      userRepo.findOne = jest.fn().mockReturnValue(null);
      partyRepo.findOne = jest.fn().mockReturnValue({});

      await expect(service.createPartyMember(username, slug)).rejects.toThrow(BadRequestException);
      expect(userRepo.findOne).toHaveBeenCalledWith({ username });
      expect(partyRepo.findOne).toHaveBeenCalledWith({
        where: { slug },
        relations: ['members', 'members.user'],
      });
    });

    it('throws Forbidden when party does not exist', async () => {
      userRepo.findOne = jest.fn().mockReturnValue({});
      partyRepo.findOne = jest.fn().mockReturnValue(null);

      await expect(service.createPartyMember(username, slug)).rejects.toThrow(ForbiddenException);
      expect(userRepo.findOne).toHaveBeenCalledWith({ username });
      expect(partyRepo.findOne).toHaveBeenCalledWith({
        where: { slug },
        relations: ['members', 'members.user'],
      });
    });

    it('throws BadRequest when user is already a member', async () => {
      const party = new Party();
      party.members = [{ user: { username } }] as PartyMember[];
      userRepo.findOne = jest.fn().mockReturnValue({ username });
      partyRepo.findOne = jest.fn().mockReturnValue(party);

      await expect(service.createPartyMember(username, slug)).rejects.toThrow(BadRequestException);
      expect(userRepo.findOne).toHaveBeenCalledWith({ username });
      expect(partyRepo.findOne).toHaveBeenCalledWith({
        where: { slug },
        relations: ['members', 'members.user'],
      });
    });

    it('returns a party member when it works well', async () => {
      const expected = {};
      const party = new Party();
      party.id = 1;
      party.members = [{ user: { username: '' } }] as PartyMember[];
      userRepo.findOne = jest.fn().mockReturnValue({ username, id: 2 });
      partyRepo.findOne = jest.fn().mockReturnValue(party);
      partyMemberRepo.create = jest.fn().mockReturnValue(expected);

      const result = await service.createPartyMember(username, slug);

      expect(result).toBe(expected);
      expect(userRepo.findOne).toHaveBeenCalledWith({ username });
      expect(partyRepo.findOne).toHaveBeenCalledWith({
        where: { slug },
        relations: ['members', 'members.user'],
      });
      expect(partyMemberRepo.create).toHaveBeenCalledWith({
        role: Role.player,
        userId: 2,
        partyId: 1,
      });
    });
  });
});
