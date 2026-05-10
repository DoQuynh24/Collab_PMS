import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { TaskAttachment } from './entities/task-attachment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { Project } from '../project/entities/project.entity';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskAttachment, Task, ProjectMember, Project]),
    PassportModule,
    ConfigModule,
  ],
  providers: [AttachmentService, CloudinaryService],
  controllers: [AttachmentController],
  exports: [AttachmentService],
})
export class AttachmentModule {}
