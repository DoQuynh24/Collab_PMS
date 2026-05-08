import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { TaskPriority } from 'src/modules/task-priorities/entities/task-priority.entity';
import { ProjectTaskStatus } from 'src/modules/task-status/entities/task-status.entity';


@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  task_id: number;

  @Column({ type: 'varchar', length: 8 })
  project_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  deadline?: Date;

  @Column({ type: 'int', nullable: true })
  assignee_id?: number;

  @Column()
  created_by: number;

  @Column()
  priority_id: number;

  @Column()
  status_id: number;

  @Column({ default: 0 })
  order_index: number;

  @Column({ type: 'tinyint', default: 0 })
  is_archived: boolean = false;

  @Column({ type: 'tinyint', default: 0 })
  deadline_reminded: boolean = false;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => TaskPriority, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'priority_id' })
  priority: TaskPriority;

  @ManyToOne(() => ProjectTaskStatus, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status: ProjectTaskStatus;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_at?: Date;
}