import { PartialType } from '@nestjs/mapped-types'
import { TaskStatusDto } from './task-status-dto';

export class UpdateTaskStatusDto extends PartialType(TaskStatusDto) {}