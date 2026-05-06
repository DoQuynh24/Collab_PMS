import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @IsOptional()
  @IsArray()
  mentioned_user_ids?: number[];
}