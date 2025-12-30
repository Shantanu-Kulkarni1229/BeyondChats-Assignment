# BeyondChats Article Scraper & CRUD API

A production-ready Node.js application that scrapes articles from BeyondChats blog and provides a RESTful CRUD API for managing them.

## 📋 Table of Contents
- [Phase 1 Implementation Guide](#phase-1-implementation-guide)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage Flow](#usage-flow)
- [Error Handling](#error-handling)
- [Database Schema](#database-schema)
- [Development](#development)
- [Production Deployment](#production-deployment)

---

## 🚀 Phase 1 Implementation Guide

### Assignment Requirements
**Phase 1 Task:**
1. Scrape articles from the last page of the blogs section of BeyondChats
2. Fetch the 5 oldest articles
3. Store these articles in a database
4. Create CRUD APIs for these articles

**URL:** https://beyondchats.com/blogs/

---

### 📐 Architecture Overview

Our implementation follows a clean MVC (Model-View-Controller) architecture with the following structure:

```
Server/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers (Business logic)
│   ├── models/          # Database schemas
│   ├── routes/          # API route definitions
│   ├── services/        # External services (Web scraping)
│   ├── utils/           # Helper functions
│   └── server.js        # Application entry point
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── README.md           # Documentation
```

---

### 🔧 Implementation Details

#### **1. Database Configuration** ([connectDb.js](src/config/connectDb.js))

**Purpose:** Establish and manage MongoDB connection

**What we implemented:**
- Asynchronous MongoDB connection using Mongoose
- Connection error handling with automatic retry
- Graceful shutdown on process termination (SIGINT)
- Connection success/failure logging
- Auto-indexing enabled for better query performance

**Key Features:**
```javascript
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true,  // Automatically build indexes
  });
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
};
```

**Why this approach:**
- Ensures database is connected before server starts accepting requests
- Prevents memory leaks with proper connection cleanup
- Uses environment variables for security

---

#### **2. Data Model** ([article.model.js](src/models/article.model.js))

**Purpose:** Define the structure and validation rules for article data

**What we implemented:**
- Mongoose schema with comprehensive validation
- Unique URL constraint to prevent duplicate articles
- Data type validation and length constraints
- Automatic timestamps (createdAt, updatedAt)
- Indexes for optimized queries
- Virtual fields for formatted date display

**Schema Structure:**
```javascript
{
  title: String (required, 3-300 chars)
  url: String (required, unique, valid URL format)
  image: String (optional)
  content: String (required, min 10 chars)
  date: Date (default: now)
  scrapedAt: Date (when article was scraped)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

**Indexes Created:**
- `date: -1` - For sorting by date (descending)
- `createdAt: -1` - For recent articles queries
- `url` - Unique index for duplicate prevention

**Why this approach:**
- URL uniqueness prevents duplicate articles in database
- Validation ensures data integrity
- Indexes improve query performance for common operations
- Timestamps track when articles were added/modified

---

#### **3. Web Scraping Service** ([scraper.service.js](src/services/scraper.service.js))

**Purpose:** Scrape articles from BeyondChats blog and extract relevant data

**What we implemented:**
- HTTP request to fetch blog page HTML
- HTML parsing using Cheerio (jQuery-like syntax)
- Multiple selector strategies for robust scraping
- Data extraction: title, URL, image, content, date
- Sorting by date to get oldest articles first
- Error handling with descriptive messages

**Scraping Process:**

1. **Fetch Blog Page:**
   ```javascript
   const response = await axios.get('https://beyondchats.com/blogs', {
     headers: { 'User-Agent': 'Mozilla/5.0...' },
     timeout: 10000
   });
   ```

2. **Parse HTML:**
   ```javascript
   const $ = cheerio.load(response.data);
   ```

3. **Extract Article Data:**
   - Search for blog cards using multiple selectors
   - Extract title from headings (h2, h3) or link titles
   - Extract URL from anchor tags
   - Extract image from img tags or data-src attributes
   - Extract content from paragraphs or description fields
   - Extract date from time elements or date classes

4. **Fallback Strategy:**
   - If primary selectors fail, try alternative selectors
   - Search for any links containing "/blog"
   - Extract data from parent elements

5. **Sort and Filter:**
   ```javascript
   const oldestArticles = articles
     .sort((a, b) => new Date(a.date) - new Date(b.date))
     .slice(0, 5);  // Get 5 oldest articles
   ```

**Why this approach:**
- Multiple selector strategies handle different HTML structures
- User-Agent header prevents blocking by server
- Timeout prevents hanging requests
- Sorting ensures we get the oldest articles as required
- Fallback strategies make scraping more reliable

---

#### **4. Controller Layer** ([article.controller.js](src/controllers/article.controller.js))

**Purpose:** Handle HTTP requests and implement business logic

**What we implemented:**

##### **A. Scrape and Store Function** (`scrapeAndStoreArticles`)
- Calls scraper service to fetch articles
- Stores articles in MongoDB using upsert (update if exists, insert if new)
- Prevents duplicates using URL as unique identifier
- Returns saved articles with count
- Error tracking for failed article saves

**Implementation Flow:**
```javascript
1. Call scrapeArticles() service
2. For each scraped article:
   - Try to find existing article by URL
   - If exists: update it
   - If not: create new one
3. Collect successfully saved articles
4. Return response with saved articles and count
```

##### **B. CRUD Operations**

**Create (`createArticle`):**
- Validates required fields (title, url, content)
- Checks for duplicate URL
- Creates new article in database
- Returns created article

**Read All (`getAllArticles`):**
- Supports pagination (page, limit)
- Supports search (searches in title and content)
- Supports sorting (default: by date descending)
- Returns articles with pagination metadata

**Read One (`getArticleById`):**
- Finds article by MongoDB ObjectId
- Handles invalid ID format
- Returns 404 if not found

**Update (`updateArticle`):**
- Validates article exists
- Checks for duplicate URL if URL is being updated
- Updates only provided fields
- Returns updated article

**Delete One (`deleteArticle`):**
- Finds and deletes article by ID
- Returns deleted article data

**Delete All (`deleteAllArticles`):**
- Removes all articles from database
- Returns count of deleted articles

##### **C. Statistics Function** (`getArticleStats`)
- Returns total article count
- Finds oldest article (by date)
- Finds newest article (by date)
- Useful for monitoring the database

**Why this approach:**
- Separation of concerns (controller handles requests, service handles scraping)
- Comprehensive error handling for each operation
- Validation prevents bad data
- Pagination prevents overloading client with too much data
- Upsert prevents duplicate entries while allowing updates

---

#### **5. Routes Configuration** ([article.routes.js](src/routes/article.routes.js))

**Purpose:** Define API endpoints and map them to controller functions

**What we implemented:**

```javascript
POST   /api/articles/scrape     → scrapeAndStoreArticles
GET    /api/articles/stats      → getArticleStats
GET    /api/articles            → getAllArticles
GET    /api/articles/:id        → getArticleById
POST   /api/articles            → createArticle
PUT    /api/articles/:id        → updateArticle
PATCH  /api/articles/:id        → updateArticle
DELETE /api/articles/:id        → deleteArticle
DELETE /api/articles            → deleteAllArticles
```

**Route Order Matters:**
1. `/scrape` and `/stats` before `/:id` - Specific routes first
2. `/:id` routes last - Dynamic parameter routes last
3. Prevents `/scrape` from being treated as an ID

**Why this approach:**
- RESTful design follows industry standards
- Both PUT and PATCH supported for flexibility
- Logical route ordering prevents conflicts
- Express Router provides modular route organization

---

#### **6. Server Setup** ([server.js](src/server.js))

**Purpose:** Initialize Express app, configure middleware, and start server

**What we implemented:**

##### **Middleware Stack:**

1. **CORS (Cross-Origin Resource Sharing):**
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL || true,
     credentials: true
   }));
   ```
   - Allows frontend from any origin to access API
   - Supports credentials (cookies, auth headers)

2. **Body Parsers:**
   ```javascript
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   ```
   - Parses JSON request bodies
   - Parses URL-encoded form data

3. **Request Logger:**
   ```javascript
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
     next();
   });
   ```
   - Logs all incoming requests with timestamp
   - Useful for debugging and monitoring

##### **Routes:**

1. **Health Check:** `GET /health`
   - Returns server status and timestamp
   - Useful for monitoring and load balancers

2. **Root Route:** `GET /`
   - Returns API documentation
   - Lists all available endpoints

3. **Article Routes:** `/api/articles`
   - Mounts all article-related routes
   - Prefix keeps API organized

4. **404 Handler:**
   - Catches undefined routes
   - Returns consistent error response

5. **Global Error Handler:**
   - Catches all errors from routes
   - Returns formatted error response
   - Includes stack trace in development mode

##### **Server Startup Process:**

```javascript
const startServer = async () => {
  1. Connect to MongoDB (await connectDB())
  2. Start Express server (app.listen())
  3. Log server URLs
  4. Handle startup errors
};
```

**Why this approach:**
- Ensures database is ready before accepting requests
- Middleware order matters (logger before routes)
- Error handlers last in middleware chain
- Health check endpoint for monitoring
- Graceful error handling prevents crashes

---

#### **7. Utility Functions** ([helpers.js](src/utils/helpers.js))

**Purpose:** Reusable helper functions for common operations

**What we implemented:**

1. **`isValidObjectId(id)`:**
   - Validates MongoDB ObjectId format
   - Prevents casting errors

2. **`errorResponse(res, statusCode, message, details)`:**
   - Standardized error response format
   - Consistent error structure across API

3. **`successResponse(res, statusCode, message, data)`:**
   - Standardized success response format
   - Consistent success structure across API

4. **`asyncHandler(fn)`:**
   - Wraps async functions to catch errors
   - Eliminates try-catch blocks in routes

**Why this approach:**
- DRY principle (Don't Repeat Yourself)
- Consistent API responses
- Easier to maintain and update response formats
- Reduces boilerplate code in controllers

---

#### **8. Environment Configuration** ([.env](../.env))

**Purpose:** Store sensitive configuration and environment-specific values

**What we configured:**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats_articles
CLIENT_URL=http://localhost:5173
```

**Environment Variables Used:**
- `PORT` - Server port number
- `NODE_ENV` - Environment (development/production)
- `MONGO_URI` - MongoDB connection string with database name
- `CLIENT_URL` - Frontend URL for CORS configuration

**Why this approach:**
- Keeps secrets out of source code
- Easy to change between environments
- Follows 12-factor app methodology
- `.gitignore` prevents committing secrets

---

#### **9. Git Configuration** ([.gitignore](../.gitignore))

**Purpose:** Prevent committing sensitive and generated files

**What we excluded:**
- `.env` files (secrets)
- `node_modules/` (dependencies)
- Log files
- OS-specific files
- IDE configuration
- Build outputs

**Why this approach:**
- Protects sensitive information
- Reduces repository size
- Prevents merge conflicts in generated files
- Standard practice for Node.js projects

---

### 🎯 How Phase 1 Requirements Were Met

#### ✅ **1. Scrape articles from BeyondChats blog**
**Implementation:**
- Created `scraper.service.js` with Axios + Cheerio
- Fetches HTML from https://beyondchats.com/blogs/
- Parses HTML to extract article data
- Multiple selector strategies for reliability

**Files Involved:**
- [`src/services/scraper.service.js`](src/services/scraper.service.js) - Scraping logic
- [`src/controllers/article.controller.js`](src/controllers/article.controller.js) - Calls scraper

---

#### ✅ **2. Fetch 5 oldest articles**
**Implementation:**
- Scraper collects all found articles
- Sorts by date in ascending order (oldest first)
- Uses `.slice(0, 5)` to take first 5 articles

**Code:**
```javascript
const oldestArticles = articles
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 5);
```

**Files Involved:**
- [`src/services/scraper.service.js`](src/services/scraper.service.js) - Sorting logic

---

#### ✅ **3. Store articles in database**
**Implementation:**
- MongoDB database with Mongoose ODM
- Article schema with validation and unique constraints
- Upsert operation (update if exists, insert if new)
- Prevents duplicate URLs

**Code:**
```javascript
await Article.findOneAndUpdate(
  { url: articleData.url },  // Find by URL
  articleData,               // Update data
  { 
    new: true,              // Return updated doc
    upsert: true,           // Create if not exists
    runValidators: true     // Validate data
  }
);
```

**Files Involved:**
- [`src/models/article.model.js`](src/models/article.model.js) - Schema definition
- [`src/config/connectDb.js`](src/config/connectDb.js) - Database connection
- [`src/controllers/article.controller.js`](src/controllers/article.controller.js) - Save logic

---

#### ✅ **4. Create CRUD APIs**
**Implementation:**
- Complete RESTful API with all CRUD operations
- Proper HTTP methods and status codes
- Input validation and error handling
- Pagination and search functionality

**API Endpoints:**

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| **Create** | POST | `/api/articles` | Create new article |
| **Read All** | GET | `/api/articles` | Get all articles (with pagination) |
| **Read One** | GET | `/api/articles/:id` | Get article by ID |
| **Update** | PUT/PATCH | `/api/articles/:id` | Update article by ID |
| **Delete One** | DELETE | `/api/articles/:id` | Delete article by ID |
| **Delete All** | DELETE | `/api/articles` | Delete all articles |
| **Scrape** | POST | `/api/articles/scrape` | Scrape & store articles |
| **Stats** | GET | `/api/articles/stats` | Get statistics |

**Files Involved:**
- [`src/controllers/article.controller.js`](src/controllers/article.controller.js) - CRUD logic
- [`src/routes/article.routes.js`](src/routes/article.routes.js) - Route definitions
- [`src/server.js`](src/server.js) - Routes integration

---

### 🧪 Testing the Implementation

**Step 1: Start the Server**
```bash
cd Server
npm run dev
```

Expected Output:
```
✅ MongoDB Connected: cluster0...
🚀 Server running on port 5000
📝 API Documentation: http://localhost:5000/
🏥 Health Check: http://localhost:5000/health
```

**Step 2: Test Health Check**
```bash
curl http://localhost:5000/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-28T..."
}
```

**Step 3: Scrape and Store Articles**
```bash
curl -X POST http://localhost:5000/api/articles/scrape
```

Expected Response:
```json
{
  "success": true,
  "message": "Successfully scraped and stored 5 articles",
  "data": {
    "articles": [...],
    "count": 5
  }
}
```

**Step 4: Get All Articles**
```bash
curl http://localhost:5000/api/articles
```

**Step 5: Test Other CRUD Operations**
- Create: `POST /api/articles` with JSON body
- Update: `PUT /api/articles/:id` with JSON body
- Delete: `DELETE /api/articles/:id`
- Get Stats: `GET /api/articles/stats`

---

### 🏗️ Implementation Timeline

**Order of Development:**

1. **Setup** (package.json, .env, .gitignore)
2. **Database** (connectDb.js, article.model.js)
3. **Scraper** (scraper.service.js)
4. **Controllers** (article.controller.js)
5. **Routes** (article.routes.js)
6. **Server** (server.js)
7. **Utilities** (helpers.js)
8. **Documentation** (README.md)

**Why this order:**
- Bottom-up approach (foundation first)
- Each layer depends on previous layers
- Can test each component independently
- Reduces debugging complexity

---

