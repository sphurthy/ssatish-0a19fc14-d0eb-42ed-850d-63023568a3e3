import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';

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
      .post<{ user: AuthUser }>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
      .subscribe({
        next: (response) => {
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.userSubject.next(response.user);
          this.router.navigate(['/tasks']);
        },
      });
  }

  logout() {
    return this.http
      .post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        localStorage.removeItem(USER_KEY);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
      });
  }

  checkAuth(): Observable<AuthUser | null> {
    return this.http
      .get<{ user: AuthUser }>(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.userSubject.next(user);
        }),
        catchError(() => {
          localStorage.removeItem(USER_KEY);
          this.userSubject.next(null);
          return of(null);
        })
      );
  }

  getUser() {
    return this.userSubject.value;
  }

  isAuthenticated() {
    return !!this.getUser();
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
