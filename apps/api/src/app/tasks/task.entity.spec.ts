import { getMetadataArgsStorage } from 'typeorm';
import { TaskEntity } from './task.entity';

describe('TaskEntity', () => {
  it('creates an instance', () => {
    const task = new TaskEntity();
    expect(task).toBeInstanceOf(TaskEntity);
  });

  it('executes relation functions from metadata', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === TaskEntity
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
