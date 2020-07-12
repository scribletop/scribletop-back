import { BadRequestException, Controller, Param, UseGuards } from '@nestjs/common';
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
import { User } from '../../users/user.entity';
import { defaultCrudOptions } from '../../utils';
import { PartyMember, Role } from '../party-member.entity';
import { Party } from '../party.entity';
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
@Feature('Party-Users')
@UseGuards(SessionGuard)
@Controller('parties/:slug/members')
export class MembersController {
  public service: MembersService;

  constructor(
    service: MembersService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Party) private partyRepository: Repository<Party>,
    @InjectRepository(PartyMember) private partyMemberRepository: Repository<PartyMember>,
  ) {
    this.service = service;
  }

  @Override('createOneBase')
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateMemberDto,
    @Param('slug') slug: string,
  ): Promise<PartyMember> {
    const [user, party] = await Promise.all([
      this.userRepository.findOne({ username: dto.username }),
      this.partyRepository.findOne({ where: { slug }, relations: ['members', 'members.user'] }),
    ]);
    if (!user) {
      throw new BadRequestException('That user does not exist.');
    }

    if (!!party.findMember(dto.username)) {
      throw new BadRequestException('That user is already in the party.');
    }

    const partyMember = this.createPartyMemberFromPartyAndUser(party, user);

    return (this as CrudController<PartyMember>).createOneBase(req, partyMember);
  }

  private createPartyMemberFromPartyAndUser(party, user): PartyMember {
    return this.partyMemberRepository.create({
      partyId: party.id,
      userId: user.id,
      role: Role.player,
    });
  }
}
