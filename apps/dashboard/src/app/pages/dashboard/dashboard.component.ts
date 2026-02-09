import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { AuthService } from '../../services/auth.service';
import { TaskFilters } from '../../services/tasks.service';
import { TasksStore } from '../../services/tasks.store';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, ModalComponent, ConfirmationModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tasksStore = inject(TasksStore);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly categories = Object.values(TaskCategory);
  readonly statuses = Object.values(TaskStatus);
  readonly sortOptions = ['order', 'title', 'status'] as const;

  readonly filtersForm = this.fb.group({
    search: [''],
    category: [''],
    status: [''],
    sort: ['order'],
  });

  readonly taskForm = this.fb.group({
    id: [''],
    title: ['', [Validators.required]],
    description: [''],
    category: [TaskCategory.Work, [Validators.required]],
    status: [TaskStatus.Todo, [Validators.required]],
    order: [0],
  });

  tasks: Task[] = [];
  groupedTasks: Record<TaskStatus, Task[]> = {
    [TaskStatus.Todo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Done]: [],
  };
  loading = false;

  // Modal state
  showEditModal = false;
  showDeleteModal = false;
  taskToEdit: Task | null = null;
  taskToDelete: Task | null = null;

  ngOnInit() {
    this.tasksStore.tasks$.subscribe((tasks) => {
      this.tasks = tasks;
      this.groupedTasks = {
        [TaskStatus.Todo]: tasks.filter((task) => task.status === TaskStatus.Todo),
        [TaskStatus.InProgress]: tasks.filter(
          (task) => task.status === TaskStatus.InProgress
        ),
        [TaskStatus.Done]: tasks.filter((task) => task.status === TaskStatus.Done),
      };
    });
    this.tasksStore.loading$.subscribe((loading) => (this.loading = loading));
    this.tasksStore.load();
  }

  applyFilters() {
    const v = this.filtersForm.value;
    const filters: TaskFilters = {
      search: v.search ?? '',
      category: (v.category as TaskCategory | '') || undefined,
      status: (v.status as TaskStatus | '') || undefined,
      sort: (v.sort as 'order' | 'title' | 'status') || 'order',
    };
    this.tasksStore.setFilters(filters);
  }

  clearFilters() {
    this.filtersForm.reset({
      search: '',
      category: '',
      status: '',
      sort: 'order',
    });
    this.applyFilters();
  }

  submitTask() {
    if (this.taskForm.invalid) {
      return;
    }

    const value = this.taskForm.value;
    const payload: Partial<Task> = {
      title: value.title ?? '',
      description: value.description ?? '',
      category: (value.category as TaskCategory) ?? TaskCategory.Work,
      status: (value.status as TaskStatus) ?? TaskStatus.Todo,
      order: value.order ?? 0,
    };

    if (value.id) {
      this.tasksStore.update(value.id, payload);
      this.toastService.success('Task updated successfully');
    } else {
      this.tasksStore.create(payload);
      this.toastService.success('Task created successfully');
    }

    this.taskForm.reset({
      id: '',
      title: '',
      description: '',
      category: TaskCategory.Work,
      status: TaskStatus.Todo,
      order: 0,
    });
  }

  editTask(task: Task) {
    this.taskToEdit = task;
    this.showEditModal = true;
    this.taskForm.patchValue({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      category: task.category,
      status: task.status,
      order: task.order,
    });
  }

  confirmEdit() {
    if (this.taskForm.invalid || !this.taskToEdit) {
      return;
    }

    const value = this.taskForm.value;
    const payload: Partial<Task> = {
      title: value.title ?? '',
      description: value.description ?? '',
      category: (value.category as TaskCategory) ?? TaskCategory.Work,
      status: (value.status as TaskStatus) ?? TaskStatus.Todo,
      order: value.order ?? 0,
    };

    this.tasksStore.update(this.taskToEdit.id, payload);
    this.toastService.success('Task updated successfully');
    this.closeEditModal();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.taskToEdit = null;
    this.taskForm.reset({
      id: '',
      title: '',
      description: '',
      category: TaskCategory.Work,
      status: TaskStatus.Todo,
      order: 0,
    });
  }

  deleteTask(task: Task) {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.taskToDelete) {
      return;
    }

    this.tasksStore.remove(this.taskToDelete.id);
    this.toastService.success('Task deleted successfully');
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  getDeleteMessage(): string {
    return `Are you sure you want to delete "${this.taskToDelete?.title}"?`;
  }

  getTasksByStatus(status: TaskStatus) {
    return this.groupedTasks[status] ?? [];
  }

  drop(event: CdkDragDrop<Task[]>, status: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const movedTask = event.container.data[event.currentIndex];
    if (movedTask) {
      this.tasksStore.update(movedTask.id, {
        status,
        order: event.currentIndex,
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
