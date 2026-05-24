import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository, Between,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { MeetingSchedule, MeetingParticipant } from './entities/meeting-schedule.entity';
import { CreateMeetingDto, CheckMeetingConflictsDto } from './dto/meeting.dto';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../project-invitation/mail/mail.service';
import { ProjectMemberService } from '../project-member/project-member.service';
import { User } from '../auth/entities/user.entity';
import { Project } from '../project/entities/project.entity';

export interface ParticipantConflictSummary {
  user_id: number;
  has_conflict: boolean;
}

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    @InjectRepository(MeetingSchedule)
    private meetingRepo: Repository<MeetingSchedule>,

    @InjectRepository(MeetingParticipant)
    private participantRepo: Repository<MeetingParticipant>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    private notificationService: NotificationService,
    private mailService: MailService,
    private memberService: ProjectMemberService,
  ) {}

  async create(dto: CreateMeetingDto, creatorId: number) {
    const project = await this.assertProjectAccess(dto.project_id, creatorId);
    const startTime = new Date(dto.start_time);
    if (startTime <= new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }

    const meeting = this.meetingRepo.create({
      project_id: dto.project_id,
      title: dto.title,
      description: dto.description ?? null,
      start_time: startTime,
      created_by: creatorId,
      status: 'scheduled',
    });
    await this.meetingRepo.save(meeting);

    let participantIds = Array.from(new Set(dto.participant_ids));
    if (!participantIds || participantIds.length === 0) {
      const members = await this.memberService.findByProject(dto.project_id);
      participantIds = members.map((m) => m.user_id);
    }

    participantIds = this.filterProjectParticipantIds(project, participantIds);

    if (participantIds.length === 0) {
      throw new BadRequestException('No valid participants selected');
    }

    const participants = participantIds.map((uid) =>
      this.participantRepo.create({ meeting_id: meeting.id, user_id: uid }),
    );
    await this.participantRepo.save(participants);

    const creator = await this.userRepo.findOne({ where: { user_id: creatorId } });
    const creatorName = creator?.name ?? 'Ai đó';
    const otherIds = participantIds.filter((id) => id !== creatorId);

    await this.notificationService.createMany({
      user_ids: otherIds,
      type: 'meeting_scheduled',
      title: `📅 ${creatorName} đã đặt lịch cuộc họp`,
      body: `"${meeting.title}" vào lúc ${this.formatTime(startTime)}`,
      project_id: dto.project_id,
      entity_id: meeting.id,
    });

    for (const uid of otherIds) {
      const user = await this.userRepo.findOne({ where: { user_id: uid } });
      if (!user) continue;
      await this.mailService.sendMeetingScheduled({
        to: user.email,
        creatorName,
        meetingTitle: meeting.title,
        description: meeting.description ?? '',
        startTime: this.formatTime(startTime),
        projectId: dto.project_id,
        meetingId: meeting.id,
      }).catch(() => {});
    }

    return this.findOne(meeting.id);
  }

  async checkConflicts(dto: CheckMeetingConflictsDto, requesterId: number): Promise<ParticipantConflictSummary[]> {
    const project = await this.assertProjectAccess(dto.project_id, requesterId);
    const startTime = new Date(dto.start_time);

    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid start time');
    }

    const participantIds = this.filterProjectParticipantIds(
      project,
      Array.from(new Set(dto.participant_ids)),
    );

    if (participantIds.length === 0) {
      return [];
    }

    const conflicts = await this.participantRepo
      .createQueryBuilder('participant')
      .innerJoin('participant.meeting', 'meeting')
      .select('participant.user_id', 'user_id')
      .where('participant.user_id IN (:...participantIds)', { participantIds })
      .andWhere('meeting.status = :status', { status: 'scheduled' })
      .andWhere('meeting.start_time = :startTime', { startTime })
      .groupBy('participant.user_id')
      .getRawMany<{ user_id: string }>();

    const conflictUserIds = new Set(conflicts.map((item) => Number(item.user_id)));

    return participantIds
      .sort((a, b) => a - b)
      .map((participantId) => ({
        user_id: participantId,
        has_conflict: conflictUserIds.has(participantId),
      }));
  }

  async findByProject(projectId: string, status?: string) {
    const where: any = { project_id: projectId };
    if (status && status !== 'all') {
      where.status = status;
    }
    return this.meetingRepo.find({
      where,
      relations: ['creator', 'participants', 'participants.user'],
      order: { start_time: 'ASC' },
    });
  }

  async findOne(id: number) {
    const meeting = await this.meetingRepo.findOne({
      where: { id },
      relations: ['creator', 'participants', 'participants.user'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async cancel(id: number, userId: number) {
    const meeting = await this.meetingRepo.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.created_by !== userId) {
      throw new ForbiddenException('Only the creator can cancel this meeting');
    }
    if (meeting.status !== 'scheduled') {
      throw new BadRequestException('Meeting is already cancelled or completed');
    }
    if (meeting.start_time <= new Date()) {
      throw new BadRequestException('Cannot cancel a meeting that has already started');
    }

    meeting.status = 'cancelled';
    await this.meetingRepo.save(meeting);

    const creator = await this.userRepo.findOne({ where: { user_id: userId } });
    const otherIds = meeting.participants
      .map((p) => p.user_id)
      .filter((uid) => uid !== userId);

    await this.notificationService.createMany({
      user_ids: otherIds,
      type: 'meeting_cancelled',
      title: `❌ Lịch họp đã bị hủy`,
      body: `"${meeting.title}" đã bị hủy bởi ${creator?.name ?? 'người tổ chức'}`,
      project_id: meeting.project_id,
      entity_id: meeting.id,
    });

    return { message: 'Meeting cancelled successfully' };
  }

  @Cron('* * * * *')
  async handleMeetingReminder() {
    const now = new Date();
    const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);
    const sixMinLater = new Date(now.getTime() + 6 * 60 * 1000);

    const meetings = await this.meetingRepo.find({
      where: {
        status: 'scheduled',
        reminder_sent: false,
        start_time: Between(fiveMinLater, sixMinLater) as any,
      },
      relations: ['participants'],
    });

    for (const meeting of meetings) {
      const participantIds = meeting.participants.map((p) => p.user_id);

      await this.notificationService.createMany({
        user_ids: participantIds,
        type: 'meeting_reminder',
        title: `⏰ 5 phút nữa bắt đầu cuộc họp`,
        body: `"${meeting.title}" sẽ bắt đầu lúc ${this.formatTime(meeting.start_time)}`,
        project_id: meeting.project_id,
        entity_id: meeting.id,
      });

      meeting.reminder_sent = true;
      await this.meetingRepo.save(meeting);
      this.logger.log(`Sent 5-min reminder for meeting ${meeting.id}`);
    }
  }

  @Cron('*/5 * * * *')
  async handleMeetingExpiry() {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const expired = await this.meetingRepo
      .createQueryBuilder('m')
      .where('m.status = :status', { status: 'scheduled' })
      .andWhere('m.start_time < :cutoff', { cutoff: thirtyMinAgo })
      .getMany();

    for (const meeting of expired) {
      meeting.status = 'completed';
      await this.meetingRepo.save(meeting);
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }

  private async assertProjectAccess(projectId: string, userId: number): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['project_members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.owner_id === userId;
    const isMember = project.project_members.some((member) => member.user_id === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private filterProjectParticipantIds(project: Project, participantIds: number[]): number[] {
    const allowedIds = new Set(project.project_members.map((member) => member.user_id));
    allowedIds.add(project.owner_id);

    return participantIds.filter((participantId) => allowedIds.has(participantId));
  }
}
