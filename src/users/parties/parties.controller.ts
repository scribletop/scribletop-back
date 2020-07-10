import { Controller, Session, UseGuards } from '@nestjs/common';
import {
  Crud,
  CrudController,
  CrudRequest,
  Feature,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { getRepository } from 'typeorm';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SessionData } from '../../auth/session/session.serializer';
import { PartyMember, Role } from '../../parties/party-member.entity';
import { Party } from '../../parties/party.entity';
import { defaultCrudOptionsUnderUser } from '../../utils';
import { PartiesService } from './parties.service';

@Crud(defaultCrudOptionsUnderUser(Party))
@Feature('User-Parties')
@UseGuards(SessionGuard)
@Controller('users/:username/parties')
export class PartiesController {
  public service: PartiesService;

  constructor(service: PartiesService) {
    this.service = service;
  }

  @Override()
  createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Party,
    @Session() session: SessionData,
  ): Promise<Party> {
    const partyMember = getRepository(PartyMember).create();
    partyMember.userId = session.passport.user.id;
    partyMember.role = Role.dm;
    dto.members = [partyMember];
    return (this as CrudController<Party>).createOneBase(req, dto);
  }
}
