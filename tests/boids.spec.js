const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

async function frames(page){ return page.evaluate(() => window.__cv.frames()); }

test('single rAF loop: frame rate does not accelerate across hide/show cycles', async ({ page }) => {
  await gotoApp(page, { width: 1366, height: 900 });
  await page.waitForTimeout(300);
  const sample = async () => { const a = await frames(page); await page.waitForTimeout(500); const b = await frames(page); return b - a; };
  const rate0 = await sample();
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(120);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(120);
  }
  const rate1 = await sample();
  expect(rate1).toBeLessThan(rate0 * 1.6);   // a duplicate rAF chain would roughly double the rate
  expect(rate1).toBeGreaterThan(rate0 * 0.4);
});

test('constant-speed invariant: agent speeds stay within the cruise envelope', async ({ page }) => {
  await gotoApp(page, { width: 1366, height: 900 });
  await page.waitForTimeout(600);
  const ok = await page.evaluate(() => {
    const f = window.__cv.flocks[0];
    const ag = f.agents();
    let bad = 0;
    for (let i = 0; i < ag.length; i++) {
      const a = ag[i];
      const sp = Math.sqrt(a.vx*a.vx + a.vy*a.vy);
      if (!(sp > a.cruise * 0.3 && sp < a.cruise * 3.2)) bad++;
    }
    return { total: ag.length, bad };
  });
  expect(ok.total).toBeGreaterThan(0);
  expect(ok.bad).toBe(0);
});
