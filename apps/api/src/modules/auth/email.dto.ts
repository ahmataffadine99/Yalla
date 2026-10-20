import { IsEmail, MaxLength } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
