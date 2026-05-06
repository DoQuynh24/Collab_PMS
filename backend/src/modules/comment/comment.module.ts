import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { User } from '../auth/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task, ProjectMember, User, Project]),
    NotificationModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}