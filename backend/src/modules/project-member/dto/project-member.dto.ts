import { IsInt, IsEnum } from 'class-validator';

export class ProjectMemberDto {
  project_id: string;

  @IsInt()
  user_id: number;

  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';

}