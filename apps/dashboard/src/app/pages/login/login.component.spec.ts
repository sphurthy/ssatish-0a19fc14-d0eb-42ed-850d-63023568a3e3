import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { LoginPageComponent } from './login.component';

describe('LoginPageComponent', () => {
  it('creates the component', () => {
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
