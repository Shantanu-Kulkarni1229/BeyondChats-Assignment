// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Color Scheme
export const COLORS = {
  primary: '#001433',
  primaryDark: '#000a1f',
  primaryLight: '#002147',
  accent: '#35DE57',
  accentHover: '#2bc948',
  accentLight: '#4df169',
  textPrimary: '#FFFFFF',
  textSecondary: '#87CEEB',
  textMuted: '#94A3B8',
};

// Routes
export const ROUTES = {
  HOME: '/',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  BATCH_ENHANCEMENT: '/batch',
  SCRAPER: '/scraper',
  TESTING: '/testing',
};

// Status Types
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Enhancement Steps
export const ENHANCEMENT_STEPS = [
  { id: 1, name: 'Fetch Article', icon: '📄' },
  { id: 2, name: 'Search Google', icon: '🔍' },
  { id: 3, name: 'Scrape Content', icon: '📚' },
  { id: 4, name: 'AI Enhancement', icon: '🤖' },
  { id: 5, name: 'Save Result', icon: '💾' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input.',
};
