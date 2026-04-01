import { IsString, IsOptional } from 'class-validator';

export class CommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  file_url?: string;
}