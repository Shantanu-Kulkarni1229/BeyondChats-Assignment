import express from 'express';
import {
  scrapeAndStoreArticles,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  deleteAllArticles,
  getArticleStats
} from '../controllers/article.controller.js';

const router = express.Router();

// Data Scraping route
router.post('/scrape', scrapeAndStoreArticles);

// Statistics route
router.get('/stats', getArticleStats);

// CRUD routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.patch('/:id', updateArticle); 
router.delete('/:id', deleteArticle);
router.delete('/', deleteAllArticles);

export default router;
