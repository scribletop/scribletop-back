import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { World } from './world.entity';
import { WorldsController } from './worlds.controller';
import { WorldsService } from './worlds.service';

@Module({
  imports: [TypeOrmModule.forFeature([World])],
  controllers: [WorldsController],
  providers: [WorldsService],
})
export class WorldsModule {}
