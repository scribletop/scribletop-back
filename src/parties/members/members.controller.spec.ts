import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';

describe('Members Controller', () => {
  let controller: MembersController;
  let service, req;

  beforeEach(async () => {
    req = {};
    service = {
      createOne: jest.fn(),
      createPartyMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: 'MembersService', useValue: service }],
    }).compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    const slug = 'slug';
    const username = 'username';

    it('should generate a new PartyMember from request', async () => {
      const dto = { userId: 1, partyId: 1 };
      service.createPartyMember.mockReturnValue(dto);
      await controller.createOne(req, { username }, slug);
      expect(service.createOne).toHaveBeenCalledWith(req, dto);
      expect(service.createPartyMember).toHaveBeenCalledWith(username, slug);
    });
  });
});
