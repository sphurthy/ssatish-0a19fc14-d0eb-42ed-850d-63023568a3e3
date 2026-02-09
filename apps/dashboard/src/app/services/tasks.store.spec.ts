import { of } from 'rxjs';
import { TaskCategory, TaskStatus } from '@task-mgmt/data';
import { TasksStore } from './tasks.store';
import { TasksService } from './tasks.service';

describe('TasksStore', () => {
  it('loads tasks and updates the snapshot', () => {
    const tasksService = {
      list: jest.fn().mockReturnValue(
        of([
          {
            id: 'task-1',
            title: 'Sample task',
            description: null,
            category: TaskCategory.Work,
            status: TaskStatus.Todo,
            order: 0,
            organizationId: 'org-1',
            createdById: 'user-1',
          },
        ])
      ),
    } as unknown as TasksService;

    const store = new TasksStore(tasksService);
    store.load();

    expect(store.getSnapshot().length).toBe(1);
    expect(store.getSnapshot()[0].title).toBe('Sample task');
  });
});
