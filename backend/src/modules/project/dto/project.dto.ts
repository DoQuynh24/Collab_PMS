import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ProjectDto {
  @IsOptional()
  @IsString()
  @Length(8, 8)
  project_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  end_date?: string | null;

  @IsEnum(['private', 'public'])
  access: 'private' | 'public';
}