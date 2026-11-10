// Renders tools/terrain.svg to assets/map-terrain.jpg.
// Run from the island-essence-tour folder:  node tools/render-terrain.js
// (Needs Playwright with Chromium installed.)
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const svg = path.resolve(__dirname, 'terrain.svg');
  const out = path.resolve(__dirname, '../assets/map-terrain.jpg');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 2.4 });
  await page.goto('file://' + svg);
  await page.screenshot({ path: out, type: 'jpeg', quality: 84 });
  await browser.close();
  console.log('Wrote', out);
})();
