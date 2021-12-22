const puppeteer = require('puppeteer');
import * as assert from 'assert';
const path = require('path');

// set to false to view transitions tested in Chromium
const headless_browser = true;

// set to true to allow 1000ms delay between transition start and finish
// (gives time to view transitions when not in headless mode)
const transition_delay = false;

describe('svelte-style-csp', async () => {
  describe('test transitions with svelte-styles-csp & strict-CSP', async () => {
    it('svelte-stylesheet sucessfully loaded', async () => {
      const absolutePath = path.join(
        __dirname,
        'svelte-test-transitions-styles-csp/index.html'
      );
      const browser = await puppeteer.launch({ headless: headless_browser });
      const page = await browser.newPage();
      try {
        await page.goto('file://' + absolutePath);
        let linkTitle: string;
        const linkTitles = await page.evaluateHandle(() => {
          return Array.from(document.getElementsByTagName('link')).map(
            (a) => a.title
          );
        });
        const linkList = await linkTitles.jsonValue();
        
        await browser.close();
        for (const item of linkList) {
          if (item == 'svelte-stylesheet') linkTitle = item;
        }
        assert.equal(linkTitle, 'svelte-stylesheet');
      } catch (err) {
        throw new Error(err);
      }
    });
    it('transitions work with strict CSP and no style-src: unsafe-inline', async () => {
      const absolutePath = path.join(
        __dirname,
        'svelte-test-transitions-styles-csp/index.html'
      );
      const browser = await puppeteer.launch({ headless: headless_browser });
      const page = await browser.newPage();
      try {
        await page.goto('file://' + absolutePath);
        await page.click('input');
        if (transition_delay) {
          await page.waitFor(1000);
        }
        await page.click('input');
        await browser.close();
        // Transitions work and no errors are thrown
        assert.ok(true);
      } catch (err) {
        throw new Error(err);
      }
    });
  });

  describe('test transitions without svelte-styles-csp & strict CSP', async () => {
    it('transitions fail with strict CSP and no style-src: unsafe-inline', async () => {
      const absolutePath = path.join(
        __dirname,
        'svelte-test-transitions-no-styles-csp/index.html'
      );
      const browser = await puppeteer.launch({ headless: headless_browser });
      const process = browser.process();
  const killBrowser = (retries = 5) => {
    if (retries === 0) {
      return; // exit condition
    }
    if (process && process.pid && process.kill && !process.killed) {
      setTimeout(() => {
        // console.log(`BROWSER Process Id: ${process.pid}, KILLING IT! retries:`, retries);
        if (!process.kill('SIGKILL')) {
          retries--;
          killBrowser(retries);
        }
      }, 200);
    }
  };
      const page = await browser.newPage();
      try {
        await page.goto('file://' + absolutePath);
        await page.click('input');
        if (transition_delay) {
          await page.waitFor(1000);
        }
        await page.click('input');
      } catch (err) {
        // Transitions should fail with strict CSP
        await browser.close();
        assert.throws(err);
      }
      killBrowser();
    });
  });
});
