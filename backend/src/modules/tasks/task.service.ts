import {
  ForbiddenException,
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
import { User } from '../auth/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../project-invitation/mail/mail.service';

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

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private notificationService: NotificationService,
    private mailService: MailService,
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
      deadline: dto.deadline || undefined,
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

  async findAssignedToMe(userId: number) {
    const tasks = await this.taskRepo.find({
      where: { assignee_id: userId, is_archived: false },
      relations: ['priority', 'status', 'project'],
      order: { updated_at: 'DESC' },
    });

    const projectIds = [...new Set(tasks.map(t => t.project_id))];
    const doneStatusMap = new Map<string, number>();

    for (const projectId of projectIds) {
      const lastStatus = await this.statusRepo.findOne({
        where: { project_id: projectId },
        order: { order_index: 'DESC' },
      });
      if (lastStatus) doneStatusMap.set(projectId, lastStatus.id);
    }

    return tasks.map(task => ({
      ...task,
      is_done: doneStatusMap.get(task.project_id) === task.status_id,
    }));
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

    const prevAssigneeId = task.assignee_id;
    const newAssigneeId = dto.assignee_id;
    const assigneeChanged = newAssigneeId !== undefined && newAssigneeId !== prevAssigneeId;

    const prevStatusId = task.status_id;
    const prevStatus = await this.statusRepo.findOne({ where: { id: prevStatusId } });
    const prevStatusName = prevStatus?.name ?? '';

    Object.assign(task, dto);
    if (dto.deadline !== undefined) {
      task.deadline = dto.deadline ? (dto.deadline as any) : undefined;
    }

    const saved = await this.taskRepo.save(task);

    if (assigneeChanged && newAssigneeId) {
      const assigner = await this.userRepo.findOne({ where: { user_id: userId } });
      const assignerName = assigner?.name ?? 'Ai đó';
      const projectName = project?.name ?? 'dự án';

      const isSelfAssign = newAssigneeId === userId;
      const isCreatorSelfAssign = isSelfAssign && userId === task.created_by;

      if (!isCreatorSelfAssign) {
        if (!isSelfAssign) {
          await this.notificationService.create({
            user_id: newAssigneeId,
            type: 'assigned_task',
            title: `Bạn được giao nhiệm vụ trong dự án "${projectName}"`,
            body: `${assignerName} đã giao nhiệm vụ "${task.title}" cho bạn.`,
            project_id: task.project_id,
            entity_id: task.task_id,
          });

      const assignee = await this.userRepo.findOne({ where: { user_id: newAssigneeId } });
        if (assignee) {
          const canEmail = await this.notificationService.canReceiveEmail(newAssigneeId, task.project_id, 'assigned_task');
          if (canEmail) {
            await this.mailService.sendAssignedTask({
              to: assignee.email,
              assignerName,
              taskTitle: task.title,
              projectName,
              projectId: task.project_id,
              taskId: task.task_id,
            });
          }
        }

        if (task.created_by !== userId && task.created_by !== newAssigneeId) {
          await this.notificationService.create({
            user_id: task.created_by,
            type: 'assigned_task',
            title: `Nhiệm vụ do bạn tạo đã được giao`,
            body: `${assignerName} đã giao nhiệm vụ "${task.title}" cho ${assignee?.name ?? 'ai đó'}.`,
            project_id: task.project_id,
            entity_id: task.task_id,
          });
        }
      } else {
        if (task.created_by !== userId) {
          await this.notificationService.create({
            user_id: task.created_by,
            type: 'assigned_task',
            title: `Nhiệm vụ do bạn tạo đã được nhận`,
            body: `${assignerName} đã nhận nhiệm vụ "${task.title}".`,
            project_id: task.project_id,
            entity_id: task.task_id,
          });
        }
      }
    }
  }

    const newStatusId = dto.status_id;
    const statusChanged = newStatusId !== undefined && newStatusId !== prevStatusId;

    if (statusChanged && newStatusId) {
      const newStatus = await this.statusRepo.findOne({ where: { id: newStatusId } });
      const newStatusName = newStatus?.name ?? '';
      const changer = await this.userRepo.findOne({ where: { user_id: userId } });
      const changerName = changer?.name ?? 'Ai đó';
      const projectName = project?.name ?? 'dự án';

      const isAssignee = task.assignee_id === userId;

      if (!isAssignee && task.assignee_id) {
        await this.notificationService.create({
          user_id: task.assignee_id,
          type: 'status_changed',
          title: `Trạng thái nhiệm vụ đã thay đổi`,
          body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${prevStatusName}" sang "${newStatusName}".`,
          project_id: task.project_id,
          entity_id: task.task_id,
        });

        const assignee = await this.userRepo.findOne({ where: { user_id: task.assignee_id } });
        if (assignee) {
          const canEmail = await this.notificationService.canReceiveEmail(task.assignee_id, task.project_id, 'status_changed');
          if (canEmail) {
            await this.mailService.sendStatusChanged({
              to: assignee.email,
              changerName,
              taskTitle: task.title,
              projectName,
              projectId: task.project_id,
              taskId: task.task_id,
              newStatusName,
              oldStatusName: prevStatusName,
            });
          }
        }

        if (task.created_by !== userId && task.created_by !== task.assignee_id) {
          await this.notificationService.create({
            user_id: task.created_by,
            type: 'status_changed',
            title: `Trạng thái nhiệm vụ đã thay đổi`,
            body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${prevStatusName}" sang "${newStatusName}".`,
            project_id: task.project_id,
            entity_id: task.task_id,
          });
        }
      } else if (isAssignee && task.created_by !== userId) {
        await this.notificationService.create({
          user_id: task.created_by,
          type: 'status_changed',
          title: `Trạng thái nhiệm vụ đã thay đổi`,
          body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${prevStatusName}" sang "${newStatusName}".`,
          project_id: task.project_id,
          entity_id: task.task_id,
        });
      }
    }

    return saved;
  }

  async archive(taskId: number, userId: number) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
      relations: ['project'],
    });

    if (!task) throw new NotFoundException('Task not found');

    const isOwner = task.project.owner_id === userId;
    const isAdmin = await this.memberRepo.findOne({
      where: { project_id: task.project_id, user_id: userId, role: 'admin' },
    });
    const isCreator = task.created_by === userId;

    if (!isOwner && !isAdmin && !isCreator) {
      throw new ForbiddenException('Only task creator, admin or owner can archive this task');
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
      throw new ForbiddenException('Only project owner or admin can permanently delete this task');
    }

    await this.taskRepo.remove(task);
    return { message: 'Task has been permanently deleted' };
  }

  async move(taskId: number, dto: MoveTaskDto, userId?: number) {
    const task = await this.taskRepo.findOne({
      where: { task_id: taskId },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const prevStatusId = task.status_id;

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

    if (userId && dto.status_id !== prevStatusId) {
      const oldStatus = await this.statusRepo.findOne({ where: { id: prevStatusId } });
      const oldStatusName = oldStatus?.name ?? '';
      const newStatus = await this.statusRepo.findOne({ where: { id: dto.status_id } });
      const newStatusName = newStatus?.name ?? '';
      const changer = await this.userRepo.findOne({ where: { user_id: userId } });
      const changerName = changer?.name ?? 'Ai đó';
      const project = await this.projectRepo.findOne({ where: { project_id: task.project_id } });
      const projectName = project?.name ?? 'dự án';

      const isAssignee = task.assignee_id === userId;

      if (!isAssignee && task.assignee_id) {
        await this.notificationService.create({
          user_id: task.assignee_id,
          type: 'status_changed',
          title: `Trạng thái nhiệm vụ đã thay đổi`,
          body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${oldStatusName}" sang "${newStatusName}".`,
          project_id: task.project_id,
          entity_id: task.task_id,
        });

        const assignee = await this.userRepo.findOne({ where: { user_id: task.assignee_id } });
        if (assignee) {
          const canEmail = await this.notificationService.canReceiveEmail(task.assignee_id, task.project_id, 'status_changed');
          if (canEmail) {
            await this.mailService.sendStatusChanged({
              to: assignee.email,
              changerName,
              taskTitle: task.title,
              projectName,
              projectId: task.project_id,
              taskId: task.task_id,
              newStatusName,
              oldStatusName,
            });
          }
        }

        if (task.created_by !== userId && task.created_by !== task.assignee_id) {
          await this.notificationService.create({
            user_id: task.created_by,
            type: 'status_changed',
            title: `Trạng thái nhiệm vụ đã thay đổi`,
            body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${oldStatusName}" sang "${newStatusName}".`,
            project_id: task.project_id,
            entity_id: task.task_id,
          });
        }
      } else if (isAssignee && task.created_by !== userId) {
        await this.notificationService.create({
          user_id: task.created_by,
          type: 'status_changed',
          title: `Trạng thái nhiệm vụ đã thay đổi`,
          body: `${changerName} đã chuyển trạng thái nhiệm vụ "${task.title}" từ "${oldStatusName}" sang "${newStatusName}".`,
          project_id: task.project_id,
          entity_id: task.task_id,
        });
      }
    }

    return { message: "Task moved successfully" };
  }
}