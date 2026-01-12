#!/bin/bash

# IT Ticketing System Frontend - Quick Start Script

echo "======================================"
echo "IT Ticketing System Frontend Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm version: $(npm --version)"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✓ Setup complete!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your API endpoint"
    echo "2. Make sure backend is running on http://localhost:4000"
    echo "3. Run 'npm run dev' to start development server"
    echo "4. Open http://localhost:3000 in your browser"
    echo ""
    echo "Default login credentials:"
    echo "- Admin: admin@example.com / admin123"
    echo "- Technician: tech@example.com / tech123"
    echo "- User: user@example.com / user123"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi
