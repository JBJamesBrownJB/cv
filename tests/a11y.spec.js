const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test.describe('accessibility landmarks', () => {
  test('exactly one <main> wrapping the content', async ({ page }) => {
    await gotoApp(page, { width: 1366, height: 900 });
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
  });

  test('skip link is first focusable and targets #main', async ({ page }) => {
    await gotoApp(page, { width: 1366, height: 900 });
    const skip = page.locator('a.skip-link');
    await expect(skip).toHaveCount(1);
    await expect(skip).toHaveAttribute('href', '#main');
    await page.keyboard.press('Tab');
    const focusedHref = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('href'));
    expect(focusedHref).toBe('#main');
  });

  test('the two contact navs have distinct accessible names', async ({ page }) => {
    await gotoApp(page, { width: 1366, height: 900 });
    const labels = await page.locator('nav.links').evaluateAll(ns => ns.map(n => n.getAttribute('aria-label')));
    expect(labels.length).toBe(2);
    expect(new Set(labels).size).toBe(2);
  });
});
