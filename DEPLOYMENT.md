# Deployment Guide - Domain Intelligence Platform

This guide covers deploying the Domain Intelligence Platform to various environments including local development, staging, and production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Version 6.0 or higher
- **Redis**: Version 7.0 or higher (for caching)
- **Memory**: Minimum 2GB RAM (4GB+ recommended for production)
- **Storage**: 10GB+ available space

### Required Services
- **Stripe Account**: For payment processing
- **MongoDB Atlas**: For managed database (recommended for production)
- **Redis Cloud**: For managed caching (optional)

### Optional External APIs
- **Ahrefs API**: For advanced SEO metrics
- **SEMrush API**: For competitive analysis
- **Moz API**: For domain authority metrics
- **Google PageSpeed API**: For performance analysis
- **Namecheap API**: For domain registration services
- **GoDaddy API**: For domain availability checking

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd domain_fetcher

# Install dependencies
npm install
cd client && npm install && cd ..

# Make startup script executable
chmod +x scripts/start.sh
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Basic Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/domain_intelligence
REDIS_URL=redis://localhost:6379

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars

# Stripe Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Start Local Services

**Option A: Using Local Services**
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb/brew/mongodb-community

# Start Redis (macOS with Homebrew)
brew services start redis

# Start the application
./scripts/start.sh
```

**Option B: Using Docker**
```bash
# Start MongoDB and Redis with Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start the application
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🐳 Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 2. Environment Variables for Docker

Create a `.env` file in the project root:

```env
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb://mongo:27017/domain_intelligence
REDIS_URL=redis://redis:6379
```

### 3. Production Docker Build

```bash
# Build production image
docker build -t domain-intelligence:latest .

# Run with external database
docker run -d \
  --name domain-intelligence \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/domain_intelligence \
  -e JWT_SECRET=your_production_secret \
  -e STRIPE_SECRET_KEY=sk_live_... \
  domain-intelligence:latest
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. ECS (Elastic Container Service)

**Deploy to ECS Fargate:**

1. **Push to ECR**:
```bash
# Build and tag image
docker build -t domain-intelligence .
docker tag domain-intelligence:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/domain-intelligence:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/domain-intelligence:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "domain-intelligence",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "domain-intelligence",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/domain-intelligence:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb+srv://username:password@cluster.mongodb.net/domain_intelligence"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:domain-intelligence/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/domain-intelligence",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 2. Application Load Balancer Setup

```bash
# Create target group
aws elbv2 create-target-group \
  --name domain-intelligence-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-12345678 \
  --health-check-path /health

# Create load balancer
aws elbv2 create-load-balancer \
  --name domain-intelligence-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678
```

### Google Cloud Platform

#### 1. Cloud Run Deployment

```bash
# Build and push to Container Registry
docker build -t gcr.io/your-project/domain-intelligence .
docker push gcr.io/your-project/domain-intelligence

# Deploy to Cloud Run
gcloud run deploy domain-intelligence \
  --image gcr.io/your-project/domain-intelligence \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --memory 1Gi \
  --set-env-vars NODE_ENV=production \
  --set-env-vars MONGODB_URI=mongodb+srv://... \
  --set-secrets JWT_SECRET=jwt-secret:latest
```

#### 2. Cloud SQL and Memorystore

```bash
# Create Cloud SQL MongoDB instance (using MongoDB Atlas is recommended)
# Or use MongoDB Atlas connection string

# Create Redis instance
gcloud redis instances create domain-intelligence-redis \
  --size=1 \
  --region=us-central1
```

### Azure Deployment

#### 1. Container Instances

```bash
# Create resource group
az group create --name domain-intelligence-rg --location eastus

# Create container instance
az container create \
  --resource-group domain-intelligence-rg \
  --name domain-intelligence \
  --image domain-intelligence:latest \
  --cpu 1 \
  --memory 2 \
  --ports 5000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables JWT_SECRET=your_secret MONGODB_URI=mongodb+srv://...
```

### Heroku Deployment

#### 1. Heroku App Setup

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create domain-intelligence-app

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secure_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
```

#### 2. Deploy

```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/domain-intelligence-app.git

# Deploy
git push heroku main
```

## 🔒 Production Security Checklist

### Environment Security
- [ ] Use strong, unique JWT secrets (min 32 characters)
- [ ] Enable MongoDB authentication and encryption
- [ ] Use Redis AUTH and encrypted connections
- [ ] Set up SSL/TLS certificates (Let's Encrypt or commercial)
- [ ] Configure CORS for your specific domain
- [ ] Set up proper firewall rules

### Application Security
- [ ] Enable Helmet.js security headers
- [ ] Configure rate limiting per your usage patterns
- [ ] Set up proper error handling (don't expose internal errors)
- [ ] Implement request logging and monitoring
- [ ] Set up health checks and monitoring

### Data Security
- [ ] Enable database encryption at rest
- [ ] Use connection encryption (SSL/TLS)
- [ ] Set up regular database backups
- [ ] Implement data retention policies
- [ ] Configure proper user permissions

## 📊 Monitoring and Maintenance

### Health Monitoring

```bash
# Health check endpoint
curl https://your-domain.com/health

# Expected response
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### Log Monitoring

```bash
# View application logs
docker-compose logs -f app

# Or with Docker
docker logs -f domain-intelligence

# In production, use centralized logging
# - AWS CloudWatch
# - Google Cloud Logging
# - Azure Monitor
# - ELK Stack
# - Splunk
```

### Performance Monitoring

**Recommended Tools:**
- **Application Performance**: New Relic, DataDog, AppDynamics
- **Infrastructure**: Prometheus + Grafana, CloudWatch
- **Error Tracking**: Sentry, Bugsnag, Rollbar
- **Uptime Monitoring**: Pingdom, StatusCake, UptimeRobot

### Database Maintenance

```bash
# MongoDB maintenance
# Create indexes for performance
db.domains.createIndex({ "name": 1 })
db.domains.createIndex({ "scoring.overall": -1 })
db.domains.createIndex({ "availability.isAvailable": 1 })

# Regular backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Redis maintenance
# Monitor memory usage
redis-cli info memory

# Set up persistence
redis-cli config set save "900 1 300 10 60 10000"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: cd client && npm ci && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Add your deployment script here
          echo "Deploying to production..."
```

## 🆘 Troubleshooting

### Common Issues

**1. Application Won't Start**
```bash
# Check logs
docker-compose logs app

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

**2. Database Connection Issues**
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/domain_intelligence"

# Test Redis connection
redis-cli ping
```

**3. Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..

# Build frontend separately
cd client && npm run build
```

**4. Performance Issues**
```bash
# Check resource usage
docker stats

# Monitor database performance
db.currentOp()

# Check Redis memory
redis-cli info memory
```

### Support Contacts

- **Technical Issues**: Create an issue in the repository
- **Security Concerns**: Email security@domainintelligence.com
- **General Support**: Email support@domainintelligence.com

---

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Verify all API endpoints are working
- [ ] Test user registration and authentication
- [ ] Confirm domain search functionality
- [ ] Validate payment processing (if applicable)
- [ ] Check database connectivity and performance
- [ ] Verify external API integrations
- [ ] Test email notifications (if configured)
- [ ] Set up monitoring and alerting
- [ ] Document your specific configuration
- [ ] Schedule regular backups
- [ ] Plan for scaling and updates

Your Domain Intelligence Platform is now ready to serve users worldwide! 🚀