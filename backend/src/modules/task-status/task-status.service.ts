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
    const count = await this.repo.count({
      where: { project_id: dto.project_id },
    });
  
    const status = this.repo.create({
      ...dto,
      order_index: count,
    });
  
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

  async reorder(projectId: string, orderedIds: number[]) {
    const updates = orderedIds.map((id, index) =>
      this.repo.update(id, { order_index: index })
    );
    await Promise.all(updates);
    return this.repo.find({
      where: { project_id: projectId },
      order: { order_index: 'ASC' },
    });
  }
 
}