const Apify = require('apify');
const { pageFunction, detailPageFunction } = require('./scrapers');
const { PAGE_TYPES } = require('./consts');

Apify.main(async () => {
    const { detailedMode, year, country, proxy } = await Apify.getInput();

    // Apify.openRequestQueue() is a factory to get a preconfigured RequestQueue instance.
    // We add our first request to it - the initial page the crawler will visit.
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.topuniversities.com/university-rankings/world-university-rankings/${year}`,
        userData: { type: PAGE_TYPES.INDEX },
    });

    if (proxy.apifyProxyGroups && proxy.apifyProxyGroups.length === 0) delete proxy.apifyProxyGroups;

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,

        // Options that are passed to the Apify.launchPuppeteer() function.
        launchPuppeteerOptions: {
            headless: true,
            ...proxy,
        },

        // Concurrency
        minConcurrency: 1,
        maxConcurrency: 1,

        // Stop crawling after several pages
        maxRequestsPerCrawl: 1200, // There should not be more request as the ranking each year contains about 1000 universities

        gotoFunction: ({ request, page }) => {
            const { url, userData } = request;
            // Wait until the page is fully loaded - universities table is loaded asynchronously
            if (userData.type === PAGE_TYPES.INDEX) return page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
            return page.goto(url, { timeout: 0 });
        },


        // The function accepts a single parameter, which is an object with the following fields:
        // - request: an instance of the Request class with information such as URL and HTTP method
        // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
        handlePageFunction: async ({ request, page }) => {
            const { userData, url } = request;
            let data = [];

            console.log(`Processing ${url}...`); // eslint-disable-line

            if (userData.type === PAGE_TYPES.INDEX) {
                // Index page

                // Set "Results per page" select field to show all universities
                await page.select('#qs-rankings_length select', '-1');

                // Set country filter
                if (country !== 'All countries') await page.select('#qs-rankings thead select.country-select', country);

                if (detailedMode) {
                    // Detailed mode
                    await Apify.utils.enqueueLinks({
                        page,
                        requestQueue,
                        selector: '#qs-rankings > tbody > tr .uni .title[href]',
                        transformRequestFunction: (req) => {
                            req.userData.type = PAGE_TYPES.DETAIL;
                            return req;
                        },
                    });
                } else {
                    // Basic mode
                    data = await page.$$eval('#qs-rankings > tbody > tr', pageFunction);
                }
            } else {
                // University detail page
                data = await page.$$eval('#block-system-main > .content', detailPageFunction);
            }

            // Store the results to the default dataset.
            await Apify.pushData(data);
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed too many times`); // eslint-disable-line
            await Apify.pushData({
                '#debug': Apify.utils.createRequestDebugInfo(request),
            });
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    console.log('Actor finished.'); // eslint-disable-line
});
