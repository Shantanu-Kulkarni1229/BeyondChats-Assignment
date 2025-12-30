import searchArticles from './googleSearch.service.js';
import { scrapeMultipleUrls } from './contentScraper.service.js';
import { enhanceArticle } from './groq.service.js';
import Article from '../models/article.model.js';

export const enhanceSingleArticle = async (articleId) => {
  const workflow = {
    articleId,
    startTime: new Date(),
    steps: [],
    status: 'in-progress'
  };

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting enhancement workflow for article: ${articleId}`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Fetch original article from database
    console.log(' Step 1: Fetching original article...');
    const originalArticle = await Article.findById(articleId);
    
    if (!originalArticle) {
      throw new Error(`Article with ID ${articleId} not found`);
    }
    
    workflow.steps.push({
      step: 1,
      name: 'Fetch Original Article',
      status: 'completed',
      data: { title: originalArticle.title }
    });
    
    console.log(` Found article: "${originalArticle.title}"\n`);

    // Step 2: Search Google for similar articles
    const searchQuery = originalArticle.title;
    console.log(' Step 2: Searching Google for top-ranking articles...');
    console.log(`   → Query: "${searchQuery}"`);
    const searchResults = await searchArticles(searchQuery);
    
    if (!searchResults || searchResults.length === 0) {
      throw new Error('No search results found on Google');
    }
    
    workflow.steps.push({
      step: 2,
      name: 'Google Search',
      status: 'completed',
      data: { 
        query: searchQuery,
        resultsFound: searchResults.length,
        results: searchResults.map(r => ({ title: r.title, url: r.link }))
      }
    });
    
    console.log(` Step 2 Complete: Found ${searchResults.length} relevant articles:\n`);
    searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title}`);
      console.log(`      ${result.link}\n`);
    });

    // Step 3: Scrape content from search results
    console.log('Step 3: Scraping content from top articles...');
    console.log(`   → Scraping ${searchResults.length} URLs...`);
    const urlsToScrape = searchResults.map(result => result.link);
    const scrapedData = await scrapeMultipleUrls(urlsToScrape);
    
    if (scrapedData.success.length === 0) {
      throw new Error('Failed to scrape content from any of the search results');
    }
    
    const referenceArticles = scrapedData.success.map(scraped => ({
      title: scraped.title,
      url: scraped.url,
      content: scraped.content,
      displayLink: searchResults.find(r => r.link === scraped.url)?.displayLink || '',
      snippet: searchResults.find(r => r.link === scraped.url)?.snippet || '',
      wordCount: scraped.wordCount
    }));
    
    workflow.steps.push({
      step: 3,
      name: 'Scrape Content',
      status: 'completed',
      data: {
        attempted: urlsToScrape.length,
        successful: scrapedData.success.length,
        failed: scrapedData.errors.length,
        references: referenceArticles.map(r => ({
          title: r.title,
          url: r.url,
          wordCount: r.wordCount
        }))
      }
    });
    
    console.log(` Step 3 Complete: Successfully scraped ${scrapedData.success.length} articles`);
    referenceArticles.forEach((ref, index) => {
      console.log(`   ${index + 1}. ${ref.title} (${ref.wordCount} words)`);
    });
    console.log();
    if (scrapedData.errors.length > 0) {
      console.log(` Failed to scrape ${scrapedData.errors.length} URLs:`);
      scrapedData.errors.forEach(err => {
        console.log(`   - ${err.url}: ${err.error}`);
      });
      console.log();
    }

    // Step 4: Enhance article using Groq AI
    console.log('Step 4: Enhancing article with Groq AI...');
    console.log(`   → Using LLaMA 3.3 70B model...`);
    const enhancedData = await enhanceArticle(
      {
        title: originalArticle.title,
        content: originalArticle.content,
        url: originalArticle.url
      },
      referenceArticles
    );
    
    workflow.steps.push({
      step: 4,
      name: 'AI Enhancement',
      status: 'completed',
      data: {
        originalWordCount: originalArticle.content.split(/\s+/).length,
        enhancedWordCount: enhancedData.wordCount,
        readingTime: enhancedData.readingTime
      }
    });
    
    console.log(` Step 4 Complete: Generated enhanced content:`);
    console.log(`   - Original: ${originalArticle.content.split(/\s+/).length} words`);
    console.log(`   - Enhanced: ${enhancedData.wordCount} words`);
    console.log(`   - Reading time: ${enhancedData.readingTime}`);

    console.log(`   - AI Provider: ${enhancedData.aiProvider || 'Groq AI'}\n`);

    // Step 5: Save enhanced article to database
    console.log(' Step 5: Saving enhanced article to database...');
    
    // Create new article with enhanced content
    const enhancedArticle = await Article.create({
      title: enhancedData.title,
      url: `${originalArticle.url}-enhanced-${Date.now()}`,
      content: enhancedData.content,
      image: originalArticle.image,
      date: new Date(),
      scrapedAt: new Date()
    });
    
    workflow.steps.push({
      step: 5,
      name: 'Save to Database',
      status: 'completed',
      data: {
        articleId: enhancedArticle._id,
        title: enhancedArticle.title
      }
    });
    
    console.log(` Step 5 Complete: Enhanced article saved`);
    console.log(`   - New Article ID: ${enhancedArticle._id}`);

    console.log(`   - URL: ${enhancedArticle.url}\n`);

    // Complete workflow
    workflow.status = 'completed';
    workflow.endTime = new Date();
    workflow.duration = `${Math.round((workflow.endTime - workflow.startTime) / 1000)}s`;
    workflow.result = {
      originalArticle: {
        id: originalArticle._id,
        title: originalArticle.title,
        wordCount: originalArticle.content.split(/\s+/).length
      },
      enhancedArticle: {
        id: enhancedArticle._id,
        title: enhancedArticle.title,
        url: enhancedArticle.url,
        wordCount: enhancedData.wordCount,
        readingTime: enhancedData.readingTime
      },
      references: enhancedData.references,
      searchResults: searchResults.length,
      scrapedArticles: scrapedData.success.length
    };

    console.log(`\n${'='.repeat(70)}`);
    console.log(`ENHANCEMENT WORKFLOW COMPLETED SUCCESSFULLY!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   Total Steps: ${workflow.steps.length}`);
    console.log(`   Duration: ${workflow.duration}`);
    console.log(`   Original Word Count: ${originalArticle.content.split(/\s+/).length} words`);
    console.log(`   Enhanced Word Count: ${enhancedData.wordCount} words`);
    console.log(`   References Used: ${enhancedData.references.length}`);
    console.log(`${'='.repeat(70)}\n`);

    return workflow;

  } catch (error) {
    console.error(`\n Enhancement workflow failed: ${error.message}\n`);
    
    workflow.status = 'failed';
    workflow.endTime = new Date();
    workflow.error = error.message;
    
    throw error;
  }
};

export const enhanceMultipleArticles = async (articleIds, options = {}) => {
  const {
    parallel = false,
    stopOnError = false
  } = options;

  console.log(`\n${'━'.repeat(70)}`);
  console.log(`STARTING BATCH ENHANCEMENT`);
  console.log(`${'━'.repeat(70)}`);
  console.log(`   Total Articles: ${articleIds.length}`);
  console.log(`   Mode: ${parallel ? 'Parallel ⚡' : 'Sequential 📝'}`);
  console.log(`   Stop on error: ${stopOnError ? 'Yes ⛔' : 'No ✓'}`);
  console.log(`${'━'.repeat(70)}\n`);

  const results = {
    total: articleIds.length,
    successful: [],
    failed: [],
    startTime: new Date()
  };

  try {
    if (parallel) {
      // Process in parallel
      const promises = articleIds.map(id => 
        enhanceSingleArticle(id)
          .then(workflow => ({ id, success: true, workflow }))
          .catch(error => ({ id, success: false, error: error.message }))
      );
      
      const outcomes = await Promise.allSettled(promises);
      
      outcomes.forEach(outcome => {
        if (outcome.status === 'fulfilled') {
          if (outcome.value.success) {
            results.successful.push(outcome.value);
          } else {
            results.failed.push(outcome.value);
          }
        } else {
          results.failed.push({
            id: 'unknown',
            success: false,
            error: outcome.reason.message
          });
        }
      });

    } else {
      // Process sequentially
      let currentIndex = 0;
      for (const articleId of articleIds) {
        currentIndex++;
        console.log(`\n[${'▓'.repeat(currentIndex)}${'░'.repeat(articleIds.length - currentIndex)}] Processing ${currentIndex}/${articleIds.length}`);
        
        try {
          const workflow = await enhanceSingleArticle(articleId);
          results.successful.push({ id: articleId, success: true, workflow });
          console.log(` Article ${currentIndex}/${articleIds.length} completed successfully\n`);
        } catch (error) {
          results.failed.push({ id: articleId, success: false, error: error.message });
          console.log(` Article ${currentIndex}/${articleIds.length} failed: ${error.message}\n`);
          
          if (stopOnError) {
            console.log(' Stopping batch processing due to error');
            break;
          }
        }
      }
    }

    results.endTime = new Date();
    results.duration = `${Math.round((results.endTime - results.startTime) / 1000)}s`;

    console.log(`\n${'━'.repeat(70)}`);
    console.log(`BATCH ENHANCEMENT COMPLETED`);
    console.log(`${'━'.repeat(70)}`);
    console.log(`   Total Processed: ${results.total}`);
    console.log(`   Successful: ${results.successful.length} ✓`);
    console.log(`   Failed: ${results.failed.length} ✗`);
    console.log(`   Success Rate: ${((results.successful.length / results.total) * 100).toFixed(1)}%`);
    console.log(`   Total Duration: ${results.duration}`);
    console.log(`${'━'.repeat(70)}\n`);

    return results;

  } catch (error) {
    console.error(' Batch enhancement error:', error.message);
    throw error;
  }
};

export const enhanceAllArticles = async (options = {}) => {
  try {
    console.log(`\n${'━'.repeat(70)}`);
    console.log(`📚 FETCHING ALL ARTICLES FROM DATABASE`);
    console.log(`${'━'.repeat(70)}\n`);
    
    const articles = await Article.find({}).select('_id title');
    const articleIds = articles.map(article => article._id.toString());
    
    console.log(` Found ${articleIds.length} articles to enhance:`);
    articles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article._id})`);
    });
    console.log();
    
    if (articleIds.length === 0) {
      return {
        total: 0,
        successful: [],
        failed: [],
        message: 'No articles found in database'
      };
    }
    
    return await enhanceMultipleArticles(articleIds, options);

  } catch (error) {
    console.error(' Error enhancing all articles:', error.message);
    throw error;
  }
};




export default {enhanceSingleArticle , enhanceMultipleArticles, enhanceAllArticles};
