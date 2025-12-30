import express from 'express';
import {
  enhanceArticleById,
  enhanceBatchArticles,
  enhanceAllArticlesInDb,
  getAvailableArticles,
  testGoogleSearch,
  testContentScraping,
  getEnhancementStats
} from '../controllers/enhance.controller.js';

const router = express.Router();

// Main enhancement routes (specific routes BEFORE dynamic :id)
router.post('/batch', enhanceBatchArticles);           // Enhance multiple articles
router.post('/all', enhanceAllArticlesInDb);           // Enhance all articles
router.post('/:id', enhanceArticleById);               // Enhance single article (must be last)

// Utility routes
router.get('/available', getAvailableArticles);        // Get list of articles
router.get('/stats', getEnhancementStats);             // Get enhancement statistics

// Testing routes (for development/debugging)
router.get('/test/search', testGoogleSearch);          // Test SerpApi Search
router.post('/test/scrape', testContentScraping);      // Test content scraping

export default router;


