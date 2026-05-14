import { IsString, IsNotEmpty } from 'class-validator';

export class StartCallDto {
  @IsString()
  @IsNotEmpty()
  project_id: string;
}

export class JoinCallDto {
  @IsString()
  @IsNotEmpty()
  channel_name: string;
}
