import { ApiProperty } from '@nestjs/swagger';
import * as slugify from '@sindresorhus/slugify';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartyMember } from './party-member.entity';

@Entity('parties')
export class Party {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ readOnly: true })
  slug: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @OneToMany(() => PartyMember, (member) => member.party, { cascade: true })
  members: PartyMember[];

  @CreateDateColumn()
  @Exclude()
  dateCreated: Date;

  @UpdateDateColumn()
  @Exclude()
  dateUpdated: Date;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = `${nanoid(4)}-${slugify(this.name)}`;
  }

  findMember(username: string): PartyMember {
    if (!this.members || this.members.length === 0) {
      throw new Error(
        `Party ${this.name} has no member. Either relation was not loaded or their is a bug in the system.`,
      );
    }

    return this.members.find((m) => m.user.username === username);
  }
}
