import { IsInt } from "class-validator";

export class MoveTaskDto {
  @IsInt()
  status_id: number;

  @IsInt()
  order_index: number;
}