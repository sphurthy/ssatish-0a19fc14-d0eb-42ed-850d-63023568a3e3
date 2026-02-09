import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { OrganizationEntity } from './organizations/organization.entity';
import { OrganizationsModule } from './organizations/organizations.module';
import { PermissionEntity } from './permissions/permission.entity';
import { SeedService } from './seed/seed.service';
import { TaskEntity } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';
import { UserEntity } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqljs',
        autoSave: true,
        location: configService.get<string>('DB_PATH', 'task-db'),
        synchronize: true,
        entities: [
          UserEntity,
          OrganizationEntity,
          TaskEntity,
          PermissionEntity,
        ],
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      OrganizationEntity,
      TaskEntity,
      PermissionEntity,
    ]),
    UsersModule,
    OrganizationsModule,
    AuthModule,
    AuditModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
