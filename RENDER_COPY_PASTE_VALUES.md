# ═══════════════════════════════════════════════════════════════
# 🚀 RENDER DEPLOYMENT - COPY & PASTE VALUES
# ═══════════════════════════════════════════════════════════════

## 📋 EXACT VALUES TO ENTER IN RENDER FORM:

### Repository Settings:
Repository: nlp_emotion_detection_project
Branch: main

### Service Configuration:
Name: nlp-emotion-server
Environment: Node  
Build Command: npm install
Start Command: node server/enhanced-server.js

### Environment Variables (Click "Add Environment Variable" for each):

Variable 1:
NAME_OF_VARIABLE: NODE_ENV
value: production

Variable 2:  
NAME_OF_VARIABLE: PORT
value: 10000

Variable 3:
NAME_OF_VARIABLE: WS_PORT  
value: 10001

### Plan:
Instance Type: Free

═══════════════════════════════════════════════════════════════

## ✅ DEPLOYMENT CHECKLIST:

□ Connected GitHub repo: nlp_emotion_detection_project
□ Set Environment to: Node
□ Set Build Command to: npm install  
□ Set Start Command to: node server/enhanced-server.js
□ Added NODE_ENV = production
□ Added PORT = 10000
□ Added WS_PORT = 10001
□ Selected Free plan
□ Clicked "Deploy Web Service"

═══════════════════════════════════════════════════════════════

## 🎯 AFTER DEPLOYMENT:

Your server will be available at:
https://nlp-emotion-server.onrender.com

Test it by visiting:
https://nlp-emotion-server.onrender.com/api/health

Expected response:
{"status":"healthy","timestamp":"2024-01-20T..."}

═══════════════════════════════════════════════════════════════
