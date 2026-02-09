import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { TaskEntity } from '../tasks/task.entity';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.children, {
    nullable: true,
  })
  parent?: OrganizationEntity | null;

  @OneToMany(() => OrganizationEntity, (org) => org.parent)
  children?: OrganizationEntity[];

  @OneToMany(() => UserEntity, (user) => user.organization)
  users?: UserEntity[];

  @OneToMany(() => TaskEntity, (task) => task.organization)
  tasks?: TaskEntity[];
}
