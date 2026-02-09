import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.group({
    email: ['owner@acme.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      return;
    }
    const { email, password } = this.form.value;
    this.authService.login(email ?? '', password ?? '');
  }
}
