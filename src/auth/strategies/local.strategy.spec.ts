import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';

describe('AuthService', () => {
  let strategy: LocalStrategy;
  let authService;

  beforeEach(async () => {
    authService = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: 'AuthService', useValue: authService }],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw an UnauthorizedException when authService returns null', async () => {
      authService.validate = jest.fn().mockReturnValue(null);
      await expect(strategy.validate('foo', 'bar')).rejects.toThrow(UnauthorizedException);
      expect(authService.validate).toHaveBeenCalled();
    });
    it('should return the validated user when valid', async () => {
      const user = {};
      authService.validate = jest.fn().mockReturnValue(user);
      await expect(strategy.validate('foo', 'bar')).resolves.toBe(user);
      expect(authService.validate).toHaveBeenCalled();
    });
  });
});
