import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository;

  beforeEach(async () => {
    repository = { metadata: { connection: { options: { type: '' } }, columns: [] } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateEmail', () => {
    const email = 'email';
    const user = {};
    let token;

    beforeEach(() => (token = service.generateEmailValidationToken(email)));

    it('throws Forbidden when user cannot be found', async () => {
      repository.findOne = jest.fn().mockReturnValue(null);
      await expect(service.validateEmail(email, token)).rejects.toThrow(ForbiddenException);
      expect(repository.findOne).toHaveBeenCalledWith({
        email,
        status: UserStatus.EMAIL_NOT_VALIDATED,
      });
    });

    it('throws Forbidden when token date is invalid', async () => {
      token = service.generateEmailValidationToken(email, new Date('2019-01-01').getTime());
      repository.findOne = jest.fn().mockReturnValue(user);
      await expect(service.validateEmail(email, token)).rejects.toThrow(ForbiddenException);
    });

    it('throws Forbidden when token is invalid', async () => {
      token = 'token';
      repository.findOne = jest.fn().mockReturnValue(user);
      await expect(service.validateEmail(email, token)).rejects.toThrow(ForbiddenException);
    });

    it('calls save when everything is correct', async () => {
      repository.findOne = jest.fn().mockReturnValue(user);
      repository.save = jest.fn();
      await service.validateEmail(email, token);

      expect(repository.save).toHaveBeenCalledWith({ status: UserStatus.ACTIVE });
    });
  });

  describe('getUserWithNotValidatedEmail', () => {
    const email = 'email';

    it('calls findOne with the correct parameters', async () => {
      repository.findOne = jest.fn();
      await service.getUserWithNotValidatedEmail(email);
      expect(repository.findOne).toHaveBeenCalledWith({
        email,
        status: UserStatus.EMAIL_NOT_VALIDATED,
      });
    });

    it('forwards findOne result', async () => {
      repository.findOne = jest.fn().mockReturnValue(null);
      expect(await service.getUserWithNotValidatedEmail(email)).toBeNull();

      const user = {};
      repository.findOne = jest.fn().mockReturnValue(user);
      expect(await service.getUserWithNotValidatedEmail(email)).toBe(user);
    });
  });

  describe('generateEmailValidationToken', () => {
    it('generates a token with a timestamp first', () => {
      let result = service.generateEmailValidationToken('email');
      expect(result).toMatch(/^[0-9]{13}/);

      const date = new Date('2019-01-01');
      result = service.generateEmailValidationToken('email', date.getTime());
      expect(result.substr(0, 13)).toBe(date.getTime().toString());
    });

    it('generated the same token with the same params', () => {
      const date = new Date('2019-01-01');
      const result = service.generateEmailValidationToken('email', date.getTime());
      const expected = service.generateEmailValidationToken('email', date.getTime());
      expect(result).toBe(expected);
    });
  });
});
