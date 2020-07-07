import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesModule } from './parties/parties.module';
import { UsersModule } from './users/users.module';
import * as ormConfig from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), PartiesModule, UsersModule],
})
export class AppModule {}
