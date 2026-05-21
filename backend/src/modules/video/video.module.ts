import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VideoRoom } from './entities/video-room.entity';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoGateway } from './video.gateway';
import { NotificationModule } from '../notification/notification.module';
import { ProjectMemberModule } from '../project-member/project-member.module';
import { AuthModule } from '../auth/auth.module';
import { Project } from '../project/entities/project.entity';
import { MeetingSchedule } from '../meeting/entities/meeting-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoRoom, Project, MeetingSchedule]),
    ConfigModule,
    NotificationModule,
    ProjectMemberModule,
    AuthModule,
  ],
  providers: [VideoService, VideoGateway],
  controllers: [VideoController],
  exports: [VideoGateway],
})
export class VideoModule {}
