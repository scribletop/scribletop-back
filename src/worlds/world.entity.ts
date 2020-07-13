import { ApiProperty } from '@nestjs/swagger';
import * as slugify from '@sindresorhus/slugify';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { nanoid } from 'nanoid';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('worlds')
export class World {
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

  @Column({ type: 'text' })
  @ApiProperty()
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  description: string;

  @Column({ nullable: true })
  @ApiProperty()
  @IsOptional({ always: true })
  @IsUrl({}, { always: true })
  image: string;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = `${nanoid(4)}-${slugify(this.name)}`;
  }
}
