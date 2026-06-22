const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

// Regression: below-the-fold git-graph nodes were measured +20px low (reveal translateY) and never re-corrected on scroll.
test('git-graph node Y stays aligned to its station after scrolling below the fold', async ({ page }) => {
  await gotoApp(page, { width: 1366, height: 900 });
  // scroll all the way to the live branch, then assert the lowest committed node (c-sims) stays aligned.
  // (c-schroders is the in-progress branch — it has no node sphere, only a spark terminus.)
  await page.locator('#c-schroders').scrollIntoViewIfNeeded();
  // poll the alignment so a slow coalesced redraw doesn't flake the test
  await expect.poll(async () => page.evaluate(() => {
    const col = document.querySelector('.spine-col');
    const svg = document.querySelector('.gitgraph');
    if (!col || !svg) return 999;
    const colTop = col.getBoundingClientRect().top;
    const st = document.getElementById('c-sims');
    const eraEl = st.querySelector('.era,.tw-role') || st;
    const expectedY = eraEl.getBoundingClientRect().top - colTop + 11;
    let best = 999;
    svg.querySelectorAll('circle').forEach(c => {
      const cy = parseFloat(c.getAttribute('cy'));
      if (!Number.isNaN(cy)) best = Math.min(best, Math.abs(cy - expectedY));
    });
    return best;
  }), { timeout: 6000, intervals: [120, 250, 500, 800] }).toBeLessThan(8);
});

// Schroders is its own branch off a continuing main: main (gold) runs to the bottom; the branch + tip are git-green.
test('main trunk continues past the green Schroders branch', async ({ page }) => {
  await gotoApp(page, { width: 1366, height: 900 });
  await page.locator('#c-schroders').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const svg = document.querySelector('.gitgraph');
    const paths = Array.from(svg.querySelectorAll('path'));
    const green = paths.filter(p => p.getAttribute('stroke') === '#3FB950').length;
    const col = document.querySelector('.spine-col');
    const cT = col.getBoundingClientRect().top;
    const schBot = document.getElementById('c-schroders').getBoundingClientRect().bottom - cT;
    let mainEnd = 0;
    paths.forEach(p => {
      const d = p.getAttribute('d');
      if (p.getAttribute('stroke') === '#E8B23A' && d.indexOf('M 16') === 0) {
        const m = d.match(/L 16 ([\d.]+)/);
        if (m) mainEnd = Math.max(mainEnd, parseFloat(m[1]));
      }
    });
    return { green, mainEnd, schBot };
  });
  expect(r.green).toBeGreaterThanOrEqual(2);     // fork + branch in git-green
  expect(r.mainEnd).toBeGreaterThan(r.schBot - 30); // gold main reaches the bottom
});
