// Get a list of universities from the QS University Rankings index page
// A function to be evaluated by Puppeteer within the browser context.
exports.pageFunction = ($universities) => {
    const data = [];

    // We're getting the title, rank and country and link to detail of each university.
    $universities.forEach(($university) => {
        data.push({
            title: $university.querySelector('.uni .title').innerText,
            rank: $university.querySelector('.rank .rank').innerText,
            country: $university.querySelector('.country > div').innerText,
            detailPage: $university.querySelector('.uni .title').href,
        });
    });

    return data;
};

// Get information from the university detail page
// A function to be evaluated by Puppeteer within the browser context.
exports.detailPageFunction = ($universities) => {
    const data = [];

    $universities.forEach(($university) => {
        const uniStatsSelector = $university.querySelectorAll('.uni_stats > .container .key');
        const location = $university.querySelector('.lead_section .location');
        const result = {};

        result.title = $university.querySelector('.lead_section .title_info h1').innerText;
        result.address = location && location.innerText ? location.innerText.replace(' View map', '').replace(/\n/g, ' ') : null;
        result.mapLink = location ? location.querySelector('a').href : null;
        result.logoLink = $university.querySelector('.lead_section .logo_area img').src;

        // University stats
        uniStatsSelector.forEach((item) => {
            const label = item.querySelector('label').innerText.replace(/\s/g, '');
            const formattedLabel = label.charAt(0).toLowerCase() + label.slice(1);
            const value = item.querySelector('.val').innerText;
            result[formattedLabel] = value;
        });

        data.push(result);
    });

    return data;
};
