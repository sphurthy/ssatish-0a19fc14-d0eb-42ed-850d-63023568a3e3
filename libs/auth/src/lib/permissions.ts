import { Permission, UserRole } from '@task-mgmt/data';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Owner]: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ],
  [UserRole.Admin]: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ],
  [UserRole.Viewer]: [Permission.TaskRead],
};

export const getRolePermissions = (role: UserRole): Permission[] =>
  ROLE_PERMISSIONS[role] ?? [];

export const hasPermission = (role: UserRole, permission: Permission): boolean =>
  getRolePermissions(role).includes(permission);
