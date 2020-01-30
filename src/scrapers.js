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
        const uniStats = $university.querySelector('.uni_stats > .container');

        const location = $university.querySelector('.lead_section .location');
        const address = location ? location.innerText.replace(' View map', '') : null;
        const mapLink = location ? location.querySelector('a').href : null;

        data.push({
            title: $university.querySelector('.lead_section .title_info h1').innerText,
            rank: uniStats.querySelector('.key:nth-child(1) .val').innerText,
            status: uniStats.querySelector('.key:nth-child(2) .val').innerText,
            researchOutput: uniStats.querySelector('.key:nth-child(3) .val').innerText,
            studentsCount: uniStats.querySelector('.key:nth-child(4) .val').innerText,
            scholarships: uniStats.querySelector('.key:nth-child(5) .val').innerText,
            address,
            mapLink,
            logoLink: $university.querySelector('.lead_section .logo_area img').src,
        });
    });

    return data;
};
