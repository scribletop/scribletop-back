import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { PartyMember } from '../party-member.entity';

@Injectable()
export class MembersService extends TypeOrmCrudService<PartyMember> {
  constructor(@InjectRepository(PartyMember) repo: Repository<PartyMember>) {
    super(repo);
  }
}
