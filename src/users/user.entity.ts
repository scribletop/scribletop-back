import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { nanoid } from 'nanoid';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  @IsEmail({}, { always: true })
  email: string;

  @Column({ unique: true })
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  username: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  password: string;

  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    this.slug = nanoid(12);
    this.password = await hash(this.password, 12);
  }
}
