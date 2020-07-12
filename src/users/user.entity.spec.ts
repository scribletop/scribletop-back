import { compareSync } from 'bcrypt';
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

  describe('beforeInsert', () => {
    it('should add the default status to the user', async () => {
      const user = new User();
      user.password = 'password';
      await user.beforeInsert();
      expect(user.status).toBe(UserStatus.EMAIL_NOT_VALIDATED);
    });

    it("should hash the user's password", async () => {
      const user = new User();
      user.password = 'password';
      await user.beforeInsert();
      expect(user.password).not.toBe('password');
      expect(compareSync('password', user.password)).toBe(true);
    });
  });
});
