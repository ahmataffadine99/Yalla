import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, EmailService],
})
export class AuthModule {}
