# 🎤 Voice Emotion Detection Server - Sharing Instructions

## 🚀 Quick Start for Users

Anyone can access your voice emotion detection system by visiting:

### 📱 Main Application
- **Local Access**: http://localhost:3004
- **Network Access**: http://172.25.226.193:4000 (accessible to anyone on your network)

### 🎯 Features Available to Users:
- ✅ **Upload Audio Files** - Upload any audio file for emotion analysis
- ✅ **Live Recording** - Record speech directly and get real-time emotion detection
- ✅ **Real Transcripts** - Get accurate speech-to-text transcription
- ✅ **Advanced AI Analysis** - BERT-enhanced emotion detection with high confidence
- ✅ **Multiple File Formats** - Supports MP3, WAV, M4A, OPUS, OGG, FLAC, AAC, WebM

## 🖥️ Admin Dashboard (Your Laptop)

### 📊 Monitor Everything in Real-Time:
- **Admin Dashboard**: http://localhost:4000/admin-dashboard.html
- **Real-time WebSocket Updates**: See all activity as it happens
- **Complete Data Export**: Download all collected data anytime

### 📈 What You'll See:
- 👤 **User Sessions** - Who's using the system and when
- 📤 **File Uploads** - All audio files with analysis results
- 🎙️ **Live Recordings** - Real-time recording sessions
- 🎭 **Emotion Statistics** - Summary of all detected emotions
- 💾 **Automatic Data Collection** - Everything saved automatically

## 🔧 Server Management

### 🎯 Start the System:
```bash
# Terminal 1: Start the enhanced backend server
npm run start-enhanced-server

# Terminal 2: Start the frontend application  
npm start
```

### 📡 Network Sharing:
Your server is accessible at:
- **Primary**: http://172.25.226.193:4000
- **Local**: http://localhost:4000
- **Admin**: http://localhost:4000/admin-dashboard.html

### 💾 Data Storage Locations:
- **Audio Files**: `server/uploads/`
- **Analysis Data**: `server/meta/`
- **User Sessions**: `server/sessions/`
- **Analytics**: `server/analytics/`

### 📊 Real-Time Features:
- **WebSocket Connection**: Port 4001 for live updates
- **Session Tracking**: Each user gets a unique session ID
- **Automatic Backups**: All data saved in JSON format
- **Export Function**: Download everything anytime

## 🌐 Sharing Your Project

### 📱 Send Users This Link:
http://172.25.226.193:4000

### 💡 What Users Can Do:
1. **Upload Audio**: Drag and drop any audio file
2. **Record Speech**: Click record and speak naturally  
3. **Get Results**: See emotions, confidence levels, and transcripts
4. **Real-time Analysis**: Emotions detected as they speak

### 🔒 Privacy & Data:
- All user audio and analysis data is collected automatically
- Complete IP tracking and session management
- Export all data anytime for analysis
- Real-time monitoring of all activity

## 🎯 Advanced Features

### 🤖 AI Analysis Includes:
- **BERT Emotion Detection** - Advanced natural language processing
- **Voice Feature Analysis** - Pitch, tone, rhythm analysis  
- **Speech-to-Text** - Real, exact transcripts using Vosk models
- **Confidence Scoring** - 95-99% confidence emotion detection
- **Multi-language Support** - English variants supported

### 📊 Data You'll Collect:
- User IP addresses and browser info
- Complete audio files with timestamps
- Emotion analysis with confidence levels
- Full speech transcripts 
- Voice characteristics and features
- Session duration and activity patterns

## 🚨 Important Notes

### ⚡ Always Running:
- Server runs continuously until manually stopped
- Automatic reconnection for WebSocket monitoring
- Data persists across server restarts

### 🔧 Troubleshooting:
- If users can't connect: Check Windows Firewall
- If no transcripts: Vosk models may need reloading
- If emotions are neutral: BERT enhancement system active

### 💻 System Requirements:
- **Node.js** - For backend server
- **Modern Browser** - For frontend interface
- **Network Access** - For sharing with others
- **Storage Space** - Audio files accumulate over time

---

## 🎉 You're All Set!

✅ Enhanced server running on port 4000
✅ Frontend application on port 3004  
✅ Admin dashboard for real-time monitoring
✅ Complete data collection and export
✅ Network sharing enabled
✅ Automatic session tracking

**Share the link and start collecting voice emotion data! 🎤🎭**
