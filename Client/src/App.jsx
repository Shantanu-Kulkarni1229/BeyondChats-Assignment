import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ActionButtons from './components/ActionButtons';
import ArticlesGrid from './components/ArticlesGrid';
import ProcessModal from './components/ProcessModal';
import ArticleReader from './components/ArticleReader';
import StatsModal from './components/StatsModal';
import CompareModal from './components/CompareModal';
import ConfirmDialog from './components/ConfirmDialog';
import { 
  fetchArticlesAPI, 
  scrapeBlogAPI, 
  enhanceArticleAPI, 
  enhanceAllArticlesAPI,
  getArticleStatsAPI,
  getEnhancementStatsAPI,
  deleteAllArticlesAPI,
  deleteArticleAPI
} from './services/api.service';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [enhancedArticles, setEnhancedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  
  // Process Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLogs, setModalLogs] = useState([]);
  const [processComplete, setProcessComplete] = useState(false);
  const [processError, setProcessError] = useState(false);

  // Article Reader States
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [isEnhancedArticle, setIsEnhancedArticle] = useState(false);

  // Stats Modal States
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Compare Modal States
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState(null);
  const [compareEnhanced, setCompareEnhanced] = useState(null);

  // Confirm Dialog States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {}
  });

  // Fetch all articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const result = await fetchArticlesAPI();
      
      if (result.success) {
        const allArticles = result.data;
        const originalArticles = allArticles.filter(article => 
          !article.url?.includes('enhanced') && !article.title?.includes('Enhanced')
        );
        const enhanced = allArticles.filter(article => 
          article.url?.includes('enhanced') || article.title?.includes('Enhanced')
        );
        
        setArticles(originalArticles);
        setEnhancedArticles(enhanced);
        setSelectedArticles([]); // Clear selection on refresh
      } else {
        toast.error(result.error);
        setArticles([]);
        setEnhancedArticles([]);
      }
    } catch (error) {
      toast.error('Failed to fetch articles');
      setArticles([]);
      setEnhancedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Open modal helper
  const openModal = (title) => {
    setModalTitle(title);
    setModalLogs([]);
    setProcessComplete(false);
    setProcessError(false);
    setModalOpen(true);
  };

  // Close modal helper
  const closeModal = () => {
    setModalOpen(false);
    setModalLogs([]);
    setProcessComplete(false);
    setProcessError(false);
  };

  // Show confirm dialog helper
  const showConfirm = (title, message, onConfirm, type = 'confirm') => {
    setConfirmConfig({ title, message, type, onConfirm });
    setConfirmOpen(true);
  };

  // Handle scrape
  const handleScrape = async () => {
    showConfirm(
      'Scrape Articles',
      'Scrape articles from BeyondChats blog? This may take a moment.',
      async () => {
        openModal('🔍 Scraping BeyondChats Blog');
        
        const result = await scrapeBlogAPI(setModalLogs);
        
        setProcessComplete(true);
        setProcessError(!result.success);
        
        if (result.success) {
          toast.success(`Scraped ${result.data.count} articles successfully!`);
          await fetchArticles(); // Refresh articles
        } else {
          toast.error(result.error);
        }
      }
    );
  };

  // Handle refresh
  const handleRefresh = async () => {
    openModal('🔄 Refreshing Articles');
    
    const result = await fetchArticlesAPI(setModalLogs);
    
    if (result.success) {
      const allArticles = result.data;
      const originalArticles = allArticles.filter(article => 
        !article.url?.includes('enhanced') && !article.title?.includes('Enhanced')
      );
      const enhanced = allArticles.filter(article => 
        article.url?.includes('enhanced') || article.title?.includes('Enhanced')
      );
      
      setArticles(originalArticles);
      setEnhancedArticles(enhanced);
      toast.success(`Loaded ${allArticles.length} articles`);
    } else {
      toast.error(result.error);
      setProcessError(true);
    }
    
    setProcessComplete(true);
  };

  // Handle enhance single article
  const handleEnhanceArticle = async (article) => {
    openModal(`✨ Enhancing: ${article.title.substring(0, 30)}...`);
    
    const result = await enhanceArticleAPI(article._id, setModalLogs);
    
    setProcessComplete(true);
    setProcessError(!result.success);
    
    if (result.success) {
      toast.success('Article enhanced successfully!');
      await fetchArticles(); // Refresh articles
    } else {
      toast.error(result.error);
    }
  };

  // Handle enhance all articles
  const handleEnhanceAll = async () => {
    if (articles.length === 0) {
      toast.error('No articles to enhance');
      return;
    }

    showConfirm(
      'Enhance All Articles',
      `Enhance ALL ${articles.length} articles in the database? This will take approximately ${(articles.length * 35 / 60).toFixed(1)} minutes.`,
      async () => {
        openModal(`⚡ Enhancing ALL Articles`);
        
        const result = await enhanceAllArticlesAPI(setModalLogs);
        
        setProcessComplete(true);
        setProcessError(!result.success);
        
        if (result.success) {
          toast.success(`Enhanced ${result.data.successful.length}/${result.data.total} articles!`);
          await fetchArticles(); // Refresh articles
        } else {
          toast.error(result.error);
        }
      }
    );
  };

  // Handle enhance selected articles
  const handleEnhanceSelected = async () => {
    if (selectedArticles.length === 0) {
      toast.error('No articles selected');
      return;
    }

    showConfirm(
      'Enhance Selected Articles',
      `Enhance ${selectedArticles.length} selected article(s)? This will take approximately ${(selectedArticles.length * 35 / 60).toFixed(1)} minutes.`,
      async () => {
        openModal(`⚡ Enhancing ${selectedArticles.length} Selected Articles`);
        
        let successCount = 0;
        let failCount = 0;

        for (const articleId of selectedArticles) {
          const article = articles.find(a => a._id === articleId);
          if (!article) continue;

          setModalLogs(prev => [...prev, { type: 'processing', message: `Enhancing: ${article.title.substring(0, 40)}...` }]);
          
          const result = await enhanceArticleAPI(articleId, setModalLogs);
          
          if (result.success) {
            successCount++;
            setModalLogs(prev => [...prev, { type: 'success', message: `✓ Enhanced: ${article.title.substring(0, 40)}` }]);
          } else {
            failCount++;
            setModalLogs(prev => [...prev, { type: 'error', message: `✗ Failed: ${article.title.substring(0, 40)}` }]);
          }
        }

        setProcessComplete(true);
        setProcessError(failCount > 0);
        
        if (successCount > 0) {
          toast.success(`Enhanced ${successCount}/${selectedArticles.length} articles!`);
          setSelectedArticles([]); // Clear selection
          await fetchArticles(); // Refresh articles
        } else {
          toast.error('Failed to enhance articles');
        }
      }
    );
  };

  // Toggle article selection
  const handleToggleSelect = (articleId) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  // Handle view stats
  const handleViewStats = async () => {
    openModal('Loading Statistics');
    
    const [articleStats, enhanceStats] = await Promise.all([
      getArticleStatsAPI(setModalLogs),
      getEnhancementStatsAPI(setModalLogs)
    ]);
    
    setProcessComplete(true);
    
    if (articleStats.success) {
      setStatsData({
        articleStats: articleStats.data,
        enhanceStats: enhanceStats.data
      });
      toast.success('Statistics loaded successfully!');
      closeModal();
      setStatsOpen(true);
    } else {
      toast.error('Failed to load some statistics');
      setProcessError(true);
    }
  };

  // Handle delete all articles
  const handleDeleteAll = async () => {
    showConfirm(
      '⚠️ Delete All Articles',
      'WARNING: Delete ALL articles? This action cannot be undone!',
      () => {
        // Second confirmation - delay to allow first dialog to close
        setTimeout(() => {
          showConfirm(
            '⚠️ Final Confirmation',
            'Are you ABSOLUTELY sure? This will permanently delete all articles from the database.',
            async () => {
              openModal('🗑️ Deleting All Articles');
              
              const result = await deleteAllArticlesAPI(setModalLogs);
              
              setProcessComplete(true);
              setProcessError(!result.success);
              
              if (result.success) {
                toast.success(`Deleted ${result.data.deletedCount} articles`);
                setArticles([]);
                setEnhancedArticles([]);
              } else {
                toast.error(result.error);
              }
            },
            'warning'
          );
        }, 100);
      },
      'warning'
    );
  };

  // Handle delete single article
  const handleDeleteArticle = async (article) => {
    showConfirm(
      'Delete Article',
      `Delete "${article.title}"? This action cannot be undone.`,
      async () => {
        openModal(`🗑️ Deleting: ${article.title.substring(0, 30)}...`);
        
        const result = await deleteArticleAPI(article._id, setModalLogs);
        
        setProcessComplete(true);
        setProcessError(!result.success);
        
        if (result.success) {
          toast.success('Article deleted successfully!');
          await fetchArticles(); // Refresh articles
        } else {
          toast.error(result.error);
        }
      },
      'warning'
    );
  };

  // Handle view article
  const handleViewArticle = (article) => {
    setCurrentArticle(article);
    setIsEnhancedArticle(article.url?.includes('enhanced') || article.title?.includes('Enhanced'));
    setReaderOpen(true);
  };

  // Handle compare articles
  const handleCompareArticle = (enhancedArticle) => {
    // Find the original article by extracting the original URL from enhanced URL
    const originalUrl = enhancedArticle.url?.split('-enhanced-')[0];
    const originalArticle = articles.find(a => a.url === originalUrl);
    
    if (originalArticle) {
      setCompareOriginal(originalArticle);
      setCompareEnhanced(enhancedArticle);
      setCompareOpen(true);
    } else {
      toast.error('Original article not found for comparison');
    }
  };

  return (
    <div className="min-h-screen bg-[#001433]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#002147',
            color: '#fff',
            border: '2px solid #35DE57',
          },
          success: {
            iconTheme: {
              primary: '#35DE57',
              secondary: '#001433',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <ProcessModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        logs={modalLogs}
        isComplete={processComplete}
        hasError={processError}
      />

      <ArticleReader
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
        article={currentArticle}
        isEnhanced={isEnhancedArticle}
      />

      <StatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={statsData}
      />

      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        originalArticle={compareOriginal}
        enhancedArticle={compareEnhanced}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />

      <Navbar />

      <ActionButtons
        onScrape={handleScrape}
        onRefresh={handleRefresh}
        onEnhanceAll={handleEnhanceAll}
        onEnhanceSelected={handleEnhanceSelected}
        onViewStats={handleViewStats}
        onDeleteAll={handleDeleteAll}
        selectedCount={selectedArticles.length}
      />

      <ArticlesGrid
        articles={articles}
        loading={loading}
        title="Original Articles"
        icon="document"
        emptyMessage="No articles found. Click 'Scrape BeyondChats Blogs' to add articles."
        onEnhance={handleEnhanceArticle}
        onView={handleViewArticle}
        onDelete={handleDeleteArticle}
        isEnhanced={false}
        selectedArticles={selectedArticles}
        onToggleSelect={handleToggleSelect}
      />

      <ArticlesGrid
        articles={enhancedArticles}
        loading={false}
        title="Enhanced Articles"
        icon="sparkles"
        emptyMessage="No enhanced articles yet."
        emptySubMessage="Select an article above and click 'Enhance' to get started!"
        onEnhance={handleEnhanceArticle}
        onView={handleViewArticle}
        onDelete={handleDeleteArticle}
        onCompare={handleCompareArticle}
        isEnhanced={true}
      />
    </div>
  );
};

export default App;