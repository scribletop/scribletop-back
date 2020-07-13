import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { World } from './world.entity';

@Injectable()
export class WorldsService extends TypeOrmCrudService<World> {
  constructor(@InjectRepository(World) repo: Repository<World>) {
    super(repo);
  }
}
