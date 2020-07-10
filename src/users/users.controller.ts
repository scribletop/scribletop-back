import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController, Feature } from '@nestjsx/crud';
import { merge } from 'lodash';
import { ACLGuard } from '../auth/guards/acl.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { defaultCrudOptions } from '../utils';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Crud(
  merge(defaultCrudOptions(User, 'username'), {
    routes: {
      createOneBase: { decorators: [UseGuards(ACLGuard)] },
      getManyBase: { decorators: [UseGuards(SessionGuard, ACLGuard)] },
      getOneBase: { decorators: [UseGuards(SessionGuard, ACLGuard)] },
      updateOneBase: { decorators: [UseGuards(SessionGuard, ACLGuard)] },
      deleteOneBase: { decorators: [UseGuards(SessionGuard, ACLGuard)] },
      exclude: ['createManyBase', 'replaceOneBase'],
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
