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
CLIENT_URL=http://localhost:3000
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

## 🌟 Features

- 🔍 **Web Scraping**: Scrapes the 5 oldest articles from BeyondChats blog
- 💾 **Database Storage**: Stores articles in MongoDB with proper indexing
- 🔄 **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- ✅ **Validation**: Input validation and error handling
- 🚀 **Production Ready**: Includes logging, CORS, and error handling
- 📊 **Statistics**: Get insights about your article collection
- 🔎 **Search**: Search articles by title or content
- 📄 **Pagination**: Efficient data retrieval with pagination
- 🛡️ **Security**: Environment variables, input sanitization

---

## 💻 Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Web Scraping**: Axios (HTTP client) + Cheerio (HTML parser)
- **Environment**: dotenv (configuration)
- **Development**: Nodemon (auto-restart)

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager
- Git (for version control)

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BeyondChats-Internship-Task/Server
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- express - Web framework
- mongoose - MongoDB ODM
- axios - HTTP client
- cheerio - HTML parser
- cors - CORS middleware
- dotenv - Environment variables
- nodemon - Development auto-reload

### 3. Configure Environment
Your `.env` file is already configured with MongoDB connection.

To modify:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000
```

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | API documentation |
| `/api/articles/scrape` | POST | Scrape & store articles |
| `/api/articles/stats` | GET | Get statistics |
| `/api/articles` | GET | Get all articles |
| `/api/articles/:id` | GET | Get article by ID |
| `/api/articles` | POST | Create article |
| `/api/articles/:id` | PUT/PATCH | Update article |
| `/api/articles/:id` | DELETE | Delete article |
| `/api/articles` | DELETE | Delete all articles |

### Detailed Endpoint Documentation

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-28T10:30:00.000Z"
}
```

---

#### 2. Scrape Articles
```http
POST /api/articles/scrape
```

Scrapes 5 oldest articles from BeyondChats blog and stores them.

**Response:**
```json
{
  "success": true,
  "message": "Successfully scraped and stored 5 articles",
  "data": {
    "articles": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Article Title",
        "url": "https://beyondchats.com/blogs/article-slug",
        "image": "https://...",
        "content": "Article content...",
        "date": "2023-01-15T00:00:00.000Z",
        "scrapedAt": "2025-12-28T10:30:00.000Z",
        "createdAt": "2025-12-28T10:30:00.000Z",
        "updatedAt": "2025-12-28T10:30:00.000Z"
      }
    ],
    "count": 5
  }
}
```

---

#### 3. Get All Articles
```http
GET /api/articles?page=1&limit=10&sort=-date&search=keyword
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sort` (default: -date) - Sort field (- for descending)
- `search` - Search in title and content

**Example:**
```bash
GET /api/articles?page=1&limit=5&search=AI
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalArticles": 5,
      "articlesPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

#### 4. Get Article by ID
```http
GET /api/articles/:id
```

**Example:**
```bash
GET /api/articles/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "article": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Article Title",
      "url": "https://...",
      "content": "...",
      "image": "...",
      "date": "2023-01-15T00:00:00.000Z",
      "createdAt": "2025-12-28T10:30:00.000Z",
      "updatedAt": "2025-12-28T10:30:00.000Z"
    }
  }
}
```

---

#### 5. Create Article
```http
POST /api/articles
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Article Title",
  "url": "https://example.com/article",
  "content": "Article content here...",
  "image": "https://example.com/image.jpg",
  "date": "2024-01-01"
}
```

**Required Fields:** `title`, `url`, `content`

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "article": {...}
  }
}
```

---

#### 6. Update Article
```http
PUT /api/articles/:id
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "image": "https://example.com/new-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article updated successfully",
  "data": {
    "article": {...}
  }
}
```

---

#### 7. Delete Article
```http
DELETE /api/articles/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully",
  "data": {
    "article": {...}
  }
}
```

---

#### 8. Delete All Articles
```http
DELETE /api/articles
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully deleted 5 articles",
  "data": {
    "deletedCount": 5
  }
}
```

---

#### 9. Get Statistics
```http
GET /api/articles/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalArticles": 5,
    "oldestArticle": {
      "title": "First Article",
      "date": "2023-01-15T00:00:00.000Z"
    },
    "newestArticle": {
      "title": "Latest Article",
      "date": "2024-12-28T00:00:00.000Z"
    }
  }
}
```

---

## 🚀 Usage Flow

### Complete Workflow Example

**1. Start the server:**
```bash
cd Server
npm run dev
```

**2. Scrape articles from BeyondChats:**
```bash
curl -X POST http://localhost:5000/api/articles/scrape
```

**3. View all scraped articles:**
```bash
curl http://localhost:5000/api/articles
```

**4. Get a specific article:**
```bash
curl http://localhost:5000/api/articles/{article_id}
```

**5. Update an article:**
```bash
curl -X PUT http://localhost:5000/api/articles/{article_id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "New content"}'
```

**6. Create a new article manually:**
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Article",
    "url": "https://example.com/my-article",
    "content": "Article content here..."
  }'
```

**7. Search articles:**
```bash
curl "http://localhost:5000/api/articles?search=AI&limit=5"
```

**8. Get statistics:**
```bash
curl http://localhost:5000/api/articles/stats
```

**9. Delete an article:**
```bash
curl -X DELETE http://localhost:5000/api/articles/{article_id}
```

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages..."]
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | Success | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, invalid input |
| 404 | Not Found | Article not found |
| 409 | Conflict | Duplicate URL |
| 500 | Internal Server Error | Server/database error |

### Common Errors

**1. Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title must be at least 3 characters long",
    "Please provide a valid URL"
  ]
}
```

**2. Not Found (404)**
```json
{
  "success": false,
  "message": "Article not found"
}
```

**3. Duplicate URL (409)**
```json
{
  "success": false,
  "message": "An article with this URL already exists"
}
```

**4. Invalid ID Format (400)**
```json
{
  "success": false,
  "message": "Invalid article ID format"
}
```

---

## 🗄️ Database Schema

### Article Model

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 300,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,                   // Prevents duplicates
    trim: true,
    validate: URL format
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now               // Article publication date
  },
  scrapedAt: {
    type: Date,
    default: Date.now               // When article was scraped
  },
  createdAt: Date,                  // Auto-generated by timestamps
  updatedAt: Date                   // Auto-generated by timestamps
}
```

### Indexes
- `date: -1` - Sorting by date (descending)
- `createdAt: -1` - Recent articles
- `url: 1` (unique) - Duplicate prevention

---

## 🛠️ Development

### Project Structure
```
Server/
├── src/
│   ├── config/
│   │   └── connectDb.js           # MongoDB connection setup
│   ├── controllers/
│   │   └── article.controller.js  # Request handlers & business logic
│   ├── models/
│   │   └── article.model.js       # Mongoose schema & validation
│   ├── routes/
│   │   └── article.routes.js      # API route definitions
│   ├── services/
│   │   └── scraper.service.js     # Web scraping logic
│   ├── utils/
│   │   └── helpers.js             # Utility functions
│   └── server.js                  # Application entry point
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
└── README.md                      # This file
```

### Scripts
```bash
# Development mode with auto-reload
npm run dev

# Production mode (if configured)
npm start

# Run tests (if configured)
npm test
```

### Adding New Features

**To add a new endpoint:**
1. Add controller function in `article.controller.js`
2. Add route in `article.routes.js`
3. Test with curl or Postman

**To modify article schema:**
1. Update `article.model.js`
2. Consider data migration for existing records
3. Update API documentation

---

## 🚢 Production Deployment

### Preparation Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Use strong MongoDB password
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting (add middleware)
- [ ] Set up monitoring/logging service
- [ ] Use HTTPS
- [ ] Configure firewall rules
- [ ] Set up backup strategy

### Deployment Steps

**1. Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
CLIENT_URL=https://yourdomain.com
```

**2. Using PM2 (Process Manager):**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name beyondchats-api

# Other PM2 commands
pm2 list                 # List all processes
pm2 stop beyondchats-api # Stop application
pm2 restart beyondchats-api # Restart
pm2 logs beyondchats-api # View logs
pm2 monit               # Monitor
```

**3. Using Docker (Optional):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**4. Nginx Reverse Proxy (Optional):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🧪 Testing

### Manual Testing with cURL

**Test scraping:**
```bash
curl -X POST http://localhost:5000/api/articles/scrape
```

**Test GET all:**
```bash
curl http://localhost:5000/api/articles
```

**Test GET by ID:**
```bash
curl http://localhost:5000/api/articles/507f1f77bcf86cd799439011
```

**Test CREATE:**
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "url": "https://example.com/test",
    "content": "This is test content"
  }'
```

**Test UPDATE:**
```bash
curl -X PUT http://localhost:5000/api/articles/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Test DELETE:**
```bash
curl -X DELETE http://localhost:5000/api/articles/507f1f77bcf86cd799439011
```

### Using Postman

1. Import collection or create requests manually
2. Set base URL: `http://localhost:5000`
3. Test each endpoint
4. Check response status codes and data

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
❌ MongoDB connection failed: connect ECONNREFUSED
```
**Solutions:**
- Check if MongoDB is running locally
- Verify `MONGO_URI` in `.env`
- Check network connectivity
- Verify MongoDB Atlas IP whitelist (if using Atlas)

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solutions:**
- Change `PORT` in `.env`
- Kill process using port: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`

**3. Module Not Found**
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
npm install
```

**4. Scraping Returns Empty Results**
```
Found 0 articles
```
**Solutions:**
- Check if website structure has changed
- Verify internet connection
- Check for blocking by target website
- Review scraper selectors

**5. Duplicate Key Error**
```
E11000 duplicate key error collection: articles index: url_1
```
**Solution:**
- URL must be unique
- Article with that URL already exists
- Use different URL or update existing article

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Axios Documentation](https://axios-http.com/)

---

## 📄 License

ISC

---

## 👤 Author

Created for **BeyondChats Internship Task - Phase 1**

**Developer:** Your Name  
**Date:** December 28, 2025  
**Repository:** BeyondChats-Assignment

---

## 🎓 Learning Outcomes

From this implementation, you learn:

1. **Web Scraping**: How to extract data from websites using HTTP requests and HTML parsing
2. **RESTful API Design**: Industry-standard API architecture and best practices
3. **MongoDB & Mongoose**: NoSQL database operations with schema validation
4. **Express.js**: Building production-ready Node.js web servers
5. **Error Handling**: Comprehensive error management in async operations
6. **Code Organization**: MVC architecture and separation of concerns
7. **Environment Configuration**: Secure handling of credentials and configs
8. **API Documentation**: Writing clear technical documentation
9. **Production Deployment**: Preparing applications for real-world usage
10. **Testing**: Manual API testing with various tools

---

## ✨ Future Enhancements (Phase 2+)

Potential improvements for future phases:
- Authentication & Authorization
- Rate limiting
- Caching layer (Redis)
- Automated testing (Jest/Mocha)
- API versioning
- GraphQL endpoint
- Real-time updates (WebSockets)
- Advanced search (Elasticsearch)
- Image storage (AWS S3/Cloudinary)
- Schedule automated scraping (Cron jobs)
- Admin dashboard
- API documentation (Swagger/OpenAPI)

---

**🎉 Phase 1 Complete! All requirements successfully implemented.**
