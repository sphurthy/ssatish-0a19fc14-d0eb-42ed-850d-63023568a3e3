import { getMetadataArgsStorage } from 'typeorm';
import { OrganizationEntity } from './organization.entity';

describe('OrganizationEntity', () => {
  it('creates an instance', () => {
    const org = new OrganizationEntity();
    expect(org).toBeInstanceOf(OrganizationEntity);
  });

  it('executes relation functions from metadata', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === OrganizationEntity
    );

    const dummy = { tasks: 'tasks', users: 'users', parent: 'parent', children: 'children' };

    relations.forEach((relation) => {
      const typeFn = relation.type as unknown;
      if (typeof typeFn === 'function') {
        (typeFn as () => unknown)();
      }
      if (typeof relation.inverseSideProperty === 'function') {
        relation.inverseSideProperty(dummy);
      }
    });
  });
});
