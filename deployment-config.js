// Update these URLs after deployment
// Replace YOUR_DEPLOYED_SERVER_URL with your actual server URL

// Example for Render:
// https://nlp-emotion-server.onrender.com

// Example for Railway:  
// https://nlp-emotion-server.up.railway.app

const DEPLOYED_SERVER_URL = 'YOUR_DEPLOYED_SERVER_URL';

// Update netlifyDataSender.js
export const serverEndpoints = [
  `${DEPLOYED_SERVER_URL}/api/netlify-data`,
];

// Update VoiceEmotionSystem.jsx  
export const SERVER_CONFIG = {
  baseUrl: DEPLOYED_SERVER_URL,
  endpoints: {
    upload: `${DEPLOYED_SERVER_URL}/api/upload`,
    session: `${DEPLOYED_SERVER_URL}/api/session/start`,
    recording: `${DEPLOYED_SERVER_URL}/api/recording`,
    health: `${DEPLOYED_SERVER_URL}/api/health`,
    export: `${DEPLOYED_SERVER_URL}/api/data/export`
  }
};

console.log('🌐 Server configured:', DEPLOYED_SERVER_URL);
