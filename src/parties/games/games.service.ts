import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../games/game.entity';
import { System } from '../../systems/system.entity';
import { World } from '../../worlds/world.entity';
import { Party } from '../party.entity';
import { CreateGameDto } from './create-game.dto';

@Injectable()
export class GamesService extends TypeOrmCrudService<Game> {
  constructor(
    @InjectRepository(Game) private gameRepo: Repository<Game>,
    @InjectRepository(World) private worldRepo: Repository<World>,
    @InjectRepository(Party) private partyRepo: Repository<Party>,
    @InjectRepository(System) private systemRepo: Repository<System>,
  ) {
    super(gameRepo);
  }

  private static verifyWorldExists(world: World): void {
    if (!world) {
      throw new BadRequestException('That world does not exist.');
    }
  }

  private static verifySystemExists(system: System): void {
    if (!system) {
      throw new BadRequestException('That system does not exist.');
    }
  }

  private static verifyPartyExists(party: Party): void {
    if (!party) {
      throw new ForbiddenException();
    }
  }

  public async createGame(dto: CreateGameDto, partySlug: string): Promise<Game> {
    const { party, world, system } = await this.findPartyWorldAndSystem(
      partySlug,
      dto.world,
      dto.system,
    );
    GamesService.verifyPartyExists(party);
    GamesService.verifyWorldExists(world);
    GamesService.verifySystemExists(system);

    return this.createGameFromData(dto, party, world, system);
  }

  public async findPartyWorldAndSystem(
    partySlug: string,
    worldSlug: string,
    systemSlug: string,
  ): Promise<{ party: Party; world: World; system: System }> {
    const [party, world, system] = await Promise.all([
      this.partyRepo.findOne({ slug: partySlug }),
      this.worldRepo.findOne({ slug: worldSlug }),
      this.systemRepo.findOne({ slug: systemSlug }),
    ]);

    return { party, world, system };
  }

  private createGameFromData(dto: CreateGameDto, party: Party, world: World, system: System): Game {
    return this.gameRepo.create({
      name: dto.name,
      type: dto.type,
      partyId: party.id,
      worldId: world.id,
      systemId: system.id,
    });
  }
}
