import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectMemberService } from './project-member.service';
import { ProjectMemberController } from './project-member.controller';
import { ProjectModule } from '../project/project.module';
import { AuthModule } from '../auth/auth.module';

@Module({
 imports: [
    TypeOrmModule.forFeature([ProjectMember]),
    ProjectModule,
    AuthModule,
  ],
  providers: [ProjectMemberService],
  controllers: [ProjectMemberController],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}