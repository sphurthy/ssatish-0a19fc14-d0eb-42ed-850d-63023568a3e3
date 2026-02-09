import { Injectable } from '@angular/core';
import { Task, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { BehaviorSubject, finalize } from 'rxjs';
import { TaskFilters, TasksService } from './tasks.service';

@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly filtersSubject = new BehaviorSubject<TaskFilters>({
    category: '',
    status: '',
    search: '',
    sort: 'order',
  });

  readonly tasks$ = this.tasksSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly filters$ = this.filtersSubject.asObservable();

  constructor(private readonly tasksService: TasksService) {}

  load() {
    this.loadingSubject.next(true);
    const filters = this.filtersSubject.value;
    this.tasksService
      .list(filters)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe((tasks) => this.tasksSubject.next(tasks));
  }

  setFilters(filters: TaskFilters) {
    this.filtersSubject.next({ ...this.filtersSubject.value, ...filters });
    this.load();
  }

  create(task: Partial<Task>) {
    const optimisticTask = this.buildOptimisticTask(task);
    const next = this.getSortedFilteredTasks([...this.tasksSubject.value, optimisticTask]);
    this.tasksSubject.next(next);

    this.tasksService
      .create(task)
      .pipe(finalize(() => this.load()))
      .subscribe();
  }

  update(taskId: string, update: Partial<Task>) {
    const current = this.tasksSubject.value;
    const updated = current.map((task) =>
      task.id === taskId ? { ...task, ...update } : task
    );
    this.tasksSubject.next(this.getSortedFilteredTasks(updated));

    this.tasksService
      .update(taskId, update)
      .pipe(finalize(() => this.load()))
      .subscribe();
  }

  remove(taskId: string) {
    const current = this.tasksSubject.value;
    const updated = current.filter((task) => task.id !== taskId);
    this.tasksSubject.next(this.getSortedFilteredTasks(updated));

    return this.tasksService.remove(taskId).pipe(finalize(() => this.load()));
  }

  getSnapshot() {
    return this.tasksSubject.value;
  }

  private buildOptimisticTask(task: Partial<Task>): Task {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: task.title ?? '',
      description: task.description ?? null,
      category: task.category ?? TaskCategory.Work,
      status: task.status ?? TaskStatus.Todo,
      order: task.order ?? 0,
      organizationId: '',
      createdById: '',
    };
  }

  private getSortedFilteredTasks(tasks: Task[]): Task[] {
    const filters = this.filtersSubject.value;
    const filtered = tasks.filter((task) => this.matchesFilters(task, filters));
    return this.sortTasks(filtered, filters.sort ?? 'order');
  }

  private matchesFilters(task: Task, filters: TaskFilters): boolean {
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  }

  private sortTasks(tasks: Task[], sort: TaskFilters['sort']): Task[] {
    const next = [...tasks];
    if (sort === 'title') {
      next.sort((a, b) => a.title.localeCompare(b.title));
      return next;
    }
    if (sort === 'status') {
      next.sort((a, b) => a.status.localeCompare(b.status));
      return next;
    }
    next.sort((a, b) => a.order - b.order);
    return next;
  }
}
