import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { ModalComponent } from '../modal/modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent, ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default title', () => {
      expect(component.title).toBe('Confirm Action');
    });

    it('should have default message', () => {
      expect(component.message).toBe('Are you sure you want to proceed?');
    });

    it('should have default confirm text', () => {
      expect(component.confirmText).toBe('Confirm');
    });

    it('should have default cancel text', () => {
      expect(component.cancelText).toBe('Cancel');
    });

    it('should have default confirm type as primary', () => {
      expect(component.confirmType).toBe('primary');
    });

    it('should display custom title', () => {
      component.title = 'Delete Item';
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('h3');
      expect(titleElement?.textContent).toBe('Delete Item');
    });

    it('should display custom message', () => {
      component.message = 'This action cannot be undone';
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('.text-slate-700 p');
      expect(messageElement?.textContent?.trim()).toBe('This action cannot be undone');
    });

    it('should display details when provided', () => {
      component.details = 'Additional information';
      fixture.detectChanges();

      const detailsElement = fixture.nativeElement.querySelector('.text-sm.text-slate-500');
      expect(detailsElement?.textContent?.trim()).toBe('Additional information');
    });

    it('should not show details section when details is undefined', () => {
      component.details = undefined;
      fixture.detectChanges();

      const detailsElement = fixture.nativeElement.querySelector('.text-sm.text-slate-500');
      expect(detailsElement).toBeNull();
    });

    it('should display custom confirm text', () => {
      component.confirmText = 'Delete';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const confirmButton = (Array.from(buttons) as Element[]).find(
        (btn: Element) => btn.textContent?.trim().includes('Delete')
      );
      expect(confirmButton).toBeTruthy();
    });

    it('should display custom cancel text', () => {
      component.cancelText = 'Nevermind';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const cancelButton = (Array.from(buttons) as Element[]).find(
        (btn: Element) => btn.textContent?.trim().includes('Nevermind')
      );
      expect(cancelButton).toBeTruthy();
    });
  });

  describe('Confirm Button Styling', () => {
    it('should apply primary button classes by default', () => {
      component.confirmType = 'primary';
      fixture.detectChanges();

      const classes = component.getConfirmButtonClasses();

      expect(classes).toContain('bg-blue-600');
      expect(classes).toContain('hover:bg-blue-700');
      expect(classes).toContain('focus:ring-blue-500');
    });

    it('should apply danger button classes when confirmType is danger', () => {
      component.confirmType = 'danger';
      fixture.detectChanges();

      const classes = component.getConfirmButtonClasses();

      expect(classes).toContain('bg-red-600');
      expect(classes).toContain('hover:bg-red-700');
      expect(classes).toContain('focus:ring-red-500');
    });

    it('should render danger button in DOM', () => {
      component.confirmType = 'danger';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const confirmButton = (Array.from(buttons) as Element[]).find((btn: Element) =>
        btn.classList.contains('bg-red-600')
      ) as HTMLElement;

      expect(confirmButton).toBeTruthy();
    });

    it('should render primary button in DOM', () => {
      component.confirmType = 'primary';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const confirmButton = (Array.from(buttons) as Element[]).find((btn: Element) =>
        btn.classList.contains('bg-blue-600')
      ) as HTMLElement;

      expect(confirmButton).toBeTruthy();
    });
  });

  describe('Event Emissions', () => {
    it('should emit confirm event when confirm button clicked', () => {
      jest.spyOn(component.confirm, 'emit');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      const confirmButton = buttons[1] as HTMLElement; // Second button is confirm

      confirmButton.click();

      expect(component.confirm.emit).toHaveBeenCalled();
    });

    it('should emit cancel event when cancel button clicked', () => {
      jest.spyOn(component.cancel, 'emit');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      const cancelButton = buttons[0] as HTMLElement; // First button is cancel

      cancelButton.click();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should emit cancel event when modal close is triggered', () => {
      jest.spyOn(component.cancel, 'emit');
      fixture.detectChanges();

      // Simulate modal close event
      const modalComponent = fixture.debugElement.children[0].componentInstance as ModalComponent;
      modalComponent.close.emit();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should not emit confirm event when cancel clicked', () => {
      jest.spyOn(component.confirm, 'emit');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      const cancelButton = buttons[0] as HTMLElement;

      cancelButton.click();

      expect(component.confirm.emit).not.toHaveBeenCalled();
    });

    it('should not emit cancel event when confirm clicked', () => {
      jest.spyOn(component.cancel, 'emit');
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      const confirmButton = buttons[1] as HTMLElement;

      confirmButton.click();

      expect(component.cancel.emit).not.toHaveBeenCalled();
    });
  });

  describe('Button Layout', () => {
    it('should render two buttons in footer', () => {
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(buttons.length).toBe(2);
    });

    it('should render cancel button first', () => {
      component.cancelText = 'Cancel Test';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(buttons[0].textContent?.trim()).toContain('Cancel Test');
    });

    it('should render confirm button second', () => {
      component.confirmText = 'Confirm Test';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(buttons[1].textContent?.trim()).toContain('Confirm Test');
    });

    it('should style cancel button as secondary', () => {
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      const cancelButton = buttons[0];

      expect(cancelButton.classList.contains('bg-white')).toBe(true);
      expect(cancelButton.classList.contains('border-slate-300')).toBe(true);
    });
  });

  describe('Integration with ModalComponent', () => {
    it('should pass title to modal component', () => {
      component.title = 'Custom Title';
      fixture.detectChanges();

      const modalTitle = fixture.nativeElement.querySelector('h3');
      expect(modalTitle?.textContent).toBe('Custom Title');
    });

    it('should use modal component for layout', () => {
      fixture.detectChanges();

      const modalElement = fixture.nativeElement.querySelector('app-modal');
      expect(modalElement).toBeTruthy();
    });

    it('should project content into modal body', () => {
      component.message = 'Test Message';
      fixture.detectChanges();

      const modalBody = fixture.nativeElement.querySelector('.text-slate-700');
      expect(modalBody).toBeTruthy();
    });

    it('should project footer into modal footer', () => {
      fixture.detectChanges();

      const footerButtons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(footerButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have clear button labels', () => {
      component.confirmText = 'Delete Forever';
      component.cancelText = 'Keep It';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(buttons[0].textContent?.trim()).toBe('Keep It');
      expect(buttons[1].textContent?.trim()).toBe('Delete Forever');
    });

    it('should use semantic button elements', () => {
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      buttons.forEach((button: Element) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Common Use Cases', () => {
    it('should configure for destructive action (delete)', () => {
      component.title = 'Delete Task';
      component.message = 'Are you sure you want to delete this task?';
      component.details = 'This action cannot be undone.';
      component.confirmText = 'Delete';
      component.cancelText = 'Cancel';
      component.confirmType = 'danger';
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('h3');
      const messageElement = fixture.nativeElement.querySelector('.text-slate-700 p');
      const detailsElement = fixture.nativeElement.querySelector('.text-sm.text-slate-500');
      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');

      expect(titleElement?.textContent).toBe('Delete Task');
      expect(messageElement?.textContent?.trim()).toBe('Are you sure you want to delete this task?');
      expect(detailsElement?.textContent?.trim()).toBe('This action cannot be undone.');
      expect(buttons[1].textContent?.trim()).toBe('Delete');
      expect(buttons[1].classList.contains('bg-red-600')).toBe(true);
    });

    it('should configure for non-destructive action', () => {
      component.title = 'Save Changes';
      component.message = 'Do you want to save your changes?';
      component.confirmText = 'Save';
      component.confirmType = 'primary';
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('[footer] button');
      expect(buttons[1].classList.contains('bg-blue-600')).toBe(true);
    });
  });
});
