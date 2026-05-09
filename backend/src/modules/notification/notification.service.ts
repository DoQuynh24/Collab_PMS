import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { ProjectNotificationPreference } from './entities/project-notification-preference.entity';

type NotificationGroup = 'assigned' | 'status' | 'comment' | 'mention' | 'project';

const TYPE_GROUP_MAP: Partial<Record<NotificationType, NotificationGroup>> = {
  assigned_task: 'assigned',
  status_changed: 'status',
  new_comment: 'comment',
  mention: 'mention',
  join_request_received: 'project',
  join_request_approved: 'project',
  join_request_rejected: 'project',
};

const DEFAULT_PREF = {
  assigned_inapp: true,
  assigned_email: true,
  status_inapp: true,
  status_email: true,
  comment_inapp: true,
  mention_inapp: true,
  mention_email: true,
  project_inapp: true,
  project_email: true,
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(ProjectNotificationPreference)
    private prefRepo: Repository<ProjectNotificationPreference>,
  ) {}

  async getPreference(userId: number, projectId: string): Promise<ProjectNotificationPreference & typeof DEFAULT_PREF> {
    const pref = await this.prefRepo.findOne({ where: { user_id: userId, project_id: projectId } });
    return { ...DEFAULT_PREF, ...(pref ?? {}), user_id: userId, project_id: projectId } as any;
  }

  async upsertPreference(userId: number, projectId: string, data: Partial<{
    assigned_inapp: boolean; assigned_email: boolean;
    status_inapp: boolean; status_email: boolean;
    comment_inapp: boolean;
    mention_inapp: boolean; mention_email: boolean;
    project_inapp: boolean; project_email: boolean;
  }>): Promise<ProjectNotificationPreference> {
    let pref = await this.prefRepo.findOne({ where: { user_id: userId, project_id: projectId } });
    if (!pref) {
      pref = this.prefRepo.create({ user_id: userId, project_id: projectId, ...DEFAULT_PREF });
    }
    Object.assign(pref, data);
    return this.prefRepo.save(pref);
  }

  private async canReceiveInapp(userId: number, projectId: string | undefined, type: NotificationType): Promise<boolean> {
    const group = TYPE_GROUP_MAP[type];
    if (!group || !projectId) return true;
    const pref = await this.prefRepo.findOne({ where: { user_id: userId, project_id: projectId } });
    const key = `${group}_inapp` as keyof typeof DEFAULT_PREF;
    if (!pref) return DEFAULT_PREF[key] ?? true;
    return (pref as any)[key] ?? true;
  }

  async canReceiveEmail(userId: number, projectId: string | undefined, type: NotificationType): Promise<boolean> {
    const group = TYPE_GROUP_MAP[type];
    if (!group || !projectId) return true; 
    const pref = await this.prefRepo.findOne({ where: { user_id: userId, project_id: projectId } });
    const key = `${group}_email` as keyof typeof DEFAULT_PREF;
    if (!pref) return DEFAULT_PREF[key] ?? true;
    return (pref as any)[key] ?? true;
  }

  async createForced(params: {
    user_id: number;
    type: NotificationType;
    title: string;
    body: string;
    project_id?: string;
    entity_id?: number;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create(params);
    return this.notificationRepo.save(notification);
  }

  async create(params: {
    user_id: number;
    type: NotificationType;
    title: string;
    body: string;
    project_id?: string;
    entity_id?: number;
  }): Promise<Notification | null> {
    const allowed = await this.canReceiveInapp(params.user_id, params.project_id, params.type);
    if (!allowed) return null;
    const notification = this.notificationRepo.create(params);
    return this.notificationRepo.save(notification);
  }

  async createMany(params: {
    user_ids: number[];
    type: NotificationType;
    title: string;
    body: string;
    project_id?: string;
    entity_id?: number;
  }): Promise<void> {
    const { user_ids, ...rest } = params;
    const allowed: number[] = [];
    for (const uid of user_ids) {
      if (await this.canReceiveInapp(uid, params.project_id, params.type)) {
        allowed.push(uid);
      }
    }
    if (allowed.length === 0) return;
    const notifications = allowed.map(user_id => this.notificationRepo.create({ user_id, ...rest }));
    await this.notificationRepo.save(notifications);
  }

  async findByUser(userId: number) {
    return this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async countUnread(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAllRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }

  async markOneRead(id: number, userId: number): Promise<void> {
    await this.notificationRepo.update(
      { id, user_id: userId },
      { is_read: true },
    );
  }

  async deleteOne(id: number, userId: number): Promise<void> {
    await this.notificationRepo.delete({ id, user_id: userId });
  }

  async deleteAll(userId: number): Promise<void> {
    await this.notificationRepo.delete({ user_id: userId });
  }
}
