#!/bin/bash

# 🤖 AUTOMATED DATA SYNC & TRAINING SYSTEM
# This script runs periodically to sync data and train models
# No need to run backend commands manually!

echo "🚀 Starting Automated Voice Emotion System..."

# 1. 📥 Download new data from cloud server
echo "📥 Downloading new data from Render server..."
curl -o "latest_data.json" "https://nlp-emotion-detection-project.onrender.com/api/data/export"

# 2. 🔍 Check if new data exists
if [ -f "latest_data.json" ]; then
    echo "✅ New data downloaded successfully"
    
    # 3. 🧠 Run training automatically
    echo "🧠 Starting voice emotion training..."
    python train_voice_emotion.py --data=latest_data.json --auto
    
    # 4. 📤 Upload improved model back to server (optional)
    echo "📤 Uploading improved model..."
    curl -X POST -F "model=@improved_model.pkl" \
         "https://nlp-emotion-detection-project.onrender.com/api/model/update"
    
    echo "🎉 Training completed automatically!"
else
    echo "ℹ️ No new data available"
fi

echo "✨ Automation cycle completed!"

# Schedule this script to run every hour:
# crontab -e
# 0 * * * * /path/to/this/script.sh
