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
import { CreateGameDto } from './create-game.dto';
import { Game } from '../../games/game.entity';
import { GamesService } from './games.service';

@Crud(
  merge<CrudOptions, Partial<CrudOptions>>(defaultCrudOptions(Game), {
    routes: {
      only: ['createOneBase', 'getManyBase'],
    },
    params: {
      partySlug: { field: 'party.slug', type: 'string' },
    },
    dto: { create: CreateGameDto },
    query: { join: { party: { eager: true }, world: { eager: true } } },
  }),
)
@UseGuards(SessionGuard)
@Feature('Party-Games')
@Controller('parties/:partySlug/games')
export class GamesController implements CrudController<Game> {
  service: GamesService;

  constructor(service: GamesService) {
    this.service = service;
  }

  @Override('createOneBase')
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateGameDto,
    @Param('partySlug') slug: string,
  ): Promise<Game> {
    const game = await this.service.createGame(dto, slug);
    return (this as CrudController<Game>).createOneBase(req, game);
  }
}
