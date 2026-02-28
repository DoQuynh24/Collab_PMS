import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: true })
  picture: string;

  @Column({ length: 255, unique: true, nullable: true })
  google_id: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @CreateDateColumn()
  created_at: Date;
}