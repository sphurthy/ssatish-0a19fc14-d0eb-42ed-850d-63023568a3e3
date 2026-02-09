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
    this.tasksService.create(task).subscribe(() => this.load());
  }

  update(taskId: string, update: Partial<Task>) {
    this.tasksService.update(taskId, update).subscribe(() => this.load());
  }

  remove(taskId: string) {
    this.tasksService.remove(taskId).subscribe(() => this.load());
  }

  getSnapshot() {
    return this.tasksSubject.value;
  }
}
