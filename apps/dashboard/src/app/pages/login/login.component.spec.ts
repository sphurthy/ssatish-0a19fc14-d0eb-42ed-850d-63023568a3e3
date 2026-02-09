import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { LoginPageComponent } from './login.component';

describe('LoginPageComponent', () => {
  it('creates the component', () => {
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: { login: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
