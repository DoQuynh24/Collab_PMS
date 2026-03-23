import { Controller, Post, Patch, Param, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ProjectInvitationService } from './project-invitation.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateInvitationDto } from './dto/create-project-invitation';

@Controller('projects/:projectId/invitations')
@UseGuards(AuthGuard('jwt'))
export class ProjectInvitationController {
  constructor(private readonly service: ProjectInvitationService) {}

  private getUserId(req: Request & { user: { sub: string } }): number {
    const userId = Number(req.user.sub);
    if (isNaN(userId) || userId <= 0) throw new UnauthorizedException('Invalid user ID');
    return userId;
  }

  @Post()
  async invite(
    @Param('projectId') projectId: string,
    @Body() dto: CreateInvitationDto,
    @Req() req: Request & { user: { sub: string } },
  ) {
    dto.project_id = projectId;
    return this.service.invite(dto, this.getUserId(req));
  }

  @Patch('accept/:token')
  async accept(
    @Param('token') token: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.accept(token, this.getUserId(req));
  }

}