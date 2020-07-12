import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController, Feature } from '@nestjsx/crud';
import { merge } from 'lodash';
import { SessionGuard } from '../auth/guards/session.guard';
import { defaultCrudOptions } from '../utils';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Crud(
  merge(defaultCrudOptions(User, 'username'), {
    routes: {
      getOneBase: { decorators: [UseGuards(SessionGuard)] },
      only: ['createOneBase', 'getOneBase'],
    },
  }),
)
@Feature('Users')
@Controller('users')
export class UsersController implements CrudController<User> {
  public service: UsersService;

  constructor(service: UsersService) {
    this.service = service;
  }
}
