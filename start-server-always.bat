@echo off
title Voice Emotion Detection Server - KEEP THIS WINDOW OPEN
echo ========================================
echo 🎤 Voice Emotion Detection Server
echo ========================================
echo.
echo 🚀 Starting enhanced server...
echo 💡 IMPORTANT: Do not close this window!
echo 📱 Share this URL: http://172.25.226.193:4000
echo 📊 Admin Dashboard: http://localhost:4000/admin-dashboard.html
echo.
echo ========================================

cd /d "%~dp0"
node server/enhanced-server.js

echo.
echo ❌ Server stopped! Press any key to restart...
pause >nul
goto restart

:restart
cls
goto start
