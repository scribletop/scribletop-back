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
import { merge } from 'lodash';
import { getRepository } from 'typeorm';
import { ACLGuard } from '../auth/guards/acl.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SessionData } from '../auth/session/session.serializer';
import { defaultCrudOptions } from '../utils';
import { PartiesService } from './parties.service';
import { PartyMember, Role } from './party-member.entity';
import { Party } from './party.entity';

@Crud(
  merge(defaultCrudOptions(Party), {
    query: { join: { members: {}, 'members.user': {} } },
  }),
)
@UseGuards(SessionGuard, ACLGuard)
@Feature('Parties')
@Controller('parties')
export class PartiesController implements CrudController<Party> {
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
