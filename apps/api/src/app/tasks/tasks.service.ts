import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Permission,
  Task,
  TaskCategory,
  TaskStatus,
  UserRole,
} from '@task-mgmt/data';
import { In, Like, Repository } from 'typeorm';
import { AuditLogService } from '../audit/audit-log.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserEntity } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    private readonly organizationsService: OrganizationsService,
    private readonly auditLogService: AuditLogService
  ) {}

  async listTasks(
    user: UserEntity,
    filters: {
      category?: TaskCategory;
      status?: TaskStatus;
      search?: string;
      sort?: 'order' | 'title' | 'status';
    }
  ) {
    const orgIds = await this.organizationsService.getScopedOrganizationIds(
      user.organization.id
    );

    const where: Record<string, unknown> = {
      organization: { id: In(orgIds) },
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.title = Like(`%${filters.search}%`);
    }

    const tasks = await this.tasksRepository.find({
      where,
      order: {
        [filters.sort ?? 'order']: 'ASC',
      },
    });

    return tasks.map((task) => this.toTaskDto(task));
  }

  async createTask(user: UserEntity, dto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category,
      status: dto.status,
      order: dto.order ?? 0,
      organization: user.organization,
      createdBy: user,
    });

    const saved = await this.tasksRepository.save(task);
    this.auditLogService.log({
      userId: user.id,
      action: Permission.TaskCreate,
      resource: `task:${saved.id}`,
      allowed: true,
    });
    return this.toTaskDto(saved);
  }

  async updateTask(user: UserEntity, id: string, dto: UpdateTaskDto) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const orgIds = await this.organizationsService.getScopedOrganizationIds(
      user.organization.id
    );

    const withinScope = orgIds.includes(task.organization.id);
    const allowedRole = user.role !== UserRole.Viewer;

    if (!withinScope || !allowedRole) {
      this.auditLogService.log({
        userId: user.id,
        action: Permission.TaskUpdate,
        resource: `task:${task.id}`,
        allowed: false,
      });
      throw new ForbiddenException('Not allowed to update this task');
    }

    Object.assign(task, {
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      category: dto.category ?? task.category,
      status: dto.status ?? task.status,
      order: dto.order ?? task.order,
    });

    const saved = await this.tasksRepository.save(task);
    this.auditLogService.log({
      userId: user.id,
      action: Permission.TaskUpdate,
      resource: `task:${task.id}`,
      allowed: true,
    });
    return this.toTaskDto(saved);
  }

  async deleteTask(user: UserEntity, id: string) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const orgIds = await this.organizationsService.getScopedOrganizationIds(
      user.organization.id
    );

    const withinScope = orgIds.includes(task.organization.id);
    const allowedRole = user.role !== UserRole.Viewer;

    if (!withinScope || !allowedRole) {
      this.auditLogService.log({
        userId: user.id,
        action: Permission.TaskDelete,
        resource: `task:${task.id}`,
        allowed: false,
      });
      throw new ForbiddenException('Not allowed to delete this task');
    }

    await this.tasksRepository.remove(task);
    this.auditLogService.log({
      userId: user.id,
      action: Permission.TaskDelete,
      resource: `task:${task.id}`,
      allowed: true,
    });
    return { deleted: true };
  }

  private toTaskDto(task: TaskEntity): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      category: task.category,
      status: task.status,
      order: task.order,
      organizationId: task.organization.id,
      createdById: task.createdBy.id,
    };
  }
}
