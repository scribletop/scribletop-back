import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { SessionGuard } from '../auth/session.guard';
import { defaultCrudOptions } from '../utils';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Crud(defaultCrudOptions(Party))
@UseGuards(SessionGuard)
@Controller('parties')
export class PartiesController implements CrudController<Party> {
  public service: PartiesService;

  constructor(service: PartiesService) {
    this.service = service;
  }
}
