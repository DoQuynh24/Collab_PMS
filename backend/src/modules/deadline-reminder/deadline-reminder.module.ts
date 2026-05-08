import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { DeadlineReminderService } from './deadline-reminder.service';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../project-invitation/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, ProjectTaskStatus]),
    NotificationModule,
    MailModule,
  ],
  providers: [DeadlineReminderService],
})
export class DeadlineReminderModule {}
