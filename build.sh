#!/bin/bash

# Production build script for Skapeta Apartments

set -e

echo "🛠️ Building Skapeta Apartments for Production..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one from .env.example"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
yarn install --frozen-lockfile
cd ..

echo "🏭 Building frontend..."
cd frontend
yarn build
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to your server"
echo "2. Deploy frontend/build to your static hosting"
echo "3. Update REACT_APP_BACKEND_URL in production"
echo ""
