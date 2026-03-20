import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  private getUserId(req: Request & { user: { sub: string } }): number {
    if (!req.user || !req.user.sub) {
      throw new UnauthorizedException('Token không có user ID');
    }

    const userId = Number(req.user.sub);
    if (isNaN(userId) || userId <= 0) {
      throw new UnauthorizedException('User ID không hợp lệ');
    }

    return userId;
  }

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.create(
      dto,
      Number(req.user.sub),
    );
  }

  @Post(':projectId/tasks')
  async createTask(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.createTask(
      projectId,
      dto,
      Number(req.user.sub),
    );
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.findAll(
      Number(req.user.sub),
    );
  }

  @Get(':projectId')
  async findOne(
    @Param('projectId') projectId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.findOne(
      projectId,
      Number(req.user.sub),
    );
  }

  @Get(':projectId/project-task-statuses')
  async getProjectStatuses(
    @Param('projectId') projectId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.getProjectTaskStatuses(
      projectId,
      Number(req.user.sub),
    );
  }

  @Get(':projectId/tasks')
  async getTasksByProject(
    @Param('projectId') projectId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.getTasksByProject(
      projectId,
      Number(req.user.sub),
    );
  }

  @Patch(':projectId')
  async update(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.update(
      projectId,
      dto,
      Number(req.user.sub),
    );
  }

  @Delete(':projectId')
  async remove(
    @Param('projectId') projectId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.projectService.remove(
      projectId,
      Number(req.user.sub),
    );
  }
}