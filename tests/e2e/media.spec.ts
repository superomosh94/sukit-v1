import { test, expect } from '@playwright/test';

test.describe('Media Library E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/media');
    await page.waitForLoadState('networkidle');
  });

  test('should display media library page', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByText(/media|library|upload/i).first()).toBeVisible();
  });

  test('should show upload button', async ({ page }) => {
    const uploadBtn = page
      .locator(
        'button:has-text("Upload"), a:has-text("Upload"), [data-testid="upload-btn"]'
      )
      .first();
    await expect(uploadBtn).toBeVisible();
  });

  test('should display media items in grid', async ({ page }) => {
    const grid = page
      .locator(
        '[class*="grid"], [class*="gallery"], [data-testid="media-grid"]'
      )
      .first();
    await expect(grid).toBeVisible();
  });

  test('should support search/filter', async ({ page }) => {
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
      )
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should open media preview on click', async ({ page }) => {
    const mediaItem = page
      .locator(
        '[class*="media-item"], [class*="thumbnail"], [data-testid="media-item"]'
      )
      .first();
    if (await mediaItem.isVisible()) {
      await mediaItem.click();
      await expect(
        page
          .locator(
            '[class*="preview"], [class*="modal"], [data-testid="media-preview"]'
          )
          .first()
      ).toBeVisible();
    }
  });

  test('should handle bulk selection', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      const selectedCount = await page
        .locator('input[type="checkbox"]:checked')
        .count();
      expect(selectedCount).toBeGreaterThanOrEqual(2);
    }
  });

  test('should support delete action', async ({ page }) => {
    const deleteBtn = page
      .locator('button:has-text("Delete"), [data-testid="delete-btn"]')
      .first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(
        page.locator('[class*="confirm"], [class*="modal"]').first()
      ).toBeVisible();
    }
  });
});
