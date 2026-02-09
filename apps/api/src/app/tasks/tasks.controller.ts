import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '@task-mgmt/auth';
import { Permission, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserEntity } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions(Permission.TaskRead)
  list(
    @CurrentUser() user: UserEntity,
    @Query('category') category?: TaskCategory,
    @Query('status') status?: TaskStatus,
    @Query('search') search?: string,
    @Query('sort') sort?: 'order' | 'title' | 'status'
  ) {
    return this.tasksService.listTasks(user, { category, status, search, sort });
  }

  @Post()
  @RequirePermissions(Permission.TaskCreate)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(user, dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.TaskUpdate)
  update(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto
  ) {
    return this.tasksService.updateTask(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.TaskDelete)
  remove(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.tasksService.deleteTask(user, id);
  }
}
