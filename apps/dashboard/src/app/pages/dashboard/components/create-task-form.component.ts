import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskCategory, TaskStatus } from '@task-mgmt/data';

@Component({
  selector: 'app-create-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section
      class="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900"
      data-testid="task-form-section"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Create / Edit Task
      </h2>
      <form
        class="mt-4 grid gap-4 md:grid-cols-2"
        [formGroup]="form"
        (ngSubmit)="submitTask.emit()"
        data-testid="task-form"
      >
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
          <input
            formControlName="title"
            class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-400"
            data-testid="task-title"
          />
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
          <textarea
            formControlName="description"
            rows="2"
            class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-400"
            data-testid="task-description"
          ></textarea>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
          <select
            formControlName="category"
            class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            data-testid="task-category"
          >
            <option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <select
            formControlName="status"
            class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            data-testid="task-status"
          >
            <option *ngFor="let status of statuses" [value]="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            data-testid="task-save"
          >
            Save Task
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-200 px-4 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            (click)="clearTask.emit()"
            data-testid="task-clear"
          >
            Clear
          </button>
        </div>
      </form>
    </section>
  `,
})
export class CreateTaskFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) categories: TaskCategory[] = [];
  @Input({ required: true }) statuses: TaskStatus[] = [];

  @Output() submitTask = new EventEmitter<void>();
  @Output() clearTask = new EventEmitter<void>();
}
