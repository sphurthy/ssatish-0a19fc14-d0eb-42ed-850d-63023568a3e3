import { TaskCategory, TaskStatus } from '@task-mgmt/data';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationEntity } from '../organizations/organization.entity';
import { UserEntity } from '../users/user.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ type: 'text' })
  category: TaskCategory;

  @Column({ type: 'text' })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => OrganizationEntity, (org) => org.tasks, { eager: true })
  organization: OrganizationEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  createdBy: UserEntity;
}
