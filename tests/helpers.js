const path = require('path');
const url = require('url');
// file:// URL to index.html with the ?test=1 hook enabled
const fileUrl = url.pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href + '?test=1';
async function gotoApp(page, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(fileUrl);
  // wait for the hero flock to register on the test hook
  await page.waitForFunction(() => window.__cv && window.__cv.flocks && window.__cv.flocks.length >= 1, null, { timeout: 8000 });
}
module.exports = { fileUrl, gotoApp };
