import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { World } from '../../worlds/world.entity';
import { Party } from '../party.entity';
import { CreateGameDto } from './create-game.dto';
import { Game } from '../../games/game.entity';

@Injectable()
export class GamesService extends TypeOrmCrudService<Game> {
  constructor(
    @InjectRepository(Game) private gameRepo: Repository<Game>,
    @InjectRepository(World) private worldRepo: Repository<World>,
    @InjectRepository(Party) private partyRepo: Repository<Party>,
  ) {
    super(gameRepo);
  }

  private static verifyWorldExists(world: World): void {
    if (!world) {
      throw new BadRequestException('That world does not exist.');
    }
  }

  private static verifyPartyExists(party: Party): void {
    if (!party) {
      throw new ForbiddenException();
    }
  }

  public async createGame(dto: CreateGameDto, partySlug: string): Promise<Game> {
    const { party, world } = await this.findPartyAndWorld(partySlug, dto.world);
    GamesService.verifyPartyExists(party);
    GamesService.verifyWorldExists(world);

    return this.createGameFromPartyAndWorld(dto, party, world);
  }

  public async findPartyAndWorld(
    partySlug: string,
    worldSlug: string,
  ): Promise<{ party: Party; world: World }> {
    const [party, world] = await Promise.all([
      this.partyRepo.findOne({ slug: partySlug }),
      this.worldRepo.findOne({ slug: worldSlug }),
    ]);

    return { party, world };
  }

  private createGameFromPartyAndWorld(dto: CreateGameDto, party: Party, world: World): Game {
    return this.gameRepo.create({
      name: dto.name,
      type: dto.type,
      partyId: party.id,
      worldId: world.id,
    });
  }
}
