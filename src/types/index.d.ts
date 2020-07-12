import { PartyMember } from '../parties/party-member.entity';
import { Party } from '../parties/party.entity';
import { System } from '../systems/system.entity';
import { User } from '../users/user.entity';

export type Entity = typeof User | typeof Party | typeof PartyMember | typeof System;
