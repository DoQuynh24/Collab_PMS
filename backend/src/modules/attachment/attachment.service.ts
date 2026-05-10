import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskAttachment } from './entities/task-attachment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { Project } from '../project/entities/project.entity';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(TaskAttachment)
    private attachmentRepo: Repository<TaskAttachment>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    private cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    taskId: number,
    userId: number,
    file: Express.Multer.File,
  ): Promise<TaskAttachment> {
    const result = await this.cloudinaryService.uploadFile(
      file,
      `collab-pms/tasks/${taskId}`,
    );

    const fileType = this.cloudinaryService.getFileType(file.mimetype);

    const attachment = this.attachmentRepo.create({
      task_id: taskId,
      uploaded_by: userId,
      file_name: file.originalname,
      file_url: result.secure_url,
      public_id: result.public_id,
      file_type: fileType,
      mime_type: file.mimetype,
      file_size: file.size,
    });

    return this.attachmentRepo.save(attachment);
  }

  async findByTask(taskId: number): Promise<TaskAttachment[]> {
    return this.attachmentRepo.find({
      where: { task_id: taskId },
      relations: ['uploader'],
      order: { created_at: 'DESC' },
    });
  }

  async delete(attachmentId: number, userId: number): Promise<void> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');

    const task = await this.taskRepo.findOne({ where: { task_id: attachment.task_id } });
    if (!task) throw new NotFoundException('Task not found');

    const project = await this.projectRepo.findOne({ where: { project_id: task.project_id } });
    const isOwner = project?.owner_id === userId;

    const isAdmin = !!(await this.memberRepo.findOne({
      where: { project_id: task.project_id, user_id: userId, role: 'admin' },
    }));

    const isUploader = attachment.uploaded_by === userId;
    const isTaskCreator = task.created_by === userId;

    if (!isUploader && !isTaskCreator && !isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only the uploader, task creator, Admin or Owner can delete this attachment.',
      );
    }

    if (attachment.public_id) {
      const resourceType = attachment.file_type === 'image' ? 'image' : 'raw';
      await this.cloudinaryService.deleteFile(attachment.public_id, resourceType);
    }

    await this.attachmentRepo.remove(attachment);
  }
}
