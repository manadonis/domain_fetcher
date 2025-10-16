# Domain Intelligence Platform

A comprehensive domain finding and analysis platform with AI-powered insights, built with Node.js, React, and MongoDB.

## 🌟 Features

### Core Domain Analysis
- **Advanced Domain Scoring**: AI-powered scoring based on brevity, commercial potential, SEO value, and market trends
- **Real-time Availability Checking**: DNS-based domain availability verification
- **Comprehensive WHOIS Data**: Detailed registration and ownership information
- **Smart Domain Suggestions**: AI-generated brandable domain names and variations

### Search & Discovery
- **Intelligent Search**: Keyword-based domain discovery with industry filters
- **Bulk Analysis**: Process hundreds of domains simultaneously
- **Advanced Filters**: Filter by TLD, length, score, availability, and price
- **Trending Domains**: Market intelligence on high-performing domains

### Valuation & Analytics
- **AI Valuation Engine**: Multi-factor domain value estimation
- **Historical Sales Data**: Comparable domain analysis and pricing trends
- **SEO Metrics**: Domain Authority, backlinks, and traffic analysis
- **Market Intelligence**: Industry categorization and trend analysis

### Business Features
- **User Authentication**: Secure registration and login system
- **Subscription Plans**: Tiered access with usage limits
- **Portfolio Management**: Track and organize domain investments
- **Export Capabilities**: CSV reports and data export
- **API Access**: RESTful API for developers

## 🏗️ Architecture

### Backend (Node.js/Express)
```
├── server.js              # Main application entry point
├── config/
│   └── database.js         # MongoDB connection configuration
├── models/
│   ├── User.js            # User model with subscription management
│   └── Domain.js          # Comprehensive domain data model
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── domains.js         # Domain analysis and search
│   ├── analytics.js       # Analytics and reporting
│   └── subscription.js    # Payment and subscription management
├── services/
│   ├── DomainAnalysisService.js  # Core analysis engine
│   └── DomainSearchService.js    # Search and suggestion engine
└── middleware/
    ├── auth.js            # JWT authentication
    ├── rateLimit.js       # Rate limiting and usage tracking
    └── errorHandler.js    # Global error handling
```

### Frontend (React)
```
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── contexts/         # React context providers
│   ├── services/         # API service layer
│   └── hooks/            # Custom React hooks
```

### Database Schema
- **Users**: Authentication, subscription plans, usage tracking
- **Domains**: Comprehensive domain analysis data
- **Portfolio**: User domain collections and watchlists
- **Analytics**: Usage statistics and market data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 7+ (for caching)
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd domain_fetcher
```

2. **Install dependencies**
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

3. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

Required environment variables:
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/domain_intelligence
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:3000

# External API Keys (optional for full functionality)
WHOIS_API_KEY=your_whois_api_key
AHREFS_API_TOKEN=your_ahrefs_token
SEMRUSH_API_KEY=your_semrush_key
```

4. **Start the application**
```bash
# Start both backend and frontend in development mode
npm run dev

# Or start separately:
npm run server  # Backend on :5000
npm run client  # Frontend on :3000
```

### Docker Deployment

1. **Quick start with Docker Compose**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

2. **Production deployment**
```bash
# Build production image
docker build -t domain-intelligence .

# Run with external database
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/domain_intelligence \
  -e JWT_SECRET=your_production_secret \
  domain-intelligence
```

## 📊 API Documentation

### Authentication
```bash
# Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Domain Analysis
```bash
# Analyze single domain
POST /api/domains/analyze
{
  "domain": "example.com"
}

# Bulk analysis
POST /api/domains/bulk-analyze
{
  "domains": ["example.com", "test.io", "sample.ai"],
  "options": {
    "includeUnavailable": false
  }
}

# Search domains
GET /api/domains/search?q=ai+startup&industries=tech&tlds=.com,.io&maxResults=25
```

### Search & Discovery
```bash
# Advanced search
POST /api/domains/advanced-search
{
  "keywords": ["ai", "health"],
  "industries": ["ai_tech", "health"],
  "tlds": [".com", ".ai"],
  "minScore": 6,
  "onlyAvailable": true
}

# Generate brandable names
POST /api/domains/generate-brandable
{
  "concept": "smart finance",
  "industries": ["fintech"],
  "maxResults": 20
}
```

## 🛠️ Development

### Project Structure
The application follows a modular architecture with clear separation of concerns:

- **Backend**: RESTful API with Express.js
- **Frontend**: React SPA with modern hooks and context
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Caching**: Redis for performance optimization
- **Rate Limiting**: Per-user and per-IP limits
- **Error Handling**: Comprehensive error management

### Key Services

#### Domain Analysis Engine
- **Brevity Scoring**: Length, pronounceability, memorability
- **Commercial Scoring**: Industry keywords, action words, geographic terms
- **SEO Scoring**: Exact match potential, search volume, voice optimization
- **Trend Scoring**: 2025 market trends, emerging technologies
- **AI Analysis**: Sentiment, clustering, predictive modeling

#### Search Engine
- **Smart Suggestions**: Prefix/suffix combinations, phonetic variations
- **Industry Targeting**: Sector-specific keyword generation
- **Brandable Names**: AI-powered creative name generation
- **Availability Filtering**: Real-time DNS checking
- **Advanced Filters**: Multi-criteria domain filtering

### Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test

# Run integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Scaling & Performance

### Performance Optimizations
- **Caching**: Redis for domain analysis results and search queries
- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Pagination**: Efficient data loading for large result sets
- **Compression**: gzip compression for API responses

### Monitoring & Analytics
- **Health Checks**: Application and database health monitoring
- **Usage Analytics**: User behavior and feature adoption tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response times and throughput monitoring

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests

### Data Protection
- **Environment Variables**: Sensitive data in environment config
- **Database Security**: Connection encryption and access controls
- **API Security**: Helmet.js security headers
- **Input Sanitization**: XSS and injection prevention

## 🚀 Deployment

### Production Considerations
- Use strong JWT secrets and database passwords
- Configure SSL/TLS certificates
- Set up database backups and monitoring
- Configure log aggregation and monitoring
- Use process managers (PM2) for Node.js applications
- Set up load balancing for high availability

### Cloud Deployment Options
- **AWS**: ECS/EKS with RDS and ElastiCache
- **Google Cloud**: Cloud Run with Cloud SQL and Memorystore
- **Azure**: Container Instances with CosmosDB
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: App Platform with managed databases

## 🔧 External Tools

The platform includes additional command-line utilities for standalone domain checking:

### Quick Domain Check
```bash
# Python-based domain checker (supports multiple methods)
npm run domain-check-py example.com test.io sample.net

# Node.js-based checker (RapidAPI integration)
npm run domain-check-js

# View available external tools
npm run external-tools
```

### Features
- **Python Tool**: Multi-method checking (WHOIS, DNS, RapidAPI) with fallback support
- **Node.js Tool**: RapidAPI integration with search and suggestion capabilities
- **Rate Limiting**: Built-in delays to respect API quotas
- **Bulk Checking**: Support for checking multiple domains at once

### Setup for External Tools
1. Ensure you have a RapidAPI key in your `.env` file:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```
2. Install Python dependencies if needed:
   ```bash
   pip install -r utils/external-tools/requirements_domain_checker.txt
   ```

See `utils/external-tools/README.md` for detailed documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@domainintelligence.com or create an issue in the repository.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core domain analysis engine
- ✅ User authentication and subscriptions
- ✅ Basic search and discovery
- ✅ RESTful API development

### Phase 2 (Next)
- 🔄 SEO metrics integration (Ahrefs, SEMrush, Moz)
- 🔄 Advanced marketplace features
- 🔄 Social media availability checking
- 🔄 Trademark conflict detection

### Phase 3 (Future)
- 📅 Machine learning recommendations
- 📅 Automated domain acquisition
- 📅 Advanced portfolio analytics
- 📅 Mobile applications

---

Built with ❤️ for domain investors and entrepreneurs worldwide.