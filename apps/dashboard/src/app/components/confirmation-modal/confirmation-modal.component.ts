import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      [title]="title"
      (close)="cancel.emit()"
    >
      <div class="text-slate-700">
        <p>{{ message }}</p>
        @if (details) {
          <p class="mt-2 text-sm text-slate-500">{{ details }}</p>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        <button
          (click)="cancel.emit()"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          (click)="confirm.emit()"
          [class]="getConfirmButtonClasses()"
          class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        >
          {{ confirmText }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() details?: string;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmType: 'danger' | 'primary' = 'primary';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getConfirmButtonClasses(): string {
    if (this.confirmType === 'danger') {
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  }
}
