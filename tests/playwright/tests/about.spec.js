const { test, expect } = require('@playwright/test');

test.describe('About', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/about');
    await page.waitForLoadState('networkidle');
  });

  test('loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
    await expect(page).toHaveTitle(/Open-AudIT/);
  });

  test('shows the running version', async ({ page }) => {
    await expect(page.locator('main')).toContainText('You are running version');
  });

  test('shows the PHP version', async ({ page }) => {
    await expect(page.locator('main')).toContainText('Your PHP version is');
  });

  test('shows the database platform', async ({ page }) => {
    await expect(page.locator('main')).toContainText('Your database platform is');
  });
});
