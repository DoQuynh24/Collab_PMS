import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectInvitation } from './entities/project-invitation.entity';
import { ProjectMember } from '../project-member/entities/project-member.entity';
import { Project } from '../project/entities/project.entity';
import { User } from '../auth/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateInvitationDto } from './dto/create-project-invitation';
import { MailService } from './mail/mail.service';

@Injectable()
export class ProjectInvitationService {
  constructor(
    @InjectRepository(ProjectInvitation)
    private invitationRepo: Repository<ProjectInvitation>,

    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private mailService: MailService,
  ) {}

  async invite(dto: CreateInvitationDto, currentUserId: number) {
    const project = await this.projectRepo.findOne({ where: { project_id: dto.project_id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== currentUserId) throw new UnauthorizedException('Only owner can invite');

    const user = await this.userRepo.findOne({ where: { email: dto.invited_email } });
    if (user) {
      const existing = await this.memberRepo.findOne({
        where: { project_id: dto.project_id, user_id: user.user_id },
      });
      if (existing) throw new ConflictException('User is already a member');
    }

    const existingInvitation = await this.invitationRepo.findOne({
      where: { project_id: dto.project_id, invited_email: dto.invited_email, status: 'pending' },
    });
    if (existingInvitation) throw new ConflictException('Invitation already sent');

    const token = uuidv4();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); 

    const invitation = this.invitationRepo.create({
      project_id: dto.project_id,
      invited_by_user_id: currentUserId,
      invited_email: dto.invited_email,
      token,
      expires_at,
    });
    await this.invitationRepo.save(invitation);

    const inviter = await this.userRepo.findOne({ where: { user_id: currentUserId } });

    await this.mailService.sendInvitation({
    to: dto.invited_email,
    projectName: project.name,
    token,
    inviterName: inviter?.name || 'Ai đó',
    });
    return { message: 'Invitation sent successfully' };
  }

  async accept(token: string, currentUserId: number | null) {
    const invitation = await this.invitationRepo.findOne({ where: { token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'pending') throw new BadRequestException('Invitation already responded');
    if (new Date() > invitation.expires_at) throw new BadRequestException('Invitation expired');

    let user: User | null = null;

    if (currentUserId) {
      user = await this.userRepo.findOne({ where: { user_id: currentUserId } });
      if (!user) throw new UnauthorizedException('User not found');
      if (user.email !== invitation.invited_email) {
        throw new UnauthorizedException('This invitation is not for your email');
      }
    } else {
      throw new UnauthorizedException('Please login to accept this invitation');
    }

    invitation.status = 'accepted';
    invitation.accepted_at = new Date();
    await this.invitationRepo.save(invitation);

    const existingMember = await this.memberRepo.findOne({
      where: { project_id: invitation.project_id, user_id: user.user_id },
    });

    if (!existingMember) {
      const member = this.memberRepo.create({
        project_id: invitation.project_id,
        user_id: user.user_id,
        role: 'member',
      });
      await this.memberRepo.save(member);
    }

    return { message: 'Invitation accepted', project_id: invitation.project_id };
  }
}