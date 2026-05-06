import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(params: {
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

  async createMany(params: {
    user_ids: number[];
    type: NotificationType;
    title: string;
    body: string;
    project_id?: string;
    entity_id?: number;
  }): Promise<void> {
    const { user_ids, ...rest } = params;
    const notifications = user_ids.map(user_id =>
      this.notificationRepo.create({ user_id, ...rest })
    );
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
