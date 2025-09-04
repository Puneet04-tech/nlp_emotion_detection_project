# 🔒 Chrome Security Fix for Voice Emotion Detection

## ⚠️ Chrome "Not Secure" Warning Solution

When you see "Not secure" warning in Chrome, here's how to access the site:

### 🎯 **Method 1: Force Chrome to Load (Recommended)**
1. **Click on the address bar** where it says "Not secure"
2. **Look for "Advanced" button** and click it
3. **Click "Proceed to 172.25.226.193 (unsafe)"**
4. The site will load normally

### 🎯 **Method 2: Use Different Browser**
- **Firefox**: Usually allows HTTP connections more easily
- **Edge**: Similar to Chrome but sometimes more permissive
- **Mobile browsers**: Often work better with HTTP

### 🎯 **Method 3: Local Access (Always Works)**
- **On your laptop**: Use `http://localhost:4000`
- **Share this**: Tell users to visit `http://localhost:4000` if they're on your network

## 🌐 **Network Sharing URLs**

### 📱 **Share ANY of these URLs:**
- `http://172.25.226.193:4000` (Main URL)
- `http://localhost:4000` (If on your network)

### 🎯 **What Users See:**
- Landing page with access to the voice emotion system
- Direct links to admin dashboard
- Mobile-friendly interface

## 🚀 **Making Server Run Always (Permanent)**

### 🔧 **Option 1: Windows Service (Professional)**
Create a batch file to run as Windows service:

1. Create `start-server.bat`:
```batch
@echo off
cd /d "D:\nlp_emotion_detection_project"
node server/enhanced-server.js
pause
```

2. Use NSSM (Non-Sucking Service Manager):
   - Download NSSM
   - Install as Windows service
   - Server runs even when you close everything

### 🔧 **Option 2: PowerShell Background (Simple)**
```powershell
# Run this in PowerShell to start server in background
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server/enhanced-server.js" -WorkingDirectory "D:\nlp_emotion_detection_project"
```

### 🔧 **Option 3: Keep Terminal Open (Easiest)**
- **Never close** the terminal running the server
- **Minimize** the window instead of closing
- Server stays active as long as terminal is open

## 🎯 **Recommended Setup for Always Running:**

### 📋 **Step 1: Create Startup Script**
