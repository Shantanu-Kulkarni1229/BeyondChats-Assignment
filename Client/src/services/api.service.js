import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to add log to ProcessModal
const addLog = (type, message) => {
  return {
    type,
    message,
    timestamp: new Date().toLocaleTimeString()
  };
};

// Fetch all articles
export const fetchArticlesAPI = async (setLogs) => {
  try {
    setLogs && setLogs((prev) => [...prev, addLog('info', '[FETCH] Connecting to server...')]);
    
    const response = await axios.get(`${API_BASE_URL}/articles`);
    const articlesData = response.data?.data?.articles || response.data?.data || response.data?.articles || response.data || [];
    const articles = Array.isArray(articlesData) ? articlesData : [];
    
    setLogs && setLogs((prev) => [...prev, addLog('success', `[SUCCESS] Fetched ${articles.length} articles`)]);
    
    return { success: true, data: articles };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch articles';
    setLogs && setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg, data: [] };
  }
};

// Scrape new articles from BeyondChats blog
export const scrapeBlogAPI = async (setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', '[SCRAPE] Starting scrape process...')]);
    setLogs((prev) => [...prev, addLog('info', '[SCRAPE] Connecting to https://beyondchats.com/blogs...')]);
    
    const response = await axios.post(`${API_BASE_URL}/articles/scrape`);
    
    setLogs((prev) => [...prev, addLog('success', '[SUCCESS] Blogs scraped successfully!')]);
    setLogs((prev) => [...prev, addLog('info', `[INFO] Total articles scraped: ${response.data.data?.count || 0}`)]);
    
    if (response.data.data?.errors?.length > 0) {
      setLogs((prev) => [...prev, addLog('warning', `[WARNING] ${response.data.data.errors.length} articles had errors`)]);
    }
    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Scraping failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Enhance single article
export const enhanceArticleAPI = async (articleId, setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', `[ENHANCE] Starting enhancement for article: ${articleId}`)]);
    setLogs((prev) => [...prev, addLog('info', '[STEP 1/5] Analyzing article content...')]);
    
    const response = await axios.post(`${API_BASE_URL}/enhance/${articleId}`);
    
    setLogs((prev) => [...prev, addLog('info', '[STEP 2/5] Searching for related information...')]);
    setLogs((prev) => [...prev, addLog('info', '[STEP 3/5] Gathering additional context...')]);
    setLogs((prev) => [...prev, addLog('info', '[STEP 4/5] Processing with AI...')]);
    setLogs((prev) => [...prev, addLog('info', '[STEP 5/5] Finalizing enhanced content...')]);
    setLogs((prev) => [...prev, addLog('success', '[SUCCESS] Article enhanced successfully!')]);
    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Enhancement failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Batch enhance specific articles
export const batchEnhanceAPI = async (articleIds, setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', `[BATCH] Starting batch enhancement for ${articleIds.length} articles`)]);
    setLogs((prev) => [...prev, addLog('info', '[BATCH] Validating articles...')]);
    
    const response = await axios.post(`${API_BASE_URL}/enhance/batch`, { 
      articleIds,
      options: {} 
    });
    
    const results = response.data.data;
    
    setLogs((prev) => [...prev, addLog('info', `[BATCH] Processing ${results.total} articles...`)]);
    
    results.successful.forEach((result, index) => {
      setLogs((prev) => [...prev, addLog('success', `[SUCCESS] Article ${index + 1}: Enhanced`)]);
    });
    
    results.failed.forEach((result, index) => {
      setLogs((prev) => [...prev, addLog('error', `[ERROR] Article ${index + 1}: ${result.error}`)]);
    });
    
    const successCount = results.successful.length;
    setLogs((prev) => [...prev, addLog('success', `[COMPLETE] ${successCount}/${results.total} articles enhanced`)]);
    
    return { success: true, data: results };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Batch enhancement failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Enhance ALL articles in database
export const enhanceAllArticlesAPI = async (setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', '[ENHANCE ALL] Starting enhancement for all articles')]);
    setLogs((prev) => [...prev, addLog('info', '[INFO] Counting articles...')]);
    
    const response = await axios.post(`${API_BASE_URL}/enhance/all`, { options: {} });
    
    const results = response.data.data;
    
    setLogs((prev) => [...prev, addLog('info', `[INFO] Processing ${results.total} articles...`)]);
    
    setLogs((prev) => [...prev, addLog('success', `[SUCCESS] Enhanced: ${results.successful.length}`)]);
    setLogs((prev) => [...prev, addLog('error', `[FAILED] Failed: ${results.failed.length}`)]);
    setLogs((prev) => [...prev, addLog('info', `[STATS] Success Rate: ${((results.successful.length / results.total) * 100).toFixed(1)}%`)]);
    
    return { success: true, data: results };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Enhancement failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Get article statistics
export const getArticleStatsAPI = async (setLogs) => {
  try {
    setLogs && setLogs((prev) => [...prev, addLog('info', '[STATS] Fetching article statistics...')]);
    
    const response = await axios.get(`${API_BASE_URL}/articles/stats`);
    const stats = response.data.data;
    
    setLogs && setLogs((prev) => [...prev, addLog('success', '[SUCCESS] Stats loaded')]);
    setLogs && setLogs((prev) => [...prev, addLog('info', `[INFO] Total Articles: ${stats.totalArticles}`)]);
    setLogs && setLogs((prev) => [...prev, addLog('info', `[INFO] Oldest: ${stats.oldestArticle?.title || 'N/A'}`)]);
    setLogs && setLogs((prev) => [...prev, addLog('info', `[INFO] Newest: ${stats.newestArticle?.title || 'N/A'}`)]);
    
    return { success: true, data: stats };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch stats';
    setLogs && setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Get enhancement statistics
export const getEnhancementStatsAPI = async (setLogs) => {
  try {
    setLogs && setLogs((prev) => [...prev, addLog('info', '[STATS] Fetching enhancement statistics...')]);
    
    const response = await axios.get(`${API_BASE_URL}/enhance/stats`);
    const stats = response.data.data;
    
    setLogs && setLogs((prev) => [...prev, addLog('success', '[SUCCESS] Enhancement stats loaded')]);
    setLogs && setLogs((prev) => [...prev, addLog('info', `[INFO] Total: ${stats.totalArticles}`)]);
    setLogs && setLogs((prev) => [...prev, addLog('info', `[INFO] Enhanced Today: ${stats.enhancedToday}`)]);
    
    return { success: true, data: stats };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch enhancement stats';
    setLogs && setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Delete all articles
export const deleteAllArticlesAPI = async (setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', '[DELETE] Starting deletion of all articles...')]);
    setLogs((prev) => [...prev, addLog('warning', '[WARNING] This action cannot be undone!')]);
    
    const response = await axios.delete(`${API_BASE_URL}/articles`);
    
    setLogs((prev) => [...prev, addLog('success', `[SUCCESS] Deleted ${response.data.data.deletedCount} articles`)]);
    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Delete operation failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};

// Delete single article
export const deleteArticleAPI = async (articleId, setLogs) => {
  try {
    setLogs((prev) => [...prev, addLog('info', `[DELETE] Removing article: ${articleId}`)]);
    
    const response = await axios.delete(`${API_BASE_URL}/articles/${articleId}`);
    
    setLogs((prev) => [...prev, addLog('success', '[SUCCESS] Article deleted')]);
    
    return { success: true, data: response.data.data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Delete operation failed';
    setLogs((prev) => [...prev, addLog('error', `[ERROR] ${errorMsg}`)]);
    
    return { success: false, error: errorMsg };
  }
};
