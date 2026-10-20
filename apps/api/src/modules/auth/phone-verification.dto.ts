import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber!: string;
}
