import axios from 'axios';
import * as cheerio from 'cheerio';
import { scrapeContent } from './contentScraper.service.js';


const scrapeArticles = async () => {
  try {
    const baseUrl = 'https://beyondchats.com/blogs';
    console.log('Fetching blog page...');

    // Fetch the main blog page
    const response = await axios.get(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    // Find all blog article cards
    $('.blog-card, article, .post-card, [class*="blog"], [class*="post"]').each((index, element) => {
      const $element = $(element);

      // Extract title
      const title = $element.find('h2, h3, .title, [class*="title"]').first().text().trim() ||
        $element.find('a').first().attr('title') ||
        '';

      // Extract URL
      let url = $element.find('a').first().attr('href') || '';
      if (url && !url.startsWith('http')) {
        url = url.startsWith('/') ? `https://beyondchats.com${url}` : `https://beyondchats.com/${url}`;
      }

      // Extract image
      const image = $element.find('img').first().attr('src') ||
        $element.find('img').first().attr('data-src') ||
        '';

      // Extract date
      const date = $element.find('time, .date, [class*="date"]').first().text().trim() ||
        $element.find('time').first().attr('datetime') ||
        new Date().toISOString();

      // Extract content/description
      const content = $element.find('p, .description, .excerpt, [class*="excerpt"]').first().text().trim() ||
        $element.find('.content').first().text().trim() ||
        '';

      if (title && url) {
        articles.push({
          title,
          url,
          image: image.startsWith('//') ? `https:${image}` : image,
          date: new Date(date || Date.now()),
          content: content || `Article about ${title}`,
          scrapedAt: new Date()
        });
      }
    });

    console.log(`Found ${articles.length} articles`);

    // If we couldn't find articles with the above selectors, try alternative approach
    if (articles.length === 0) {
      console.log('⚠️ No articles found with primary selectors, trying alternative...');

      $('a[href*="/blog"]').each((index, element) => {
        const $link = $(element);
        const title = $link.text().trim() || $link.attr('title') || '';
        let url = $link.attr('href') || '';

        if (url && !url.startsWith('http')) {
          url = url.startsWith('/') ? `https://beyondchats.com${url}` : `https://beyondchats.com/${url}`;
        }

        const $parent = $link.parent().parent();
        const image = $parent.find('img').first().attr('src') || '';
        const content = $parent.find('p').first().text().trim() || '';

        if (title && url && !articles.some(a => a.url === url)) {
          articles.push({
            title,
            url,
            image: image.startsWith('//') ? `https:${image}` : image,
            date: new Date(),
            content: content || `Article about ${title}`,
            scrapedAt: new Date()
          });
        }
      });
    }

    // Sort by date (oldest first) and take first 5
    const oldestArticles = articles
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    console.log(`📝 Scraping full content for ${oldestArticles.length} articles...`);

    // Now scrape the full content from each article URL
    const articlesWithFullContent = [];
    for (const article of oldestArticles) {
      try {
        console.log(`📄 Scraping full content from: ${article.url}`);
        const fullContent = await scrapeContent(article.url);
        
        // Merge the listing data with full scraped content
        articlesWithFullContent.push({
          ...article,
          content: fullContent.content || article.content, // Use full content if available
          image: fullContent.image || article.image, // Use better image if available
          images: fullContent.images || [], // Include all images
          author: fullContent.author || '',
          description: fullContent.description || ''
        });
        
        console.log(`✅ Successfully scraped ${fullContent.content?.length || 0} characters`);
      } catch (error) {
        console.error(`❌ Failed to scrape full content from ${article.url}:`, error.message);
        // Keep the article with preview content if full scraping fails
        articlesWithFullContent.push(article);
      }
    }

    console.log(`📝 Returning ${articlesWithFullContent.length} articles with full content`);

    return articlesWithFullContent;

  } catch (error) {
    console.error('❌ Error scraping articles:', error.message);
    throw new Error(`Failed to scrape articles: ${error.message}`);
  }
};

export default scrapeArticles;
