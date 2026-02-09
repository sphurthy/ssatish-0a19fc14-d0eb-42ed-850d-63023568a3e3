import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Permission,
  TaskCategory,
  TaskStatus,
  UserRole,
} from '../../../../../libs/data/src';
import { Repository } from 'typeorm';
import { AuditLogService } from '../audit/audit-log.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserEntity } from '../users/user.entity';
import { TaskEntity } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: jest.Mocked<Repository<TaskEntity>>;
  let organizationsService: jest.Mocked<OrganizationsService>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockUser: UserEntity = {
    id: 'user-1',
    name: 'Test Admin',
    email: 'admin@acme.com',
    role: UserRole.Admin,
    passwordHash: 'hash',
    organization: { id: 'org-1', name: 'ACME Corp', parentId: null } as never,
  } as UserEntity;

  const mockTask: TaskEntity = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    category: TaskCategory.Work,
    status: TaskStatus.Todo,
    order: 0,
    organization: { id: 'org-1' } as never,
    createdBy: { id: 'user-1' } as never,
  } as TaskEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            getScopedOrganizationIds: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepository = module.get(getRepositoryToken(TaskEntity));
    organizationsService = module.get(OrganizationsService);
    auditLogService = module.get(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listTasks', () => {
    it('should return tasks scoped to user organization', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.find.mockResolvedValue([mockTask]);

      const result = await service.listTasks(mockUser, {});

      expect(organizationsService.getScopedOrganizationIds).toHaveBeenCalledWith('org-1');
      expect(tasksRepository.find).toHaveBeenCalledWith({
        where: { organization: { id: expect.anything() } },
        order: { order: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
    });

    it('should filter by category', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.find.mockResolvedValue([mockTask]);

      await service.listTasks(mockUser, { category: TaskCategory.Work });

      expect(tasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: TaskCategory.Work }),
        })
      );
    });

    it('should filter by status', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.find.mockResolvedValue([mockTask]);

      await service.listTasks(mockUser, { status: TaskStatus.InProgress });

      expect(tasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: TaskStatus.InProgress }),
        })
      );
    });

    it('should search by title', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.find.mockResolvedValue([mockTask]);

      await service.listTasks(mockUser, { search: 'test' });

      expect(tasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ title: expect.anything() }),
        })
      );
    });

    it('should sort by specified field', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.find.mockResolvedValue([mockTask]);

      await service.listTasks(mockUser, { sort: 'title' });

      expect(tasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { title: 'ASC' },
        })
      );
    });

    it('should include child organization tasks', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue([
        'org-1',
        'org-2',
        'org-3',
      ]);
      tasksRepository.find.mockResolvedValue([mockTask]);

      await service.listTasks(mockUser, {});

      expect(organizationsService.getScopedOrganizationIds).toHaveBeenCalledWith('org-1');
      expect(tasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organization: { id: expect.anything() },
          }),
        })
      );
    });
  });

  describe('createTask', () => {
    it('should create task with correct organization and user', async () => {
      const createDto = {
        title: 'New Task',
        description: 'Description',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 0,
      };

      tasksRepository.create.mockReturnValue(mockTask);
      tasksRepository.save.mockResolvedValue(mockTask);

      const result = await service.createTask(mockUser, createDto);

      expect(tasksRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createDto.title,
          description: createDto.description,
          category: createDto.category,
          status: createDto.status,
          organization: mockUser.organization,
          createdBy: mockUser,
        })
      );
      expect(result.id).toBe('task-1');
    });

    it('should log audit entry for task creation', async () => {
      const createDto = {
        title: 'New Task',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
      };

      tasksRepository.create.mockReturnValue(mockTask);
      tasksRepository.save.mockResolvedValue(mockTask);

      await service.createTask(mockUser, createDto);

      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: Permission.TaskCreate,
        resource: `task:${mockTask.id}`,
        allowed: true,
      });
    });

    it('should handle optional fields', async () => {
      const createDto = {
        title: 'New Task',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
      };

      tasksRepository.create.mockReturnValue(mockTask);
      tasksRepository.save.mockResolvedValue(mockTask);

      await service.createTask(mockUser, createDto);

      expect(tasksRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          order: 0,
        })
      );
    });
  });

  describe('updateTask', () => {
    it('should update task when user has permission and scope', async () => {
      const updateDto = {
        title: 'Updated Task',
        status: TaskStatus.InProgress,
      };

      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue(mockTask);
      tasksRepository.save.mockResolvedValue({ ...mockTask, ...updateDto });

      const result = await service.updateTask(mockUser, 'task-1', updateDto);

      expect(result.title).toBe('Updated Task');
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          action: Permission.TaskUpdate,
          allowed: true,
        })
      );
    });

    it('should throw NotFoundException when task does not exist', async () => {
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTask(mockUser, 'nonexistent', { title: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when task is not in scope', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue({
        ...mockTask,
        organization: { id: 'org-2' } as never,
      });

      await expect(
        service.updateTask(mockUser, 'task-1', { title: 'Test' })
      ).rejects.toThrow(ForbiddenException);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          allowed: false,
        })
      );
    });

    it('should throw ForbiddenException when user is not the task owner', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue({
        ...mockTask,
        createdBy: { id: 'user-2' } as never,
      });

      await expect(
        service.updateTask(mockUser, 'task-1', { title: 'Test' })
      ).rejects.toThrow(ForbiddenException);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: Permission.TaskUpdate,
          allowed: false,
        })
      );
    });

    it('should throw ForbiddenException when user is Viewer', async () => {
      const viewerUser = { ...mockUser, role: UserRole.Viewer };
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue(mockTask);

      await expect(
        service.updateTask(viewerUser, 'task-1', { title: 'Test' })
      ).rejects.toThrow(ForbiddenException);

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: Permission.TaskUpdate,
          allowed: false,
        })
      );
    });

    it('should preserve existing values when fields not provided', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue(mockTask);
      tasksRepository.save.mockImplementation((task) => Promise.resolve(task as TaskEntity));

      await service.updateTask(mockUser, 'task-1', { title: 'Updated' });

      expect(tasksRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          description: mockTask.description,
          category: mockTask.category,
          status: mockTask.status,
        })
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete task when user has permission and scope', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue(mockTask);
      tasksRepository.remove.mockResolvedValue(mockTask);

      const result = await service.deleteTask(mockUser, 'task-1');

      expect(result.deleted).toBe(true);
      expect(tasksRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: Permission.TaskDelete,
          allowed: true,
        })
      );
    });

    it('should throw NotFoundException when task does not exist', async () => {
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTask(mockUser, 'nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when task is not in scope', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue({
        ...mockTask,
        organization: { id: 'org-2' } as never,
      });

      await expect(service.deleteTask(mockUser, 'task-1')).rejects.toThrow(
        ForbiddenException
      );

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          allowed: false,
        })
      );
    });

    it('should throw ForbiddenException when user is not the task owner', async () => {
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue({
        ...mockTask,
        createdBy: { id: 'user-2' } as never,
      });

      await expect(service.deleteTask(mockUser, 'task-1')).rejects.toThrow(
        ForbiddenException
      );

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: Permission.TaskDelete,
          allowed: false,
        })
      );
    });

    it('should throw ForbiddenException when user is Viewer', async () => {
      const viewerUser = { ...mockUser, role: UserRole.Viewer };
      organizationsService.getScopedOrganizationIds.mockResolvedValue(['org-1']);
      tasksRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.deleteTask(viewerUser, 'task-1')).rejects.toThrow(
        ForbiddenException
      );

      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: Permission.TaskDelete,
          allowed: false,
        })
      );
    });
  });
});
