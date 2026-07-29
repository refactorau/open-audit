const { test, expect } = require('@playwright/test');

test.describe('Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/users');
    await page.waitForLoadState('networkidle');
  });

  test('collection page loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
    await expect(page).toHaveTitle(/Open-AudIT/);
  });

  test('collection page lists the admin user', async ({ page }) => {
    await expect(page.locator('table.dataTable tbody')).toContainText('admin');
  });

  test('collection page has a Create button', async ({ page }) => {
    await expect(page.locator('#button_create')).toBeVisible();
  });
});

test.describe('Users create form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/users/create');
    await page.waitForLoadState('networkidle');
  });

  test('create form loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
  });

  test('create form has name, full name and email fields', async ({ page }) => {
    await expect(page.locator('#data\\[attributes\\]\\[name\\]')).toBeVisible();
    await expect(page.locator('#data\\[attributes\\]\\[full_name\\]')).toBeVisible();
    await expect(page.locator('#data\\[attributes\\]\\[email\\]')).toBeVisible();
  });

  test('create form has roles and orgs multi-selects', async ({ page }) => {
    await expect(page.locator('#data\\[attributes\\]\\[roles\\]\\[\\]')).toBeVisible();
    await expect(page.locator('#data\\[attributes\\]\\[orgs\\]\\[\\]')).toBeVisible();
  });

  test('create form has a submit button', async ({ page }) => {
    await expect(page.locator('#submit')).toBeVisible();
  });
});
