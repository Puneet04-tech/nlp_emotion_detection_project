@echo off
echo =======================================
echo    🌐 NGROK SETUP FOR GLOBAL ACCESS
echo =======================================
echo.

echo 1. Adding ngrok to PATH...
set "PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe"

echo 2. Checking ngrok installation...
ngrok --version
echo.

echo 3. Setup Instructions:
echo    a) Go to: https://ngrok.com/signup
echo    b) Sign up for a FREE account
echo    c) Copy your authtoken from dashboard
echo    d) Run: ngrok config add-authtoken YOUR_TOKEN_HERE
echo.

echo 4. To start global tunnel for your laptop:
echo    ngrok http 4000
echo.

echo =======================================
echo    🚀 Ready for Global Data Collection!
echo =======================================
pause
