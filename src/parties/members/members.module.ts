import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { PartyMember } from '../party-member.entity';
import { Party } from '../party.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartyMember, User, Party])],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
