import { PartialType } from '@nestjs/mapped-types'
import { ProjectTaskStatus } from '../entities/task-status.entity';

export class UpdateTaskStatusDto extends PartialType(ProjectTaskStatus) {}