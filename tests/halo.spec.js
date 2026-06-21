const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('avoid halo is active at desktop width', async ({ page }) => {
  await gotoApp(page, { width: 1366, height: 900 });
  await page.waitForTimeout(300);
  const av = await page.evaluate(() => window.__cv.flocks[0].avoid());
  expect(av.r).toBeGreaterThan(0);
  expect(av.x).not.toBe(-99999);
});

test('avoid halo is disabled at phone width (portrait hidden)', async ({ page }) => {
  await gotoApp(page, { width: 390, height: 800 });
  await page.waitForTimeout(300);
  const av = await page.evaluate(() => window.__cv.flocks[0].avoid());
  expect(av.x).toBe(-99999);
});
