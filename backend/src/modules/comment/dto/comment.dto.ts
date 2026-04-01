import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;
}