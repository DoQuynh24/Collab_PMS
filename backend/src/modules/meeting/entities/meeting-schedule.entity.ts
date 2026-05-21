import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed';

@Entity('meeting_schedules')
export class MeetingSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'datetime' })
  start_time: Date;

  @Column()
  created_by: number;

  @Column({ type: 'enum', enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' })
  status: MeetingStatus;

  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => MeetingParticipant, (p) => p.meeting, { cascade: true })
  participants: MeetingParticipant[];
}

@Entity('meeting_participants')
export class MeetingParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  meeting_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => MeetingSchedule, (m) => m.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_id' })
  meeting: MeetingSchedule;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
