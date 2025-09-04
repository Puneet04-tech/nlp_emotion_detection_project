@echo off
title Netlify Setup - Voice Emotion Detection
echo ========================================
echo 🌐 Netlify Deployment Setup
echo ========================================
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Dependency installation failed!
    pause
    exit /b 1
)

echo.
echo 🔨 Building project for production...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Project ready for Netlify deployment!
echo.
echo 📋 Next steps:
echo 1. Push to GitHub: 
echo    git add .
echo    git commit -m "Ready for Netlify deployment"
echo    git push origin main
echo.
echo 2. Go to netlify.com and connect your repository
echo 3. Deploy automatically (netlify.toml handles the settings)
echo.
echo 🌍 Your voice emotion detection will be available globally!
echo 📊 Don't forget to configure data collection to your laptop!
echo.
echo 💡 See NETLIFY_DEPLOYMENT_GUIDE.md for complete instructions
echo.
pause
