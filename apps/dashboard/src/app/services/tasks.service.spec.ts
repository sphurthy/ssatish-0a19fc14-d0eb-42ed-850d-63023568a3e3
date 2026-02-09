import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService, TaskFilters } from './tasks.service';
import { Task, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { firstValueFrom } from 'rxjs';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  const API_BASE_URL = 'http://localhost:3000/api';

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    category: TaskCategory.Work,
    status: TaskStatus.Todo,
    order: 0,
    organizationId: 'org-1',
    createdById: 'user-1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService],
    });

    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    it('should fetch tasks without filters', async () => {
      const filters: TaskFilters = {};

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);

      req.flush([mockTask]);

      const tasks = await listPromise;
      expect(tasks).toEqual([mockTask]);
    });

    it('should fetch tasks with category filter', async () => {
      const filters: TaskFilters = { category: TaskCategory.Work };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(
        `${API_BASE_URL}/tasks?category=${TaskCategory.Work}`
      );
      expect(req.request.params.get('category')).toBe(TaskCategory.Work);

      req.flush([mockTask]);

      await listPromise;
    });

    it('should fetch tasks with status filter', async () => {
      const filters: TaskFilters = { status: TaskStatus.InProgress };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(
        `${API_BASE_URL}/tasks?status=${TaskStatus.InProgress}`
      );
      expect(req.request.params.get('status')).toBe(TaskStatus.InProgress);

      req.flush([mockTask]);

      await listPromise;
    });

    it('should fetch tasks with search query', async () => {
      const filters: TaskFilters = { search: 'test search' };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks?search=test%20search`);
      expect(req.request.params.get('search')).toBe('test search');

      req.flush([mockTask]);

      await listPromise;
    });

    it('should fetch tasks with sort parameter', async () => {
      const filters: TaskFilters = { sort: 'title' };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks?sort=title`);
      expect(req.request.params.get('sort')).toBe('title');

      req.flush([mockTask]);

      await listPromise;
    });

    it('should fetch tasks with multiple filters', async () => {
      const filters: TaskFilters = {
        category: TaskCategory.Personal,
        status: TaskStatus.Done,
        search: 'bug fix',
        sort: 'status',
      };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(
        (request) => request.url === `${API_BASE_URL}/tasks`
      );
      expect(req.request.params.get('category')).toBe(TaskCategory.Personal);
      expect(req.request.params.get('status')).toBe(TaskStatus.Done);
      expect(req.request.params.get('search')).toBe('bug fix');
      expect(req.request.params.get('sort')).toBe('status');

      req.flush([mockTask]);

      await listPromise;
    });

    it('should ignore empty string filters', async () => {
      const filters: TaskFilters = {
        category: '',
        status: '',
        search: '',
      };

      const listPromise = firstValueFrom(service.list(filters));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      expect(req.request.params.keys().length).toBe(0);

      req.flush([mockTask]);

      await listPromise;
    });

    it('should return empty array when no tasks exist', async () => {
      const listPromise = firstValueFrom(service.list({}));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      req.flush([]);

      const tasks = await listPromise;
      expect(tasks).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const newTask: Partial<Task> = {
        title: 'New Task',
        description: 'Description',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 0,
      };

      const createPromise = firstValueFrom(service.create(newTask));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);

      req.flush(mockTask);

      const task = await createPromise;
      expect(task).toEqual(mockTask);
    });

    it('should create task with minimal data', async () => {
      const minimalTask: Partial<Task> = {
        title: 'Minimal Task',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
      };

      const createPromise = firstValueFrom(service.create(minimalTask));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      expect(req.request.body).toEqual(minimalTask);

      req.flush(mockTask);

      await createPromise;
    });

    it('should handle creation errors', async () => {
      const newTask: Partial<Task> = {
        title: 'New Task',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
      };

      const createPromise = firstValueFrom(service.create(newTask));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });

      await expect(createPromise).rejects.toBeTruthy();
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const updates: Partial<Task> = {
        title: 'Updated Task',
        status: TaskStatus.InProgress,
      };

      const updatePromise = firstValueFrom(service.update('task-1', updates));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/task-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);

      req.flush({ ...mockTask, ...updates });

      const task = await updatePromise;
      expect(task.title).toBe('Updated Task');
    });

    it('should update task with partial data', async () => {
      const updates: Partial<Task> = { status: TaskStatus.Done };

      const updatePromise = firstValueFrom(service.update('task-1', updates));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/task-1`);
      expect(req.request.body).toEqual(updates);

      req.flush(mockTask);

      await updatePromise;
    });

    it('should handle update errors (403 Forbidden for Viewer)', async () => {
      const updatePromise = firstValueFrom(service.update('task-1', { title: 'Update' }));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/task-1`);
      req.flush(
        { message: 'Permission denied' },
        { status: 403, statusText: 'Forbidden' }
      );

      await expect(updatePromise).rejects.toBeTruthy();
    });

    it('should handle update errors (404 Not Found)', async () => {
      const updatePromise = firstValueFrom(service.update('nonexistent', { title: 'Update' }));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/nonexistent`);
      req.flush({ message: 'Task not found' }, { status: 404, statusText: 'Not Found' });

      await expect(updatePromise).rejects.toBeTruthy();
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const removePromise = firstValueFrom(service.remove('task-1'));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/task-1`);
      expect(req.request.method).toBe('DELETE');

      req.flush({ deleted: true });

      const result = await removePromise;
      expect(result.deleted).toBe(true);
    });

    it('should handle delete errors (403 Forbidden for Viewer)', async () => {
      const removePromise = firstValueFrom(service.remove('task-1'));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/task-1`);
      req.flush(
        { message: 'Permission denied' },
        { status: 403, statusText: 'Forbidden' }
      );

      await expect(removePromise).rejects.toBeTruthy();
    });

    it('should handle delete errors (404 Not Found)', async () => {
      const removePromise = firstValueFrom(service.remove('nonexistent'));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks/nonexistent`);
      req.flush({ message: 'Task not found' }, { status: 404, statusText: 'Not Found' });

      await expect(removePromise).rejects.toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should propagate HTTP errors to subscribers', async () => {
      const listPromise = firstValueFrom(service.list({}));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      req.flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      await expect(listPromise).rejects.toBeTruthy();
    });

    it('should handle network errors', async () => {
      const listPromise = firstValueFrom(service.list({}));

      const req = httpMock.expectOne(`${API_BASE_URL}/tasks`);
      req.error(new ProgressEvent('error'));

      await expect(listPromise).rejects.toBeTruthy();
    });
  });
});
