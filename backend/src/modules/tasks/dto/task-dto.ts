import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  IsDateString,
} from 'class-validator';

export class TaskDto {
  @IsString()
  @Length(8, 8)
  project_id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  assignee_id?: number;

  @IsInt()
  priority_id: number;

  @IsInt()
  status_id: number;
}