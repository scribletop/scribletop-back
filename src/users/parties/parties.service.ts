import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Party } from '../../parties/party.entity';

@Injectable()
export class PartiesService extends TypeOrmCrudService<Party> {
  constructor(@InjectRepository(Party) repo: Repository<Party>) {
    super(repo);
  }
}
