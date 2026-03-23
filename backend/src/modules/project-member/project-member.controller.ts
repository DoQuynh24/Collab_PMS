import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectMemberService } from './project-member.service';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('projects/:projectId/members')
@UseGuards(AuthGuard('jwt'))
export class ProjectMemberController {
  constructor(private readonly service: ProjectMemberService) {}

  private getUserId(req: Request & { user: { sub: string } }): number {
    const userId = Number(req.user.sub);
    if (isNaN(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid user ID from token');
    }
    return userId;
  }

  @Post()
  async add(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectMemberDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    dto.project_id = projectId;
    return this.service.addMember(dto, this.getUserId(req));
  }

  @Patch(':memberId')
  async update(
    @Param('projectId') projectId: string,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateProjectMemberDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.updateMember(memberId, dto, this.getUserId(req));
  }

  @Delete(':memberId')
  async remove(
    @Param('projectId') projectId: string,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.removeMember(memberId, this.getUserId(req));
  }

  @Get()
  async findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }
}