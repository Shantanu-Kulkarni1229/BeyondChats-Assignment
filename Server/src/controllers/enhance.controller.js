import {
  enhanceSingleArticle,
  enhanceMultipleArticles,
  enhanceAllArticles
} from '../services/articleEnhancer.service.js';
import Article from '../models/article.model.js';

export const enhanceArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📨 ENHANCEMENT REQUEST RECEIVED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Article ID: ${id}`);

    // Validate article ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    // Check if article exists
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Article with ID ${id} not found`
      });
    }

    console.log(`Article Title: "${article.title}"`);
    console.log(`Original URL: ${article.url}`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`🚀 STARTING ENHANCEMENT WORKFLOW`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`📝 Step 1: Fetching original article...`);
    console.log(`   ✓ Article loaded: "${article.title}"`);
    console.log(`   ✓ Content length: ${article.content.length} characters\n`);

    console.log(`🔍 Step 2: Searching Google for top-ranking articles...`);
    console.log(`   → Query: "${article.title}"`);
    console.log(`   → Searching for reference articles...\n`);

    // Start enhancement workflow
    const workflow = await enhanceSingleArticle(id);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ ENHANCEMENT COMPLETED SUCCESSFULLY`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Article: "${article.title}"`);
    console.log(`Total Steps: ${workflow.steps?.length || 4}`);
    console.log(`Status: ${workflow.status}`);
    if (workflow.enhancedArticle) {
      console.log(`Enhanced Article ID: ${workflow.enhancedArticle._id}`);
      console.log(`Word Count: ${workflow.enhancedArticle.content?.split(/\s+/).length || 0} words`);
    }
    console.log(`Duration: ${workflow.endTime ? ((new Date(workflow.endTime) - new Date(workflow.startTime)) / 1000).toFixed(2) : 'N/A'}s`);
    console.log(`${'='.repeat(70)}\n`);

    res.status(200).json({
      success: true,
      message: 'Article enhanced successfully',
      data: workflow
    });

  } catch (error) {
    console.error('❌ Error in enhanceArticleById:', error);

    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID format'
      });
    }

    if (error.message.includes('API') || error.message.includes('quota')) {
      return res.status(503).json({
        success: false,
        message: 'External API service unavailable',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to enhance article',
      error: error.message
    });
  }
};

export const enhanceBatchArticles = async (req, res) => {
  try {
    const { articleIds, options = {} } = req.body;

    // Validate input
    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'articleIds array is required and must not be empty'
      });
    }

    if (articleIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 articles can be enhanced in a single batch'
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`BATCH ENHANCEMENT REQUEST RECEIVED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Total Articles: ${articleIds.length}`);
    console.log(`Options:`, options);
    console.log(`${'='.repeat(70)}\n`);

    // Verify all articles exist
    console.log(`📋 Step 1: Validating articles...`);
    const existingArticles = await Article.find({ _id: { $in: articleIds } });
    if (existingArticles.length !== articleIds.length) {
      console.log(`validation failed: ${existingArticles.length}/${articleIds.length} articles found\n`);
      return res.status(404).json({
        success: false,
        message: 'Some article IDs not found in database',
        found: existingArticles.length,
        requested: articleIds.length
      });
    }
    console.log(`   ✓ All ${existingArticles.length} articles found in database`);
    existingArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title}"`);
    });
    console.log();

    console.log(`STARTING BATCH ENHANCEMENT WORKFLOW`);
    console.log(`${'─'.repeat(70)}\n`);

    // Start batch enhancement
    const startTime = Date.now();
    const results = await enhanceMultipleArticles(articleIds, options);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`BATCH ENHANCEMENT COMPLETED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Total Processed: ${results.total}`);
    console.log(`Successful: ${results.successful.length} ✓`);
    console.log(`Failed: ${results.failed.length} ✗`);
    console.log(`Duration: ${duration}s`);
    console.log(`${'='.repeat(70)}\n`);

    res.status(200).json({
      success: true,
      message: `Batch enhancement completed: ${results.successful.length}/${results.total} successful`,
      data: results
    });

  } catch (error) {
    console.error('Error in enhanceBatchArticles:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to enhance batch of articles',
      error: error.message
    });
  }
};

export const enhanceAllArticlesInDb = async (req, res) => {
  try {
    const { options = {} } = req.body || {};

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🌐 ENHANCE ALL ARTICLES REQUEST RECEIVED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Options:`, options);
    console.log(`${'='.repeat(70)}\n`);

    // Get count first
    console.log(`Step 1: Counting articles in database...`);
    const totalCount = await Article.countDocuments();
    
    if (totalCount === 0) {
      console.log(`❌ No articles found in database\n`);
      return res.status(404).json({
        success: false,
        message: 'No articles found in database'
      });
    }

    console.log(`   ✓ Found ${totalCount} articles in database\n`);

    if (totalCount > 20) {
      console.log(`Too many articles (${totalCount}). Recommend using batch processing.\n`);
      return res.status(400).json({
        success: false,
        message: `Too many articles (${totalCount}). Please use batch enhancement for large datasets or set parallel:true in options.`,
        suggestion: 'Use POST /api/enhance/batch with specific article IDs'
      });
    }

    console.log(`STARTING ENHANCEMENT FOR ALL ${totalCount} ARTICLES`);
    console.log(`${'─'.repeat(70)}\n`);

    // Start enhancement for all articles
    const startTime = Date.now();
    const results = await enhanceAllArticles(options);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`ALL ARTICLES ENHANCEMENT COMPLETED`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Total Processed: ${results.total}`);
    console.log(`Successful: ${results.successful.length} ✓`);
    console.log(`Failed: ${results.failed.length} ✗`);
    console.log(`Success Rate: ${((results.successful.length / results.total) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${duration}s`);
    console.log(`Avg per article: ${(duration / results.total).toFixed(2)}s`);
    console.log(`${'='.repeat(70)}\n`);

    res.status(200).json({
      success: true,
      message: `Enhanced ${results.successful.length}/${results.total} articles`,
      data: results
    });

  } catch (error) {
    console.error('Error in enhanceAllArticlesInDb:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to enhance all articles',
      error: error.message
    });
  }
};


export const getAvailableArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      Article.find({})
        .select('_id title url date createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles: articles.map(article => ({
          id: article._id,
          title: article.title,
          url: article.url,
          date: article.date,
          createdAt: article.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalArticles: total,
          articlesPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAvailableArticles:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch available articles',
      error: error.message
    });
  }
};

export const testGoogleSearch = async (req, res) => {
  try {
    const { query = 'test search query' } = req.query;

    const searchArticles = (await import('../services/googleSearch.service.js')).default;
    const results = await searchArticles(query);

    res.status(200).json({
      success: true,
      message: 'SerpApi Search is working',
      data: {
        query,
        resultsFound: results.length,
        results
      }
    });

  } catch (error) {
    console.error('Error testing SerpApi Search:', error);

    res.status(500).json({
      success: false,
      message: 'SerpApi Search test failed',
      error: error.message
    });
  }
};

export const testContentScraping = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required in request body'
      });
    }

    const { scrapeContent } = await import('../services/contentScraper.service.js');
    const scrapedContent = await scrapeContent(url);

    res.status(200).json({
      success: true,
      message: 'Content scraping is working',
      data: scrapedContent
    });

  } catch (error) {
    console.error('Error testing content scraping:', error);

    res.status(500).json({
      success: false,
      message: 'Content scraping test failed',
      error: error.message
    });
  }
};

export const getEnhancementStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    
    // Get articles enhanced today (this is a simple example)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const enhancedToday = await Article.countDocuments({
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        totalArticles,
        enhancedToday,
        availableForEnhancement: totalArticles,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting enhancement stats:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get enhancement statistics',
      error: error.message
    });
  }
};

export default {
  enhanceArticleById,
  enhanceBatchArticles,
  enhanceAllArticlesInDb,
  getAvailableArticles,
  testGoogleSearch,
  testContentScraping,
  getEnhancementStats
};
