import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from '../../games/game.entity';
import { System } from '../../systems/system.entity';
import { World } from '../../worlds/world.entity';
import { Party } from '../party.entity';
import { CreateGameDto } from './create-game.dto';
import { GamesService } from './games.service';

describe('GamesService', () => {
  let service: GamesService;
  let gameRepo, partyRepo, worldRepo, systemRepo;

  beforeEach(async () => {
    gameRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    partyRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    worldRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    systemRepo = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getRepositoryToken(Game), useValue: gameRepo },
        { provide: getRepositoryToken(Party), useValue: partyRepo },
        { provide: getRepositoryToken(World), useValue: worldRepo },
        { provide: getRepositoryToken(System), useValue: systemRepo },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    let dto: CreateGameDto,
      name: string,
      type: number,
      world: string,
      party: string,
      system: string;
    beforeEach(() => {
      name = 'name';
      type = 1;
      world = 'world';
      party = 'party';
      system = 'system';
      dto = { name, type, world, system };
    });

    it('should fail when the world does not exist', async () => {
      worldRepo.findOne = jest.fn().mockReturnValue(null);
      partyRepo.findOne = jest.fn().mockReturnValue({});
      systemRepo.findOne = jest.fn().mockReturnValue({});

      await expect(service.createGame(dto, party)).rejects.toThrow(BadRequestException);

      expect(worldRepo.findOne).toHaveBeenCalledWith({ slug: world });
      expect(partyRepo.findOne).toHaveBeenCalledWith({ slug: party });
      expect(systemRepo.findOne).toHaveBeenCalledWith({ slug: system });
    });

    it('should fail when the party does not exist', async () => {
      worldRepo.findOne = jest.fn().mockReturnValue({});
      partyRepo.findOne = jest.fn().mockReturnValue(null);
      systemRepo.findOne = jest.fn().mockReturnValue({});

      await expect(service.createGame(dto, party)).rejects.toThrow(ForbiddenException);

      expect(worldRepo.findOne).toHaveBeenCalledWith({ slug: world });
      expect(partyRepo.findOne).toHaveBeenCalledWith({ slug: party });
      expect(systemRepo.findOne).toHaveBeenCalledWith({ slug: system });
    });

    it('should fail when the system does not exist', async () => {
      worldRepo.findOne = jest.fn().mockReturnValue({});
      partyRepo.findOne = jest.fn().mockReturnValue({});
      systemRepo.findOne = jest.fn().mockReturnValue(null);

      await expect(service.createGame(dto, party)).rejects.toThrow(BadRequestException);

      expect(worldRepo.findOne).toHaveBeenCalledWith({ slug: world });
      expect(partyRepo.findOne).toHaveBeenCalledWith({ slug: party });
      expect(systemRepo.findOne).toHaveBeenCalledWith({ slug: system });
    });

    it('should return a game when it works', async () => {
      const partyId = 1,
        worldId = 2,
        systemId = 3;
      worldRepo.findOne = jest.fn().mockReturnValue({ id: worldId });
      partyRepo.findOne = jest.fn().mockReturnValue({ id: partyId });
      systemRepo.findOne = jest.fn().mockReturnValue({ id: systemId });
      gameRepo.create = jest.fn().mockReturnValue({ name, type, partyId, worldId });

      const result = await service.createGame(dto, party);
      expect(result).toStrictEqual({ name, type, partyId, worldId });
      expect(worldRepo.findOne).toHaveBeenCalledWith({ slug: world });
      expect(partyRepo.findOne).toHaveBeenCalledWith({ slug: party });
      expect(systemRepo.findOne).toHaveBeenCalledWith({ slug: system });
      expect(gameRepo.create).toHaveBeenCalledWith({ name, type, partyId, worldId, systemId });
    });
  });
});
