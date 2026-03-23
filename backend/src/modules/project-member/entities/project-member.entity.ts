import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Project } from 'src/modules/project/entities/project.entity';

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn()
  member_id: number;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column()
  user_id: number;

  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
  })
  role: 'admin' | 'member';

  @ManyToOne(() => Project, (project) => project.project_members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, (user) => user.project_members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}