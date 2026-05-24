import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, IsArray } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  start_time: string;

  @IsArray()
  @IsInt({ each: true })
  participant_ids: number[];
}

export class CheckMeetingConflictsDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsDateString()
  start_time: string;

  @IsArray()
  @IsInt({ each: true })
  participant_ids: number[];
}
