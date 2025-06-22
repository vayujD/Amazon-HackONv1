#!/bin/bash

echo "🚀 Setting up Fake Review Detection ML Integration"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "fake_review_detection.ipynb" ]; then
    echo "❌ Error: fake_review_detection.ipynb not found in current directory"
    echo "Please run this script from the directory containing your notebook"
    exit 1
fi

echo "✅ Found fake_review_detection.ipynb"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/ml_service/ml_models

# Check if models exist
echo "🔍 Checking for trained models..."
if [ -f "fake_review.h5" ]; then
    echo "✅ Found fake_review.h5"
    cp fake_review.h5 backend/ml_service/ml_models/
else
    echo "⚠️  Warning: fake_review.h5 not found"
fi

if [ -f "burst_review.h5" ]; then
    echo "✅ Found burst_review.h5"
    cp burst_review.h5 backend/ml_service/ml_models/
else
    echo "⚠️  Warning: burst_review.h5 not found"
fi

if [ -f "copy-paste_review.h5" ]; then
    echo "✅ Found copy-paste_review.h5"
    cp copy-paste_review.h5 backend/ml_service/ml_models/
else
    echo "⚠️  Warning: copy-paste_review.h5 not found"
fi

if [ -f "likely_bot.h5" ]; then
    echo "✅ Found likely_bot.h5"
    cp likely_bot.h5 backend/ml_service/ml_models/
else
    echo "⚠️  Warning: likely_bot.h5 not found"
fi

# Check Python installation
echo "🐍 Checking Python installation..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 is installed"
else
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Set up Python environment
echo "🔧 Setting up Python environment..."
cd backend/ml_service

if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if models need to be extracted
if [ ! -f "ml_models/tokenizer.pkl" ]; then
    echo "🔧 Running model extraction..."
    python extract_models.py
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the Python ML service:"
echo "   cd backend/ml_service && ./start.sh"
echo ""
echo "2. In another terminal, start the Node.js backend:"
echo "   cd backend && npm start"
echo ""
echo "3. In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Test the integration:"
echo "   curl http://localhost:5001/health"
echo ""
echo "📖 For detailed instructions, see FAKE_REVIEW_INTEGRATION_GUIDE.md" 