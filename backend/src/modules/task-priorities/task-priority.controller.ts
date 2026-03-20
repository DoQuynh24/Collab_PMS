import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskPriorityService } from './task-priority.service';
import { CreateTaskPriorityDto } from './dto/create-task-priorities.dto';


@Controller('task-priorities')
export class TaskPriorityController {
  constructor(private readonly service: TaskPriorityService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateTaskPriorityDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateTaskPriorityDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}