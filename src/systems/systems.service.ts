import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { System } from './system.entity';

@Injectable()
export class SystemsService extends TypeOrmCrudService<System> {
  constructor(@InjectRepository(System) repo: Repository<System>) {
    super(repo);
  }
}
