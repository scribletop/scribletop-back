import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  @MinLength(3, { always: true })
  name: string;

  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  world: string;

  @IsNotEmpty({ always: true })
  @IsString({ always: true })
  system: string;

  @IsNotEmpty({ always: true })
  type: number;
}
