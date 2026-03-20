import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('global_task_statuses')
export class GlobalTaskStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}