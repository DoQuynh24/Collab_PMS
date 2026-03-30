import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Project } from '../project/entities/project.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    @InjectRepository(ProjectTaskStatus)
    private statusRepo: Repository<ProjectTaskStatus>,
  ) {}

  async create(dto: CreateTaskDto, userId: number) {
    const project = await this.projectRepo.findOne({
      where: { project_id: dto.project_id },
    });

    if (!project)
      throw new NotFoundException('Project not found');

    const isMember = await this.memberRepo.findOne({
      where: {
        project_id: dto.project_id,
        user_id: userId,
      },
    });

    if (!isMember && project.owner_id !== userId)
      throw new UnauthorizedException('Not a project member');

    const lastTask = await this.taskRepo.findOne({
      where: {
        project_id: dto.project_id,
        status_id: dto.status_id,
      },
      order: { order_index: 'DESC' },
    });

    const orderIndex = lastTask ? lastTask.order_index + 1 : 0;

    const task = this.taskRepo.create({
      ...dto,
      deadline: dto.deadline
        ? new Date(dto.deadline)
        : undefined,
      created_by: userId,
      order_index: orderIndex,
    });

    return this.taskRepo.save(task);
  }

  async findByProject(projectId: string, includeArchived: boolean = false) {
    return this.taskRepo.find({
      where: { 
        project_id: projectId,
        is_archived: false
      },
      relations: ['assignee', 'priority', 'status', 'creator'],
      order: { order_index: 'ASC' },
    });
  }

  async update(taskId: number, dto: UpdateTaskDto, userId: number) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    const project = await this.projectRepo.findOne({
      where: { project_id: task.project_id },
    });
    const isMember = await this.memberRepo.findOne({
      where: { project_id: task.project_id, user_id: userId },
    });
    const isOwner = project?.owner_id === userId;

    if (!isMember && !isOwner) {
      throw new UnauthorizedException('Only project members can update task');
    }

    Object.assign(task, dto);
    if (dto.deadline) task.deadline = new Date(dto.deadline);

    return this.taskRepo.save(task);
  }

  async archive(taskId: number, userId: number) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
      relations: ['project'],
    });

    if (!task) throw new NotFoundException('Task not found');

    const isMember = await this.memberRepo.findOne({
      where: { project_id: task.project_id, user_id: userId },
    });

    if (!isMember && task.project.owner_id !== userId) {
      throw new UnauthorizedException('Only project members can archive task');
    }

    task.is_archived = true;
    await this.taskRepo.save(task);

    return { message: 'Task has been archived' };
  }

  async remove(taskId: number, userId: number) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
      relations: ['project'],
    });

    if (!task) throw new NotFoundException('Task not found');

    const isOwner = task.project.owner_id === userId;
    const isAdmin = await this.memberRepo.findOne({
      where: { 
        project_id: task.project_id, 
        user_id: userId, 
        role: 'admin' 
      },
    });

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('Only project owner or admin can permanently delete this task');
    }

    await this.taskRepo.remove(task);
    return { message: 'Task has been permanently deleted' };
  }

  async move(taskId: number, dto: MoveTaskDto) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const tasks = await this.taskRepo.find({
      where: {
        project_id: task.project_id,
        status_id: dto.status_id,
      },
      order: { order_index: "ASC" },
    });

    tasks.splice(dto.order_index, 0, task);

    for (let i = 0; i < tasks.length; i++) {
      tasks[i].order_index = i;
      tasks[i].status_id = dto.status_id;
    }

    await this.taskRepo.save(tasks);

    return { message: "Task moved successfully" };
  }
}