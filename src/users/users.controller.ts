import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { defaultCrudOptions } from '../utils';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Crud(defaultCrudOptions(User))
@Controller('users')
export class UsersController implements CrudController<User> {
  public service: UsersService;

  constructor(service: UsersService) {
    this.service = service;
  }
}
