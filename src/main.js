const Apify = require('apify');
const { waitClick } = require('./fns');
const { pageFunction, detailPageFunction } = require('./scrapers');
const { MODE, PAGE_TYPES } = require('./consts');

const { log } = Apify.utils;

Apify.main(async () => {
    const { mode, year, country, maxItems, proxy } = await Apify.getInput();
    log.info(`Actor mode: ${mode}.`);
    log.info(`Year: ${year}.`);
    log.info(`Country: ${country}.`);
    log.info(`Limit of items that can be saved: ${maxItems}.`);

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.topuniversities.com/university-rankings/world-university-rankings/${year}`,
        userData: { type: PAGE_TYPES.INDEX },
    });

    const proxyConfiguration = await Apify.createProxyConfiguration(proxy);

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        useSessionPool: true,
        persistCookiesPerSession: true,
        maxConcurrency: 10,
        maxRequestRetries: 5,
        proxyConfiguration,
        launchContext: {
            launchOptions: {
                waitUntil: 'networkidle0',
            },
            useChrome: true,
            stealth: false,
        },
        handlePageFunction: async ({ request, page }) => {
            const { userData, url } = request;
            let data = [];
            log.info(`Processing ${url}...`);
            if (userData.type === PAGE_TYPES.INDEX) {
                // this means the list loaded and dropdown will work
                await page.waitForSelector('._qs-ranking-data-row');
                // Index page
                // Set "Results per page" select field to show all universities
                await waitClick(page, '.sort_by_dropdown .dropdown');
                await page.evaluate(() => window.scrollBy({ top: document.body.scrollHeight / 2 }));
                await waitClick(page, '.sort_by_dropdown div[data-value="100"]', 2000);
                // Set country filter
                if (country !== 'All countries') {
                    log.info(`Setting desired country ${country}...`);
                    await Promise.all([
                        page.waitForResponse(() => true),
                        page.select('.country-select-realdiv #country-select', country.toLowerCase()),
                    ]);
                }
                const numberOfResults = await page.$eval('#_totalcountresults', (el) => el.textContent);
                log.info(`Found ${numberOfResults} results in total.`);

                if (numberOfResults > maxItems) {
                    log.info(`Will be saved: ${maxItems} items.`);
                }
                // COUNTER OF ITEMS TO SAVE;
                let itemsCounter = 0;

                if (mode === MODE.VISIT_DETAIL) {
                    const detailUrls = await page.$$eval('.uni-link', (links) => links
                        .map((link) => `https://www.topuniversities.com/${link.getAttribute('href')}`));

                    for (const req of detailUrls) {
                        if (!(itemsCounter >= maxItems)) {
                            await requestQueue.addRequest(
                                {
                                    url: req,
                                    userData: {
                                        type: PAGE_TYPES.DETAIL,
                                    },
                                },
                            );
                        }
                        itemsCounter += 1;
                    }
                } else {
                    // Basic mode
                    data = await page.$$eval('.ind', pageFunction);
                    for (const item of data) {
                        if (!(itemsCounter >= maxItems)) {
                            await Apify.pushData(item);
                            itemsCounter += 1;
                        }
                    }
                }
            } else {
                // // University detail page
                // eslint-disable-next-line no-shadow
                for (const data of await page.$$eval('body', detailPageFunction)) {
                    await Apify.pushData({ ...data, detail_page: url });
                }
            }
        },
        handleFailedRequestFunction: async ({ request }) => {
            log.info(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                '#debug': Apify.utils.createRequestDebugInfo(request),
            });
        },
    });
    await crawler.run();
    log.info('Actor finished.');
});
