import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party } from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Party])],
  providers: [PartiesService],
  controllers: [PartiesController],
})
export class PartiesModule {}
