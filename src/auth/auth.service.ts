import { Injectable } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

export interface SuccessLogin {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validate(username: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne({ username });
    if (user && compareSync(password, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
