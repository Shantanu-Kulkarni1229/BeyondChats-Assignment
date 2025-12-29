import Article from '../models/article.model.js';
import scrapeArticles from '../services/scraper.service.js';


export const scrapeAndStoreArticles = async (req, res) => {
  try {
    console.log('🔄 Starting article scraping...');
    
    // Scrape articles
    const scrapedArticles = await scrapeArticles();
    
    if (!scrapedArticles || scrapedArticles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No articles found to scrape'
      });
    }

   
    const savedArticles = [];
    const errors = [];

    for (const articleData of scrapedArticles) {
      try {
        const article = await Article.findOneAndUpdate(
          { url: articleData.url },
          articleData,
          { 
            new: true, 
            upsert: true,
            runValidators: true 
          }
        );
        savedArticles.push(article);
      } catch (error) {
        errors.push({
          title: articleData.title,
          error: error.message
        });
      }
    }

    console.log(`Successfully saved ${savedArticles.length} articles`);

    res.status(201).json({
      success: true,
      message: `Successfully scraped and stored ${savedArticles.length} articles`,
      data: {
        articles: savedArticles,
        count: savedArticles.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error in scrapeAndStoreArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape articles',
      error: error.message
    });
  }
};


export const getAllArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-date',
      search = ''
    } = req.query;

    const query = search 
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Article.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalArticles: total,
          articlesPerPage: parseInt(limit),
          hasNextPage: skip + articles.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error('Error in getArticleById:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message
    });
  }
};


export const createArticle = async (req, res) => {
  try {
    const { title, url, image, content, date } = req.body;

    // Validate required fields
    if (!title || !url || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, URL, and content are required'
      });
    }

    // Check if article with same URL exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(409).json({
        success: false,
        message: 'An article with this URL already exists'
      });
    }

    const article = await Article.create({
      title,
      url,
      image,
      content,
      date: date || new Date(),
      scrapedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error('❌ Error in createArticle:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: error.message
    });
  }
};


export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, image, content, date } = req.body;

    // Check if article exists
    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // If URL is being updated, check for duplicates
    if (url && url !== existingArticle.url) {
      const duplicateUrl = await Article.findOne({ url, _id: { $ne: id } });
      if (duplicateUrl) {
        return res.status(409).json({
          success: false,
          message: 'An article with this URL already exists'
        });
      }
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { 
        ...(title && { title }),
        ...(url && { url }),
        ...(image !== undefined && { image }),
        ...(content && { content }),
        ...(date && { date })
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Error in updateArticle:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID format'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: error.message
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
      data: { article }
    });

  } catch (error) {
    console.error('Error in deleteArticle:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: error.message
    });
  }
};


export const deleteAllArticles = async (req, res) => {
  try {
    const result = await Article.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} articles`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Error in deleteAllArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete articles',
      error: error.message
    });
  }
};


export const getArticleStats = async (req, res) => {
  try {
    const [totalArticles, oldestArticle, newestArticle] = await Promise.all([
      Article.countDocuments(),
      Article.findOne().sort({ date: 1 }),
      Article.findOne().sort({ date: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalArticles,
        oldestArticle: oldestArticle ? {
          title: oldestArticle.title,
          date: oldestArticle.date
        } : null,
        newestArticle: newestArticle ? {
          title: newestArticle.title,
          date: newestArticle.date
        } : null
      }
    });

  } catch (error) {
    console.error('Error in getArticleStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
