import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController, ProjectPublicController } from './project.controller';
import { Project } from './entities/project.entity';
import { GlobalTaskStatus } from '../task-status/entities/gobal-task-status.entity';
import { ProjectTaskStatus } from '../task-status/entities/task-status.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../project-invitation/mail/mail.module';
import { ProjectInvitationModule } from '../project-invitation/project-invitation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, GlobalTaskStatus, ProjectTaskStatus, Task, ProjectMember, User]),
    MailModule,
    forwardRef(() => ProjectInvitationModule),
  ],
  controllers: [ProjectPublicController, ProjectController],
  providers: [ProjectService],
  exports: [
    ProjectService,
    TypeOrmModule.forFeature([Project]),
  ],
})
export class ProjectModule {}