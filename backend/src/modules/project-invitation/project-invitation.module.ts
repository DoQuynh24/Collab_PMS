import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ProjectInvitationService } from './project-invitation.service';
import { ProjectInvitationController, JoinRequestPublicController } from './project-invitation.controller';
import { ProjectModule } from '../project/project.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { MailModule } from './mail/mail.module';
import { InvitationController } from './invitation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectInvitation, ProjectMember]),
    forwardRef(() => ProjectModule),
    AuthModule,
    MailModule,
  ],
  providers: [ProjectInvitationService],
  controllers: [JoinRequestPublicController, ProjectInvitationController, InvitationController],
  exports: [ProjectInvitationService],
})
export class ProjectInvitationModule {}