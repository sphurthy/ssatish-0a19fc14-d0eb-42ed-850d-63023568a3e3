import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, PERMISSIONS_KEY } from '@task-mgmt/auth';
import { Permission, UserRole } from '@task-mgmt/data';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; role: UserRole } | undefined;
    const allowed =
      !!user && required.every((permission) => hasPermission(user.role, permission));

    this.auditLogService.log({
      userId: user?.id ?? 'anonymous',
      action: `${request.method} ${request.url}`,
      resource: 'rbac',
      allowed,
    });

    return allowed;
  }
}
