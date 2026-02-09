import { Permission } from '@task-mgmt/data';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('permissions')
@Unique(['name'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: Permission;

  @Column({ nullable: true })
  description?: string | null;
}
