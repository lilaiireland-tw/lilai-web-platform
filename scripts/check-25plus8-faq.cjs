// Local browser check; external requests are blocked and no forms are submitted.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [375, 1440]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
        await page.goto('http://127.0.0.1:3120/ireland-25-plus-8');
        await page.locator('#hv-player button').waitFor();
        const items = page.locator('#faq details');
        assert.deepEqual(await items.evaluateAll(items => items.map(item => item.open)), [true, true, false, false, false, false, false, false, false, false]);
        const item = items.nth(2), summary = item.locator('summary');
        const closedHeight = await item.evaluate(el => el.getBoundingClientRect().height);
        await summary.focus();
        await page.keyboard.press('Enter');
        if (reducedMotion === 'no-preference') {
          // Pause halfway to prove content height is interpolated, rather than snapping.
          const heights = await item.evaluate(async el => {
            const animation = el.getAnimations()[0];
            animation.pause();
            animation.currentTime = 140;
            await new Promise(requestAnimationFrame);
            const middle = el.getBoundingClientRect().height;
            animation.finish();
            await new Promise(requestAnimationFrame);
            return { middle, full: el.getBoundingClientRect().height };
          });
          assert(heights.middle > closedHeight && heights.middle < heights.full);
          await summary.press('Space');
          assert(await item.evaluate(el => el.open && el.hasAttribute('data-faq-closing') && el.getAnimations().length === 1));
          // Reverse the closing animation without leaving the item stuck or creating parallel animations.
          await summary.press('Enter');
          assert.equal(await item.evaluate(el => el.getAnimations().length), 1);
          await page.waitForFunction(() => document.querySelectorAll('#faq details')[2].getAnimations().length === 0);
          assert(await item.evaluate(el => el.open));
        } else {
          assert(await item.evaluate(el => el.open && el.getAnimations().length === 0));
        }
        await summary.press('Enter');
        await page.waitForFunction(() => !document.querySelectorAll('#faq details')[2].open);
        assert.equal(await item.evaluate(el => el.getAnimations().length), 0);
        assert.equal(await item.evaluate(el => el.getBoundingClientRect().height), closedHeight);
        assert.equal(await item.locator('p').isVisible(), false);
        assert(await summary.evaluate(el => document.activeElement === el));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log('PASS FAQ: 375/1440px, animated opening/closing, rapid reversal, Enter/Space, independent initial states, reduced motion, no overflow or page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
