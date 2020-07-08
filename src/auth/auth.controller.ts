import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { User } from '../users/user.entity';
import { AuthService, SuccessLogin } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { LocalGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('auth/login')
  async login(@Request() req: Request & { user: User }): Promise<SuccessLogin> {
    return this.authService.login(req.user);
  }
}
