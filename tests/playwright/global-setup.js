const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

module.exports = async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL;
  const authFile = path.join(__dirname, '.auth', 'admin.json');

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(baseURL + '/index.php/logon');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('password');
  await page.locator('#submit').click();
  await page.waitForLoadState('networkidle');

  // Visiting summaries triggers the EULA check on a fresh database.
  await page.goto(baseURL + '/index.php/summaries');
  await page.waitForLoadState('networkidle');

  if (page.url().includes('license_eula')) {
    await page.getByRole('button', { name: 'Accept' }).click();
    // Accept fires AJAX then does window.location redirect
    await page.waitForURL(url => !url.href.includes('license_eula'), { timeout: 10000 });
  }

  await context.storageState({ path: authFile });
  await browser.close();
};
