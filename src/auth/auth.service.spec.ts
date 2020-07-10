import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService;

  beforeEach(async () => {
    usersService = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: 'UsersService', useValue: usersService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validate', () => {
    const username = 'username',
      password = 'password';

    it('should fail when user cannot be found', async () => {
      usersService.findOne = jest.fn().mockReturnValue(null);
      const res = await service.validate(username, password);
      expect(res).toBe(null);
    });

    it('should fail when user has wrong password', async () => {
      usersService.findOne = jest.fn().mockReturnValue({ password });
      const res = await service.validate(username, password);
      expect(res).toBe(null);
    });

    it('should fail when user is not active', async () => {
      const user = { password: await hash(password, 4), isActive: (): boolean => false };
      usersService.findOne = jest.fn().mockReturnValue(user);
      const res = await service.validate(username, password);
      expect(res).toBe(null);
    });

    it('should succeed otherwise', async () => {
      const user = { id: 5, isActive: (): boolean => true, password: await hash(password, 4) };
      usersService.findOne = jest.fn().mockReturnValue(user);
      const res = await service.validate(username, password);
      expect(res.id).toBe(user.id);
    });
  });
});
