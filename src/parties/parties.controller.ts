import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudOptions, Feature } from '@nestjsx/crud';
import { merge } from 'lodash';
import { SessionGuard } from '../auth/guards/session.guard';
import { defaultCrudOptions } from '../utils';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Crud(
  merge(defaultCrudOptions(Party), {
    query: { join: { members: { eager: true }, 'members.user': { eager: true } } },
    routes: { only: ['getOneBase'] },
  } as Partial<CrudOptions>),
)
@UseGuards(SessionGuard)
@Feature('Parties')
@Controller('parties')
export class PartiesController implements CrudController<Party> {
  public service: PartiesService;

  constructor(service: PartiesService) {
    this.service = service;
  }
}
