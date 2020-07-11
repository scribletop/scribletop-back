import { ApiProperty } from '@nestjs/swagger';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartyMember } from '../parties/party-member.entity';
import { Party } from '../parties/party.entity';

export enum UserStatus {
  EMAIL_NOT_VALIDATED,
  ACTIVE,
  INACTIVE,
  BANNED,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ unique: true })
  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  @IsEmail({}, { always: true })
  email: string;

  @Column({ unique: true })
  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  username: string;

  @Column()
  @ApiProperty({ writeOnly: true })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  @MinLength(3)
  password: string;

  @Column({ type: 'smallint' })
  @Exclude()
  status: UserStatus;

  @CreateDateColumn()
  dateCreated: Date;

  @UpdateDateColumn()
  dateUpdated: Date;

  @OneToMany(() => PartyMember, (party) => party.user)
  parties: PartyMember[];

  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    this.status = UserStatus.EMAIL_NOT_VALIDATED;
    this.password = await hash(this.password, 12);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
