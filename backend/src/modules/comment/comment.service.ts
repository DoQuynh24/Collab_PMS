import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,
  ) {}

  async create(taskId: number, dto: CreateCommentDto, userId: number) {
    const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const isMember = await this.memberRepo.findOne({
      where: { project_id: task.project_id, user_id: userId },
    });
    if (!isMember) throw new UnauthorizedException('Not a project member');

    const comment = this.commentRepo.create({
      task_id: taskId,
      user_id: userId,
      content: dto.content,
      file_url: dto.file_url,
    });

    return this.commentRepo.save(comment);
  }

  async findByTask(taskId: number) {
    return this.commentRepo.find({
      where: { task_id: taskId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.commentRepo.findOne({ where: { comment_id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user_id !== userId) throw new UnauthorizedException('Only creator can delete comment');

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted' };
  }
}