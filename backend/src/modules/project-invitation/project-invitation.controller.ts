import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, UnauthorizedException, Res, Query, BadRequestException } from '@nestjs/common';import { ProjectInvitationService } from './project-invitation.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import type { Response } from 'express';
import { CreateInvitationDto } from './dto/create-project-invitation';

@Controller('projects/join-requests')
export class JoinRequestPublicController {
  constructor(private readonly service: ProjectInvitationService) {}

  @Get(':token/handle')
  async handleDirect(
    @Param('token') token: string,
    @Query('action') action: string,
    @Res() res: Response,
  ) {
    try {
      let result: { project_id: string };

      if (action === 'approve') {
        result = await this.service.approveJoinRequestDirect(token);
      } else if (action === 'reject') {
        result = await this.service.rejectJoinRequestDirect(token);
      } else {
        throw new BadRequestException('Invalid action');
      }

      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/projects/${result.project_id}/board`);

    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL;
      
      return res.redirect(
        `${frontendUrl}/error?message=${encodeURIComponent(error.message || 'Something went wrong')}&type=join-request`
      );
    }
  }
}

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

  @Get('join-requests')
  async getJoinRequests(@Param('projectId') projectId: string) {
    return this.service.getJoinRequests(projectId);
  }

  @Patch('join-requests/:token/approve')
  async approveJoinRequest(
    @Param('token') token: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.approveJoinRequest(token, this.getUserId(req));
  }

  @Patch('join-requests/:token/reject')
  async rejectJoinRequest(
    @Param('token') token: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.service.rejectJoinRequest(token, this.getUserId(req));
  }
}