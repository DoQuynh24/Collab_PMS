import { Task } from 'src/modules/tasks/entities/task.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('task_priorities')
export class TaskPriority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: 0 })
  order_index: number;

  @OneToMany(() => Task, (task) => task.priority)
  tasks: Task[];
}