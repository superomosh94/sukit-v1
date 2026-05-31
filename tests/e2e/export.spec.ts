import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Static Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Create page with content', async ({ page }) => {
    await page.click('text=E2E Test Site');
    await page.click('text=Edit');
    await page.waitForSelector('[data-testid="block-palette"]');
    const source = page.locator('[data-testid="block-text"]');
    const target = page.locator('[data-testid="canvas-dropzone"]');
    await source.dragTo(target);
    await page.click('[data-testid^="block-"]');
    await page.fill('[data-testid="prop-content"]', 'Export Test Content');
    await page.click('button:has-text("Save")');
    await expect(page.locator('[data-testid="save-indicator"]')).toHaveText('Saved');
  });

  test('Trigger export', async ({ page }) => {
    await page.goto('/sites/site-1/export');
    await page.click('button:has-text("Export Site")');
    await page.waitForSelector('[data-testid="export-progress"]');
    await expect(page.locator('[data-testid="export-status"]')).toHaveText('Complete');
  });

  test('Download ZIP', async ({ page }) => {
    await page.goto('/sites/site-1/export');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")'),
    ]);
    expect(download.suggestedFilename()).toContain('.zip');
    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    expect(fs.existsSync(downloadPath)).toBe(true);
  });

  test('Verify ZIP contains HTML', async ({ page }) => {
    await page.goto('/sites/site-1/export');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")'),
    ]);
    const downloadPath = path.join('/tmp', `export-${Date.now()}.zip`);
    await download.saveAs(downloadPath);
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(downloadPath);
    const entries = zip.getEntries().map(e => e.entryName);
    expect(entries.some(e => e.endsWith('.html'))).toBe(true);
  });
});
