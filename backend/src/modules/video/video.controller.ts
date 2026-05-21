import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from './video.service';
import { StartCallDto, JoinCallDto } from './dto/video.dto';

@Controller('video')
@UseGuards(AuthGuard('jwt'))
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('start')
  startCall(@Body() dto: StartCallDto, @Req() req: any) {
    const { user_id, name, picture } = req.user;
    return this.videoService.startCall(dto.project_id, user_id, name, picture, dto.meeting_id);
  }

  @Post('join')
  joinCall(@Body() dto: JoinCallDto, @Req() req: any) {
    return this.videoService.joinCall(dto.channel_name, req.user.user_id);
  }

  @Post(':roomId/leave')
  leaveCall(@Param('roomId') roomId: string) {
    return this.videoService.leaveCall(Number(roomId));
  }

  @Post(':roomId/end')
  endCall(@Param('roomId') roomId: string, @Req() req: any) {
    return this.videoService.endCall(Number(roomId), req.user.user_id);
  }

  @Get('active/:projectId')
  getActiveRoom(@Param('projectId') projectId: string) {
    return this.videoService.getActiveRoom(projectId);
  }
}
