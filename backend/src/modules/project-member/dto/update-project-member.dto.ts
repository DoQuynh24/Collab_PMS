import { PartialType } from '@nestjs/mapped-types';
import { ProjectMemberDto } from './project-member.dto';

export class UpdateProjectMemberDto extends PartialType(ProjectMemberDto) {}