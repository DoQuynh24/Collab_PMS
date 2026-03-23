import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { Project } from '../project/entities/project.entity';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async addMember(
    dto: CreateProjectMemberDto,
    currentUserId: number,
  ) {
    if (isNaN(currentUserId) || currentUserId <= 0) {
      throw new UnauthorizedException('Invalid current user ID');
    }

    const project = await this.projectRepo.findOne({
      where: { project_id: dto.project_id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.project_id} not found`);
    }

    if (project.owner_id !== currentUserId) {
      throw new UnauthorizedException('Only project owner can add members');
    }

    const userExists = await this.userRepo.findOne({
      where: { user_id: dto.user_id },
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    const existing = await this.memberRepo.findOne({
      where: {
        project_id: dto.project_id,
        user_id: dto.user_id,
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    if (dto.user_id === project.owner_id) {
      throw new ConflictException('Owner is already the admin of the project');
    }

    const member = this.memberRepo.create({
      project_id: dto.project_id,
      user_id: dto.user_id,
      role: dto.role,
    });

    return this.memberRepo.save(member);
  }

  async updateMember(
    memberId: number,
    dto: UpdateProjectMemberDto,
    currentUserId: number,
  ) {
    if (isNaN(currentUserId) || currentUserId <= 0) {
      throw new UnauthorizedException('Invalid current user ID');
    }

    const member = await this.memberRepo.findOne({
      where: { member_id: memberId },
      relations: ['project', 'project.owner'],
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    if (member.project.owner_id !== currentUserId) {
      throw new UnauthorizedException('Only project owner can update member role');
    }

    if (member.user_id === member.project.owner_id && dto.role !== 'admin') {
      throw new UnauthorizedException('Cannot change role of project owner');
    }

    Object.assign(member, dto);
    return this.memberRepo.save(member);
  }

  async removeMember(
    memberId: number,
    currentUserId: number,
  ) {
    if (isNaN(currentUserId) || currentUserId <= 0) {
      throw new UnauthorizedException('Invalid current user ID');
    }

    const member = await this.memberRepo.findOne({
      where: { member_id: memberId },
      relations: ['project', 'project.owner'],
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    if (member.project.owner_id !== currentUserId) {
      throw new UnauthorizedException('Only project owner can remove members');
    }

    if (member.user_id === member.project.owner_id) {
      throw new UnauthorizedException('Cannot remove project owner from members');
    }

    await this.memberRepo.remove(member);
    return { message: 'Member removed successfully' };
  }

  async findByProject(projectId: string) {
    return this.memberRepo.find({
      where: { project_id: projectId },
      relations: ['user'], 
      order: { created_at: 'ASC' },
    });
  }
}