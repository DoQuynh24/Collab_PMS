import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Task, ProjectMember])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}