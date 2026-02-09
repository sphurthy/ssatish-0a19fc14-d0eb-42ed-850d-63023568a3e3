import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { TaskCategory, TaskStatus } from '@task-mgmt/data';

describe('API endpoints', () => {
  let app: INestApplication;
  let ownerToken: string;
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login as different users
    const ownerResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'owner@acme.com', password: 'password123' });
    ownerToken = ownerResponse.body.accessToken;

    const adminResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@acme.com', password: 'password123' });
    adminToken = adminResponse.body.accessToken;

    const viewerResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'viewer@acme.com', password: 'password123' });
    viewerToken = viewerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('logs in and lists tasks', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'owner@acme.com', password: 'password123' })
        .expect(201);

      const token = loginResponse.body.accessToken;
      expect(token).toBeDefined();

      const tasksResponse = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(tasksResponse.body)).toBe(true);
    });

    it('rejects login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'invalid@acme.com', password: 'wrong' })
        .expect(401);
    });

    it('rejects requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks')
        .expect(401);
    });
  });

  describe('Owner Role RBAC', () => {
    it('should allow Owner to read tasks', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });

    it('should allow Owner to create tasks', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Owner Created Task',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        })
        .expect(201);

      expect(response.body.title).toBe('Owner Created Task');
    });

    it('should allow Owner to update tasks', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task to Update',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Update it
      const updateResponse = await request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated Task' })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated Task');
    });

    it('should allow Owner to delete tasks', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task to Delete',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
    });
  });

  describe('Admin Role RBAC', () => {
    it('should allow Admin to read tasks', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should allow Admin to create tasks', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Created Task',
          category: TaskCategory.Bug,
          status: TaskStatus.Todo,
        })
        .expect(201);

      expect(response.body.title).toBe('Admin Created Task');
    });

    it('should allow Admin to update tasks', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Task to Update',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Update it
      const updateResponse = await request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: TaskStatus.InProgress })
        .expect(200);

      expect(updateResponse.body.status).toBe(TaskStatus.InProgress);
    });

    it('should allow Admin to delete tasks', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Task to Delete',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Viewer Role RBAC', () => {
    it('should allow Viewer to read tasks', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
    });

    it('should deny Viewer from creating tasks (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: 'Viewer Task',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        })
        .expect(403);
    });

    it('should deny Viewer from updating tasks (403)', async () => {
      // Create a task as Owner first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task for Viewer Update Test',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Try to update as Viewer
      await request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ title: 'Viewer Update' })
        .expect(403);
    });

    it('should deny Viewer from deleting tasks (403)', async () => {
      // Create a task as Owner first
      const createResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task for Viewer Delete Test',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const taskId = createResponse.body.id;

      // Try to delete as Viewer
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });

  describe('Cross-Organization Access Control', () => {
    it('should prevent access to tasks from different organization', async () => {
      // Login as user from Globex (different org)
      const globexResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@globex.com', password: 'password123' });

      const globexToken = globexResponse.body.accessToken;

      // Create a task as ACME Owner
      const acmeTaskResponse = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'ACME Task',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      const acmeTaskId = acmeTaskResponse.body.id;

      // Try to update ACME task as Globex Admin
      await request(app.getHttpServer())
        .put(`/api/tasks/${acmeTaskId}`)
        .set('Authorization', `Bearer ${globexToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      // Try to delete ACME task as Globex Admin
      await request(app.getHttpServer())
        .delete(`/api/tasks/${acmeTaskId}`)
        .set('Authorization', `Bearer ${globexToken}`)
        .expect(403);
    });

    it('should only return tasks from accessible organizations', async () => {
      // Login as Globex user
      const globexResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@globex.com', password: 'password123' });

      const globexToken = globexResponse.body.accessToken;

      // Get tasks as Globex user
      const globexTasks = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${globexToken}`)
        .expect(200);

      // Get tasks as ACME user
      const acmeTasks = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      // Tasks should be different (organization scoping)
      const globexTaskIds = globexTasks.body.map((t: never) => t['id']);
      const acmeTaskIds = acmeTasks.body.map((t: never) => t['id']);

      // No overlap expected (different organizations)
      const overlap = globexTaskIds.filter((id: string) => acmeTaskIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Task Filtering', () => {
    beforeAll(async () => {
      // Create various tasks for filtering tests
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Feature Task',
          category: TaskCategory.Feature,
          status: TaskStatus.Todo,
        });

      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Bug Task',
          category: TaskCategory.Bug,
          status: TaskStatus.InProgress,
        });
    });

    it('should filter tasks by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?category=Feature')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.every((t: never) => t['category'] === TaskCategory.Feature)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?status=Todo')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.every((t: never) => t['status'] === TaskStatus.Todo)).toBe(true);
    });

    it('should search tasks by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?search=Bug')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((t: never) => t['title'].includes('Bug'))).toBe(true);
    });
  });
});
