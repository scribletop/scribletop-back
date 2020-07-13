import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Party } from './party.entity';

export enum Role {
  dm,
  player,
}

@Entity('party_user')
export class PartyMember {
  @PrimaryColumn()
  @RelationId(/* istanbul ignore next */ (pm: PartyMember) => pm.party)
  @Exclude({ toPlainOnly: true })
  partyId!: number;

  @PrimaryColumn()
  @RelationId(/* istanbul ignore next */ (pm: PartyMember) => pm.user)
  @Exclude({ toPlainOnly: true })
  userId!: number;

  @Column({ type: 'smallint' })
  role!: Role;

  @ManyToOne(
    /* istanbul ignore next */ () => User,
    /* istanbul ignore next */ (user) => user.parties,
  )
  user!: User;

  @ManyToOne(
    /* istanbul ignore next */ () => Party,
    /* istanbul ignore next */ (party) => party.members,
  )
  party!: Party;

  @CreateDateColumn()
  @Exclude()
  dateCreated: Date;

  @UpdateDateColumn()
  @Exclude()
  dateUpdated: Date;
}
