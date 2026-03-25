export default function sitemap() {
    const baseUrl = 'https://www.nso.mn';
    
    // Static pages
    const staticPages = [
        '',
        '/mn',
        '/en',
        '/mn/about-us',
        '/en/about-us',
        '/mn/about-us/organization',
        '/en/about-us/organization',
        '/mn/about-us/time-line',
        '/en/about-us/time-line',
        '/mn/about-us/workspace',
        '/en/about-us/workspace',
        '/mn/contact',
        '/en/contact',
        '/mn/statistical-categories',
        '/en/statistical-categories',
        '/mn/downloads',
        '/en/downloads',
        '/mn/metadata',
        '/en/metadata',
        '/mn/metadata/questionnaire',
        '/en/metadata/questionnaire',
        '/mn/metadata/indicator',
        '/en/metadata/indicator',
        '/mn/metadata/glossary',
        '/en/metadata/glossary',
        '/mn/metadata/methodology',
        '/en/metadata/methodology',
        '/mn/metadata/classcode',
        '/en/metadata/classcode',
        '/mn/news',
        '/en/news',
        '/mn/legal',
        '/en/legal',
        '/mn/dissemination',
        '/en/dissemination',
        '/mn/open-data',
        '/en/open-data',
        '/mn/transparency',
        '/en/transparency',
        '/mn/data-visualisation',
        '/en/data-visualisation',
    ];

    const routes = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: route === '' || route === '/mn' || route === '/en' ? 1 : 0.8,
    }));

    return routes;
}

