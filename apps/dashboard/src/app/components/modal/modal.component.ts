import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in"
      (click)="onBackdropClick()"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
          @if (closeable) {
            <button
              (click)="close.emit()"
              class="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          }
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        @if (hasFooter) {
          <div class="p-4 border-t border-slate-200 bg-slate-50">
            <ng-content select="[footer]"></ng-content>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scale-in {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }

      .animate-scale-in {
        animation: scale-in 0.2s ease-out;
      }
    `,
  ],
})
export class ModalComponent {
  @Input() title = '';
  @Input() closeable = true;
  @Input() hasFooter = true;
  @Output() close = new EventEmitter<void>();

  onBackdropClick() {
    if (this.closeable) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.closeable) {
      this.close.emit();
    }
  }
}
