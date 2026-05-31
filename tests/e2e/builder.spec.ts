import { test, expect } from '@playwright/test';

test.describe('Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Login flow', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Create new site', async ({ page }) => {
    await page.click('text=New Site');
    await page.fill('[name="name"]', 'E2E Test Site');
    await page.fill('[name="domain"]', 'e2e-test.example.com');
    await page.click('button:has-text("Create")');
    await expect(page.locator('text=E2E Test Site')).toBeVisible();
  });

  test('Navigate to builder', async ({ page }) => {
    await page.click('text=E2E Test Site');
    await page.click('text=Edit');
    await expect(page.locator('[data-testid="canvas"]')).toBeVisible();
  });

  test('Drag block from palette to canvas', async ({ page }) => {
    await page.goto('/builder/site-1/page-1');
    await page.waitForSelector('[data-testid="block-palette"]');
    const source = page.locator('[data-testid="block-text"]');
    const target = page.locator('[data-testid="canvas-dropzone"]');
    await source.dragTo(target);
    await expect(page.locator('[data-testid^="block-"]')).toBeVisible();
  });

  test('Edit block property', async ({ page }) => {
    await page.waitForSelector('[data-testid^="block-"]');
    await page.click('[data-testid^="block-"]');
    await page.waitForSelector('[data-testid="property-panel"]');
    await page.fill('[data-testid="prop-content"]', 'Edited Text');
    await expect(page.locator('text=Edited Text')).toBeVisible();
  });

  test('Save and verify', async ({ page }) => {
    await page.click('button:has-text("Save")');
    await expect(page.locator('[data-testid="save-indicator"]')).toHaveText('Saved');
    await page.reload();
    await expect(page.locator('text=Edited Text')).toBeVisible();
  });
});
