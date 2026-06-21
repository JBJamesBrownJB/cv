const { test, expect } = require('@playwright/test');
const path = require('path');
const url = require('url');
const fileUrl = url.pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href + '?test=1';

test('no rAF animation loop runs under prefers-reduced-motion', async ({ page }) => {
  // emulate BEFORE navigation so the page reads reduced-motion at load
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(fileUrl);
  await page.waitForFunction(() => window.__cv && window.__cv.flocks && window.__cv.flocks.length >= 1, null, { timeout: 8000 });
  const f0 = await page.evaluate(() => window.__cv.frames());
  await page.waitForTimeout(800);
  const f1 = await page.evaluate(() => window.__cv.frames());
  expect(f1).toBe(f0); // reduced motion does a one-off static seed; the counter must not advance
  expect(await page.evaluate(() => window.__cv.flocks[0].isRunning())).toBe(false);
});
