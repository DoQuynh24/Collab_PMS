import { Controller, Patch, Param, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectInvitationService } from './project-invitation.service';
import { Request } from 'express';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly service: ProjectInvitationService) {}

  private getUserId(req: Request & { user: { sub: string } }): number {
    const userId = Number(req.user.sub);
    if (isNaN(userId) || userId <= 0) throw new UnauthorizedException('Invalid user ID');
    return userId;
  }

  @Patch('accept/:token')
  @UseGuards(AuthGuard('jwt'))
  async accept(
    @Param('token') token: string,
    @Req() req: Request & { user?: { sub: string } }, 
  ) {
    const currentUserId = req.user ? Number(req.user.sub) : null;

    return this.service.accept(token, currentUserId);
  }
}