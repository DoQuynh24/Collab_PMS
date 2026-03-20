import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskPriority } from './entities/task-priority.entity';
import { CreateTaskPriorityDto } from './dto/create-task-priorities.dto';

@Injectable()
export class TaskPriorityService {
  constructor(
    @InjectRepository(TaskPriority)
    private repo: Repository<TaskPriority>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { order_index: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateTaskPriorityDto) {
    const priority = this.repo.create(dto);
    return this.repo.save(priority);
  }

  async update(id: number, dto: CreateTaskPriorityDto) {
    const priority = await this.findOne(id);
    if (!priority)
      throw new NotFoundException('Priority not found');

    Object.assign(priority, dto);
    return this.repo.save(priority);
  }

  async remove(id: number) {
    const priority = await this.findOne(id);
    if (!priority)
      throw new NotFoundException('Priority not found');

    await this.repo.remove(priority);
    return { message: 'Priority deleted' };
  }
}