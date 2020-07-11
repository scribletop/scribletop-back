import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyMember } from '../../parties/party-member.entity';
import { Party } from '../../parties/party.entity';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Party, PartyMember])],
  providers: [PartiesService],
  controllers: [PartiesController],
})
export class PartiesModule {}
