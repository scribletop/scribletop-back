import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getAction, getFeature } from '@nestjsx/crud';
import { Request } from 'express';
import { User } from '../../users/user.entity';

@Injectable()
export class ACLGuard implements CanActivate {
  private static isCurrentUser(request: Request): boolean {
    return (request.user as User).username === request.params.username;
  }

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const controller = ctx.getClass();
    const request: Request = ctx.switchToHttp().getRequest();

    const feature: string = getFeature(controller);
    const action: string = getAction(handler);

    console.log(`${feature}-${action}`);
    if (feature.startsWith('User-')) {
      return ACLGuard.isCurrentUser(request);
    }

    if (feature === 'Users') {
      switch (action) {
        case 'Read-One':
          return ACLGuard.isCurrentUser(request);
        case 'Create-One':
          return !request.isAuthenticated();
      }
    }

    if (feature === 'Auth') {
      return !request.isAuthenticated();
    }

    return false;
  }
}
