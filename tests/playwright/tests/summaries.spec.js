const { test, expect } = require('@playwright/test');

test.describe('Summaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/summaries');
    await page.waitForLoadState('networkidle');
  });

  test('loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
    await expect(page).toHaveTitle(/Open-AudIT/);
  });

  test('resource tile icons all return 200 — regression for Apache /icons/ alias', async ({ page, request }) => {
    const baseURL = page.url().replace(/\/index\.php.*/, '');
    const images = page.locator('img[src*="/icons/"]');
    const count = await images.count();

    expect(count, 'summaries page should have at least one icon').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src');
      if (!src) continue;
      const url = src.startsWith('http') ? src : baseURL + src;
      const response = await request.get(url);
      expect(response.status(), `icon ${src} should be 200, got ${response.status()}`).toBe(200);
    }
  });

  test('shows the Devices resource tile', async ({ page }) => {
    await expect(page.locator('img[alt="devices"]')).toBeVisible();
  });
});
