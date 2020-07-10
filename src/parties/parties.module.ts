import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Party } from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Party])],
  providers: [],
  controllers: [],
})
export class PartiesModule {}
