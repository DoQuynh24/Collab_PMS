import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @Column()
  task_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  file_url?: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}