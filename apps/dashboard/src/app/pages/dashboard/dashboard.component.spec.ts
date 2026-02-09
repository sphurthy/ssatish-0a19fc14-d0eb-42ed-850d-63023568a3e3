import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskCategory, TaskStatus, UserRole } from '@task-mgmt/data';
import { DashboardPageComponent } from './dashboard.component';
import { AuthService, AuthUser } from '../../services/auth.service';
import { TasksStore } from '../../services/tasks.store';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let mockTasksStore: any;
  let mockAuthService: any;
  let mockToastService: any;
  let tasksSubject: BehaviorSubject<Task[]>;
  let loadingSubject: BehaviorSubject<boolean>;

  const mockUser: AuthUser = {
    id: 'user-1',
    name: 'Test Admin',
    email: 'admin@acme.com',
    role: UserRole.Admin,
    organizationId: 'org-1',
  };

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

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>([mockTask]);
    loadingSubject = new BehaviorSubject<boolean>(false);

    mockTasksStore = {
      tasks$: tasksSubject.asObservable(),
      loading$: loadingSubject.asObservable(),
      load: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setFilters: jest.fn(),
    } as never;

    mockAuthService = {
      getUser: jest.fn().mockReturnValue(mockUser),
      logout: jest.fn(),
    } as never;

    mockToastService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    } as never;

    await TestBed.configureTestingModule({
      imports: [
        DashboardPageComponent,
        ReactiveFormsModule,
        DragDropModule,
        ModalComponent,
        ConfirmationModalComponent,
      ],
      providers: [
        { provide: TasksStore, useValue: mockTasksStore },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should load tasks on initialization', () => {
      fixture.detectChanges();

      expect(mockTasksStore.load).toHaveBeenCalled();
      expect(component.tasks).toEqual([mockTask]);
    });

    it('should subscribe to tasks$ and group by status', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', status: TaskStatus.Todo },
        { ...mockTask, id: '2', status: TaskStatus.InProgress },
        { ...mockTask, id: '3', status: TaskStatus.Done },
      ];

      tasksSubject.next(tasks);
      fixture.detectChanges();

      expect(component.groupedTasks[TaskStatus.Todo]).toHaveLength(1);
      expect(component.groupedTasks[TaskStatus.InProgress]).toHaveLength(1);
      expect(component.groupedTasks[TaskStatus.Done]).toHaveLength(1);
    });

    it('should subscribe to loading$ and update loading state', () => {
      fixture.detectChanges();
      expect(component.loading).toBe(false);

      loadingSubject.next(true);
      expect(component.loading).toBe(true);

      loadingSubject.next(false);
      expect(component.loading).toBe(false);
    });
  });

  describe('Filter Management', () => {
    it('should apply filters with all values', () => {
      fixture.detectChanges();
      component.filtersForm.patchValue({
        search: 'test',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        sort: 'title',
      });

      component.applyFilters();

      expect(mockTasksStore.setFilters).toHaveBeenCalledWith({
        search: 'test',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        sort: 'title',
      });
    });

    it('should handle empty filter values', () => {
      fixture.detectChanges();
      component.filtersForm.patchValue({
        search: '',
        category: '',
        status: '',
        sort: 'order',
      });

      component.applyFilters();

      expect(mockTasksStore.setFilters).toHaveBeenCalledWith({
        search: '',
        category: undefined,
        status: undefined,
        sort: 'order',
      });
    });

    it('should clear all filters', () => {
      fixture.detectChanges();
      component.filtersForm.patchValue({
        search: 'test',
        category: TaskCategory.Personal,
        status: TaskStatus.InProgress,
        sort: 'title',
      });

      component.clearFilters();

      expect(component.filtersForm.value).toEqual({
        search: '',
        category: '',
        status: '',
        sort: 'order',
      });
      expect(mockTasksStore.setFilters).toHaveBeenCalled();
    });
  });

  describe('Task Creation', () => {
    it('should create task with valid form data', () => {
      fixture.detectChanges();
      component.taskForm.patchValue({
        title: 'New Task',
        description: 'Description',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 0,
      });

      component.submitTask();

      expect(mockTasksStore.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Description',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 0,
      });
      expect(mockToastService.success).toHaveBeenCalledWith('Task created successfully');
    });

    it('should not submit task with invalid form', () => {
      fixture.detectChanges();
      component.taskForm.patchValue({
        title: '', // Required field
      });

      component.submitTask();

      expect(mockTasksStore.create).not.toHaveBeenCalled();
      expect(mockToastService.success).not.toHaveBeenCalled();
    });

    it('should reset form after successful creation', () => {
      fixture.detectChanges();
      component.taskForm.patchValue({
        title: 'New Task',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
      });

      component.submitTask();

      expect(component.taskForm.value.title).toBe('');
      expect(component.taskForm.value.id).toBe('');
    });
  });

  describe('Task Editing', () => {
    it('should open edit modal with task data', () => {
      fixture.detectChanges();

      component.editTask(mockTask);

      expect(component.showEditModal).toBe(true);
      expect(component.taskToEdit).toEqual(mockTask);
      expect(component.taskForm.value.id).toBe(mockTask.id);
      expect(component.taskForm.value.title).toBe(mockTask.title);
    });

    it('should update task on confirm edit', () => {
      fixture.detectChanges();
      component.editTask(mockTask);
      component.taskForm.patchValue({ title: 'Updated Title' });

      component.confirmEdit();

      expect(mockTasksStore.update).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({ title: 'Updated Title' })
      );
      expect(mockToastService.success).toHaveBeenCalledWith('Task updated successfully');
      expect(component.showEditModal).toBe(false);
    });

    it('should not update task with invalid form', () => {
      fixture.detectChanges();
      component.editTask(mockTask);
      component.taskForm.patchValue({ title: '' });

      component.confirmEdit();

      expect(mockTasksStore.update).not.toHaveBeenCalled();
    });

    it('should close edit modal and reset form', () => {
      fixture.detectChanges();
      component.editTask(mockTask);
      expect(component.showEditModal).toBe(true);

      component.closeEditModal();

      expect(component.showEditModal).toBe(false);
      expect(component.taskToEdit).toBeNull();
      expect(component.taskForm.value.id).toBe('');
    });

    it('should not update when taskToEdit is null', () => {
      fixture.detectChanges();
      component.taskToEdit = null;

      component.confirmEdit();

      expect(mockTasksStore.update).not.toHaveBeenCalled();
    });
  });

  describe('Task Deletion', () => {
    it('should open delete confirmation modal', () => {
      fixture.detectChanges();

      component.deleteTask(mockTask);

      expect(component.showDeleteModal).toBe(true);
      expect(component.taskToDelete).toEqual(mockTask);
    });

    it('should delete task on confirmation', () => {
      fixture.detectChanges();
      component.deleteTask(mockTask);

      component.confirmDelete();

      expect(mockTasksStore.remove).toHaveBeenCalledWith(mockTask.id);
      expect(mockToastService.success).toHaveBeenCalledWith('Task deleted successfully');
      expect(component.showDeleteModal).toBe(false);
    });

    it('should close delete modal and clear taskToDelete', () => {
      fixture.detectChanges();
      component.deleteTask(mockTask);
      expect(component.showDeleteModal).toBe(true);

      component.closeDeleteModal();

      expect(component.showDeleteModal).toBe(false);
      expect(component.taskToDelete).toBeNull();
    });

    it('should not delete when taskToDelete is null', () => {
      fixture.detectChanges();
      component.taskToDelete = null;

      component.confirmDelete();

      expect(mockTasksStore.remove).not.toHaveBeenCalled();
    });

    it('should generate correct delete message', () => {
      fixture.detectChanges();
      component.taskToDelete = mockTask;

      const message = component.getDeleteMessage();

      expect(message).toBe(`Are you sure you want to delete "${mockTask.title}"?`);
    });
  });

  describe('Task Grouping', () => {
    it('should return tasks for given status', () => {
      const tasks: Task[] = [
        { ...mockTask, id: '1', status: TaskStatus.Todo },
        { ...mockTask, id: '2', status: TaskStatus.Todo },
      ];

      tasksSubject.next(tasks);
      fixture.detectChanges();

      const todoTasks = component.getTasksByStatus(TaskStatus.Todo);

      expect(todoTasks).toHaveLength(2);
    });

    it('should return empty array for status with no tasks', () => {
      tasksSubject.next([]);
      fixture.detectChanges();

      const tasks = component.getTasksByStatus(TaskStatus.InProgress);

      expect(tasks).toEqual([]);
    });
  });

  describe('Drag and Drop', () => {
    it('should update task status when dropped in different column', () => {
      const tasks = [mockTask];
      tasksSubject.next(tasks);
      fixture.detectChanges();

      const event = {
        previousContainer: { data: [mockTask] },
        container: { data: [] },
        previousIndex: 0,
        currentIndex: 0,
      } as never;

      component.drop(event, TaskStatus.InProgress);

      expect(mockTasksStore.update).toHaveBeenCalledWith(mockTask.id, {
        status: TaskStatus.InProgress,
        order: 0,
      });
    });

    it('should update task order when dropped in same column', () => {
      const task1 = { ...mockTask, id: '1' };
      const task2 = { ...mockTask, id: '2' };
      const tasks = [task1, task2];

      const containerData = [...tasks];
      const event = {
        previousContainer: { data: containerData },
        container: { data: containerData },
        previousIndex: 0,
        currentIndex: 1,
      } as never;

      component.drop(event, TaskStatus.Todo);

      expect(mockTasksStore.update).toHaveBeenCalled();
    });
  });

  describe('Role-Based Visibility', () => {
    it('should expose authService for template access', () => {
      fixture.detectChanges();

      expect(component.authService).toBeDefined();
      expect(component.authService.getUser()).toEqual(mockUser);
    });

    it('should call logout on authService', () => {
      fixture.detectChanges();

      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should mark title as required', () => {
      fixture.detectChanges();
      const titleControl = component.taskForm.get('title');

      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);

      titleControl?.setValue('Valid Title');
      expect(titleControl?.hasError('required')).toBe(false);
    });

    it('should mark category as required', () => {
      fixture.detectChanges();
      const categoryControl = component.taskForm.get('category');

      expect(categoryControl?.hasError('required')).toBe(false); // Has default value
    });

    it('should mark status as required', () => {
      fixture.detectChanges();
      const statusControl = component.taskForm.get('status');

      expect(statusControl?.hasError('required')).toBe(false); // Has default value
    });
  });
});
