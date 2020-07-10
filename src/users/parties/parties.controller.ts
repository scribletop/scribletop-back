import { Controller, UseGuards } from '@nestjs/common';
import { Crud, Feature } from '@nestjsx/crud';
import { ACLGuard } from '../../auth/guards/acl.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { Party } from '../../parties/party.entity';
import { defaultCrudOptionsUnderUser } from '../../utils';
import { PartiesService } from './parties.service';

@Crud(defaultCrudOptionsUnderUser(Party))
@Feature('User-Parties')
@UseGuards(SessionGuard, ACLGuard)
@Controller('users/:username/parties')
export class PartiesController {
  public service: PartiesService;

  constructor(service: PartiesService) {
    this.service = service;
  }
}
