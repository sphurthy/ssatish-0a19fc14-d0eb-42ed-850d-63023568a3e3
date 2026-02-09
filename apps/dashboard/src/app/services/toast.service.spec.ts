import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should add toast to toasts$ observable', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message');

      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
    });

    it('should generate unique ID for each toast', () => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Message 1');
      service.show('info', 'Message 2');

      expect(toasts).toHaveLength(2);
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('should auto-dismiss toast after duration', fakeAsync(() => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message', 1000);

      expect(toasts).toHaveLength(1);

      tick(1000);

      expect(toasts).toHaveLength(0);
    }));

    it('should not auto-dismiss when duration is 0', fakeAsync(() => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message', 0);

      expect(toasts).toHaveLength(1);

      tick(10000);

      expect(toasts).toHaveLength(1);
    }));

    it('should use default duration of 5000ms', fakeAsync(() => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message');

      expect(toasts).toHaveLength(1);

      tick(4999);
      expect(toasts).toHaveLength(1);

      tick(1);
      expect(toasts).toHaveLength(0);
    }));

    it('should support multiple toasts at once', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('success', 'Success message', 0);
      service.show('error', 'Error message', 0);
      service.show('warning', 'Warning message', 0);

      expect(toasts).toHaveLength(3);
      expect(toasts[0].type).toBe('success');
      expect(toasts[1].type).toBe('error');
      expect(toasts[2].type).toBe('warning');
    });
  });

  describe('success', () => {
    it('should create success toast', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.success('Success message');

      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Success message');
    });

    it('should use custom duration', fakeAsync(() => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.success('Success message', 2000);

      expect(toasts).toHaveLength(1);

      tick(2000);

      expect(toasts).toHaveLength(0);
    }));
  });

  describe('error', () => {
    it('should create error toast', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.error('Error message');

      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Error message');
    });

    it('should use custom duration', fakeAsync(() => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.error('Error message', 3000);

      expect(toasts).toHaveLength(1);

      tick(3000);

      expect(toasts).toHaveLength(0);
    }));
  });

  describe('warning', () => {
    it('should create warning toast', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.warning('Warning message');

      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Warning message');
    });
  });

  describe('info', () => {
    it('should create info toast', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.info('Info message');

      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('Info message');
    });
  });

  describe('dismiss', () => {
    it('should remove toast by ID', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message', 0);
      const toastId = toasts[0].id;

      service.dismiss(toastId);

      expect(toasts).toHaveLength(0);
    });

    it('should only remove specified toast', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Message 1', 0);
      service.show('info', 'Message 2', 0);

      const toast1Id = toasts[0].id;

      service.dismiss(toast1Id);

      expect(toasts).toHaveLength(1);
      expect(toasts[0].id).not.toBe(toast1Id);
    });

    it('should handle dismissing non-existent toast gracefully', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('info', 'Test message', 0);

      expect(() => {
        service.dismiss('nonexistent-id');
      }).not.toThrow();

      expect(toasts).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.show('success', 'Success', 0);
      service.show('error', 'Error', 0);
      service.show('warning', 'Warning', 0);

      expect(toasts).toHaveLength(3);

      service.clear();

      expect(toasts).toHaveLength(0);
    });

    it('should clear toasts even when empty', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      expect(() => {
        service.clear();
      }).not.toThrow();

      expect(toasts).toHaveLength(0);
    });
  });

  describe('toasts$ observable', () => {
    it('should emit empty array initially', () => {
      let toasts: Toast[] = [];
      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      expect(toasts).toEqual([]);
    });

    it('should emit updates to all subscribers', () => {
      const subscriber1Toasts: Toast[][] = [];
      const subscriber2Toasts: Toast[][] = [];

      service.toasts$.subscribe((t) => {
        subscriber1Toasts.push([...t]);
      });

      service.toasts$.subscribe((t) => {
        subscriber2Toasts.push([...t]);
      });

      service.show('info', 'Test message', 0);

      expect(subscriber1Toasts.length).toBeGreaterThan(0);
      expect(subscriber2Toasts.length).toBeGreaterThan(0);
      expect(subscriber1Toasts[subscriber1Toasts.length - 1]).toHaveLength(1);
    });
  });

  describe('Toast Lifecycle', () => {
    it('should create, display, and auto-dismiss toast', fakeAsync(() => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      // Initial state
      expect(toasts).toHaveLength(0);

      // Create toast
      service.success('Success message', 1000);
      expect(toasts).toHaveLength(1);

      // Still visible before duration
      tick(999);
      expect(toasts).toHaveLength(1);

      // Auto-dismissed after duration
      tick(1);
      expect(toasts).toHaveLength(0);
    }));

    it('should handle rapid consecutive toasts', fakeAsync(() => {
      let toasts: Toast[] = [];

      service.toasts$.subscribe((t) => {
        toasts = t;
      });

      service.success('Toast 1', 1000);
      service.success('Toast 2', 2000);
      service.success('Toast 3', 3000);

      expect(toasts).toHaveLength(3);

      tick(1000);
      expect(toasts).toHaveLength(2);

      tick(1000);
      expect(toasts).toHaveLength(1);

      tick(1000);
      expect(toasts).toHaveLength(0);
    }));
  });
});
