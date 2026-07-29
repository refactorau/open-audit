const { test, expect } = require('@playwright/test');

test.describe('Devices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/devices');
    await page.waitForLoadState('networkidle');
  });

  test('collection page loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
    await expect(page).toHaveTitle(/Open-AudIT/);
  });

  test('collection page has a DataTable', async ({ page }) => {
    await expect(page.locator('table.dataTableDevices')).toBeVisible();
  });

  test('collection page has a Create button', async ({ page }) => {
    await expect(page.locator('#button_create')).toBeVisible();
  });
});

test.describe('Devices create form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/devices/create');
    await page.waitForLoadState('networkidle');
  });

  test('create form loads without redirecting to logon', async ({ page }) => {
    await expect(page).not.toHaveURL(/logon/);
  });

  test('create form has an input type selector', async ({ page }) => {
    await expect(page.locator('#input_type')).toBeVisible();
  });

  test('create form has a submit button', async ({ page }) => {
    await expect(page.locator('#submit')).toBeVisible();
  });
});
