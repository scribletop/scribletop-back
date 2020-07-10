import { ApiProperty } from '@nestjs/swagger';
import * as slugify from '@sindresorhus/slugify';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
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

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = slugify(this.name);
  }
}
