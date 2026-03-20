import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from './entities/project.entity';
import { GlobalTaskStatus } from '../task-status/entities/gobal-task-status.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, GlobalTaskStatus, ProjectTaskStatus, Task]), 
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [
    ProjectService,
    TypeOrmModule.forFeature([Project]),
  ],
})
export class ProjectModule {}