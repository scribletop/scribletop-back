import { ApiProperty } from '@nestjs/swagger';
import * as slugify from '@sindresorhus/slugify';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { nanoid } from 'nanoid';
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RelationId } from 'typeorm/index';
import { Party } from '../parties/party.entity';
import { System } from '../systems/system.entity';
import { World } from '../worlds/world.entity';

export enum GameType {
  ONE_SHOT,
  ADVENTURE,
  CAMPAIGN,
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ readOnly: true })
  slug: string;

  @Column()
  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  @MinLength(3, { always: true })
  name: string;

  @Column({ type: 'smallint' })
  @ApiProperty()
  @IsNotEmpty({ always: true })
  type: GameType;

  @ManyToOne(/* istanbul ignore next */ () => World)
  @ApiProperty()
  world: World;

  @ManyToOne(/* istanbul ignore next */ () => System)
  @ApiProperty()
  system: System;

  @ManyToOne(/* istanbul ignore next */ () => Party)
  @Exclude()
  party: Party;

  @Column()
  @RelationId(/* istanbul ignore next */ (pm: Game) => pm.world)
  @Exclude({ toPlainOnly: true })
  worldId!: number;

  @Column()
  @RelationId(/* istanbul ignore next */ (pm: Game) => pm.party)
  @Exclude({ toPlainOnly: true })
  partyId!: number;

  @Column()
  @RelationId(/* istanbul ignore next */ (pm: Game) => pm.system)
  @Exclude({ toPlainOnly: true })
  systemId!: number;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = `${nanoid(4)}-${slugify(this.name)}`;
  }
}
