import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission, TaskCategory, TaskStatus, UserRole } from '@task-mgmt/data';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../permissions/permission.entity';
import { OrganizationEntity } from '../organizations/organization.entity';
import { TaskEntity } from '../tasks/task.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly organizationsRepository: Repository<OrganizationEntity>,
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>
  ) {}

  async onModuleInit() {
    const existingUsers = await this.usersRepository.count();
    if (existingUsers > 0) {
      return;
    }

    const [parentOrg, childOrg] = await this.seedOrganizations();
    await this.seedPermissions();
    const [owner, admin, viewer, childViewer] = await this.seedUsers(
      parentOrg,
      childOrg
    );
    await this.seedTasks(owner, admin, viewer, childViewer);
  }

  private async seedOrganizations() {
    const parentOrg = this.organizationsRepository.create({
      name: 'Acme Corp',
    });
    await this.organizationsRepository.save(parentOrg);

    const childOrg = this.organizationsRepository.create({
      name: 'Acme Subsidiary',
      parent: parentOrg,
    });
    await this.organizationsRepository.save(childOrg);

    return [parentOrg, childOrg] as const;
  }

  private async seedPermissions() {
    const permissions = Object.values(Permission).map((name) =>
      this.permissionsRepository.create({
        name,
        description: `Permission: ${name}`,
      })
    );
    await this.permissionsRepository.save(permissions);
  }

  private async seedUsers(
    parentOrg: OrganizationEntity,
    childOrg: OrganizationEntity
  ) {
    const passwordHash = await bcrypt.hash('password123', 10);

    const owner = this.usersRepository.create({
      name: 'Owner User',
      email: 'owner@acme.com',
      role: UserRole.Owner,
      passwordHash,
      organization: parentOrg,
    });

    const admin = this.usersRepository.create({
      name: 'Admin User',
      email: 'admin@acme.com',
      role: UserRole.Admin,
      passwordHash,
      organization: parentOrg,
    });

    const viewer = this.usersRepository.create({
      name: 'Viewer User',
      email: 'viewer@acme.com',
      role: UserRole.Viewer,
      passwordHash,
      organization: parentOrg,
    });

    const childViewer = this.usersRepository.create({
      name: 'Child Viewer',
      email: 'viewer@subsidiary.com',
      role: UserRole.Viewer,
      passwordHash,
      organization: childOrg,
    });

    await this.usersRepository.save([owner, admin, viewer, childViewer]);
    return [owner, admin, viewer, childViewer] as const;
  }

  private async seedTasks(
    owner: UserEntity,
    admin: UserEntity,
    viewer: UserEntity,
    childViewer: UserEntity
  ) {
    const tasks = [
      this.tasksRepository.create({
        title: 'Prepare quarterly report',
        description: 'Compile stats and summaries for Q1.',
        category: TaskCategory.Work,
        status: TaskStatus.InProgress,
        order: 0,
        organization: owner.organization,
        createdBy: owner,
      }),
      this.tasksRepository.create({
        title: 'Review support tickets',
        description: 'Close or assign open tickets.',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 1,
        organization: admin.organization,
        createdBy: admin,
      }),
      this.tasksRepository.create({
        title: 'Plan team offsite',
        description: 'Collect ideas for Q2 offsite.',
        category: TaskCategory.Personal,
        status: TaskStatus.Todo,
        order: 2,
        organization: viewer.organization,
        createdBy: viewer,
      }),
      this.tasksRepository.create({
        title: 'Update onboarding docs',
        description: 'Refresh guidance for new hires.',
        category: TaskCategory.Work,
        status: TaskStatus.Done,
        order: 0,
        organization: childViewer.organization,
        createdBy: childViewer,
      }),
    ];

    await this.tasksRepository.save(tasks);
  }
}
