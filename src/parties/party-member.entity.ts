import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { User } from '../users/user.entity';
import { Party } from './party.entity';

export enum Role {
  dm,
  player,
}

@Entity('party_user')
export class PartyMember {
  @PrimaryColumn()
  @RelationId((pm: PartyMember) => pm.party)
  @Exclude({ toPlainOnly: true })
  partyId!: number;

  @PrimaryColumn()
  @RelationId((pm: PartyMember) => pm.user)
  @Exclude({ toPlainOnly: true })
  userId!: number;

  @Column({ type: 'smallint' })
  role!: Role;

  @ManyToOne(() => User, (user) => user.parties)
  user!: User;

  @ManyToOne(() => Party, (party) => party.members)
  party!: Party;
}
