import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { SessionGuard } from '../auth/session.guard';
import { defaultCrudOptions } from '../utils';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Crud({
  ...defaultCrudOptions(User, 'username'),
  routes: {
    getManyBase: { decorators: [UseGuards(SessionGuard)] },
    getOneBase: { decorators: [UseGuards(SessionGuard)] },
    updateOneBase: { decorators: [UseGuards(SessionGuard)] },
    replaceOneBase: { decorators: [UseGuards(SessionGuard)] },
    deleteOneBase: { decorators: [UseGuards(SessionGuard)] },
    exclude: ['createManyBase'],
  },
})
@Controller('users')
export class UsersController implements CrudController<User> {
  public service: UsersService;

  constructor(service: UsersService) {
    this.service = service;
  }
}
