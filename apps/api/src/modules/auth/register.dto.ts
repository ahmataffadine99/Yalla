import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phoneNumber!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
