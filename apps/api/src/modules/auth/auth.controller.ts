import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthenticatedUser } from './access-token';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { EmailDto } from './email.dto';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import { VerifyEmailDto } from './verify-email.dto';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  register(@Body() request: RegisterDto) {
    return this.auth.register(request);
  }

  @Post('email/verification/resend')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  resendVerification(@Body() request: EmailDto) {
    return this.auth.resendVerification(request.email);
  }

  @Post('email/verification/check')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verifyEmail(@Body() request: VerifyEmailDto) {
    return this.auth.verifyEmail(request.token);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() request: LoginDto) {
    return this.auth.login(request);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.auth.getProfile(request.user.id);
  }
}
