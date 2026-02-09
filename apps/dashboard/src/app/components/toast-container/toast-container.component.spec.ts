import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService, Toast } from '../../services/toast.service';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let mockToastService: any;
  let toastsSubject: BehaviorSubject<Toast[]>;

  beforeEach(async () => {
    toastsSubject = new BehaviorSubject<Toast[]>([]);

    mockToastService = {
      toasts$: toastsSubject.asObservable(),
      dismiss: jest.fn(),
    } as never;

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [{ provide: ToastService, useValue: mockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Toast Rendering', () => {
    it('should render no toasts initially', () => {
      fixture.detectChanges();

      const toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(0);
    });

    it('should render success toast with correct styling', () => {
      const successToast: Toast = {
        id: '1',
        type: 'success',
        message: 'Success message',
      };

      toastsSubject.next([successToast]);
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.rounded-lg');
      expect(toastElement).toBeTruthy();
      expect(toastElement.classList.contains('bg-green-50')).toBe(true);
      expect(toastElement.classList.contains('border-green-500')).toBe(true);

      const messageElement = toastElement.querySelector('.text-sm');
      expect(messageElement?.textContent?.trim()).toBe('Success message');
    });

    it('should render error toast with correct styling', () => {
      const errorToast: Toast = {
        id: '1',
        type: 'error',
        message: 'Error message',
      };

      toastsSubject.next([errorToast]);
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.rounded-lg');
      expect(toastElement.classList.contains('bg-red-50')).toBe(true);
      expect(toastElement.classList.contains('border-red-500')).toBe(true);
    });

    it('should render warning toast with correct styling', () => {
      const warningToast: Toast = {
        id: '1',
        type: 'warning',
        message: 'Warning message',
      };

      toastsSubject.next([warningToast]);
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.rounded-lg');
      expect(toastElement.classList.contains('bg-yellow-50')).toBe(true);
      expect(toastElement.classList.contains('border-yellow-500')).toBe(true);
    });

    it('should render info toast with correct styling', () => {
      const infoToast: Toast = {
        id: '1',
        type: 'info',
        message: 'Info message',
      };

      toastsSubject.next([infoToast]);
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.rounded-lg');
      expect(toastElement.classList.contains('bg-blue-50')).toBe(true);
      expect(toastElement.classList.contains('border-blue-500')).toBe(true);
    });

    it('should render multiple toasts', () => {
      const toasts: Toast[] = [
        { id: '1', type: 'success', message: 'Success' },
        { id: '2', type: 'error', message: 'Error' },
        { id: '3', type: 'info', message: 'Info' },
      ];

      toastsSubject.next(toasts);
      fixture.detectChanges();

      const toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(3);
    });
  });

  describe('Toast Icons', () => {
    it('should render success icon', () => {
      const toast: Toast = { id: '1', type: 'success', message: 'Success' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.text-green-600');
      expect(icon).toBeTruthy();
    });

    it('should render error icon', () => {
      const toast: Toast = { id: '1', type: 'error', message: 'Error' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.text-red-600');
      expect(icon).toBeTruthy();
    });

    it('should render warning icon', () => {
      const toast: Toast = { id: '1', type: 'warning', message: 'Warning' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.text-yellow-600');
      expect(icon).toBeTruthy();
    });

    it('should render info icon', () => {
      const toast: Toast = { id: '1', type: 'info', message: 'Info' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.text-blue-600');
      expect(icon).toBeTruthy();
    });
  });

  describe('Toast Dismissal', () => {
    it('should call dismiss when close button clicked', () => {
      const toast: Toast = { id: 'test-1', type: 'success', message: 'Test' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const dismissButton = fixture.nativeElement.querySelector('button');
      dismissButton?.click();

      expect(mockToastService.dismiss).toHaveBeenCalledWith('test-1');
    });

    it('should dismiss correct toast when multiple toasts present', () => {
      const toasts: Toast[] = [
        { id: 'toast-1', type: 'success', message: 'First' },
        { id: 'toast-2', type: 'error', message: 'Second' },
      ];
      toastsSubject.next(toasts);
      fixture.detectChanges();

      const dismissButtons = fixture.nativeElement.querySelectorAll('button');
      dismissButtons[1]?.click();

      expect(mockToastService.dismiss).toHaveBeenCalledWith('toast-2');
    });
  });

  describe('getToastClasses', () => {
    it('should return success classes', () => {
      const classes = component.getToastClasses('success');
      expect(classes).toContain('bg-green-50');
      expect(classes).toContain('border-green-500');
    });

    it('should return error classes', () => {
      const classes = component.getToastClasses('error');
      expect(classes).toContain('bg-red-50');
      expect(classes).toContain('border-red-500');
    });

    it('should return warning classes', () => {
      const classes = component.getToastClasses('warning');
      expect(classes).toContain('bg-yellow-50');
      expect(classes).toContain('border-yellow-500');
    });

    it('should return info classes', () => {
      const classes = component.getToastClasses('info');
      expect(classes).toContain('bg-blue-50');
      expect(classes).toContain('border-blue-500');
    });

    it('should return info classes for unknown type', () => {
      const classes = component.getToastClasses('unknown' as never);
      expect(classes).toContain('bg-blue-50');
      expect(classes).toContain('border-blue-500');
    });

    it('should include base classes', () => {
      const classes = component.getToastClasses('success');
      expect(classes).toContain('border-l-4');
    });
  });

  describe('Positioning and Layout', () => {
    it('should be positioned fixed at top-right', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.fixed');
      expect(container.classList.contains('top-4')).toBe(true);
      expect(container.classList.contains('right-4')).toBe(true);
    });

    it('should have high z-index for overlay', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.fixed');
      expect(container.classList.contains('z-50')).toBe(true);
    });

    it('should display toasts in column layout', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.fixed');
      expect(container.classList.contains('flex-col')).toBe(true);
    });

    it('should have gap between toasts', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.fixed');
      expect(container.classList.contains('gap-2')).toBe(true);
    });
  });

  describe('Animation', () => {
    it('should apply slide-in animation to toasts', () => {
      const toast: Toast = { id: '1', type: 'success', message: 'Success' };
      toastsSubject.next([toast]);
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.rounded-lg');
      expect(toastElement.classList.contains('animate-slide-in')).toBe(true);
    });
  });

  describe('Observable Integration', () => {
    it('should update when toasts$ emits new values', () => {
      fixture.detectChanges();

      let toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(0);

      toastsSubject.next([
        { id: '1', type: 'success', message: 'New toast' },
      ]);
      fixture.detectChanges();

      toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(1);

      toastsSubject.next([]);
      fixture.detectChanges();

      toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(0);
    });

    it('should track toasts by ID', () => {
      const toast1: Toast = { id: 'unique-1', type: 'success', message: 'First' };
      const toast2: Toast = { id: 'unique-2', type: 'error', message: 'Second' };

      toastsSubject.next([toast1]);
      fixture.detectChanges();

      toastsSubject.next([toast1, toast2]);
      fixture.detectChanges();

      const toastElements = fixture.nativeElement.querySelectorAll('.rounded-lg');
      expect(toastElements.length).toBe(2);
    });
  });
});
