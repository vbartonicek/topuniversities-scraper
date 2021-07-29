const Apify = require('apify');
const { pageFunction, detailPageFunction } = require('./scrapers');
const { MODE, PAGE_TYPES } = require('./consts');

const { log } = Apify.utils;

Apify.main(async () => {
    const { mode, year, country, maxItems } = await Apify.getInput();
    log.info(`Actor mode: ${mode}.`);
    log.info(`Year: ${year}.`);
    log.info(`Country: ${country}.`);
    log.info(`Limit of items that can be saved: ${maxItems}.`);

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.topuniversities.com/university-rankings/world-university-rankings/${year}`,
        userData: { type: PAGE_TYPES.INDEX },
    });

    const proxyConfiguration = await Apify.createProxyConfiguration();

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
                // Index page
                // Set "Results per page" select field to show all universities
                await page.click('.sort_by_dropdown');
                await Apify.utils.sleep(5000);
                await page.click('.sort_by_dropdown .dropdown');
                await Apify.utils.sleep(7000);
                await page.click('.sort_by_dropdown div[data-value="100"]');
                await Apify.utils.sleep(6000);
                // Set country filter
                if (country !== 'All countries') {
                    log.info(`Setting desired country...`);
                    await page.select('.country-select-realdiv #country-select', country.toLowerCase());
                    await Apify.utils.sleep(6000);
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
                // University detail page
                data = await page.$$eval('body', detailPageFunction);
                data = {
                    ...data,
                    detail_page: url,
                };
                await Apify.pushData(data);
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
