import { Controller, Param, UseGuards } from '@nestjs/common';
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
import { SessionGuard } from '../../auth/guards/session.guard';
import { defaultCrudOptions } from '../../utils';
import { PartyMember } from '../party-member.entity';
import { CreateMemberDto } from './create-member.dto';
import { MembersService } from './members.service';

@Crud(
  merge<CrudOptions, Partial<CrudOptions>>(defaultCrudOptions(PartyMember, 'username'), {
    routes: {
      createOneBase: { returnShallow: true },
      only: ['createOneBase', 'getManyBase', 'deleteOneBase'],
    },
    params: {
      slug: { field: 'party.slug', type: 'string' },
      username: { field: 'user.username', type: 'string', primary: true },
    },
    dto: { create: CreateMemberDto },
    query: { join: { party: { eager: true }, user: { eager: true } } },
  }),
)
@UseGuards(SessionGuard)
@Feature('Party-Users')
@Controller('parties/:slug/members')
export class MembersController implements CrudController<PartyMember> {
  public service: MembersService;

  constructor(service: MembersService) {
    this.service = service;
  }

  @Override('createOneBase')
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateMemberDto,
    @Param('slug') slug: string,
  ): Promise<PartyMember> {
    const partyMember = await this.service.createPartyMember(dto.username, slug);
    return (this as CrudController<PartyMember>).createOneBase(req, partyMember);
  }
}
