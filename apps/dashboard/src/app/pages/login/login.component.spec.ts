import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { LoginPageComponent } from './login.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let authService: { login: jest.Mock };

  beforeEach(() => {
    authService = { login: jest.fn() };
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('submits when form is valid', () => {
    component.form.patchValue({
      email: 'owner@acme.com',
      password: 'password123',
    });

    component.submit();

    expect(authService.login).toHaveBeenCalledWith('owner@acme.com', 'password123');
  });

  it('does not submit when form is invalid', () => {
    component.form.patchValue({
      email: '',
      password: '',
    });

    component.submit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
