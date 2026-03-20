import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Project } from '../project/entities/project.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { TaskPriority } from '../task-priorities/entities/task-priority.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskPriority,
      ProjectTaskStatus,
      Project,
      ProjectMember,
    ]),
  ],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}