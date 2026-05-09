import { Controller, Get, Patch, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(@Request() req: any) {
    return this.notificationService.findByUser(req.user.user_id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.countUnread(req.user.user_id);
    return { count };
  }

  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    await this.notificationService.markAllRead(req.user.user_id);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  async markOneRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.markOneRead(Number(id), req.user.user_id);
    return { message: 'Notification marked as read' };
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.deleteOne(Number(id), req.user.user_id);
    return { message: 'Notification deleted' };
  }

  @Delete()
  async deleteAll(@Request() req: any) {
    await this.notificationService.deleteAll(req.user.user_id);
    return { message: 'All notifications deleted' };
  }

  @Get('preferences/:projectId')
  async getPreferences(@Param('projectId') projectId: string, @Request() req: any) {
    return this.notificationService.getPreference(req.user.user_id, projectId);
  }

  @Put('preferences/:projectId')
  async updatePreferences(
    @Param('projectId') projectId: string,
    @Body() body: {
      assigned_inapp?: boolean; assigned_email?: boolean;
      status_inapp?: boolean; status_email?: boolean;
      comment_inapp?: boolean;
      mention_inapp?: boolean; mention_email?: boolean;
      project_inapp?: boolean; project_email?: boolean;
    },
    @Request() req: any,
  ) {
    return this.notificationService.upsertPreference(req.user.user_id, projectId, body);
  }
}
