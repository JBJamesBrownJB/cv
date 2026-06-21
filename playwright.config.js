const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  reporter: 'list',
  use: { headless: true },
  projects: [ { name: 'chromium', use: { browserName: 'chromium' } } ],
});
