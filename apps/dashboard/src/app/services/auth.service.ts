import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'task-auth-token';
const USER_KEY = 'task-auth-user';
const API_BASE_URL = 'http://localhost:3000/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(
    this.getStoredUser()
  );

  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string; user: AuthUser }>(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem(TOKEN_KEY, response.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.userSubject.next(response.user);
          this.router.navigate(['/tasks']);
        },
      });
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser() {
    return this.userSubject.value;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
