const { test, expect } = require('@playwright/test');

test.describe('Groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/groups');
    await page.waitForLoadState('networkidle');
  });

  test('collection page loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
    await expect(page).toHaveTitle(/Open-AudIT/);
  });

  test('collection page has a DataTable', async ({ page }) => {
    await expect(page.locator('table.dataTable')).toBeVisible();
  });

  test('collection page has a Create button', async ({ page }) => {
    await expect(page.locator('#button_create')).toBeVisible();
  });
});

test.describe('Groups create form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/groups/create');
    await page.waitForLoadState('networkidle');
  });

  test('create form loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
  });

  test('create form has a name field', async ({ page }) => {
    await expect(page.locator('#data\\[attributes\\]\\[name\\]')).toBeVisible();
  });

  test('create form has a SQL textarea', async ({ page }) => {
    await expect(page.locator('#data\\[attributes\\]\\[sql\\]')).toBeVisible();
  });

  test('create form has a submit button', async ({ page }) => {
    await expect(page.locator('#submit')).toBeVisible();
  });
});
