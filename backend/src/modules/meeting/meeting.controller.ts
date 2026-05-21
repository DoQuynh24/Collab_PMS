import {
  Controller, Post, Get, Delete, Param, Body, UseGuards, Req, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/meeting.dto';

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto, @Req() req: any) {
    return this.meetingService.create(dto, req.user.user_id);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.meetingService.findByProject(projectId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingService.findOne(Number(id));
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.meetingService.cancel(Number(id), req.user.user_id);
  }
}
