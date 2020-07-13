import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesModule } from './games/games.module';
import { MembersModule } from './members/members.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Party]), MembersModule, GamesModule],
  providers: [PartiesService],
  controllers: [PartiesController],
})
export class PartiesModule {}
