import { PartialType } from '@nestjs/mapped-types'
import { ProjectDto } from './project.dto';

export class UpdateProjectDto extends PartialType(ProjectDto) {}