#!/bin/bash

# Domain Intelligence Platform - Startup Script
# This script sets up and starts the application

set -e

echo "🚀 Starting Domain Intelligence Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the application"
    echo "   Required: MONGODB_URI, JWT_SECRET"
    echo "   Optional: External API keys for full functionality"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

# Check if MongoDB is running (optional check)
if command -v mongosh &> /dev/null; then
    if ! mongosh --eval "db.runCommand('ping').ok" --quiet 2>/dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB before running the application."
        echo "   Use: brew services start mongodb/brew/mongodb-community (macOS)"
        echo "   Or: sudo systemctl start mongod (Linux)"
    fi
fi

# Check if Redis is running (optional check)
if command -v redis-cli &> /dev/null; then
    if ! redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo "⚠️  Redis is not running. Please start Redis for caching functionality."
        echo "   Use: brew services start redis (macOS)"
        echo "   Or: sudo systemctl start redis (Linux)"
    fi
fi

echo "✅ Dependencies check complete"

# Start the application based on environment
if [ "${NODE_ENV}" = "production" ]; then
    echo "🏭 Starting in production mode..."

    # Build frontend if build directory doesn't exist
    if [ ! -d "client/build" ]; then
        echo "🔨 Building frontend..."
        cd client && npm run build && cd ..
    fi

    # Start production server
    node server.js
else
    echo "🛠️  Starting in development mode..."
    echo "Backend will run on http://localhost:5000"
    echo "Frontend will run on http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the application"

    # Start development server
    npm run dev
fi