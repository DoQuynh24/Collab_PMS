import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskPriority } from './entities/task-priority.entity';
import { TaskPriorityService } from './task-priority.service';
import { TaskPriorityController } from './task-priority.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskPriority])],
  controllers: [TaskPriorityController],
  providers: [TaskPriorityService],
  exports: [TypeOrmModule], 
})
export class TaskPriorityModule {}