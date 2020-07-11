import { User, UserStatus } from './user.entity';

describe('UserEntity', () => {
  describe('isActive', () => {
    it('should return true when user is active', () => {
      const user = new User();
      user.status = UserStatus.ACTIVE;
      expect(user.isActive()).toBe(true);
    });

    it('should return false when user is inactive', () => {
      const user = new User();
      user.status = UserStatus.EMAIL_NOT_VALIDATED;
      expect(user.isActive()).toBe(false);
      user.status = UserStatus.INACTIVE;
      expect(user.isActive()).toBe(false);
      user.status = UserStatus.BANNED;
      expect(user.isActive()).toBe(false);
    });
  });
});
