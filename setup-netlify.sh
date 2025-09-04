#!/bin/bash
# Quick Netlify Setup Script

echo "🌐 Setting up project for Netlify deployment..."

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project for production..."
npm run build

echo "✅ Project ready for Netlify deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Ready for Netlify' && git push"
echo "2. Go to netlify.com and connect your repository"
echo "3. Deploy automatically with netlify.toml settings"
echo ""
echo "🌍 Your voice emotion detection will be available globally!"
echo "📊 Don't forget to configure data collection to your laptop!"
