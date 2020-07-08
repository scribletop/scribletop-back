import { ApiProperty } from '@nestjs/swagger';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  password: string;

  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    this.password = await hash(this.password, 12);
  }
}
