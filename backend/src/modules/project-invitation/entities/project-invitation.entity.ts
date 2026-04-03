import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('project_invitations')
export class ProjectInvitation {
  @PrimaryGeneratedColumn()
  invitation_id: number;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column()
  invited_by_user_id: number;

  @Column()
  invited_email: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
    default: 'member'
  })
  role: 'admin' | 'member';

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @Column({ type: 'datetime', nullable: true })
  accepted_at: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by_user_id' })
  invitedBy: User;
}