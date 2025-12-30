import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeContent = async (url) => {
  try {
    console.log(` Scraping content from: ${url}`);

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, noscript, aside, .advertisement, .ads, .sidebar, .comments').remove();

    // Extract title
    const title = 
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      '';

    // Extract main content using multiple strategies
    let mainContent = '';

    // Strategy 1: Look for article/main tags
    const articleContent = $('article, main, .article-content, .post-content, .entry-content, .content, [role="main"]').first();
    if (articleContent.length > 0) {
      mainContent = extractTextContent(articleContent, $);
    }

    // Strategy 2: Look for largest text block
    if (!mainContent || mainContent.length < 200) {
      let maxLength = 0;
      $('div, section').each((i, elem) => {
        const text = extractTextContent($(elem), $);
        if (text.length > maxLength) {
          maxLength = text.length;
          mainContent = text;
        }
      });
    }

    // Strategy 3: Fallback - get all paragraph text
    if (!mainContent || mainContent.length < 200) {
      mainContent = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Extract metadata
    const author = 
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').first().text().trim() ||
      $('.author').first().text().trim() ||
      '';

    const publishDate = 
      $('meta[property="article:published_time"]').attr('content') ||
      $('time').first().attr('datetime') ||
      $('time').first().text().trim() ||
      $('.date').first().text().trim() ||
      '';

    const description = 
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Extract main image
    const image = 
      $('meta[property="og:image"]').attr('content') ||
      $('article img').first().attr('src') ||
      $('img').first().attr('src') ||
      '';

    // Clean and format the content
    mainContent = cleanContent(mainContent);

    console.log(`Scraped ${mainContent.length} characters from ${url}`);

    return {
      url,
      title: cleanText(title),
      content: mainContent,
      author: cleanText(author),
      publishDate: cleanText(publishDate),
      description: cleanText(description),
      image: image || '',
      wordCount: mainContent.split(/\s+/).length,
      scrapedAt: new Date()
    };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    
    if (error.code === 'ENOTFOUND') {
      throw new Error(`Failed to reach ${url}. URL may be invalid or unreachable.`);
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error(`Access denied to ${url}. The website may be blocking scrapers.`);
    }
    
    if (error.response?.status === 404) {
      throw new Error(`URL not found: ${url}`);
    }
    
    throw new Error(`Failed to scrape content from ${url}: ${error.message}`);
  }
};


const extractTextContent = (element, $) => {
  // Get all paragraph texts
  const paragraphs = element.find('p').map((i, el) => {
    return $(el).text().trim();
  }).get();

  // Get heading texts
  const headings = element.find('h1, h2, h3, h4, h5, h6').map((i, el) => {
    return '\n\n## ' + $(el).text().trim() + '\n';
  }).get();

  // Combine headings and paragraphs
  const allText = element.text();
  
  if (paragraphs.length > 0) {
    return paragraphs.join('\n\n');
  }
  
  return allText.trim();
};

const cleanContent = (text) => {
  if (!text) return '';
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim
    .trim()
    // Ensure max length
    .slice(0, 50000);
};

const cleanText = (text) => {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ').slice(0, 500);
};

export const scrapeMultipleUrls = async (urls) => {
  try {
    console.log(`📚 Scraping ${urls.length} URLs...`);
    
    const results = await Promise.allSettled(
      urls.map(url => scrapeContent(url))
    );

    const successfulResults = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        errors.push({
          url: urls[index],
          error: result.reason.message
        });
      }
    });

    console.log(`✅ Successfully scraped ${successfulResults.length}/${urls.length} URLs`);
    
    if (errors.length > 0) {
      console.log(`⚠️ Failed to scrape ${errors.length} URLs`);
    }

    return {
      success: successfulResults,
      errors: errors
    };

  } catch (error) {
    console.error('❌ Error in batch scraping:', error.message);
    throw error;
  }
};

export const analyzeContentStructure = (content) => {
  try {
    const $ = cheerio.load(`<div>${content}</div>`);
    
    // Analyze structure
    const hasHeadings = $('h1, h2, h3, h4').length > 0;
    const hasList = $('ul, ol').length > 0;
    const hasImages = $('img').length > 0;
    const hasLinks = $('a').length > 0;
    const hasBlockquotes = $('blockquote').length > 0;
    
    const paragraphCount = $('p').length;
    const wordCount = content.split(/\s+/).length;
    const avgWordsPerParagraph = paragraphCount > 0 ? Math.round(wordCount / paragraphCount) : 0;
    
    return {
      hasHeadings,
      hasList,
      hasImages,
      hasLinks,
      hasBlockquotes,
      paragraphCount,
      wordCount,
      avgWordsPerParagraph,
      structure: {
        introduction: paragraphCount > 0,
        bodyParagraphs: paragraphCount > 2,
        conclusion: paragraphCount > 3
      }
    };

  } catch (error) {
    console.error('Error analyzing content structure:', error.message);
    return {};
  }
};

export default scrapeContent;
