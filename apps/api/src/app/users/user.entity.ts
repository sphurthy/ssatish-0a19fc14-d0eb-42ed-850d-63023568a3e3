import { UserRole } from '@task-mgmt/data';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OrganizationEntity } from '../organizations/organization.entity';

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'text' })
  role: UserRole;

  @ManyToOne(() => OrganizationEntity, (org) => org.users, {
    eager: true,
  })
  organization: OrganizationEntity;
}
