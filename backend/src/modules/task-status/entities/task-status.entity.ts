import { Task } from 'src/modules/tasks/entities/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('project_task_statuses')
export class ProjectTaskStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: string;

  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];

  @Column({ default: 0 })
  order_index: number;
}