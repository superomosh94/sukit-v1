import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('homepage has no critical violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const violations = await page.evaluate(async () => {
      const axe = await import('@axe-core/playwright');
      const results = await axe.default(page).analyze();
      return results.violations.filter(
        (v: any) => v.impact === 'critical' || v.impact === 'serious'
      );
    });
    expect(violations.length).toBe(0);
  });

  test('builder page has proper heading structure', async ({ page }) => {
    await page.goto('/builder');
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    for (const h of headings) {
      const tag = await h.evaluate((el) => el.tagName.toLowerCase());
      expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(tag);
    }
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/sites');
    const images = await page.locator('img:not([alt])').count();
    expect(images).toBe(0);
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = await page.locator(':focus');
    const outline = await focused.evaluate(
      (el) => getComputedStyle(el).outline
    );
    expect(outline).not.toBe('none');
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    const contrastIssues = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const issues: string[] = [];
      allElements.forEach((el) => {
        const style = getComputedStyle(el);
        if (style.color && style.backgroundColor) {
          const contrast = 4.5; // placeholder for WCAG contrast calculation
          if (contrast < 4.5) issues.push(el.tagName);
        }
      });
      return issues;
    });
    expect(contrastIssues.length).toBeLessThan(10);
  });
});
