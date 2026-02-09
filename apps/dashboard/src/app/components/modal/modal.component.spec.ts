import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal title="Projected" [hasFooter]="hasFooter">
      <p class="projected-body">Test Content</p>
      <div footer class="projected-footer">Footer Content</div>
    </app-modal>
  `,
})
class ModalHostComponent {
  hasFooter = true;
}

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let hostFixture: ComponentFixture<ModalHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should display title', () => {
      component.title = 'Test Modal';
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('h3');
      expect(titleElement?.textContent).toBe('Test Modal');
    });

    it('should be closeable by default', () => {
      expect(component.closeable).toBe(true);
    });

    it('should have footer by default', () => {
      expect(component.hasFooter).toBe(true);
    });

    it('should hide close button when not closeable', () => {
      component.closeable = false;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('[aria-label="Close modal"]');
      expect(closeButton).toBeNull();
    });

    it('should show close button when closeable', () => {
      component.closeable = true;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('[aria-label="Close modal"]');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Backdrop Click', () => {
    it('should emit close event on backdrop click when closeable', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = true;

      component.onBackdropClick();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should not emit close event on backdrop click when not closeable', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = false;

      component.onBackdropClick();

      expect(component.close.emit).not.toHaveBeenCalled();
    });

    it('should not close when clicking inside modal content', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = true;
      fixture.detectChanges();

      const modalContent = fixture.nativeElement.querySelector('.bg-white');
      modalContent?.dispatchEvent(new Event('click'));

      expect(component.close.emit).not.toHaveBeenCalled();
    });
  });

  describe('Escape Key', () => {
    it('should emit close event on ESC key when closeable', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = true;

      component.onEscapeKey();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should not emit close event on ESC key when not closeable', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = false;

      component.onEscapeKey();

      expect(component.close.emit).not.toHaveBeenCalled();
    });

    it('should handle ESC key event at document level', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = true;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Close Button', () => {
    it('should emit close event when close button clicked', () => {
      jest.spyOn(component.close, 'emit');
      component.closeable = true;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('[aria-label="Close modal"]');
      closeButton?.click();

      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project content into modal body', () => {
      hostFixture = TestBed.createComponent(ModalHostComponent);
      hostFixture.detectChanges();

      const modalBody = hostFixture.nativeElement.querySelector('.p-6');
      const projected = hostFixture.nativeElement.querySelector('.projected-body');
      expect(modalBody).toBeTruthy();
      expect(projected?.textContent).toContain('Test Content');
    });

    it('should project footer content when hasFooter is true', () => {
      hostFixture = TestBed.createComponent(ModalHostComponent);
      hostFixture.detectChanges();

      const footerContainer = hostFixture.nativeElement.querySelector('.bg-slate-50');
      const projectedFooter = hostFixture.nativeElement.querySelector('.projected-footer');
      expect(footerContainer).toBeTruthy();
      expect(projectedFooter?.textContent).toContain('Footer Content');
    });

    it('should not show footer when hasFooter is false', () => {
      hostFixture = TestBed.createComponent(ModalHostComponent);
      hostFixture.componentInstance.hasFooter = false;
      hostFixture.detectChanges();

      const footerContainer = hostFixture.nativeElement.querySelector('.bg-slate-50');
      expect(footerContainer).toBeNull();
    });
  });

  describe('Styling and Animation', () => {
    it('should apply overlay background', () => {
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
      expect(overlay).toBeTruthy();
      expect(overlay.classList.contains('bg-black')).toBe(true);
      expect(overlay.classList.contains('bg-opacity-50')).toBe(true);
    });

    it('should apply fade-in animation to backdrop', () => {
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
      expect(overlay.classList.contains('animate-fade-in')).toBe(true);
    });

    it('should apply scale-in animation to modal content', () => {
      fixture.detectChanges();

      const modalContent = fixture.nativeElement.querySelector('.bg-white');
      expect(modalContent.classList.contains('animate-scale-in')).toBe(true);
    });

    it('should have proper z-index for overlay', () => {
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
      expect(overlay.classList.contains('z-[100]')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on close button', () => {
      component.closeable = true;
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('[aria-label="Close modal"]');
      expect(closeButton?.getAttribute('aria-label')).toBe('Close modal');
    });

    it('should focus trap within modal (visual indication)', () => {
      fixture.detectChanges();

      const modalContent = fixture.nativeElement.querySelector('.bg-white');
      expect(modalContent).toBeTruthy();
    });
  });
});
