@echo off
echo.
echo ════════════════════════════════════════════════════════════════
echo 🚀 RENDER DEPLOYMENT CHECKLIST
echo ════════════════════════════════════════════════════════════════
echo.

echo ✅ PRE-DEPLOYMENT CHECKLIST:
echo    □ GitHub repo is up to date
echo    □ All code committed and pushed  
echo    □ render.yaml file exists
echo    □ package.json has correct dependencies
echo.

echo 📋 RENDER FORM VALUES TO ENTER:
echo.
echo    Repository: nlp_emotion_detection_project
echo    Branch: main
echo    Environment: Node
echo    Build Command: npm install
echo    Start Command: node server/enhanced-server.js
echo.
echo    Environment Variables:
echo    NODE_ENV = production
echo    PORT = 10000
echo    WS_PORT = 10001
echo.
echo    Plan: Free
echo.

echo 🌐 AFTER DEPLOYMENT:
echo    1. Copy your Render URL (looks like: https://app-name.onrender.com)
echo    2. Test health check: https://your-url.onrender.com/api/health
echo    3. Update src/config/serverConfig.js with your URL
echo    4. Update src/utils/netlifyDataSender.js with your URL
echo    5. Commit and push changes
echo    6. Test complete data flow
echo.

echo 🔧 TROUBLESHOOTING:
echo    - Build fails: Check dependencies in package.json
echo    - App crashes: Check environment variables are set
echo    - Health check fails: Wait 2-3 minutes for startup
echo    - No data received: Verify endpoint URLs are updated
echo.

echo ════════════════════════════════════════════════════════════════
echo Ready to deploy? Follow the complete guide in:
echo COMPLETE_RENDER_GUIDE.md
echo ════════════════════════════════════════════════════════════════
echo.

pause
