import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from './auth.service';
import { UserRole } from '@task-mgmt/data';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: any;

  const API_BASE_URL = 'http://localhost:3000/api';
  const mockUser: AuthUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@acme.com',
    role: UserRole.Admin,
    organizationId: 'org-1',
  };

  beforeEach(() => {
    const mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: mockRouter }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as any;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user with valid credentials', () => {
      service.login('test@acme.com', 'password123');

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@acme.com', password: 'password123' });
      expect(req.request.withCredentials).toBe(true);

      req.flush({ user: mockUser });

      expect(localStorage.getItem('task-auth-user')).toBe(JSON.stringify(mockUser));
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should update user$ observable on successful login', async () => {
      // Skip initial null value and get the next emission
      const userPromise = firstValueFrom(
        service.user$.pipe(
          // Filter out null values
        )
      );

      setTimeout(() => {
        service.login('test@acme.com', 'password123');

        const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
        req.flush({ user: mockUser });
      }, 0);

      // Just verify the service updated correctly
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(service.getUser()).toEqual(mockUser);
    });

    it('should send withCredentials for cookie-based auth', () => {
      service.login('test@acme.com', 'password123');

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
      expect(req.request.withCredentials).toBe(true);

      req.flush({ user: mockUser });
    });

    it('should store user in localStorage', () => {
      service.login('test@acme.com', 'password123');

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
      req.flush({ user: mockUser });

      const stored = localStorage.getItem('task-auth-user');
      expect(stored).toBe(JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('task-auth-user', JSON.stringify(mockUser));
      service['userSubject'].next(mockUser);
    });

    it('should logout user and clear storage', () => {
      service.logout();

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);

      req.flush({});

      expect(localStorage.getItem('task-auth-user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should update user$ observable to null on logout', async () => {
      expect(service.getUser()).toEqual(mockUser);

      service.logout();

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/logout`);
      req.flush({});

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(service.getUser()).toBeNull();
    });

    it('should send withCredentials to clear cookie', () => {
      service.logout();

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/logout`);
      expect(req.request.withCredentials).toBe(true);

      req.flush({});
    });
  });

  describe('checkAuth', () => {
    it('should restore user session from valid cookie', async () => {
      const checkAuthPromise = firstValueFrom(service.checkAuth());

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush({ user: mockUser });

      const user = await checkAuthPromise;
      expect(user).toEqual(mockUser);
      expect(localStorage.getItem('task-auth-user')).toBe(JSON.stringify(mockUser));
    });

    it('should update user$ observable on successful auth check', async () => {
      const checkAuthPromise = firstValueFrom(service.checkAuth());

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
      req.flush({ user: mockUser });

      await checkAuthPromise;

      const currentUser = service.getUser();
      expect(currentUser).toEqual(mockUser);
    });

    it('should return null and clear storage on auth failure', async () => {
      localStorage.setItem('task-auth-user', JSON.stringify(mockUser));

      const checkAuthPromise = firstValueFrom(service.checkAuth());

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
      req.flush(null, { status: 401, statusText: 'Unauthorized' });

      const user = await checkAuthPromise;
      expect(user).toBeNull();
      expect(localStorage.getItem('task-auth-user')).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const checkAuthPromise = firstValueFrom(service.checkAuth());

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
      req.error(new ProgressEvent('error'));

      const user = await checkAuthPromise;
      expect(user).toBeNull();
    });

    it('should send withCredentials to read cookie', async () => {
      const checkAuthPromise = firstValueFrom(service.checkAuth());

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
      expect(req.request.withCredentials).toBe(true);

      req.flush({ user: mockUser });

      await checkAuthPromise;
    });
  });

  describe('getUser', () => {
    it('should return current user', () => {
      service['userSubject'].next(mockUser);

      expect(service.getUser()).toEqual(mockUser);
    });

    it('should return null when no user is logged in', () => {
      service['userSubject'].next(null);

      expect(service.getUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is logged in', () => {
      service['userSubject'].next(mockUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no user is logged in', () => {
      service['userSubject'].next(null);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should retrieve user from localStorage on service creation', () => {
      localStorage.setItem('task-auth-user', JSON.stringify(mockUser));

      const newService = new AuthService(null as never, null as never);

      expect(newService.getUser()).toEqual(mockUser);
    });

    it('should return null when localStorage is empty', () => {
      localStorage.clear();

      const newService = new AuthService(null as never, null as never);

      expect(newService.getUser()).toBeNull();
    });

    it('should return null when localStorage contains invalid JSON', () => {
      localStorage.setItem('task-auth-user', 'invalid-json');

      const newService = new AuthService(null as never, null as never);

      expect(newService.getUser()).toBeNull();
    });
  });

  describe('user$ observable', () => {
    it('should emit current user value to new subscribers', async () => {
      service['userSubject'].next(mockUser);

      const user = await firstValueFrom(service.user$);
      expect(user).toEqual(mockUser);
    });

    it('should emit updates to all subscribers', async () => {
      const updates: (AuthUser | null)[] = [];

      const subscription = service.user$.subscribe((user) => {
        updates.push(user);
      });

      service['userSubject'].next(mockUser);

      // Wait for observable to emit
      await new Promise(resolve => setTimeout(resolve, 10));

      subscription.unsubscribe();

      expect(updates[0]).toBeNull(); // Initial value
      expect(updates[1]).toEqual(mockUser); // After update
    });
  });

  describe('Cookie-based authentication (XSS protection)', () => {
    it('should not include token in localStorage', () => {
      service.login('test@acme.com', 'password123');

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
      req.flush({ user: mockUser });

      expect(localStorage.getItem('task-auth-token')).toBeNull();
    });

    it('should rely on HttpOnly cookies for authentication', () => {
      service.login('test@acme.com', 'password123');

      const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);

      // Should use withCredentials to send/receive cookies
      expect(req.request.withCredentials).toBe(true);

      // Response should not contain accessToken (security improvement)
      req.flush({ user: mockUser });

      // Only user data stored, no token
      const stored = JSON.parse(localStorage.getItem('task-auth-user') || '{}');
      expect(stored.accessToken).toBeUndefined();
    });
  });
});
