import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { GlobalTaskStatus } from '../task-status/entities/gobal-task-status.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(GlobalTaskStatus)
    private globalStatusRepo: Repository<GlobalTaskStatus>,

    @InjectRepository(ProjectTaskStatus)
    private projectStatusRepo: Repository<ProjectTaskStatus>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

  ) {}

  async create(dto: CreateProjectDto, userId: number) {
    const project = this.projectRepository.create({
    project_id: dto.project_id || this.generateProjectId(),
    name: dto.name,
    description: dto.description,
    start_date: new Date(dto.start_date),
    end_date: dto.end_date
        ? new Date(dto.end_date)
        : undefined,
    access: dto.access,
    status: 'active',
    owner_id: userId,
    });

    await this.projectRepository.save(project);

    const globalStatuses = await this.globalStatusRepo.find();

    const projectStatuses = globalStatuses.map((status, index) => ({
    project_id: project.project_id,
    name: status.name,
    order_index: index,
  }));

  await this.projectStatusRepo.save(projectStatuses);

  return this.findOne(project.project_id, userId);
  }

  async createTask(
    projectId: string,
    dto: CreateTaskDto,
    userId: number,
  ) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = this.taskRepo.create({
      ...dto,
      project_id: projectId,
      created_by: userId
    });

    return this.taskRepo.save(task);
  }

  async findAll(userId: number) {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.project_members', 'members')
      .where('project.status = :status', { status: 'active' })
      .andWhere(
        '(project.owner_id = :userId OR members.user_id = :userId)',
        { userId },
      )
      .orderBy('project.created_at', 'DESC')
      .getMany();
  }

  async findOne(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['owner', 'project_members', 'project_members.user', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found`,
      );
    }

    const isOwner = project.owner_id === userId;
    const isMember = project.project_members.some(
      (m) => m.user_id === userId,
    );

    if (!isOwner && !isMember) {
      throw new UnauthorizedException(
        'You do not have access to this project',
      );
    }

    return project;
  }

  async getProjectTaskStatuses(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.owner_id === userId;
    const isMember = project.project_members.some(
      (m) => m.user_id === userId,
    );

    if (!isOwner && !isMember) {
      throw new UnauthorizedException(
        'You do not have access to this project',
      );
    }

    const statuses = await this.projectStatusRepo.find({
      where: { project_id: projectId },
      order: { order_index: 'ASC' },
    });

    return {
      data: statuses,
      error: false,
      message: 'Get project task statuses successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async getTasksByProject(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.owner_id === userId;
    const isMember = project.project_members.some(m => m.user_id === userId);

    if (!isOwner && !isMember) {
      throw new UnauthorizedException('You do not have access to this project');
    }

    return this.taskRepo.find({
      where: { project_id: projectId },
      relations: ['assignee', 'priority', 'status'],
      order: { order_index: 'ASC' },
    });
  }

  async update(
    projectId: string,
    dto: UpdateProjectDto,
    userId: number,
  ) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found`,
      );
    }

    if (project.owner_id !== userId) {
      throw new UnauthorizedException(
        'Only owner can update project',
      );
    }

    Object.assign(project, dto);

    return this.projectRepository.save(project);
  }

  async remove(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found`,
      );
    }

    if (project.owner_id !== userId) {
      throw new UnauthorizedException(
        'Only owner can archive project',
      );
    }

    project.status = 'archived';

    return this.projectRepository.save(project);
  }

  private generateProjectId(): string {
    return (
      'PROJ' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  }
}