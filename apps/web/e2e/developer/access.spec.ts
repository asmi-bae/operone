import { test, expect } from '@playwright/test';

test.describe('Developer Section Access Control', () => {
  
  test('should redirect unauthenticated users from AI Providers page', async ({ page }) => {
    await page.goto('/dashboard/developer/ai-providers');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from Repositories page', async ({ page }) => {
    await page.goto('/dashboard/developer/repositories');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from Apps & OAuth page', async ({ page }) => {
    await page.goto('/dashboard/developer/apps');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users from Settings page', async ({ page }) => {
    await page.goto('/dashboard/developer/settings');
    await expect(page).toHaveURL(/\/login/);
  });

});

test.describe('Developer API Access Control', () => {

  test('should reject unauthenticated access to repositories API', async ({ request }) => {
    const response = await request.get('/api/repositories');
    expect(response.status()).toBe(401);
  });

  test('should reject unauthenticated access to oauth apps API', async ({ request }) => {
    const response = await request.get('/api/oauth/apps');
    expect(response.status()).toBe(401);
  });

  test('should reject unauthenticated access to webhooks API', async ({ request }) => {
    const response = await request.get('/api/webhooks');
    expect(response.status()).toBe(401);
  });

});
