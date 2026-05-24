import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MeetingSchedule, MeetingParticipant } from './entities/meeting-schedule.entity';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { NotificationModule } from '../notification/notification.module';
import { ProjectMemberModule } from '../project-member/project-member.module';
import { MailModule } from '../project-invitation/mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Project } from '../project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingSchedule, MeetingParticipant, User, Project]),
    ConfigModule,
    NotificationModule,
    ProjectMemberModule,
    MailModule,
    AuthModule,
  ],
  providers: [MeetingService],
  controllers: [MeetingController],
  exports: [MeetingService],
})
export class MeetingModule {}
