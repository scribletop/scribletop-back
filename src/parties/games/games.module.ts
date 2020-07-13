import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../../games/game.entity';
import { System } from '../../systems/system.entity';
import { World } from '../../worlds/world.entity';
import { Party } from '../party.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, World, Party, System])],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
