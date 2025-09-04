// ⚡ STEP-BY-STEP CODE UPDATES AFTER RENDER DEPLOYMENT
// Copy and paste these exact changes into your files

// ==================================================================
// 1. UPDATE NETLIFY DATA SENDER (src/utils/netlifyDataSender.js)
// ==================================================================

// FIND THIS LINE (around line 8):
// this.serverEndpoints = [

// REPLACE THE ENTIRE ARRAY WITH:
this.serverEndpoints = [
  'https://YOUR_RENDER_URL_HERE.onrender.com/api/netlify-data'
];

// Example (replace with your actual URL):
// this.serverEndpoints = [
//   'https://nlp-emotion-server-abc123.onrender.com/api/netlify-data'
// ];

// ==================================================================
// 2. UPDATE VOICE EMOTION SYSTEM (src/components/VoiceEmotionSystem.jsx)
// ==================================================================

// FIND THIS LINE (around line 15-20):
// const SERVER_URL = 

// REPLACE WITH:
const SERVER_URL = 'https://YOUR_RENDER_URL_HERE.onrender.com';

// Example:
// const SERVER_URL = 'https://nlp-emotion-server-abc123.onrender.com';

// ==================================================================
// 3. CREATE ENVIRONMENT CONFIG FILE
// ==================================================================

// CREATE NEW FILE: src/config/serverConfig.js
export const SERVER_CONFIG = {
  // Replace with your actual Render URL after deployment
  baseUrl: 'https://YOUR_RENDER_URL_HERE.onrender.com',
  
  endpoints: {
    health: '/api/health',
    netlifyData: '/api/netlify-data',
    upload: '/api/upload',
    recording: '/api/recording',
    session: '/api/session/start',
    export: '/api/data/export',
    admin: '/admin'
  },
  
  // Full endpoint URLs
  getFullUrl: function(endpoint) {
    return this.baseUrl + this.endpoints[endpoint];
  }
};

// Example usage:
// import { SERVER_CONFIG } from '../config/serverConfig.js';
// const healthUrl = SERVER_CONFIG.getFullUrl('health');

// ==================================================================
// 4. TEST COMMANDS TO RUN IN TERMINAL
// ==================================================================

// After updating the URLs, test locally:
// npm run dev

// Then test your deployed server:
// Open browser and visit:
// https://your-render-url.onrender.com/api/health

// ==================================================================
// 5. FINAL DEPLOYMENT COMMANDS
// ==================================================================

// Commit your changes:
// git add .
// git commit -m "Update server URLs for Render deployment"
// git push

// If you have Netlify frontend, redeploy it to pick up new server URLs

console.log('🚀 Configuration ready for Render deployment!');
