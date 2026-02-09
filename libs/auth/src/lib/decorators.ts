import { SetMetadata } from '@nestjs/common';
import { Permission } from '@task-mgmt/data';

export const PERMISSIONS_KEY = 'rbac_permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
