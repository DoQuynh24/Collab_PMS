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
import { NotificationService } from '../notification/notification.service';

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
    private notificationService: NotificationService,
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
      role: dto.role
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
        role: invitation.role,
      });
      await this.memberRepo.save(member);
    }

    return { message: 'Invitation accepted', project_id: invitation.project_id };
  }

  async createJoinRequest(projectId: string, requester: User): Promise<string> {
    await this.invitationRepo.delete({
      project_id: projectId,
      invited_email: requester.email,
      is_join_request: true,
      status: 'pending',
    });

    const token = uuidv4();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const req = this.invitationRepo.create({
      project_id: projectId,
      invited_by_user_id: requester.user_id,
      invited_email: requester.email,
      token,
      expires_at,
      role: 'member',
      is_join_request: true,
    });
    await this.invitationRepo.save(req);

    const project = await this.projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });
    if (project) {
      const adminUserIds = (project.project_members || [])
        .filter(m => m.role === 'admin')
        .map(m => m.user_id);
      const recipientIds = Array.from(new Set([project.owner_id, ...adminUserIds]));

      await this.notificationService.createMany({
        user_ids: recipientIds,
        type: 'join_request_received',
        title: 'Yêu cầu tham gia dự án',
        body: `${requester.name} đã gửi yêu cầu tham gia dự án "${project.name}".`,
        project_id: projectId,
      });
    }

    return token;
  }

  async getJoinRequests(projectId: string) {
    return this.invitationRepo.find({
      where: { project_id: projectId, is_join_request: true, status: 'pending' },
      relations: ['invitedBy'],
      order: { created_at: 'DESC' },
    });
  }

  async approveJoinRequest(token: string, adminId: number) {
    const req = await this.invitationRepo.findOne({ where: { token, is_join_request: true } });
    if (!req) throw new NotFoundException('Join request not found');
    if (req.status !== 'pending') throw new BadRequestException('Request already handled');

    const project = await this.projectRepo.findOne({
      where: { project_id: req.project_id },
      relations: ['project_members'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.owner_id === adminId;
    const isAdmin = project.project_members?.some(
      (m) => Number(m.user_id) === Number(adminId) && m.role === 'admin'
    );
    if (!isOwner && !isAdmin) throw new UnauthorizedException('Only owner or admin can approve');

    const user = await this.userRepo.findOne({ where: { email: req.invited_email } });
    if (!user) throw new NotFoundException('User not found');

    req.status = 'accepted';
    req.accepted_at = new Date();
    await this.invitationRepo.save(req);

    const existing = await this.memberRepo.findOne({
      where: { project_id: req.project_id, user_id: user.user_id },
    });
    if (!existing) {
      await this.memberRepo.save(
        this.memberRepo.create({ project_id: req.project_id, user_id: user.user_id, role: 'member' })
      );
    }

    await this.notificationService.create({
      user_id: user.user_id,
      type: 'join_request_approved',
      title: 'Yêu cầu tham gia được chấp nhận',
      body: `Yêu cầu tham gia dự án "${project.name}" của bạn đã được chấp nhận.`,
      project_id: req.project_id,
    });

    return { message: 'Join request approved', project_id: req.project_id };
  }

  async rejectJoinRequest(token: string, adminId: number) {
    const req = await this.invitationRepo.findOne({ where: { token, is_join_request: true } });
    if (!req) throw new NotFoundException('Join request not found');
    if (req.status !== 'pending') throw new BadRequestException('Request already handled');

    const project = await this.projectRepo.findOne({
      where: { project_id: req.project_id },
      relations: ['project_members'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.owner_id === adminId;
    const isAdmin = project.project_members?.some(
      (m) => Number(m.user_id) === Number(adminId) && m.role === 'admin'
    );
    if (!isOwner && !isAdmin) throw new UnauthorizedException('Only owner or admin can reject');

    req.status = 'rejected';
    await this.invitationRepo.save(req);

    const requesterUser = await this.userRepo.findOne({ where: { email: req.invited_email } });
    if (requesterUser) {
      await this.notificationService.create({
        user_id: requesterUser.user_id,
        type: 'join_request_rejected',
        title: 'Yêu cầu tham gia bị từ chối',
        body: `Yêu cầu tham gia dự án "${project.name}" của bạn đã bị từ chối.`,
        project_id: req.project_id,
      });
    }

    return { message: 'Join request rejected' };
  }

  async approveJoinRequestDirect(token: string) {
    const req = await this.invitationRepo.findOne({ where: { token, is_join_request: true } });
    if (!req) throw new NotFoundException('Yêu cầu không tồn tại');
    if (req.status !== 'pending') throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    if (new Date() > req.expires_at) throw new BadRequestException('Yêu cầu đã hết hạn');

    const user = await this.userRepo.findOne({ where: { email: req.invited_email } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    req.status = 'accepted';
    req.accepted_at = new Date();
    await this.invitationRepo.save(req);

    const existing = await this.memberRepo.findOne({
      where: { project_id: req.project_id, user_id: user.user_id },
    });
    if (!existing) {
      await this.memberRepo.save(
        this.memberRepo.create({ project_id: req.project_id, user_id: user.user_id, role: 'member' })
      );
    }
    return { message: 'Approved', project_id: req.project_id };
  }

  async rejectJoinRequestDirect(token: string) {
    const req = await this.invitationRepo.findOne({ where: { token, is_join_request: true } });
    if (!req) throw new NotFoundException('Yêu cầu không tồn tại');
    if (req.status !== 'pending') throw new BadRequestException('Yêu cầu đã được xử lý trước đó');

    req.status = 'rejected';
    await this.invitationRepo.save(req);
    return { message: 'Rejected', project_id: req.project_id };
  }
}
