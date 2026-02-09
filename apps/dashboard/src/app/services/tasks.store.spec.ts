import { of, Subject } from 'rxjs';
import { Task, TaskCategory, TaskStatus } from '@task-mgmt/data';
import { TasksStore } from './tasks.store';
import { TasksService } from './tasks.service';

describe('TasksStore', () => {
  let tasksService: jest.Mocked<TasksService>;
  let store: TasksStore;

  const sampleTask: Task = {
    id: 'task-1',
    title: 'Sample task',
    description: null,
    category: TaskCategory.Work,
    status: TaskStatus.Todo,
    order: 0,
    organizationId: 'org-1',
    createdById: 'user-1',
  };

  beforeEach(() => {
    tasksService = {
      list: jest.fn().mockReturnValue(of([sampleTask])),
      create: jest.fn().mockReturnValue(of(sampleTask)),
      update: jest.fn().mockReturnValue(of(sampleTask)),
      remove: jest.fn().mockReturnValue(of({ deleted: true })),
    } as never;

    store = new TasksStore(tasksService);
  });

  it('loads tasks and updates the snapshot', () => {
    store.load();

    expect(tasksService.list).toHaveBeenCalled();
    expect(store.getSnapshot().length).toBe(1);
    expect(store.getSnapshot()[0].title).toBe('Sample task');
  });

  it('load toggles loading state and completes', () => {
    const loadingStates: boolean[] = [];
    store.loading$.subscribe((value) => loadingStates.push(value));

    const list$ = new Subject<Task[]>();
    tasksService.list.mockReturnValueOnce(list$);

    store.load();
    expect(loadingStates[loadingStates.length - 1]).toBe(true);

    list$.next([sampleTask]);
    list$.complete();

    expect(store.getSnapshot()).toEqual([sampleTask]);
    expect(loadingStates[loadingStates.length - 1]).toBe(false);
  });

  it('setFilters merges filters and reloads', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    store.setFilters({ search: 'alpha', sort: 'title' });

    expect(tasksService.list).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'alpha', sort: 'title' })
    );
  });

  it('create adds optimistic task and filters by search', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    const create$ = new Subject();
    tasksService.create.mockReturnValue(create$);
    store.setFilters({ search: 'alpha' });
    store.create({ title: 'Alpha task', category: TaskCategory.Work });
    store.create({ title: 'Beta task', category: TaskCategory.Work });

    const titles = store.getSnapshot().map((task) => task.title);
    expect(titles).toEqual(['Alpha task']);

    const loadSpy = jest.spyOn(store, 'load');
    create$.complete();
    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockRestore();
  });

  it('create sorts tasks by title when configured', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    tasksService.create.mockReturnValue(new Subject());
    store.setFilters({ sort: 'title' });
    store.create({ title: 'Bravo', category: TaskCategory.Work });
    store.create({ title: 'Alpha', category: TaskCategory.Work });

    const titles = store.getSnapshot().map((task) => task.title);
    expect(titles).toEqual(['Alpha', 'Bravo']);
  });

  it('filters by status and category for optimistic updates', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    tasksService.create.mockReturnValue(new Subject());
    store.setFilters({ status: TaskStatus.Done, category: TaskCategory.Work });
    store.create({
      title: 'Done Task',
      category: TaskCategory.Work,
      status: TaskStatus.Done,
    });
    store.create({
      title: 'Todo Task',
      category: TaskCategory.Work,
      status: TaskStatus.Todo,
    });
    store.create({
      title: 'Personal Done',
      category: TaskCategory.Personal,
      status: TaskStatus.Done,
    });

    const titles = store.getSnapshot().map((task) => task.title);
    expect(titles).toEqual(['Done Task']);
  });

  it('create uses default values when fields are missing', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    tasksService.create.mockReturnValue(new Subject());

    store.create({});

    const task = store.getSnapshot()[0];
    expect(task.title).toBe('');
    expect(task.description).toBeNull();
    expect(task.category).toBe(TaskCategory.Work);
    expect(task.status).toBe(TaskStatus.Todo);
    expect(task.order).toBe(0);
  });

  it('sorts by order when configured', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    tasksService.create.mockReturnValue(new Subject());
    store.setFilters({ sort: 'order' });

    store.create({ title: 'Task B', order: 2 });
    store.create({ title: 'Task A', order: 1 });

    const titles = store.getSnapshot().map((task) => task.title);
    expect(titles).toEqual(['Task A', 'Task B']);
  });

  it('update merges changes and resorts by status', () => {
    tasksService.list.mockReturnValueOnce(of([]));
    tasksService.create.mockReturnValue(new Subject());
    tasksService.update.mockReturnValue(new Subject());
    store.setFilters({ sort: 'status' });
    store.create({ title: 'Task A', status: TaskStatus.Todo });
    store.create({ title: 'Task B', status: TaskStatus.InProgress });

    const taskId = store.getSnapshot()[0].id;
    store.update(taskId, { status: TaskStatus.Done });

    const statuses = store.getSnapshot().map((task) => task.status);
    expect(statuses).toEqual([TaskStatus.Done, TaskStatus.Todo]);
  });

  it('update triggers reload on completion', () => {
    const update$ = new Subject();
    tasksService.update.mockReturnValue(update$);
    tasksService.list.mockReturnValueOnce(of([]));

    const loadSpy = jest.spyOn(store, 'load');
    store.update(sampleTask.id, { title: 'Updated' });

    update$.complete();

    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockRestore();
  });

  it('remove deletes task from snapshot', () => {
    tasksService.create.mockReturnValue(new Subject());
    tasksService.remove.mockReturnValue(new Subject());
    store.create({ title: 'Task to delete' });
    const taskId = store.getSnapshot()[0].id;

    store.remove(taskId);

    expect(store.getSnapshot().find((task) => task.id === taskId)).toBeUndefined();
  });

  it('remove triggers reload on completion', () => {
    const remove$ = new Subject();
    tasksService.remove.mockReturnValue(remove$);
    tasksService.list.mockReturnValueOnce(of([]));

    const loadSpy = jest.spyOn(store, 'load');
    store.remove(sampleTask.id);

    remove$.complete();

    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockRestore();
  });
});
