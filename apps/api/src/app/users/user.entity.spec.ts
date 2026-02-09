import { getMetadataArgsStorage } from 'typeorm';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('creates an instance', () => {
    const user = new UserEntity();
    expect(user).toBeInstanceOf(UserEntity);
  });

  it('executes relation functions from metadata', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === UserEntity
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
