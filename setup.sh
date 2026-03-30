#!/bin/bash

# Skapeta Apartments - Quick Setup Script

echo "\n🎉 Welcome to Skapeta Apartments Setup\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed\n"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration.\n"
else
    echo "✅ .env file already exists\n"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p backend/uploads
echo "✅ Directories created\n"

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start in Development Mode"
echo "2) Start in Production Mode"
echo "3) Build and Start"
echo "4) Stop All Services"
echo "5) View Logs"
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "\n🚀 Starting in Development Mode..."
        docker-compose up -d
        echo "\n✅ Services started!"
        echo "Frontend: http://localhost:3000"
        echo "Backend: http://localhost:8001"
        echo "Admin Panel: http://localhost:3000/admin/login"
        ;;
    2)
        echo "\n🚀 Starting in Production Mode..."
        docker-compose -f docker-compose.prod.yml up -d
        echo "\n✅ Production services started!"
        ;;
    3)
        echo "\n🔨 Building and Starting..."
        docker-compose up -d --build
        echo "\n✅ Services built and started!"
        ;;
    4)
        echo "\n🛑 Stopping All Services..."
        docker-compose down
        docker-compose -f docker-compose.prod.yml down
        echo "\n✅ All services stopped!"
        ;;
    5)
        echo "\n📜 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    *)
        echo "\n❌ Invalid choice!"
        exit 1
        ;;
esac

echo "\n🎉 Done!\n"
