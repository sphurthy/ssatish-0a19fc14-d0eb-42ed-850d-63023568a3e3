import { Permission, UserRole } from '@task-mgmt/data';
import { getRolePermissions, hasPermission } from './permissions';

describe('RBAC permissions', () => {
  describe('Viewer role', () => {
    it('should have only TaskRead permission', () => {
      const permissions = getRolePermissions(UserRole.Viewer);
      expect(permissions).toHaveLength(1);
      expect(permissions).toContain(Permission.TaskRead);
    });

    it('should not have create, update, or delete permissions', () => {
      expect(hasPermission(UserRole.Viewer, Permission.TaskRead)).toBe(true);
      expect(hasPermission(UserRole.Viewer, Permission.TaskCreate)).toBe(false);
      expect(hasPermission(UserRole.Viewer, Permission.TaskUpdate)).toBe(false);
      expect(hasPermission(UserRole.Viewer, Permission.TaskDelete)).toBe(false);
      expect(hasPermission(UserRole.Viewer, Permission.AuditRead)).toBe(false);
    });

    it('should not have Owner-specific permissions', () => {
      expect(hasPermission(UserRole.Viewer, Permission.UserManage)).toBe(false);
      expect(hasPermission(UserRole.Viewer, Permission.OrganizationManage)).toBe(false);
    });
  });

  describe('Admin role', () => {
    it('should have Admin base permissions', () => {
      const permissions = getRolePermissions(UserRole.Admin);
      expect(permissions).toContain(Permission.TaskCreate);
      expect(permissions).toContain(Permission.TaskUpdate);
      expect(permissions).toContain(Permission.TaskDelete);
      expect(permissions).toContain(Permission.AuditRead);
    });

    it('should inherit TaskRead from Viewer', () => {
      expect(hasPermission(UserRole.Admin, Permission.TaskRead)).toBe(true);
    });

    it('should have total of 5 permissions (4 base + 1 inherited)', () => {
      const permissions = getRolePermissions(UserRole.Admin);
      expect(permissions).toHaveLength(5);
    });

    it('should not have Owner-specific permissions', () => {
      expect(hasPermission(UserRole.Admin, Permission.UserManage)).toBe(false);
      expect(hasPermission(UserRole.Admin, Permission.OrganizationManage)).toBe(false);
    });
  });

  describe('Owner role', () => {
    it('should have Owner base permissions', () => {
      const permissions = getRolePermissions(UserRole.Owner);
      expect(permissions).toContain(Permission.UserManage);
      expect(permissions).toContain(Permission.OrganizationManage);
    });

    it('should inherit all Admin permissions', () => {
      expect(hasPermission(UserRole.Owner, Permission.TaskCreate)).toBe(true);
      expect(hasPermission(UserRole.Owner, Permission.TaskUpdate)).toBe(true);
      expect(hasPermission(UserRole.Owner, Permission.TaskDelete)).toBe(true);
      expect(hasPermission(UserRole.Owner, Permission.AuditRead)).toBe(true);
    });

    it('should inherit Viewer permissions transitively through Admin', () => {
      expect(hasPermission(UserRole.Owner, Permission.TaskRead)).toBe(true);
    });

    it('should have total of 7 permissions (2 base + 4 from Admin + 1 from Viewer)', () => {
      const permissions = getRolePermissions(UserRole.Owner);
      expect(permissions).toHaveLength(7);
      expect(permissions).toEqual(
        expect.arrayContaining([
          Permission.UserManage,
          Permission.OrganizationManage,
          Permission.TaskCreate,
          Permission.TaskUpdate,
          Permission.TaskDelete,
          Permission.AuditRead,
          Permission.TaskRead,
        ])
      );
    });

    it('assigns full access to owner (backward compatibility test)', () => {
      const permissions = getRolePermissions(UserRole.Owner);
      expect(permissions).toContain(Permission.TaskCreate);
      expect(permissions).toContain(Permission.TaskRead);
      expect(permissions).toContain(Permission.TaskUpdate);
      expect(permissions).toContain(Permission.TaskDelete);
      expect(permissions).toContain(Permission.AuditRead);
    });
  });

  describe('Role hierarchy', () => {
    it('should maintain proper hierarchy: Viewer < Admin < Owner', () => {
      const viewerPerms = getRolePermissions(UserRole.Viewer);
      const adminPerms = getRolePermissions(UserRole.Admin);
      const ownerPerms = getRolePermissions(UserRole.Owner);

      expect(viewerPerms.length).toBeLessThan(adminPerms.length);
      expect(adminPerms.length).toBeLessThan(ownerPerms.length);
    });

    it('should ensure Admin has all Viewer permissions', () => {
      const viewerPerms = getRolePermissions(UserRole.Viewer);
      const adminPerms = getRolePermissions(UserRole.Admin);

      viewerPerms.forEach(permission => {
        expect(adminPerms).toContain(permission);
      });
    });

    it('should ensure Owner has all Admin permissions', () => {
      const adminPerms = getRolePermissions(UserRole.Admin);
      const ownerPerms = getRolePermissions(UserRole.Owner);

      adminPerms.forEach(permission => {
        expect(ownerPerms).toContain(permission);
      });
    });
  });
});
