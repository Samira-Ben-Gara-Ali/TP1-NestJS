import { IsNotEmpty } from 'class-validator';

export class CredenialsDto {
  @IsNotEmpty()
  identifier: string;
  @IsNotEmpty()
  password: string;
}