import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('project_notification_preferences')
@Unique(['user_id', 'project_id'])
export class ProjectNotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column({ type: 'boolean', default: true })
  assigned_inapp: boolean;

  @Column({ type: 'boolean', default: true })
  assigned_email: boolean;

  @Column({ type: 'boolean', default: true })
  status_inapp: boolean;

  @Column({ type: 'boolean', default: true })
  status_email: boolean;

  @Column({ type: 'boolean', default: true })
  comment_inapp: boolean;

  @Column({ type: 'boolean', default: true })
  mention_inapp: boolean;

  @Column({ type: 'boolean', default: true })
  mention_email: boolean;

  @Column({ type: 'boolean', default: true })
  project_inapp: boolean;

  @Column({ type: 'boolean', default: true })
  project_email: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
