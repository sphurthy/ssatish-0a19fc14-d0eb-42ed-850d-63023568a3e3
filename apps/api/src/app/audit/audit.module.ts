import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditController } from './audit.controller';
import { RbacGuard } from '../auth/rbac.guard';

@Module({
  providers: [AuditLogService, RbacGuard],
  controllers: [AuditController],
  exports: [AuditLogService],
})
export class AuditModule {}
