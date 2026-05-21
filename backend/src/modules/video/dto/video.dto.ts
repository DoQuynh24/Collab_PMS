import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class StartCallDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @IsOptional()
  @IsInt()
  meeting_id?: number;
}

export class JoinCallDto {
  @IsString()
  @IsNotEmpty()
  channel_name: string;
}
