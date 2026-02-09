import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { RbacGuard } from '../auth/rbac.guard';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TaskEntity } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    OrganizationsModule,
    AuditModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, RbacGuard],
})
export class TasksModule {}
