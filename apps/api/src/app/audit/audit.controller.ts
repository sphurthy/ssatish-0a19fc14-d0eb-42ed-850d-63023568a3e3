import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '@task-mgmt/auth';
import { Permission } from '@task-mgmt/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { AuditLogService } from './audit-log.service';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions(Permission.AuditRead)
  list() {
    return this.auditLogService.list();
  }
}
