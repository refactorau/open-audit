const { test, expect } = require('@playwright/test');

// Override the global storageState so these tests start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Logon', () => {
  test('shows the login form', async ({ page }) => {
    await page.goto('/index.php/logon');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#submit')).toBeVisible();
  });

  test('redirects unauthenticated access to logon', async ({ page }) => {
    await page.goto('/index.php/devices');
    await expect(page).toHaveURL(/logon/);
  });

  test('accepts valid credentials and leaves the logon page', async ({ page }) => {
    await page.goto('/index.php/logon');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('password');
    await page.locator('#submit').click();
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/logon/);
  });

  test('stays on logon with invalid credentials', async ({ page }) => {
    await page.goto('/index.php/logon');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('notthepassword');
    await page.locator('#submit').click();
    await expect(page).toHaveURL(/logon/);
  });
});
