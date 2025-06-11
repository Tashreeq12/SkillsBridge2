const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyDpdAZSLkt2_aTKl5gQZLY8JR4u9ZorX-8';
const SEARCH_ENGINE_ID = 'e1bb0f15c419b4422';
const UNSPLASH_ACCESS_KEY = 'rn3sVq77gIpfJGmuP2XxEvuOV9Qwpe_7hYAY_1y8Ikg'; // Get from https://unsplash.com/developers

const googleSearch = async (query, numResults = 10) => {
    console.log(`Executing Google Search: "${query}"`);
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: SEARCH_ENGINE_ID,
                q: query,
                num: numResults,
                safe: 'active'
            },
            timeout: 10000
        });

        const items = response.data.items || [];
        console.log(`API Response: ${items.length} items found for "${query}"`);
        if (items.length > 0) console.log('Sample Result:', items[0]);

        return items.map(item => ({
            title: item.title,
            snippet: item.snippet,
            url: item.link,
            thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src
        }));
    } catch (error) {
        console.error(`Google Search Error for "${query}":`, error.response?.data?.error || error.message);
        return [];
    }
};

const fetchUnsplashImage = async (skill) => {
    try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                query: skill.toLowerCase(),
                client_id: UNSPLASH_ACCESS_KEY,
                orientation: 'landscape',
                w: 400,
                h: 200
            },
            timeout: 5000
        });
        return response.data.urls?.regular || 'https://via.placeholder.com/400x200?text=Image+Not+Found';
    } catch (error) {
        console.error(`Unsplash Error for "${skill}":`, error.message);
        return 'https://via.placeholder.com/400x200?text=Image+Not+Found';
    }
};

const searchCourses = async (skill) => {
    const query = `${skill} online course`;
    let results = await googleSearch(query, 10);

    if (results.length === 0) {
        console.log(`No results for "${query}". Trying broader search...`);
        results = await googleSearch(`${skill} course tutorial training`, 10);
    }

    if (results.length === 0) {
        console.log(`No courses found for "${skill}" after fallback.`);
        return [];
    }

    const filteredResults = results.filter(result => 
        result.url.includes('coursera.org') || 
        result.url.includes('udemy.com') || 
        result.url.includes('edx.org') || 
        result.url.includes('linkedin.com') || 
        result.url.includes('youtube.com')
    );

    // Fetch Unsplash image if thumbnail is missing
    const courses = await Promise.all(filteredResults.map(async result => {
        const image = result.thumbnail && result.thumbnail.startsWith('http') 
            ? result.thumbnail 
            : await fetchUnsplashImage(skill);
        console.log(`Image for "${result.title}": ${image}`);
        return {
            skill,
            title: result.title,
            description: result.snippet,
            url: result.url,
            image
        };
    }));

    return courses.length > 0 ? courses : [];
};

module.exports = { googleSearch, searchCourses };