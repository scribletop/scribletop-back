import { ApiProperty } from '@nestjs/swagger';
import slugify from '@sindresorhus/slugify';
import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  name: string;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = slugify(this.name);
  }
}
