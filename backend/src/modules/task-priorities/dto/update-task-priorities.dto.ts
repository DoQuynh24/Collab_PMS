import { PartialType } from '@nestjs/mapped-types'
import { TaskPriorityDto } from './task-priorities-dto';

export class UpdateTaskPrioritiesDto extends PartialType(TaskPriorityDto) {}