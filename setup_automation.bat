@echo off
REM 🤖 WINDOWS AUTOMATED DATA SYNC & TRAINING
REM Run this once to set up complete automation

echo 🚀 Setting up automated voice emotion system...

REM 1. 📥 Create data download script
echo @echo off > auto_download.bat
echo echo 📥 Downloading latest data... >> auto_download.bat
echo curl -o "data\latest_data.json" "https://nlp-emotion-detection-project.onrender.com/api/data/export" >> auto_download.bat
echo if exist "data\latest_data.json" ( >> auto_download.bat
echo     echo ✅ Data downloaded successfully >> auto_download.bat
echo     python scripts\train_voice_emotion.py >> auto_download.bat
echo     echo 🎉 Training completed! >> auto_download.bat
echo ) else ( >> auto_download.bat
echo     echo ℹ️ No new data available >> auto_download.bat
echo ) >> auto_download.bat

REM 2. ⏰ Schedule automatic execution (every 2 hours)
echo 📅 Setting up automatic schedule...
schtasks /create /tn "VoiceEmotionAutoSync" /tr "%cd%\auto_download.bat" /sc hourly /mo 2 /f

REM 3. 📂 Create necessary directories
if not exist "data" mkdir data
if not exist "models" mkdir models
if not exist "scripts" mkdir scripts

echo ✅ AUTOMATION SETUP COMPLETE!
echo.
echo 🎯 What happens now:
echo - Data downloads automatically every 2 hours
echo - Voice emotion training runs automatically
echo - No need to run any backend commands
echo - Everything works in background
echo.
echo 📊 To monitor: Check data\ folder for new files
echo 🔧 To stop: schtasks /delete /tn "VoiceEmotionAutoSync"
echo.
pause
