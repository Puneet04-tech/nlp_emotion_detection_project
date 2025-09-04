# 🚀 Render Deployment Guide - Step by Step

## Step 1: Repository Setup
✅ Repository: nlp_emotion_detection_project
✅ Owner: Puneet04-tech  
✅ Branch: main

## Step 2: Service Configuration

### Basic Info:
- **Name:** nlp-emotion-server
- **Environment:** Node
- **Region:** Oregon (US West) or closest to you
- **Branch:** main
- **Build Command:** npm install
- **Start Command:** node server/enhanced-server.js

### Environment Variables:
Click "Add Environment Variable" for each:

1. **NODE_ENV**
   Value: production

2. **PORT** 
   Value: 10000

3. **WS_PORT**
   Value: 10001

## Step 3: Advanced Settings (Optional)
- **Instance Type:** Free
- **Auto-Deploy:** Yes (recommended)
- **Health Check Path:** /api/health

## Step 4: Deploy
Click "Deploy Web Service" and wait for deployment to complete.

## Step 5: Your Server URL
After deployment, you'll get a URL like:
https://nlp-emotion-server.onrender.com

## Step 6: Test Your Deployment
Visit: https://your-app-name.onrender.com/api/health
Should return: {"status":"healthy","timestamp":"..."}

## Step 7: Update Frontend Configuration
Replace the server URLs in your netlifyDataSender.js with your new Render URL.

## 🎯 Endpoints Available:
- POST /api/netlify-data (receives user data)
- GET /api/health (health check)
- GET /api/data/export (download all data)
- GET /admin (real-time dashboard)

## 🔧 Troubleshooting:
- Check logs in Render dashboard
- Ensure all environment variables are set
- Verify the start command points to correct file
