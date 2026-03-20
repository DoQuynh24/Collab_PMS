import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskPriority } from '../modules/task-priorities/entities/task-priority.entity';
import { GlobalTaskStatus } from 'src/modules/task-status/entities/gobal-task-status.entity';

@Injectable()
export class DatabaseSeed implements OnModuleInit {
  constructor(
    @InjectRepository(TaskPriority)
    private readonly priorityRepo: Repository<TaskPriority>,

    @InjectRepository(GlobalTaskStatus)
    private readonly statusRepo: Repository<GlobalTaskStatus>,
  ) {}

  async onModuleInit() {
    await this.seedPriorities();
    await this.seedStatuses();
  }

  private async seedPriorities() {
    const count = await this.priorityRepo.count();

    if (count === 0) {
      await this.priorityRepo.save([
        { name: 'LOW', color: 'green', order_index: 1 },
        { name: 'MEDIUM', color: 'yellow', order_index: 2 },
        { name: 'HIGH', color: 'red', order_index: 3 },
      ]);
    }
  }

  private async seedStatuses() {
    const count = await this.statusRepo.count();

    if (count === 0) {
      await this.statusRepo.save([
        { name: 'BACKLOG' },
        { name: 'TODO' },
        { name: 'IN_PROGRESS' },
        { name: 'DONE' },
      ]);
    }
  }
}