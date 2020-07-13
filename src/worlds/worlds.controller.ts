import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudOptions, Feature } from '@nestjsx/crud';
import { merge } from 'lodash';
import { SessionGuard } from '../auth/guards/session.guard';
import { defaultCrudOptions } from '../utils';
import { World } from './world.entity';
import { WorldsService } from './worlds.service';

@Crud(
  merge<CrudOptions, Partial<CrudOptions>>(defaultCrudOptions(World), {
    routes: {
      only: ['getManyBase', 'getOneBase', 'createOneBase'],
    },
  }),
)
@UseGuards(SessionGuard)
@Feature('Worlds')
@Controller('worlds')
export class WorldsController implements CrudController<World> {
  public service: WorldsService;

  constructor(service: WorldsService) {
    this.service = service;
  }
}
