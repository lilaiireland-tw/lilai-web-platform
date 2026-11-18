// Run against a local Next server; external services are mocked and no forms are submitted.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [375, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:3120/ireland-25-plus-8');
      const play = page.locator('#hv-player button');
      await play.waitFor();
      assert(await page.locator('#hv-block').isVisible());
      assert.equal(await page.locator('#hv-player iframe').count(), 0);
      assert.equal(await page.locator('script[src*="youtube.com/iframe_api"]').count(), 0);
      const links = page.locator('[data-school-detail]');
      assert.equal(await links.count(), 3);
      for (const link of await links.all()) {
        assert.match(await link.getAttribute('href'), /^https:\/\/tidy-nerine-6a5\.notion\.site\//);
        assert.equal(await link.getAttribute('target'), '_blank');
        assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
        await link.focus();
        assert(await link.evaluate(el => el.matches(':focus-visible')));
        // Prevent navigation while exercising the real delegated tracking handler.
        await link.evaluate(el => el.addEventListener('click', e => e.preventDefault()));
      }
      await links.first().click();
      assert.equal(await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'click_25plus8_school_detail').length), 0);
      await context.addCookies([{ name: 'lilai_consent_v1', value: 'v1.100', url: 'http://127.0.0.1:3120' }]);
      for (const link of await links.all()) await link.click();
      assert.equal(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'click_25plus8_school_detail').length), 3);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      // Use an API double so playback milestones can be checked without contacting YouTube.
      await page.evaluate(() => {
        window.YT = { Player: function (host, options) {
          window.playerOptions = options;
          const iframe = document.createElement('iframe');
          host.replaceWith(iframe);
          this.getIframe = () => iframe;
          this.getDuration = () => 100;
          this.getCurrentTime = () => 60;
          this.destroy = () => iframe.remove();
          setTimeout(() => options.events.onReady({ target: this }), 0);
        } };
      });
      await play.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => !!window.playerOptions);
      assert.equal(await page.evaluate(() => window.playerOptions.videoId), 'fY5Qom7wTKE');
      assert.equal(await page.evaluate(() => window.playerOptions.host), 'https://www.youtube-nocookie.com');
      await page.evaluate(() => window.playerOptions.events.onStateChange({ data: 1 }));
      await page.waitForFunction(() => window.dataLayer.some(e => e.event === 'highlight_video_50_percent'));
      await page.evaluate(() => {
        window.playerOptions.events.onStateChange({ data: 1 });
        window.playerOptions.events.onStateChange({ data: 0 });
        window.playerOptions.events.onStateChange({ data: 0 });
      });
      for (const stage of ['play', '50_percent', 'complete']) {
        assert.equal(await page.evaluate(stage => window.dataLayer.filter(e => e.event === 'highlight_video_' + stage).length, stage), 1);
      }
      // API unavailable: six-second fallback embeds the same video, without a false play event.
      await page.reload();
      await page.locator('#hv-player button').click();
      await page.waitForSelector('#hv-player iframe', { timeout: 10000 });
      assert.match(await page.locator('#hv-player iframe').getAttribute('src'), /youtube-nocookie\.com\/embed\/fY5Qom7wTKE\?/);
      assert.equal(await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'highlight_video_play').length), 0);
      assert.equal(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'highlight_video_fallback_embed').length), 1);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('PASS 25+8 media: 375/1440px, school links/focus/consent, keyboard playback, milestone deduplication, API fallback, no overflow or page errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
