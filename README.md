# BeyondChats Article Enhancement System

A comprehensive full-stack application that scrapes articles from BeyondChats blog, enhances them using AI (Groq LLaMA), and provides a professional interface for managing and comparing articles.

🔗 **Live Demo**: [https://beyondchats-blogs.netlify.app/](https://beyondchats-blogs.netlify.app/)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Diagram](#architecture-diagram)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Local Setup Instructions](#local-setup-instructions)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)
9. [Frontend Components](#frontend-components)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [Screenshots](#screenshots)

---

## 🎯 Overview

The **BeyondChats Article Enhancement System** is a three-phase project that demonstrates:
- **Phase 1**: Backend API with MongoDB integration
- **Phase 2**: AI-powered article enhancement using Groq LLaMA 3.3-70B
- **Phase 3**: Professional React frontend with responsive design

The system scrapes blog articles, stores them in MongoDB, enhances them with AI for better readability and SEO, and provides a beautiful UI for managing and comparing articles.

---

## ✨ Features

### Backend Features
- ✅ **Web Scraping**: Extracts full article content and images from BeyondChats blog
- ✅ **AI Enhancement**: Uses Groq LLaMA 3.3-70B to improve article quality
- ✅ **MongoDB Integration**: Stores articles with metadata
- ✅ **RESTful API**: Complete CRUD operations
- ✅ **Statistics**: Article and enhancement analytics
- ✅ **Error Handling**: Comprehensive error management

### Frontend Features
- ✅ **Article Management**: View, enhance, and delete articles
- ✅ **Batch Operations**: Select multiple articles for enhancement
- ✅ **Article Comparison**: Side-by-side view of original vs enhanced
- ✅ **Full-Screen Reader**: Immersive reading experience with markdown rendering
- ✅ **Statistics Dashboard**: Visual analytics and metrics
- ✅ **Real-Time Feedback**: Process logs and toast notifications
- ✅ **Responsive Design**: Mobile-first design for all screen sizes
- ✅ **Custom Dialogs**: Styled confirmation dialogs matching brand theme

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Service**: Groq API (LLaMA 3.3-70B-Versatile)
- **Web Scraping**: Cheerio, Axios
- **Search API**: SerpApi (Google Search)

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **HTTP Client**: Axios
- **UI Libraries**: 
  - React Hot Toast (notifications)
  - React Icons (HeroIcons v2)
  - React Markdown (enhanced content rendering)
- **Routing**: React Router DOM

### Development Tools
- **Version Control**: Git & GitHub
- **Linting**: ESLint
- **Package Manager**: npm
- **Deployment**: Netlify (Frontend), MongoDB Atlas (Database)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  React Application (Vite)                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │   Navbar     │  │ ActionButtons│  │ ArticlesGrid│  │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │ ArticleCard  │  │ArticleReader │  │ ProcessModal│  │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │ StatsModal   │  │CompareModal  │  │ConfirmDialog│  │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  │                                                          │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │         API Service Layer (api.service.js)     │    │    │
│  │  │  • fetchArticles   • enhanceArticle            │    │    │
│  │  │  • scrapeBlog      • deleteArticle             │    │    │
│  │  │  • getStats        • enhanceAll                │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │ HTTP/REST (Axios)
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Express.js Application (Node.js)                       │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │              Routes Layer                       │    │    │
│  │  │  • /api/articles/*    • /api/enhance/*         │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │            Controllers Layer                    │    │    │
│  │  │  • article.controller  • enhance.controller    │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │             Services Layer                      │    │    │
│  │  │  • scraper.service     • gemini.service        │    │    │
│  │  │  • contentScraper      • googleSearch.service  │    │    │
│  │  │  • articleEnhancer.service                     │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │              Models Layer                       │    │    │
│  │  │          • article.model (Mongoose)            │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │
                ┌─────────────┼─┼─────────────┐
                │             │ │             │
                ▼             ▼ ▼             ▼
┌─────────────────────┐ ┌─────────────┐ ┌──────────────────┐
│   MongoDB Atlas     │ │  Groq API   │ │    SerpApi       │
│  (Database)         │ │  (AI Model) │ │ (Google Search)  │
│  • Articles         │ │  LLaMA 3.3  │ │ • Find articles  │
│  • Metadata         │ │  70B-Versa  │ │ • Get URLs       │
└─────────────────────┘ └─────────────┘ └──────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. Article Scraping Flow
```
User clicks "Scrape Blogs"
        │
        ▼
Frontend: api.service.js → POST /api/articles/scrape
        │
        ▼
Backend: article.controller.js → scrapeBlog()
        │
        ▼
Services: googleSearch.service → SerpApi
        │ (Get list of BeyondChats blog URLs)
        ▼
Services: scraper.service → Fetch article listing page
        │
        ▼
Services: contentScraper.service → Scrape each article
        │ (Extract: title, content, images, metadata)
        ▼
MongoDB: Save articles with schema
        │ { title, url, content, images[], author, date, wordCount }
        ▼
Frontend: Display articles in ArticlesGrid
```

### 2. Article Enhancement Flow
```
User clicks "Enhance" on article
        │
        ▼
Frontend: api.service.js → POST /api/enhance/:id
        │
        ▼
Backend: enhance.controller.js → enhanceArticle()
        │
        ▼
Services: gemini.service.js → Call Groq API
        │ Prompt: "Enhance this article for SEO and readability..."
        │
        ▼
Groq API: LLaMA 3.3-70B processes article
        │ (Improves structure, adds markdown, optimizes content)
        ▼
Backend: Create enhanced article
        │ URL: original-url-enhanced-timestamp
        │ Title: "Enhanced: Original Title"
        │
        ▼
MongoDB: Save enhanced article
        │
        ▼
Frontend: Display in "Enhanced Articles" grid
```

### 3. Article Comparison Flow
```
User clicks "Compare" on enhanced article
        │
        ▼
Frontend: Extract original URL from enhanced URL
        │ enhanced-url.split('-enhanced-')[0]
        ▼
Find original article in state
        │
        ▼
CompareModal: Display side-by-side
        │
        ├─► Left Panel: Original article (blue theme)
        │   • Plain text with paragraph breaks
        │   • Word count
        │
        └─► Right Panel: Enhanced article (green theme)
            • Markdown rendered
            • Word count
            • Visual improvements highlighted
```

### 4. Batch Enhancement Flow
```
User selects multiple articles (checkboxes)
        │
        ▼
User clicks "Enhance Selected"
        │
        ▼
Frontend: Loop through selectedArticles[]
        │
        ├─► For each article:
        │   │
        │   ├─► POST /api/enhance/:id
        │   │
        │   ├─► Show progress in ProcessModal
        │   │   ("Enhancing 2 of 5...")
        │   │
        │   └─► Wait for completion
        │
        ▼
All enhanced → Refresh articles → Clear selection
```

---

## 💻 Local Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **API Keys**:
  - Groq API Key (free at [groq.com](https://groq.com))
  - SerpApi Key (free at [serpapi.com](https://serpapi.com))

### Step 1: Clone Repository
```bash
git clone https://github.com/Shantanu-Kulkarni1229/BeyondChats-Assignment.git
cd BeyondChats-Assignment
```

### Step 2: Backend Setup

#### 2.1 Navigate to Server Directory
```bash
cd Server
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Create Environment Variables
Create a `.env` file in the `Server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beyondchats
GROQ_API_KEY=your_groq_api_key_here
SERPAPI_KEY=your_serpapi_key_here
NODE_ENV=development
```

**To get API keys**:
1. **Groq API**: 
   - Visit [https://console.groq.com](https://console.groq.com)
   - Sign up and navigate to API Keys
   - Generate a new API key

2. **SerpApi**:
   - Visit [https://serpapi.com](https://serpapi.com)
   - Sign up for free account
   - Get API key from dashboard

#### 2.4 Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

#### 2.5 Start Backend Server
```bash
npm run dev
```

Server should start at `http://localhost:5000`

### Step 3: Frontend Setup

#### 3.1 Open New Terminal & Navigate to Client
```bash
cd Client
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Create Environment Variables
Create a `.env` file in the `Client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### 3.4 Start Development Server
```bash
npm run dev
```

Frontend should start at `http://localhost:5173`

### Step 4: Access Application
1. Open browser and navigate to `http://localhost:5173`
2. Click **"Scrape BeyondChats Blogs"** to fetch articles
3. Select articles and click **"Enhance"** to improve them with AI
4. View statistics, compare articles, and explore features!

---

## 📁 Project Structure

```
BeyondChats-Internship-Task/
├── README.md                          # This file
├── Server/                            # Backend application
│   ├── package.json
│   ├── .env                          # Environment variables (not in git)
│   ├── src/
│   │   ├── server.js                 # Express app entry point
│   │   ├── config/
│   │   │   └── connectDb.js          # MongoDB connection
│   │   ├── models/
│   │   │   └── article.model.js      # Mongoose schema
│   │   ├── controllers/
│   │   │   ├── article.controller.js # Article CRUD logic
│   │   │   └── enhance.controller.js # Enhancement logic
│   │   ├── routes/
│   │   │   ├── article.routes.js     # Article endpoints
│   │   │   └── enhance.routes.js     # Enhancement endpoints
│   │   ├── services/
│   │   │   ├── scraper.service.js         # Main scraper
│   │   │   ├── contentScraper.service.js  # Full content extraction
│   │   │   ├── gemini.service.js          # Groq AI integration
│   │   │   ├── googleSearch.service.js    # SerpApi integration
│   │   │   └── articleEnhancer.service.js # Enhancement logic
│   │   └── utils/
│   │       └── helpers.js            # Utility functions
│   └── Phase2README.md               # Backend documentation
│
├── Client/                            # Frontend application
│   ├── package.json
│   ├── .env                          # Environment variables (not in git)
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Root component
│   │   ├── index.css                 # Global styles
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation
│   │   │   ├── ActionButtons.jsx     # Main action controls
│   │   │   ├── ArticleCard.jsx       # Article display card
│   │   │   ├── ArticlesGrid.jsx      # Grid container
│   │   │   ├── ArticleReader.jsx     # Full-screen reader
│   │   │   ├── ProcessModal.jsx      # Real-time logs
│   │   │   ├── StatsModal.jsx        # Analytics dashboard
│   │   │   ├── CompareModal.jsx      # Side-by-side comparison
│   │   │   └── ConfirmDialog.jsx     # Custom confirmations
│   │   ├── services/
│   │   │   └── api.service.js        # API communication layer
│   │   └── utils/
│   │       └── constants.js          # Constants and configs
│   └── Phase3README.md               # Frontend documentation
```

---

## 📡 API Documentation

### Base URL
```
Local: http://localhost:5000/api
Production: Your deployed backend URL
```

### Endpoints

#### Article Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all articles |
| POST | `/articles/scrape` | Scrape BeyondChats blog |
| GET | `/articles/stats` | Get article statistics |
| DELETE | `/articles/:id` | Delete single article |
| DELETE | `/articles` | Delete all articles |

#### Enhancement Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/enhance/:id` | Enhance single article |
| POST | `/enhance/all` | Enhance all articles |
| GET | `/enhance/stats` | Get enhancement statistics |

### Example API Calls

#### Scrape Articles
```javascript
POST /api/articles/scrape
Response: {
  success: true,
  data: [
    {
      _id: "...",
      title: "Article Title",
      url: "https://beyondchats.com/blogs/...",
      content: "Full article content...",
      images: ["url1.jpg", "url2.jpg"],
      author: "Author Name",
      publishDate: "2024-01-15",
      wordCount: 1234,
      scrapedAt: "2025-12-30T..."
    }
  ]
}
```

#### Enhance Article
```javascript
POST /api/enhance/:id
Response: {
  success: true,
  data: {
    _id: "...",
    title: "Enhanced: Article Title",
    url: "original-url-enhanced-1735567890123",
    content: "# Enhanced Content\n\n**Improved** article...",
    enhancedFrom: "original-article-id",
    enhancementMetadata: {
      model: "llama-3.3-70b-versatile",
      tokensUsed: 5432,
      processingTime: "32s"
    }
  }
}
```

---

## 🎨 Frontend Components

### Component Hierarchy
```
App.jsx (Root)
├── Navbar
├── ActionButtons
│   ├── Scrape Blogs
│   ├── Refresh
│   ├── Enhance All
│   ├── Enhance Selected (dynamic count)
│   ├── View Statistics
│   └── Delete All
├── ArticlesGrid (Original)
│   └── ArticleCard[]
│       ├── Checkbox (for selection)
│       ├── Image
│       ├── Title & Content Preview
│       ├── Metadata (date, word count)
│       ├── Enhance Button
│       ├── View Button
│       └── Delete Button
├── ArticlesGrid (Enhanced)
│   └── ArticleCard[]
│       ├── Enhanced Badge
│       ├── Image
│       ├── Title & Content Preview
│       ├── Read Full Button
│       ├── Compare Button
│       └── Delete Button
├── ProcessModal (Real-time logs)
├── ArticleReader (Full-screen)
├── StatsModal (Analytics)
├── CompareModal (Side-by-side)
└── ConfirmDialog (Custom alerts)
```

### Component Details

#### 1. **Navbar**
- BeyondChats logo
- Sticky positioning
- Responsive sizing

#### 2. **ActionButtons**
- 6 action buttons
- Responsive grid (1→2→3→5 columns)
- Dynamic "Enhance Selected" counter
- Disabled states

#### 3. **ArticleCard**
- Image with hover effects
- Title truncation
- Content preview (150 chars)
- Word count calculation
- Selection checkbox (original only)
- Green ring when selected
- Action buttons based on article type

#### 4. **ArticlesGrid**
- Responsive grid (1→2→3 columns)
- Loading states
- Empty states with icons
- Article count display

#### 5. **ArticleReader**
- Full-screen overlay (z-100)
- Sticky header with close button
- Multiple images support
- Markdown rendering (enhanced)
- Paragraph formatting (original)
- Single scrollbar
- Reading time estimate

#### 6. **ProcessModal**
- Real-time log streaming
- Color-coded messages
- Auto-scroll to latest
- Cannot close until complete
- Success/error indicators

#### 7. **StatsModal**
- 3 stat cards (total, enhanced, success rate)
- Oldest/newest article info
- Animated progress bar
- Responsive grid

#### 8. **CompareModal**
- Split-screen layout
- Original (blue) vs Enhanced (green)
- Independent scrolling
- Word count comparison
- Markdown rendering for enhanced

#### 9. **ConfirmDialog**
- Custom styled confirmations
- Two types: confirm (blue) / warning (red)
- Backdrop blur
- Fade-in animation
- Replaces browser alerts

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/beyondchats
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats

# API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Optional: CORS Origin (if frontend is on different domain)
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# For production:
# VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Build Production Bundle**
```bash
cd Client
npm run build
```

2. **Deploy to Netlify**
   - Connect GitHub repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL`

3. **Live Link**: [https://beyondchats-blogs.netlify.app/](https://beyondchats-blogs.netlify.app/)

### Backend Deployment Options

1. **Heroku**
```bash
heroku create beyondchats-api
heroku config:set MONGODB_URI=your_atlas_uri
heroku config:set GROQ_API_KEY=your_key
heroku config:set SERPAPI_KEY=your_key
git push heroku main
```

2. **Railway**
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Render**
   - Connect GitHub repository
   - Add environment variables
   - Choose Node.js environment

---

## 📸 Screenshots

### Homepage
```
┌─────────────────────────────────────────────────┐
│  [BeyondChats Logo]                             │
├─────────────────────────────────────────────────┤
│ [Scrape] [Refresh] [Enhance All] [Enhance Se... │
├─────────────────────────────────────────────────┤
│              Original Articles (5)              │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │ [✓]  │  │ [ ]  │  │ [ ]  │                 │
│  │Image │  │Image │  │Image │                 │
│  │Title │  │Title │  │Title │                 │
│  │View  │  │View  │  │View  │                 │
│  └──────┘  └──────┘  └──────┘                 │
│                                                  │
│            Enhanced Articles (3)                │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │ENHAN │  │ENHAN │  │ENHAN │                 │
│  │Image │  │Image │  │Image │                 │
│  │Title │  │Title │  │Title │                 │
│  │Compa │  │Compa │  │Compa │                 │
│  └──────┘  └──────┘  └──────┘                 │
└─────────────────────────────────────────────────┘
```

### Article Reader
```
┌─────────────────────────────────────────────────┐
│  [ENHANCED] Article Reader              [Close] │
├─────────────────────────────────────────────────┤
│  [Image 1]                                       │
│  [Image 2]                                       │
│                                                  │
│  # Article Title                                │
│  Published: Jan 15, 2024 | 1234 words | 5 min  │
│                                                  │
│  ## Introduction                                │
│  Lorem ipsum dolor sit amet...                  │
│                                                  │
│  **Key Points:**                                │
│  - Point 1                                      │
│  - Point 2                                      │
│                                                  │
│  [View Original Source]                         │
└─────────────────────────────────────────────────┘
```

### Compare Modal
```
┌─────────────────────────────────────────────────┐
│  Compare Articles                       [Close] │
├────────────────────┬────────────────────────────┤
│  ORIGINAL ARTICLE  │  ENHANCED ARTICLE          │
│  (1234 words)      │  (1456 words)              │
├────────────────────┼────────────────────────────┤
│  Title             │  Enhanced: Title           │
│                    │                            │
│  Plain text        │  # Formatted               │
│  paragraph 1       │  **Bold introduction**     │
│                    │                            │
│  Plain text        │  ## Section Heading        │
│  paragraph 2       │  - Bullet point 1          │
│                    │  - Bullet point 2          │
├────────────────────┴────────────────────────────┤
│  [Close Comparison]                             │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Key Features Showcase

### 1. **Intelligent Scraping**
- Fetches article listing from BeyondChats
- Extracts full content from each article URL
- Captures all images (up to 10 per article)
- Preserves metadata (author, date, word count)

### 2. **AI Enhancement**
- Uses Groq LLaMA 3.3-70B (fastest AI model)
- Improves readability and structure
- Adds markdown formatting
- Optimizes for SEO
- Processing time: ~30-35 seconds per article

### 3. **Batch Operations**
- Select multiple articles with checkboxes
- Enhance all selected articles in sequence
- Real-time progress tracking
- Time estimation displayed

### 4. **Visual Comparison**
- Side-by-side original vs enhanced
- Color-coded themes (blue vs green)
- Markdown rendering for enhanced
- Word count comparison

### 5. **Responsive Design**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Optimized for all devices

### 6. **Professional UI/UX**
- BeyondChats brand colors (#001433, #35DE57, #87CEEB)
- Inter font family
- Custom scrollbar
- Smooth animations
- Toast notifications
- Custom confirmation dialogs

---

## 🧪 Testing

### Manual Testing Checklist
- ✅ Scrape articles from BeyondChats
- ✅ View full article content
- ✅ Enhance single article
- ✅ Enhance multiple articles (batch)
- ✅ Enhance all articles
- ✅ Compare original vs enhanced
- ✅ View statistics
- ✅ Delete single article
- ✅ Delete all articles
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Error handling (network failures, API errors)
- ✅ Loading states
- ✅ Empty states

### Test Scenarios

**Scenario 1: Fresh Start**
1. Open application (no articles)
2. Click "Scrape BeyondChats Blogs"
3. Verify 5 articles loaded
4. Check images and content display correctly

**Scenario 2: Enhancement**
1. Select 3 articles using checkboxes
2. Click "Enhance Selected"
3. Watch process modal show progress
4. Verify 3 enhanced articles appear in grid

**Scenario 3: Comparison**
1. Click "Compare" on enhanced article
2. Verify original article found and displayed
3. Check side-by-side layout works
4. Verify markdown rendering for enhanced

---

## 📚 Documentation

- **Phase 1**: Backend API setup (See `Server/README.md`)
- **Phase 2**: AI enhancement implementation (See `Server/Phase2README.md`)
- **Phase 3**: Frontend development (See `Client/Phase3README.md`)

---

## 🤝 Contributing

This is an internship assignment project. For improvements or bug reports:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## 📄 License

This project is created as part of BeyondChats internship assignment.

---

## 👤 Author

**Shantanu Kulkarni**
- GitHub: [@Shantanu-Kulkarni1229](https://github.com/Shantanu-Kulkarni1229)
- Project: [BeyondChats-Assignment](https://github.com/Shantanu-Kulkarni1229/BeyondChats-Assignment)
- Live Demo: [https://beyondchats-blogs.netlify.app/](https://beyondchats-blogs.netlify.app/)

---

## 🙏 Acknowledgments

- **BeyondChats**: For the internship opportunity and project requirements
- **Groq**: For providing fast and efficient AI inference
- **SerpApi**: For Google Search API integration
- **Netlify**: For frontend hosting
- **MongoDB Atlas**: For database hosting

---

## 📞 Support

For questions or support:
- Open an issue on [GitHub](https://github.com/Shantanu-Kulkarni1229/BeyondChats-Assignment/issues)
- Check documentation in respective README files
- Review API documentation above

---

## 🎉 Project Status

**Status**: ✅ Completed

**All Phases Completed:**
- ✅ Phase 1: Backend API with MongoDB
- ✅ Phase 2: AI Enhancement with Groq
- ✅ Phase 3: React Frontend with Tailwind CSS

**Live Demo**: [https://beyondchats-blogs.netlify.app/](https://beyondchats-blogs.netlify.app/)

---

**Made with ❤️ for BeyondChats Internship Assignment**
