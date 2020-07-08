import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartiesModule } from './parties/parties.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as ormConfig from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), PartiesModule, UsersModule, AuthModule],
})
export class AppModule {}
