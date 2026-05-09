import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../project-invitation/mail/mail.service';

@Injectable()
export class DeadlineReminderService {
  private readonly logger = new Logger(DeadlineReminderService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ProjectTaskStatus)
    private statusRepo: Repository<ProjectTaskStatus>,

    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  @Cron('45 8 * * *')
  async handleDeadlineReminder() {
    this.logger.log('Running deadline reminder cron job...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);

    const tasks = await this.taskRepo.find({
      where: {
        deadline: Between(tomorrowStart, tomorrowEnd) as any,
        is_archived: false,
        deadline_reminded: false,
      },
      relations: ['project'],
    });

    if (tasks.length === 0) {
      this.logger.log('No upcoming deadline tasks found.');
      return;
    }

    const projectIds = [...new Set(tasks.map(t => t.project_id))];
    const doneStatusMap = new Map<string, number>();

    for (const projectId of projectIds) {
      const statuses = await this.statusRepo.find({
        where: { project_id: projectId },
        order: { order_index: 'DESC' },
        take: 1,
      });
      if (statuses.length > 0) {
        doneStatusMap.set(projectId, statuses[0].id);
      }
    }

    const deadlineStr = tomorrowStart.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    let sentCount = 0;

    for (const task of tasks) {
      const doneStatusId = doneStatusMap.get(task.project_id);
      if (doneStatusId && task.status_id === doneStatusId) continue;

      if (!task.assignee_id) continue;

      const assignee = await this.userRepo.findOne({ where: { user_id: task.assignee_id } });
      if (!assignee) continue;

      const projectName = task.project?.name ?? 'dự án';

      await this.notificationService.create({
        user_id: task.assignee_id,
        type: 'deadline_upcoming',
        title: `Nhiệm vụ sắp đến hạn vào ngày mai`,
        body: `Nhiệm vụ "${task.title}" trong dự án "${projectName}" sẽ đến hạn vào ${deadlineStr}.`,
        project_id: task.project_id,
        entity_id: task.task_id,
      });

      await this.mailService.sendDeadlineUpcoming({
        to: assignee.email,
        taskTitle: task.title,
        projectName,
        projectId: task.project_id,
        taskId: task.task_id,
        deadline: deadlineStr,
      });

      await this.taskRepo.update(task.task_id, { deadline_reminded: true });

      sentCount++;
    }

    this.logger.log(`Deadline reminder sent for ${sentCount} tasks.`);
  }

  @Cron('45 8 * * *')
  async handleOverdueReminder() {
    this.logger.log('Running overdue task reminder cron job...');

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const tasks = await this.taskRepo.find({
      where: {
        deadline: LessThan(todayStart) as any,
        is_archived: false,
        overdue_notified: false,
      },
      relations: ['project'],
    });

    if (tasks.length === 0) {
      this.logger.log('No overdue tasks found.');
      return;
    }

    const projectIds = [...new Set(tasks.map(t => t.project_id))];
    const doneStatusMap = new Map<string, number>();

    for (const projectId of projectIds) {
      const statuses = await this.statusRepo.find({
        where: { project_id: projectId },
        order: { order_index: 'DESC' },
        take: 1,
      });
      if (statuses.length > 0) {
        doneStatusMap.set(projectId, statuses[0].id);
      }
    }

    let sentCount = 0;

    for (const task of tasks) {
      const doneStatusId = doneStatusMap.get(task.project_id);
      if (doneStatusId && task.status_id === doneStatusId) {
        await this.taskRepo.update(task.task_id, { overdue_notified: true });
        continue;
      }

      if (!task.assignee_id) {
        await this.taskRepo.update(task.task_id, { overdue_notified: true });
        continue;
      }

      const assignee = await this.userRepo.findOne({ where: { user_id: task.assignee_id } });
      if (!assignee) {
        await this.taskRepo.update(task.task_id, { overdue_notified: true });
        continue;
      }

      const projectName = task.project?.name ?? 'dự án';
      const deadlineFormatted = new Date(task.deadline!).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });

      await this.notificationService.create({
        user_id: task.assignee_id,
        type: 'deadline_overdue',
        title: `Nhiệm vụ đã quá hạn`,
        body: `Nhiệm vụ "${task.title}" trong dự án "${projectName}" đã quá hạn vào ${deadlineFormatted}.`,
        project_id: task.project_id,
        entity_id: task.task_id,
      });

      await this.mailService.sendOverdueTask({
        to: assignee.email,
        taskTitle: task.title,
        projectName,
        projectId: task.project_id,
        taskId: task.task_id,
        deadline: deadlineFormatted,
      });

      await this.taskRepo.update(task.task_id, { overdue_notified: true });

      sentCount++;
    }

    this.logger.log(`Overdue reminder sent for ${sentCount} tasks.`);
  }
}
