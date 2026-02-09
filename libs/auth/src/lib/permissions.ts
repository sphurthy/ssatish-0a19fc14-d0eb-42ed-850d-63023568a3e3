import { Permission, UserRole } from '@task-mgmt/data';

// Define base permissions for each role (not including inherited)
const BASE_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Viewer]: [Permission.TaskRead],
  [UserRole.Admin]: [
    Permission.TaskCreate,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ],
  [UserRole.Owner]: [
    Permission.UserManage,
    Permission.OrganizationManage,
  ],
};

// Define role hierarchy (child inherits from parent)
const ROLE_HIERARCHY: Partial<Record<UserRole, UserRole>> = {
  [UserRole.Admin]: UserRole.Viewer,    // Admin extends Viewer
  [UserRole.Owner]: UserRole.Admin,     // Owner extends Admin
};

// Get all permissions for a role including inherited
export const getRolePermissions = (role: UserRole): Permission[] => {
  const permissions = new Set<Permission>();

  // Add base permissions for this role
  BASE_ROLE_PERMISSIONS[role]?.forEach(p => permissions.add(p));

  // Add inherited permissions from parent role
  let parentRole = ROLE_HIERARCHY[role];
  while (parentRole) {
    BASE_ROLE_PERMISSIONS[parentRole]?.forEach(p => permissions.add(p));
    parentRole = ROLE_HIERARCHY[parentRole];
  }

  return Array.from(permissions);
};

export const hasPermission = (role: UserRole, permission: Permission): boolean =>
  getRolePermissions(role).includes(permission);
