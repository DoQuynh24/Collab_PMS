import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from '../auth/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { MailService } from '../project-invitation/mail/mail.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    private notificationService: NotificationService,
    private mailService: MailService,
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
      parent_id: dto.parent_id,
    });

    const saved = await this.commentRepo.save(comment);

    const commenter = await this.userRepo.findOne({ where: { user_id: userId } });
    const project = await this.projectRepo.findOne({ where: { project_id: task.project_id } });
    const commenterName = commenter?.name ?? 'Ai đó';
    const projectName = project?.name ?? 'dự án';

    const recipientIds = Array.from(
      new Set([task.assignee_id, task.created_by].filter((id): id is number => !!id && id !== userId))
    );
    if (recipientIds.length > 0) {
      await this.notificationService.createMany({
        user_ids: recipientIds,
        type: 'new_comment',
        title: `Bình luận mới trong dự án "${projectName}"`,
        body: `${commenterName} đã bình luận trên nhiệm vụ "${task.title}".`,
        project_id: task.project_id,
        entity_id: task.task_id,
      });
    }

    const mentionedIds = dto.mentioned_user_ids ?? [];
    const uniqueMentionIds = mentionedIds.filter(id => id !== userId);
    if (uniqueMentionIds.length > 0) {
      await this.notificationService.createMany({
        user_ids: uniqueMentionIds,
        type: 'new_comment',
        title: `Bình luận mới trong dự án "${projectName}"`,
        body: `${commenterName} đã nhắc đến bạn trong bình luận của nhiệm vụ "${task.title}".`,
        project_id: task.project_id,
        entity_id: task.task_id,
      });

      const mentionedUsers = await this.userRepo.findByIds(uniqueMentionIds);
      for (const user of mentionedUsers) {
        await this.mailService.sendMention({
          to: user.email,
          mentionerName: commenterName,
          taskTitle: task.title,
          projectName,
          projectId: task.project_id,
          taskId: task.task_id,
          commentContent: dto.content,
        });
      }
    }

    return saved;
  }

  async findByTask(taskId: number) {
    return this.commentRepo.find({
      where: { task_id: taskId },
      relations: ['user', 'parent', 'parent.user'],
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