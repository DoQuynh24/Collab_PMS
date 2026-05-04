import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import type { NotificationType } from '../entities/notification.entity';

export class NotificationDto {
  @IsNumber()
  id: number;

  @IsNumber()
  user_id: number;

  @IsEnum(['join_request_received', 'join_request_approved', 'join_request_rejected'])
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  project_id?: string;

  @IsBoolean()
  is_read: boolean;

  created_at: Date;
}
