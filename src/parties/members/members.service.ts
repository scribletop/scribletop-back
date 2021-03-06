import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { PartyMember, Role } from '../party-member.entity';
import { Party } from '../party.entity';

@Injectable()
export class MembersService extends TypeOrmCrudService<PartyMember> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Party) private partyRepository: Repository<Party>,
    @InjectRepository(PartyMember) private partyMemberRepository: Repository<PartyMember>,
  ) {
    super(partyMemberRepository);
  }

  private static verifyUserExists(user: User): void {
    if (!user) {
      throw new BadRequestException('That user does not exist.');
    }
  }

  private static verifyPartyExists(party: Party): void {
    if (!party) {
      throw new ForbiddenException();
    }
  }

  private static verifyUserIsNotMemberOfParty(party: Party, username: string): void {
    if (!!party.findMember(username)) {
      throw new BadRequestException('That user is already in the party.');
    }
  }

  public async createPartyMember(username: string, slug: string): Promise<PartyMember> {
    const { user, party } = await this.getUserAndPartyFromRequest(username, slug);
    MembersService.verifyUserExists(user);
    MembersService.verifyPartyExists(party);
    MembersService.verifyUserIsNotMemberOfParty(party, username);

    return this.createPartyMemberFromPartyAndUser(party, user);
  }

  private async getUserAndPartyFromRequest(
    username: string,
    slug: string,
  ): Promise<{ user: User; party: Party }> {
    const [user, party] = await Promise.all([
      this.userRepository.findOne({ username: username }),
      this.partyRepository.findOne({ where: { slug }, relations: ['members', 'members.user'] }),
    ]);
    return { user, party };
  }

  private createPartyMemberFromPartyAndUser(party: Party, user: User): PartyMember {
    return this.partyMemberRepository.create({
      partyId: party.id,
      userId: user.id,
      role: Role.player,
    });
  }
}
