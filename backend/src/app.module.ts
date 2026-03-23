import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { ProjectMemberModule } from './modules/project-member/project-member.module';
import { TaskModule } from './modules/tasks/task.module';
import { TaskStatusModule } from './modules/task-status/task-status.module';
import { TaskPriorityModule } from './modules/task-priorities/task-priority.module';
import { DatabaseSeed } from './database/database.seed';
import { TaskPriority } from './modules/task-priorities/entities/task-priority.entity';
import { ProjectTaskStatus } from './modules/task-status/entities/task-status.entity';
import { GlobalTaskStatus } from './modules/task-status/entities/gobal-task-status.entity';
import { ProjectInvitationModule } from './modules/project-invitation/project-invitation.module';
import { MailModule } from './modules/project-invitation/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3360,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, 
    }),
    TypeOrmModule.forFeature([TaskPriority, ProjectTaskStatus, GlobalTaskStatus]),
    AuthModule,
    ProjectModule,
    ProjectMemberModule,
    ProjectInvitationModule,
    TaskModule,
    TaskStatusModule,
    TaskPriorityModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeed],
})
export class AppModule {}