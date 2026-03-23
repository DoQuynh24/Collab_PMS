import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ProjectInvitationService } from './project-invitation.service';
import { ProjectInvitationController } from './project-invitation.controller';
import { ProjectModule } from '../project/project.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { MailModule } from './mail/mail.module';
import { InvitationController } from './invitation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectInvitation, ProjectMember]),
    ProjectModule,
    AuthModule,
    MailModule,
  ],
  providers: [ProjectInvitationService],
  controllers: [ProjectInvitationController, InvitationController],
})
export class ProjectInvitationModule {}