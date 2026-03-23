import { PartialType } from '@nestjs/mapped-types';
import { InvitationDto } from './project-invitation.dto';

export class UpdateProjectInvitationDto extends PartialType(InvitationDto) {}