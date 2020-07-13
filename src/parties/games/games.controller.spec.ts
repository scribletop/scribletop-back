import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';

describe('Games Controller', () => {
  let controller: GamesController;
  let service, req;

  beforeEach(async () => {
    req = {};
    service = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [{ provide: 'GamesService', useValue: service }],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    const name = 'name',
      type = 1,
      world = 'world',
      party = 'party',
      system = 'system';
    const dto = { name, type, world, system };
    it('should create a game from the dto', async () => {
      const game = {};
      service.createGame = jest.fn().mockReturnValue(game);
      service.createOne = jest.fn();

      await controller.createOne(req, dto, party);

      expect(service.createGame).toHaveBeenCalledWith(dto, party);
      expect(service.createOne).toHaveBeenCalledWith(req, game);
    });
  });
});
