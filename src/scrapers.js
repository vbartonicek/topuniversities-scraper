// Get a list of universities from the QS University Rankings index page
// A function to be evaluated by Puppeteer within the browser context.
exports.pageFunction = ($universities) => {
    const data = [];

    // We're getting the title, rank and country and link to detail of each university.
    $universities.forEach(($university) => {
        data.push({
            title: $university.querySelector('.uni-link') ? $university.querySelector('.uni-link').textContent.trim() : null,
            QS_world_university_ranking: $university.querySelector('._univ-rank')
                ? $university.querySelector('._univ-rank').textContent.trim() : null,
            overall_score: $university.querySelector('.overall-score-span')
                ? $university.querySelector('.overall-score-span').textContent.trim() : null,
            country: $university.querySelector('.location') ? $university.querySelector('.location').textContent.trim() : null,
            detail_page: $university.querySelector('.uni-link') ? $university.querySelector('.uni-link').href : null,
        });
    });

    return data;
};

// Get information from the university detail page
// A function to be evaluated by Puppeteer within the browser context.
exports.detailPageFunction = ($universities) => {
    const data = [];

    $universities.forEach(($university) => {
        const result = {};
        const locations = $university.querySelectorAll('.desktop-view .campus-locations');
        const locationsResult = [];
        locations.forEach((locationNode) => {
            locationsResult.push(locationNode.textContent.trim());
        });

        result.title = $university.querySelector('.programeTitle') ? $university.querySelector('.programeTitle').textContent.trim() : null;
        result.locations = locationsResult;
        result.QS_world_university_ranking = $university.querySelector('.uni_ranking span')
            ? $university.querySelector('.uni_ranking span').textContent.replace('=', '') : null;
        result.status = $university.querySelector('li[title="Status"] > .info-setails')
            ? $university.querySelector('li[title="Status"] > .info-setails').textContent.trim() : null;
        result.research_output = $university.querySelector('li[title="Research Output"] > .info-setails')
            ? $university.querySelector('li[title="Research Output"] > .info-setails').textContent.trim() : null;
        result['Student/Faculty_ratio'] = $university.querySelector('li[title="Student/Faculty Ratio"] > .info-setails')
            ? $university.querySelector('li[title="Student/Faculty Ratio"] > .info-setails').textContent.trim() : null;
        result.scholarships = $university.querySelector('li[title="Scholarships"] > .info-setails')
            ? $university.querySelector('li[title="Scholarships"] > .info-setails').textContent.trim() : null;
        result.international_students = $university.querySelector('li[title="International Students"] > .info-setails')
            ? $university.querySelector('li[title="International Students"] > .info-setails').textContent.trim() : null;
        result.size = $university.querySelector('li[title="Size"] > .info-setails')
            ? $university.querySelector('li[title="Size"] > .info-setails').textContent.trim() : null;
        result.total_faculty = $university.querySelector('li[title="Total Faculty"] > .info-setails')
            ? $university.querySelector('li[title="Total Faculty"] > .info-setails').textContent.trim() : null;
        result.overview = $university.querySelector('.profile-about-section')
            ? $university.querySelector('.profile-about-section').textContent.trim().replace('Read less', '') : null;

        data.push(result);
    });

    return data;
};
