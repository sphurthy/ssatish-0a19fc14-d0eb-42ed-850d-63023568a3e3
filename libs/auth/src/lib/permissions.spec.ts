import { Permission, UserRole } from '@task-mgmt/data';
import { getRolePermissions, hasPermission } from './permissions';

describe('RBAC permissions', () => {
  it('assigns full access to owner', () => {
    const permissions = getRolePermissions(UserRole.Owner);
    expect(permissions).toContain(Permission.TaskCreate);
    expect(permissions).toContain(Permission.TaskRead);
    expect(permissions).toContain(Permission.TaskUpdate);
    expect(permissions).toContain(Permission.TaskDelete);
    expect(permissions).toContain(Permission.AuditRead);
  });

  it('restricts viewer to read-only', () => {
    expect(hasPermission(UserRole.Viewer, Permission.TaskRead)).toBe(true);
    expect(hasPermission(UserRole.Viewer, Permission.TaskCreate)).toBe(false);
    expect(hasPermission(UserRole.Viewer, Permission.TaskUpdate)).toBe(false);
    expect(hasPermission(UserRole.Viewer, Permission.TaskDelete)).toBe(false);
  });
});
