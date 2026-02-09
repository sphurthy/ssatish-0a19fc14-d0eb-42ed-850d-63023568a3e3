import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationsRepository: Repository<OrganizationEntity>
  ) {}

  findById(id: string) {
    return this.organizationsRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
  }

  async getScopedOrganizationIds(organizationId: string): Promise<string[]> {
    const org = await this.findById(organizationId);
    if (!org) {
      return [];
    }
    const childIds = (org.children ?? []).map((child) => child.id);
    return [org.id, ...childIds];
  }

  save(org: OrganizationEntity) {
    return this.organizationsRepository.save(org);
  }
}
