import {
  BadRequestException,
  ConflictException,
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
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { MailService } from '../project-invitation/mail/mail.service';
import { User } from '../auth/entities/user.entity';
import { ProjectInvitationService } from '../project-invitation/project-invitation.service';

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

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    private mailService: MailService,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private invitationService: ProjectInvitationService,
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

  async lookup(projectId: string) {
  const project = await this.projectRepository.findOne({
    where: { project_id: projectId },
    select: ['project_id', 'name', 'access', 'status', 'description'],
  });

  if (!project) throw new NotFoundException('Project not found');
  if (project.status === 'archived') throw new BadRequestException('This project has been archived');

  return project;
}

  async joinProject(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.status === 'archived') throw new BadRequestException('This project has been archived');

    const alreadyMember = project.project_members.some(
      (m) => Number(m.user_id) === Number(userId)
    );

    if (project.owner_id === userId || alreadyMember) {
      throw new ConflictException('You are already a member of this project');
    }

    if (project.access === 'public') {
      const member = this.memberRepo.create({
        project_id: projectId,
        user_id: userId,
        role: 'member',
      });

      await this.memberRepo.save(member);

      return { 
        type: 'joined', 
        message: 'Successfully joined the project' 
      };
    } 
    else {
      const requester = await this.userRepo.findOne({ where: { user_id: userId } });
      if (!requester) throw new NotFoundException('User not found');

      const token = await this.invitationService.createJoinRequest(projectId, requester);

      const owner = await this.userRepo.findOne({ where: { user_id: project.owner_id } });
      const admins = await this.memberRepo.find({
        where: { project_id: projectId, role: 'admin' },
        relations: ['user'],
      });

      const recipients = new Set<string>();
      if (owner?.email) recipients.add(owner.email);
      admins.forEach((m) => {
        if (m.user?.email) recipients.add(m.user.email);
      });

      await Promise.all(
        [...recipients].map((email) =>
          this.mailService.sendJoinRequest({
            to: email,
            projectName: project.name,
            requesterName: requester.name,
            requesterEmail: requester.email,
            token,
            projectId,
          })
        )
      );

      return { 
        type: 'requested', 
        message: 'Join request has been sent successfully' 
      };
    }
  }

  async findAllArchived(userId: number) {
    const accessibleProjects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.project_members', 'members')
      .where('project.status = :status', { status: 'archived' })
      .andWhere(
        '(project.owner_id = :userId OR members.user_id = :userId)',
        { userId },
      )
      .select('project.project_id')
      .getMany();

    if (accessibleProjects.length === 0) return [];

    const ids = accessibleProjects.map((p) => p.project_id);

    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.project_members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where('project.project_id IN (:...ids)', { ids })
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

  async getTasksByProject(projectId: string, userId: number, is_archived: boolean = false) {
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
      where: { 
        project_id: projectId,
        is_archived: false
      },
      relations: ['assignee', 'priority', 'status', 'creator'],
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

  async archiveProject(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isOwner = project.owner_id === userId;
    const isAdmin = project.project_members.some(
      (member) => member.user_id === userId && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('Only owner or admin can archive this project');
    }

    if (project.status === 'archived') {
      throw new BadRequestException('Project is already archived');
    }

    project.status = 'archived';

    return this.projectRepository.save(project);
  }

  async restoreProject(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) throw new NotFoundException(`Project with ID ${projectId} not found`);

    const isOwner = project.owner_id === userId;
    const isAdmin = project.project_members.some(
      (m) => m.user_id === userId && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('Only owner or admin can restore this project');
    }

    project.status = 'active';
    return this.projectRepository.save(project);
  }

  async remove(projectId: string, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { project_id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.owner_id !== userId) {
      throw new UnauthorizedException('Only owner can delete project');
    }

    await this.projectRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }

  private generateProjectId(): string {
    return (
      'PROJ' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  }
}