import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { VideoRoom } from './entities/video-room.entity';
import { VideoGateway } from './video.gateway';
import { NotificationService } from '../notification/notification.service';
import { ProjectMemberService } from '../project-member/project-member.service';
import { Project } from '../project/entities/project.entity';

const TOKEN_EXPIRE_SECONDS = 3600;

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoRoom)
    private roomRepo: Repository<VideoRoom>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    private readonly config: ConfigService,
    private readonly gateway: VideoGateway,
    private readonly notificationService: NotificationService,
    private readonly memberService: ProjectMemberService,
  ) {}

  async startCall(
    projectId: string,
    hostId: number,
    hostName: string,
    hostPicture: string | undefined,
  ) {
    const existing = await this.roomRepo.findOne({
      where: { project_id: projectId, status: 'active' },
    });
    if (existing) {
      throw new BadRequestException('A call is already active in this project');
    }

    const channelName = `project_${projectId}_${Date.now()}`;

    const room = this.roomRepo.create({
      channel_name: channelName,
      project_id: projectId,
      host_id: hostId,
      status: 'active',
      participant_count: 1,
    });
    await this.roomRepo.save(room);

    const token = this.generateToken(channelName, hostId);

    const members = await this.memberService.findByProject(projectId);
    const otherMemberIds = members
      .map((m) => m.user_id)
      .filter((id) => id !== hostId);

    const project = await this.projectRepo.findOne({ where: { project_id: projectId } });
    const projectName = project?.name ?? projectId;

    this.gateway.sendCallInvite(otherMemberIds, {
      roomId: room.id,
      channelName,
      projectId,
      projectName,
      hostId,
      hostName,
      hostPicture,
    });

    await this.notificationService.createMany({
      user_ids: otherMemberIds,
      type: 'video_call_started',
      title: `📹 ${hostName} đang gọi video`,
      body: `Cuộc họp nhóm trong dự án "${projectName}" đã bắt đầu. Nhấn để tham gia.`,
      project_id: projectId,
      entity_id: room.id,
    });

    return { room, token, channelName, appId: this.getAppId() };
  }

  async joinCall(channelName: string, userId: number) {
    const room = await this.roomRepo.findOne({
      where: { channel_name: channelName, status: 'active' },
    });
    if (!room) {
      throw new NotFoundException('Call not found or already ended');
    }

    // Tăng participant count
    await this.roomRepo.increment({ id: room.id }, 'participant_count', 1);

    const token = this.generateToken(channelName, userId);
    return { room, token, channelName, appId: this.getAppId() };
  }

  /**
   * User rời phòng — giảm participant count.
   * Nếu count về 0 thì tự end room.
   */
  async leaveCall(roomId: number) {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room || room.status === 'ended') return { message: 'Room not active' };

    const newCount = Math.max(0, room.participant_count - 1);
    room.participant_count = newCount;

    if (newCount === 0) {
      // Người cuối cùng rời → end room
      room.status = 'ended';
      await this.roomRepo.save(room);
      const members = await this.memberService.findByProject(room.project_id);
      this.gateway.sendCallEnded(members.map((m) => m.user_id), room.channel_name);
      return { message: 'Room ended — last participant left' };
    }

    await this.roomRepo.save(room);
    return { message: 'Left room' };
  }

  async endCall(roomId: number, userId: number) {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.status === 'ended') return { message: 'Already ended' };
    if (room.host_id !== userId) {
      throw new ForbiddenException('Only the host can end the call');
    }

    room.status = 'ended';
    await this.roomRepo.save(room);

    const members = await this.memberService.findByProject(room.project_id);
    const memberIds = members.map((m) => m.user_id);
    this.gateway.sendCallEnded(memberIds, room.channel_name);

    return { message: 'Call ended' };
  }

  async getActiveRoom(projectId: string) {
    return this.roomRepo.findOne({
      where: { project_id: projectId, status: 'active' },
      relations: ['host'],
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleRooms() {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const staleRooms = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.status = :status', { status: 'active' })
      .andWhere('room.created_at < :cutoff', { cutoff: fourHoursAgo })
      .getMany();

    for (const room of staleRooms) {
      room.status = 'ended';
      await this.roomRepo.save(room);
      const members = await this.memberService.findByProject(room.project_id);
      this.gateway.sendCallEnded(members.map((m) => m.user_id), room.channel_name);
    }
  }

  private generateToken(channelName: string, userId: number): string {
    const appId = this.getAppId();
    const appCertificate = this.config.get<string>('AGORA_APP_CERTIFICATE');

    if (!appCertificate) return '';

    const expireTime = Math.floor(Date.now() / 1000) + TOKEN_EXPIRE_SECONDS;
    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userId,
      RtcRole.PUBLISHER,
      expireTime,
      expireTime,
    );
  }

  private getAppId(): string {
    return this.config.get<string>('AGORA_APP_ID') ?? '';
  }
}
