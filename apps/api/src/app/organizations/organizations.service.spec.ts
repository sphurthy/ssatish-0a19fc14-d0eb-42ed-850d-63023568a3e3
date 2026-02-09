import { Repository } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationsRepository: jest.Mocked<Repository<OrganizationEntity>>;

  beforeEach(() => {
    organizationsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as never;

    service = new OrganizationsService(organizationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findById should query with relations', async () => {
    organizationsRepository.findOne.mockResolvedValue(null);

    await service.findById('org-1');

    expect(organizationsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'org-1' },
      relations: ['children', 'parent'],
    });
  });

  it('getScopedOrganizationIds should return empty when org not found', async () => {
    organizationsRepository.findOne.mockResolvedValue(null);

    const result = await service.getScopedOrganizationIds('missing');

    expect(result).toEqual([]);
  });

  it('getScopedOrganizationIds should include org and children', async () => {
    organizationsRepository.findOne.mockResolvedValue({
      id: 'org-1',
      children: [{ id: 'org-2' }, { id: 'org-3' }],
    } as OrganizationEntity);

    const result = await service.getScopedOrganizationIds('org-1');

    expect(result).toEqual(['org-1', 'org-2', 'org-3']);
  });

  it('getScopedOrganizationIds should handle org with no children', async () => {
    organizationsRepository.findOne.mockResolvedValue({
      id: 'org-1',
      children: [],
    } as OrganizationEntity);

    const result = await service.getScopedOrganizationIds('org-1');

    expect(result).toEqual(['org-1']);
  });

  it('save should delegate to repository', async () => {
    const org = { id: 'org-1', name: 'Acme' } as OrganizationEntity;
    organizationsRepository.save.mockResolvedValue(org);

    const result = await service.save(org);

    expect(organizationsRepository.save).toHaveBeenCalledWith(org);
    expect(result).toBe(org);
  });
});
