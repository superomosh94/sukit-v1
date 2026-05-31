import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testPassword = 'TestPass123!';

  test('Register new user', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="name"]', 'E2E User');
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Login with credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Access protected route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });
});
