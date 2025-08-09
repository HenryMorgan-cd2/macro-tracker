#!/bin/bash

echo "🚀 Setting up Macro Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
else
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    echo "✅ PostgreSQL is running on localhost:5432"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
go mod tidy

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ Created .env file. Please update it with your database credentials if needed."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: go run main.go"
echo "2. Start the frontend: npm run dev"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy tracking! 📊"
