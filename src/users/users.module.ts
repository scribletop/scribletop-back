import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from '../parties/party.entity';
import { PartiesController } from './parties/parties.controller';
import { PartiesService } from './parties/parties.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Party])],
  providers: [UsersService, PartiesService],
  controllers: [UsersController, PartiesController],
  exports: [UsersService],
})
export class UsersModule {}
