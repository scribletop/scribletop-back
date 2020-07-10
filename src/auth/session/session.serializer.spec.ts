import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/user.entity';
import { SessionSerializer } from './session.serializer';

describe('SessionSerializer', () => {
  let serializer: SessionSerializer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionSerializer],
    }).compile();

    serializer = module.get<SessionSerializer>(SessionSerializer);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(serializer).toBeDefined();
  });

  describe('serializeUser', () => {
    it('should just forward to callback', (done) => {
      const expected = new User();
      const cb = (err: Error, user: User): void => {
        expect(err).toBe(null);
        expect(user).toBe(expected);
        done();
      };

      serializer.serializeUser(expected, cb);
    });

    it('should just forward to callback', (done) => {
      const expected = 'user';
      const cb = (err: Error, user: string): void => {
        expect(err).toBe(null);
        expect(user).toBe(expected);
        done();
      };

      serializer.deserializeUser(expected, cb);
    });
  });
});
