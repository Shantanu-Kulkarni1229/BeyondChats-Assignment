import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from './config/connectDb.js';
import articleRoutes from './routes/article.routes.js';
import enhanceRoutes from './routes/enhance.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/articles', articleRoutes);
app.use('/api/enhance', enhanceRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BeyondChats Article API',
    version: '2.0.0',
    phase: 'Phase 2 - AI-Powered Article Enhancement',
    endpoints: {
      // Phase 1 endpoints
      health: '/health',
      articles: '/api/articles',
      scrape: '/api/articles/scrape',
      stats: '/api/articles/stats',
      // Phase 2 endpoints
      enhance: '/api/enhance/:id',
      enhanceBatch: '/api/enhance/batch',
      enhanceAll: '/api/enhance/all',
      availableArticles: '/api/enhance/available',
      enhanceStats: '/api/enhance/stats',
      testSearch: '/api/enhance/test/search',
      testScrape: '/api/enhance/test/scrape',
      testGroq: '/api/enhance/test/groq'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
