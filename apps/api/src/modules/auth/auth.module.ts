import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, EmailService],
})
export class AuthModule {}
