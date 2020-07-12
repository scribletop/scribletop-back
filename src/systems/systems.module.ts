import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from './system.entity';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';

@Module({
  imports: [TypeOrmModule.forFeature([System])],
  controllers: [SystemsController],
  providers: [SystemsService],
})
export class SystemsModule {}
