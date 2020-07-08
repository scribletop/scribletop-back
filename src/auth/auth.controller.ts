import { Body, Controller, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from './local.guard';

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

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @UseGuards(LocalGuard)
  @Post('')
  login(@Request() request: { user: Partial<User> }): Partial<User> {
    return { username: request.user.username };
  }

  @Post('validate')
  @UsePipes(ValidationPipe)
  async validate(@Body() body: ValidateEmailDto): Promise<void> {
    await this.usersService.validateEmail(body.email, body.token);
  }

  @Post('validation-token')
  @UsePipes(ValidationPipe)
  createValidationToken(@Body() body: CreateValidationTokenDto): { token: string } {
    const token = this.usersService.generateEmailValidationToken(body.email);
    return { token };
  }
}
