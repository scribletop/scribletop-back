import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Action, Feature } from '@nestjsx/crud';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';

export class ValidateEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}

export class CreateValidationTokenDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

@Feature('Auth')
@Controller({ path: 'auth' })
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @UseGuards(LocalGuard)
  @Action('Login')
  @Post('')
  login(@Request() request: { user: Partial<User> }): Partial<User> {
    return { username: request.user.username };
  }

  @Post('validate')
  @Action('Validate-Email')
  @UsePipes(ValidationPipe)
  validate(@Body() body: ValidateEmailDto): Promise<void> {
    return this.usersService.validateEmail(body.email, body.token);
  }

  @Post('validation-token')
  @Action('Generate-Validation-Token')
  @UsePipes(ValidationPipe)
  createValidationToken(@Body() body: CreateValidationTokenDto): void {
    if (!!this.usersService.getUserWithNotValidatedEmail(body.email)) {
      return;
    }

    const token = this.usersService.generateEmailValidationToken(body.email);
    console.log(token);
  }
}
