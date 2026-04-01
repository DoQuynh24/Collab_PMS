import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';

@Controller('comments')   
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly service: CommentService) {}

  @Post('tasks/:taskId')
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.create(taskId, dto, Number(req.user.sub));
  }

  @Get('tasks/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.service.findByTask(taskId);
  }

  @Delete(':commentId')
  remove(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.remove(commentId, Number(req.user.sub));
  }
}