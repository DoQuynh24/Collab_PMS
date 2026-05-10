import {
  Controller, Post, Get, Delete, Param, UseGuards,
  Request, UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AttachmentService } from './attachment.service';
import { memoryStorage } from 'multer';

@Controller('attachments')
@UseGuards(AuthGuard('jwt'))
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('tasks/:taskId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.attachmentService.upload(taskId, req.user.user_id, file);
  }

  @Get('tasks/:taskId')
  async findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.attachmentService.findByTask(taskId);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.attachmentService.delete(id, req.user.user_id);
    return { message: 'Attachment deleted' };
  }
}
