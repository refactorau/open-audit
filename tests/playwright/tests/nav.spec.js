const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php/welcome');
    await page.waitForLoadState('networkidle');
    // On unlicensed community instances with no devices, the license comparison
    // modal auto-opens. Dismiss it so navbar clicks are not intercepted.
    const modal = page.locator('#modalCompareLicense');
    if (await modal.isVisible()) {
      await modal.locator('.btn-close').click();
      await modal.waitFor({ state: 'hidden' });
    }
  });

  test('shows the four main nav menus', async ({ page }) => {
    await expect(page.locator('#navbarView')).toBeVisible();
    await expect(page.locator('#navbarDiscover')).toBeVisible();
    await expect(page.locator('#navbarReport')).toBeVisible();
    await expect(page.locator('#navbarManage')).toBeVisible();
  });

  test('user dropdown shows Logout option', async ({ page }) => {
    await page.locator('#navbarUser').click();
    // The logout <a> has role="button" so it matches getByRole('button'), not 'link'
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});

// Runs with a fresh browser session so that logging out does not invalidate the
// shared auth state used by every other test (PHP destroys the server-side session
// on logoff; other tests rely on the session stored in .auth/admin.json).
test.describe('Logout', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logout redirects to the logon page', async ({ page }) => {
    await page.goto('/index.php/logon');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('password');
    await page.locator('#submit').click();
    await page.waitForLoadState('networkidle');

    if (page.url().includes('license_eula')) {
      await page.getByRole('button', { name: 'Accept' }).click();
      await page.waitForURL(url => !url.href.includes('license_eula'), { timeout: 10000 });
    }
    const modal = page.locator('#modalCompareLicense');
    if (await modal.isVisible()) {
      await modal.locator('.btn-close').click();
      await modal.waitFor({ state: 'hidden' });
    }

    await page.locator('#navbarUser').click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/logon/);
  });
});
