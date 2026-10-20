import { Body, Controller, Post } from '@nestjs/common';
import { CheckPhoneVerificationDto } from './check-phone-verification.dto';
import { PhoneVerificationDto } from './phone-verification.dto';
import { PhoneVerificationService } from './phone-verification.service';

@Controller('auth/phone')
export class AuthController {
  constructor(private readonly phoneVerification: PhoneVerificationService) {}

  @Post('verification')
  startPhoneVerification(@Body() request: PhoneVerificationDto) {
    return this.phoneVerification.start(request.phoneNumber);
  }

  @Post('verification/check')
  checkPhoneVerification(@Body() request: CheckPhoneVerificationDto) {
    return this.phoneVerification.check(request.phoneNumber, request.code);
  }
}
