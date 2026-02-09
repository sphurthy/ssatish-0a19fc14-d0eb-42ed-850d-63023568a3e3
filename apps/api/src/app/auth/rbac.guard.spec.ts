import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@task-mgmt/auth';
import { Permission, UserRole } from '@task-mgmt/data';
import { AuditLogService } from '../audit/audit-log.service';
import { RbacGuard } from './rbac.guard';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: jest.Mocked<Reflector>;
  let auditLogService: jest.Mocked<AuditLogService>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as never;

    auditLogService = {
      log: jest.fn(),
    } as never;

    guard = new RbacGuard(reflector, auditLogService);
  });

  const createMockContext = (
    user: { id: string; role: UserRole } | undefined,
    method = 'GET',
    url = '/tasks'
  ): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user, method, url }),
      }),
    } as never;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no permissions required', () => {
      reflector.getAllAndOverride.mockReturnValue(null);
      const context = createMockContext({ id: 'user-1', role: UserRole.Admin });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when required permissions array is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext({ id: 'user-1', role: UserRole.Admin });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow Owner to access TaskRead endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);
      const context = createMockContext({ id: 'owner-1', role: UserRole.Owner });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'owner-1',
        action: 'GET /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should allow Owner to access TaskCreate endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskCreate]);
      const context = createMockContext({ id: 'owner-1', role: UserRole.Owner }, 'POST', '/tasks');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'owner-1',
        action: 'POST /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should allow Owner to access Owner-specific permissions', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.UserManage]);
      const context = createMockContext({ id: 'owner-1', role: UserRole.Owner }, 'GET', '/users');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'owner-1',
        action: 'GET /users',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should allow Admin to access TaskRead endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);
      const context = createMockContext({ id: 'admin-1', role: UserRole.Admin });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'admin-1',
        action: 'GET /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should allow Admin to access TaskCreate endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskCreate]);
      const context = createMockContext({ id: 'admin-1', role: UserRole.Admin }, 'POST', '/tasks');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'admin-1',
        action: 'POST /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should deny Admin access to Owner-specific permissions', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.UserManage]);
      const context = createMockContext({ id: 'admin-1', role: UserRole.Admin }, 'GET', '/users');

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'admin-1',
        action: 'GET /users',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should allow Viewer to access TaskRead endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'GET /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should deny Viewer access to TaskCreate endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskCreate]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer }, 'POST', '/tasks');

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'POST /tasks',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should deny Viewer access to TaskUpdate endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskUpdate]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer }, 'PUT', '/tasks/1');

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'PUT /tasks/1',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should deny Viewer access to TaskDelete endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskDelete]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer }, 'DELETE', '/tasks/1');

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'DELETE /tasks/1',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should deny access when user is not authenticated', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);
      const context = createMockContext(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'anonymous',
        action: 'GET /tasks',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should require all permissions to be satisfied', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Permission.TaskCreate,
        Permission.TaskUpdate,
      ]);
      const context = createMockContext({ id: 'admin-1', role: UserRole.Admin }, 'POST', '/tasks');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'admin-1',
        action: 'POST /tasks',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should deny access if any required permission is missing', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Permission.TaskRead,
        Permission.UserManage, // Viewer doesn't have this
      ]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'GET /tasks',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should log audit entry for allowed access', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);
      const context = createMockContext({ id: 'user-1', role: UserRole.Admin }, 'GET', '/tasks?status=todo');

      guard.canActivate(context);

      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'GET /tasks?status=todo',
        resource: 'rbac',
        allowed: true,
      });
    });

    it('should log audit entry for denied access', () => {
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskCreate]);
      const context = createMockContext({ id: 'viewer-1', role: UserRole.Viewer }, 'POST', '/tasks');

      guard.canActivate(context);

      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'viewer-1',
        action: 'POST /tasks',
        resource: 'rbac',
        allowed: false,
      });
    });

    it('should use reflector to get permissions from handler and class', () => {
      const context = createMockContext({ id: 'user-1', role: UserRole.Admin });
      reflector.getAllAndOverride.mockReturnValue([Permission.TaskRead]);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()]
      );
    });
  });
});
