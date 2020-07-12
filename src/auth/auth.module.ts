import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ACLGuard } from './guards/acl.guard';
import { SessionSerializer } from './session/session.serializer';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy, SessionSerializer, ACLGuard],
  controllers: [AuthController],
})
export class AuthModule {
}
