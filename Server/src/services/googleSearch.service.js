import axios from 'axios';


const SERPAPI_URL = 'https://serpapi.com/search';


export const searchGoogleWithSerpApi = async (query) => {
  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('SerpApi key not configured. Please set SERPAPI_KEY in .env file');
    }

    console.log(`🔍 Searching Google via SerpApi for: "${query}"`);

    const response = await axios.get(SERPAPI_URL, {
      params: {
        q: query,
        api_key: apiKey,
        num: 10,
        gl: 'us',
        hl: 'en',
        engine: 'google'
      },
      timeout: 15000
    });

    const organicResults = response.data.organic_results || [];
    
    if (organicResults.length === 0) {
      console.log('⚠️ No search results found');
      return [];
    }

    // Filter for quality content (exclude social media, videos, etc.)
    const filteredResults = organicResults.filter(item => {
      const url = (item.link || '').toLowerCase();
      
      // Exclude certain domains
      const excludeDomains = [
        'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'pinterest.com', 'reddit.com', 'tiktok.com'
      ];
      
      const isExcluded = excludeDomains.some(domain => url.includes(domain));
      return !isExcluded;
    });

    // Get top 2 results
    const topResults = filteredResults.slice(0, 2).map(item => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayed_link || new URL(item.link).hostname
    }));

    console.log(`✅ Found ${topResults.length} relevant results via SerpApi`);
    topResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title}`);
      console.log(`      ${result.link}`);
    });
    
    return topResults;

  } catch (error) {
    console.error('❌ Error with SerpApi:', error.message);
    
    if (error.response?.status === 429) {
      throw new Error('SerpApi rate limit exceeded. Please try again later.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('SerpApi authentication failed. Check your SERPAPI_KEY in .env file.');
    }
    
    throw new Error(`SerpApi search failed: ${error.message}`);
  }
};

export const searchArticles = async (query) => {
  try {
    // Use SerpApi as primary search method
    return await searchGoogleWithSerpApi(query);
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    
    // Provide helpful error message
    if (error.message.includes('not configured')) {
      throw new Error('SerpApi is not configured. Please add SERPAPI_KEY to your .env file. Get your key at: https://serpapi.com/');
    }
    
    throw error;
  }
};

export default searchArticles;
