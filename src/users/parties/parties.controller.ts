import { Controller, Session, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Crud,
  CrudController,
  CrudOptions,
  CrudRequest,
  Feature,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { merge } from 'lodash';
import { Repository } from 'typeorm';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SessionData } from '../../auth/session/session.serializer';
import { PartyMember, Role } from '../../parties/party-member.entity';
import { Party } from '../../parties/party.entity';
import { defaultCrudOptionsUnderUser } from '../../utils';
import { PartiesService } from './parties.service';

@Crud(
  merge<CrudOptions, Partial<CrudOptions>>(defaultCrudOptionsUnderUser(Party), {
    routes: { only: ['createOneBase', 'getManyBase'] },
  }),
)
@Feature('User-Parties')
@UseGuards(SessionGuard)
@Controller('users/:username/parties')
export class PartiesController {
  public service: PartiesService;
  @InjectRepository(PartyMember) private repository: Repository<PartyMember>;

  constructor(
    service: PartiesService,
    @InjectRepository(PartyMember) repository: Repository<PartyMember>,
  ) {
    this.repository = repository;
    this.service = service;
  }

  @Override()
  createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Party,
    @Session() session: SessionData,
  ): Promise<Party> {
    const partyMember = this.repository.create();
    partyMember.userId = session.passport.user.id;
    partyMember.role = Role.dm;
    dto.members = [partyMember];
    return (this as CrudController<Party>).createOneBase(req, dto);
  }
}
