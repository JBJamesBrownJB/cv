// Build JB_CV.pdf from index.html using Playwright's bundled Chromium.
// Honours the print stylesheet (@page { size: A4; margin: 11mm }) and prints backgrounds.
// Usage: npm run pdf
const { chromium } = require('@playwright/test');
const path = require('path');
const url = require('url');

(async () => {
  const root = path.resolve(__dirname, '..');
  const file = url.pathToFileURL(path.join(root, 'index.html')).href;
  const out = path.join(root, 'JB_CV.pdf');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(file, { waitUntil: 'networkidle' });
  // ensure web fonts are ready so the print layout is stable
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: out,
    printBackground: true,
    preferCSSPageSize: true, // use @page size:A4; margin:11mm from the stylesheet
  });
  await browser.close();
  console.log('Wrote ' + out);
})().catch((e) => { console.error(e); process.exit(1); });
