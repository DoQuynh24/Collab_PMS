import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type VideoRoomStatus = 'active' | 'ended';

@Entity('video_rooms')
export class VideoRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  channel_name: string;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column()
  host_id: number;

  @Column({ type: 'enum', enum: ['active', 'ended'], default: 'active' })
  status: VideoRoomStatus;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;
}
