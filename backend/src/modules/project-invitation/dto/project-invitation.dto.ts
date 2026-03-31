import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class InvitationDto {
  @IsOptional()
  @IsString()
  project_id: string;

  @IsEmail()
  invited_email: string;

  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
}