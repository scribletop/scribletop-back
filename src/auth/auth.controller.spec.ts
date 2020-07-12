import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('Auth Controller', () => {
  let controller: AuthController;
  let usersService, authService;

  beforeEach(async () => {
    usersService = {};
    authService = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'UsersService', useValue: usersService },
        { provide: 'AuthService', useValue: authService },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('should return the username', () => {
      const username = 'user';
      expect(controller.login({ user: { username } })).toStrictEqual({ username });
    });
  });

  describe('validate', () => {
    it('should forward exceptions', async () => {
      const theException = new UnauthorizedException();
      usersService.validateEmail = jest.fn().mockImplementation(async () => {
        throw theException;
      });

      const result = controller.validate({ token: 'foo', email: 'bar@email.com' });

      await expect(result).rejects.toThrow(theException);
    });

    it('should forward return values', async () => {
      const expected = {};
      usersService.validateEmail = jest.fn().mockReturnValue(expected);

      const result = controller.validate({ token: 'foo', email: 'bar@email.com' });

      expect(result).toBe(expected);
    });
  });

  describe('createValidationToken', () => {
    it('should not generate a token when user is already validated', () => {
      usersService.getUserWithNotValidatedEmail = jest.fn().mockReturnValue(null);
      usersService.generateEmailValidationToken = jest.fn();

      controller.createValidationToken({ email: 'bar@email.com' });

      expect(usersService.generateEmailValidationToken).not.toHaveBeenCalled();
    });

    it('should generate a token when user is not validated yet', () => {
      usersService.getUserWithNotValidatedEmail = jest.fn().mockReturnValue({});
      usersService.generateEmailValidationToken = jest.fn().mockReturnValue('token');
      const spy = jest.spyOn(console, 'log').mockImplementation();

      controller.createValidationToken({ email: 'bar@email.com' });

      expect(usersService.generateEmailValidationToken).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('token');
      spy.mockRestore();
    });
  });
});
