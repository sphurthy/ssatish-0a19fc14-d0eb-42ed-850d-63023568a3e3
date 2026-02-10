import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskCategory, TaskStatus } from '@task-mgmt/data';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section
      class="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900"
      data-testid="task-filters"
    >
      <div class="flex flex-wrap items-end gap-4" [formGroup]="form">
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Search</label>
          <input
            formControlName="search"
            class="mt-1 w-64 rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Search tasks"
            data-testid="filter-search"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
          <select
            class="mt-1 w-40 rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            formControlName="category"
            data-testid="filter-category"
          >
            <option value="">All</option>
            <option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <select
            class="mt-1 w-40 rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            formControlName="status"
            data-testid="filter-status"
          >
            <option value="">All</option>
            <option *ngFor="let status of statuses" [value]="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Sort</label>
          <select
            class="mt-1 w-40 rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            formControlName="sort"
            data-testid="filter-sort"
          >
            <option *ngFor="let sort of sortOptions" [value]="sort">
              {{ sort }}
            </option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            (click)="applyFilters.emit()"
            data-testid="filter-apply"
          >
            Apply
          </button>
          <button
            class="rounded-md border border-slate-200 px-4 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            (click)="clearFilters.emit()"
            data-testid="filter-clear"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  `,
})
export class TaskFiltersComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) categories: TaskCategory[] = [];
  @Input({ required: true }) statuses: TaskStatus[] = [];
  @Input({ required: true }) sortOptions: ReadonlyArray<'order' | 'title' | 'status'> = ['order'];

  @Output() applyFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
}
