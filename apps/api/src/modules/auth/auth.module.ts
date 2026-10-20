import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PhoneVerificationService } from './phone-verification.service';

@Module({
  controllers: [AuthController],
  providers: [PhoneVerificationService],
})
export class AuthModule {}
