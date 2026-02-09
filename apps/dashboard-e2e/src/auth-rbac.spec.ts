import { test, expect, Page } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3000/api';

const users = {
  admin: {
    email: 'admin@acme.com',
    password: 'password123',
  },
  viewer: {
    email: 'viewer@acme.com',
    password: 'password123',
  },
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
}

async function createTask(page: Page, title: string) {
  const response = await page.request.post(`${API_BASE_URL}/tasks`, {
    data: {
      title,
      description: 'Created by Playwright',
      category: 'Work',
      status: 'Todo',
      order: 0,
    },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: string; title: string };
}

async function deleteTask(page: Page, taskId: string) {
  const response = await page.request.delete(`${API_BASE_URL}/tasks/${taskId}`);
  expect(response.ok()).toBeTruthy();
}

async function reloadAndWait(page: Page) {
  await page.reload();
  await expect(page.getByTestId('task-columns')).toBeVisible();
}

test.describe('Dashboard RBAC', () => {
  test('viewer cannot see edit or delete controls', async ({ page }) => {
    await login(page, users.viewer.email, users.viewer.password);

    await expect(page.getByTestId('task-columns')).toBeVisible();
    await expect(page.getByTestId('task-edit')).toHaveCount(0);
    await expect(page.getByTestId('task-delete')).toHaveCount(0);
  });
});
