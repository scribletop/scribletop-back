import { Injectable } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validate(username: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne({ username });
    if (user && compareSync(password, user.password) && user.isActive()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, id, status, ...result } = user;
      return result;
    }

    return null;
  }
}
