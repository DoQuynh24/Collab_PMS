import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { ProjectTaskStatus } from './entities/task-status.entity';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(ProjectTaskStatus)
    private repo: Repository<ProjectTaskStatus>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateTaskStatusDto) {
    const status = this.repo.create(dto);
    return this.repo.save(status);
  }

  async update(id: number, dto: UpdateTaskStatusDto) {
    const status = await this.findOne(id);
    if (!status)
      throw new NotFoundException('Status not found');

    Object.assign(status, dto);
    return this.repo.save(status);
  }

  async remove(id: number) {
    const status = await this.findOne(id);
    if (!status)
      throw new NotFoundException('Status not found');

    await this.repo.remove(status);
    return { message: 'Status deleted' };
  }
}