@echo off
echo 🚀 NLP Emotion Detection Server - Deployment Guide
echo ==================================================

echo.
echo 📋 Choose your deployment platform:
echo.
echo 1. 🚀 RENDER (Recommended - Free)
echo    - Visit: https://render.com
echo    - Connect your GitHub repo: nlp_emotion_detection_project
echo    - Auto-deploys from main branch
echo    - Uses render.yaml configuration
echo.

echo 2. ⚡ RAILWAY (Fast & Modern)  
echo    - Visit: https://railway.app
echo    - Connect GitHub repo
echo    - Auto-detects Node.js
echo    - Instant deployments
echo.

echo 3. 🔥 HEROKU (Classic)
echo    - Install Heroku CLI
echo    - heroku create your-app-name
echo    - git push heroku main
echo    - Uses Procfile
echo.

echo 4. ⚡ VERCEL (Serverless)
echo    - npm i -g vercel
echo    - vercel --prod
echo    - Uses vercel.json
echo.

echo 📁 All configuration files created:
echo    ✅ render.yaml
echo    ✅ package-server.json  
echo    ✅ vercel.json
echo    ✅ Procfile
echo.

echo 🌐 Your server will be available at:
echo    https://your-app-name.onrender.com (Render)
echo    https://your-app-name.up.railway.app (Railway)
echo    https://your-app-name.herokuapp.com (Heroku)
echo    https://your-app-name.vercel.app (Vercel)
echo.

echo 📊 Endpoints that will work globally:
echo    POST /api/netlify-data   ← Netlify frontend sends data here
echo    GET  /api/health         ← Health check
echo    GET  /api/data/export    ← Download all collected data
echo    GET  /admin              ← Real-time dashboard
echo.

pause
