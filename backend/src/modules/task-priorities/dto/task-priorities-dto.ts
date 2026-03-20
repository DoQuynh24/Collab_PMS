import { IsInt, IsOptional, IsString } from 'class-validator';

export class TaskPriorityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  order_index?: number;
}