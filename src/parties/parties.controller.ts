import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtGuard } from '../auth/jwt.guard';
import { defaultCrudOptions } from '../utils';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Crud(defaultCrudOptions(Party))
@UseGuards(JwtGuard)
@Controller('parties')
export class PartiesController implements CrudController<Party> {
  public service: PartiesService;

  constructor(service: PartiesService) {
    this.service = service;
  }
}
