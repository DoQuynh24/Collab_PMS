import { IsEmail, IsEnum } from 'class-validator';

export class InvitationDto {
  project_id: string;

  @IsEmail()
  invited_email: string;

  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
}