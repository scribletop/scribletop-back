import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { getAction, getFeature } from '@nestjsx/crud';
import { Request } from 'express';
import { Connection } from 'typeorm';
import { Role } from '../../parties/party-member.entity';
import { Party } from '../../parties/party.entity';
import { User } from '../../users/user.entity';

// todo refactor this into multiple classes?
@Injectable()
export class ACLGuard implements CanActivate {
  constructor(@InjectConnection() private connection: Connection) {}

  private static isCurrentUser(request: Request): boolean {
    return ACLGuard.getUser(request).username === request.params.username;
  }

  private static getUser(request: Request): User {
    return (request.user || {}) as User;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
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

    if (feature === 'Parties') {
      const party = await this.getParty(request);
      return !!party && !!party.findMember(ACLGuard.getUser(request).username);
    }

    if (feature === 'Party-Users') {
      if (
        action === 'Delete-One' &&
        request.params.username === ACLGuard.getUser(request).username
      ) {
        return false;
      }

      const party = await this.getParty(request);
      if (!party) {
        return false;
      }

      const member = party.findMember(ACLGuard.getUser(request).username);
      if (!member) {
        return false;
      }

      return action === 'Delete-One' ? member.role === Role.dm : true;
    }

    if (feature === 'Party-Games') {
      const party = await this.getParty(request);
      if (!party) {
        return false;
      }

      const member = party.findMember(ACLGuard.getUser(request).username);
      if (!member) {
        return false;
      }

      return action === 'Create-One' ? member.role === Role.dm : true;
    }

    if (feature === 'Systems') {
      return action === 'Read-One' || action === 'Read-All' || action === 'Create-One';
    }

    if (feature === 'Worlds') {
      return action === 'Read-One' || action === 'Read-All' || action === 'Create-One';
    }

    console.log('ACL NOT FOUND');
    return false;
  }

  private async getParty(request: Request): Promise<Party> {
    const parties = await this.connection
      .getRepository(Party)
      .find({
        where: { slug: request.params.partySlug || request.params.slug },
        relations: ['members', 'members.user'],
      });
    return parties[0];
  }
}
