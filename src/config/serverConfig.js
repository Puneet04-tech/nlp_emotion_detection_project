// Server Configuration for Render Deployment
// Update the baseUrl after your Render deployment completes

export const SERVER_CONFIG = {
  // 🚨 IMPORTANT: Replace this URL after Render deployment
  baseUrl: 'https://YOUR_RENDER_URL_HERE.onrender.com',
  
  // API endpoints
  endpoints: {
    health: '/api/health',
    netlifyData: '/api/netlify-data',
    upload: '/api/upload',
    recording: '/api/recording',
    session: '/api/session/start',
    export: '/api/data/export',
    admin: '/admin',
    analytics: '/api/analytics/live'
  },
  
  // Helper function to get full URLs
  getFullUrl: function(endpoint) {
    if (this.endpoints[endpoint]) {
      return this.baseUrl + this.endpoints[endpoint];
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  },
  
  // Get all endpoint URLs
  getAllUrls: function() {
    const urls = {};
    for (const [key, path] of Object.entries(this.endpoints)) {
      urls[key] = this.baseUrl + path;
    }
    return urls;
  },
  
  // Validate if server URL is configured
  isConfigured: function() {
    return !this.baseUrl.includes('YOUR_RENDER_URL_HERE');
  }
};

// Example usage:
// import { SERVER_CONFIG } from './serverConfig.js';
// const healthUrl = SERVER_CONFIG.getFullUrl('health');
// console.log('Health check:', healthUrl);

export default SERVER_CONFIG;
