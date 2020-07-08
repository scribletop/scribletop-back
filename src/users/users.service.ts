import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';

const validationTokenTimeExpiration = 24 * 3600 * 1000;

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(@InjectRepository(User) repo: Repository<User>) {
    super(repo);
  }

  async validateEmail(email: string, token: string): Promise<void> {
    const user = await this.repo.findOne({
      email,
      status: UserStatus.EMAIL_NOT_VALIDATED,
    });
    const timestamp = parseInt(token.substr(0, 13));
    const correctToken = this.generateEmailValidationToken(email, timestamp);
    if (!user || new Date(timestamp) < new Date() || correctToken !== token) {
      throw new ForbiddenException();
    }

    user.status = UserStatus.ACTIVE;
    await this.repo.save(user);
  }

  generateEmailValidationToken(
    email: string,
    timestamp = new Date().getTime() + validationTokenTimeExpiration,
  ): string {
    const salt = 'SALT'; // todo change in env
    const hash = createHash('sha512');
    hash.update(`${timestamp}_${email}_${salt}`, 'utf8');

    return timestamp.toString() + hash.digest('hex');
  }
}
