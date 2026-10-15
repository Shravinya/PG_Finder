#!/bin/bash
# Quick Start Script for PG Finder
# This script sets up both backend and frontend for development

set -e  # Exit on error

echo "🚀 PG Finder Quick Start Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi
echo "✅ Python 3 found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js found"

echo ""
echo -e "${YELLOW}Note: This script sets up the development environment.${NC}"
echo -e "${YELLOW}You'll need to run servers in separate terminals.${NC}"
echo ""

# Backend setup
echo -e "${BLUE}Setting up Backend...${NC}"

if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
fi

echo "Activating virtual environment..."
source backend/venv/bin/activate 2>/dev/null || . backend/venv/Scripts/activate

echo "Installing backend dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt
fi

echo "✅ Backend ready"
echo ""

# Frontend setup
echo -e "${BLUE}Setting up Frontend...${NC}"

cd frontend_react

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

echo "✅ Frontend ready"
echo ""

cd ..

# Environment setup
echo -e "${BLUE}Checking environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
    echo "Please create it with:"
    echo "  OPENROUTER_API_KEY=your_key"
    echo "  JWT_SECRET_KEY=your_secret"
fi

if [ ! -f "frontend_react/.env.local" ]; then
    echo "Creating frontend_react/.env.local..."
    cat > frontend_react/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
EOF
    echo "✅ Frontend .env.local created"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1️⃣  Terminal 1 - Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m uvicorn main:app --reload"
echo ""
echo "2️⃣  Terminal 2 - Start Frontend:"
echo "   cd frontend_react"
echo "   npm run dev"
echo ""
echo "3️⃣  Open in Browser:"
echo "   http://localhost:3000"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   • Setup Guide: REACT_SETUP.md"
echo "   • Implementation: REACT_IMPLEMENTATION_SUMMARY.md"
echo "   • Frontend: frontend_react/README.md"
echo ""
