import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatusService } from './task-status.service';

@Controller('project-task-statuses')
export class TaskStatusController {
  constructor(private readonly service: TaskStatusService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateTaskStatusDto) {
    return this.service.create(dto);
  }

  @Patch('reorder')
  reorder(
    @Body() dto: { project_id: string; ordered_ids: number[] }
  ) {
    return this.service.reorder(dto.project_id, dto.ordered_ids);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

}