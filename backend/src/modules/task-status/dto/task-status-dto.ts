import { IsNotEmpty, IsString } from 'class-validator';

export class TaskStatusDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;
  
  @IsString()
  name: string;
}