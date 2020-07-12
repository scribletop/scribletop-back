import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudOptions, Feature } from '@nestjsx/crud';
import { merge } from 'lodash';
import { SessionGuard } from '../auth/guards/session.guard';
import { defaultCrudOptions } from '../utils';
import { System } from './system.entity';
import { SystemsService } from './systems.service';

@Crud(
  merge<CrudOptions, Partial<CrudOptions>>(defaultCrudOptions(System), {
    routes: { only: ['getManyBase', 'getOneBase'] },
  }),
)
@UseGuards(SessionGuard)
@Feature('Systems')
@Controller('systems')
export class SystemsController {
  public service: SystemsService;

  constructor(service: SystemsService) {
    this.service = service;
  }
}
