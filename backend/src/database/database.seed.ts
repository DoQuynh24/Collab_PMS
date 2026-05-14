import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { TaskPriority } from '../modules/task-priorities/entities/task-priority.entity';
import { GlobalTaskStatus } from 'src/modules/task-status/entities/gobal-task-status.entity';

@Injectable()
export class DatabaseSeed implements OnModuleInit {
  constructor(
    @InjectRepository(TaskPriority)
    private readonly priorityRepo: Repository<TaskPriority>,

    @InjectRepository(GlobalTaskStatus)
    private readonly statusRepo: Repository<GlobalTaskStatus>,

    private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    await this.seedPriorities();
    await this.seedStatuses();
    await this.createAfterProjectInsertTrigger();
  }

  private async seedPriorities() {
    const count = await this.priorityRepo.count();

    if (count === 0) {
      await this.priorityRepo.save([
        { name: 'Thấp', color: 'green', order_index: 1 },
        { name: 'Trung bình', color: 'yellow', order_index: 2 },
        { name: 'Cao', color: 'red', order_index: 3 },
      ]);
    }
  }

  private async seedStatuses() {
    const count = await this.statusRepo.count();

    if (count === 0) {
      await this.statusRepo.save([
        { name: 'Nhiệm vụ chờ' },
        { name: 'Cần làm' },
        { name: 'Đang làm' },
        { name: 'Hoàn thành' },
      ]);
    }
  }

  private async createAfterProjectInsertTrigger() {
    const triggerName = 'after_project_insert';

    const [exists] = await this.connection.query(`
      SELECT TRIGGER_NAME 
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = DATABASE() 
      AND TRIGGER_NAME = ?
    `, [triggerName]);

    if (exists && exists.TRIGGER_NAME) {
      return;
    }

    await this.connection.query(`
      CREATE TRIGGER ${triggerName}
      AFTER INSERT ON projects
      FOR EACH ROW
      BEGIN
          INSERT INTO project_members (project_id, user_id, role, created_at)
          VALUES (NEW.project_id, NEW.owner_id, 'admin', NOW());
      END
    `);
  }
}