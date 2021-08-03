const Apify = require('apify');
// eslint-disable-next-line no-unused-vars
const Puppeteer = require('puppeteer');

const { sleep } = Apify.utils;

/**
 * Waits and click the selector
 *
 * @param {Puppeteer.Page} page
 * @param {string} selector
 * @param {number} [timeout]
 */
exports.waitClick = async (page, selector, timeout = 5000) => {
    await page.waitForSelector(selector, { timeout, visible: true });
    await Promise.all([
        page.waitForResponse(() => true),
        page.click(selector),
    ]);
    await sleep(timeout);
};
