import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CheckPhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
