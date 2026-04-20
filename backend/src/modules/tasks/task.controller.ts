import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';

import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const userId = Number(req.user.sub);

    return this.service.create(dto, userId);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query('archived') archived?: string
  ) {
    const includeArchived = archived === 'true';
    return this.service.findByProject(projectId, includeArchived);
  }

  @Get('assigned-to-me')
  findAssignedToMe(@Req() req: Request & { user: { sub: string } }) {
    return this.service.findAssignedToMe(Number(req.user.sub));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.update(
      Number(id),
      dto,
      Number(req.user.sub),
    );
  }

  @Patch(':taskId/move')
  moveTask(
    @Param('taskId') taskId: number,
    @Body() dto: MoveTaskDto
  ) {
    return this.service.move(taskId, dto);
  }

  @Patch(':id/archive')
  archive(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.archive(Number(id), Number(req.user.sub));
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.remove(
      Number(id),
      Number(req.user.sub),
    );
  }
}