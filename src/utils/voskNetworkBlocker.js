// Network Request Interceptor to Block Vosk Downloads
// This prevents vosk-browser from making any external requests

class VoskNetworkBlocker {
  constructor() {
    this.originalFetch = window.fetch;
    this.blockedRequests = [];
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Override fetch to block vosk-related downloads
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      // Block any requests that look like vosk model downloads
      if (this.shouldBlockRequest(url)) {
        console.warn(`🚫 BLOCKED Vosk download attempt: ${url}`);
        this.blockedRequests.push({ url, timestamp: new Date().toISOString() });
        
        // Return a fake response to prevent errors
        return new Response(JSON.stringify({ error: 'External downloads disabled' }), {
          status: 403,
          statusText: 'Forbidden - External downloads disabled',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Allow other requests
      return this.originalFetch.call(window, input, init);
    };

    // Also override XMLHttpRequest for older code
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (this.shouldBlockRequest && this.shouldBlockRequest(url)) {
        console.warn(`🚫 BLOCKED XHR Vosk download attempt: ${url}`);
        // Override with a local URL that will fail gracefully
        url = '/models/blocked-external-request';
      }
      return originalXHROpen.call(this, method, url, ...args);
    };
  }

  shouldBlockRequest(url) {
    if (!url) return false;
    
    const blockPatterns = [
      'alphacephei.com',
      'vosk/models',
      '.tar.gz',
      'downloaded.tar.gz',
      '_models_vosk_model',
      '/vosk/_models',
      'vosk-model-small-en-us-0.15.tar.gz',
      'github.com/alphacep/vosk-api'
    ];
    
    return blockPatterns.some(pattern => url.includes(pattern));
  }

  getBlockedRequests() {
    return this.blockedRequests;
  }

  restore() {
    window.fetch = this.originalFetch;
  }
}

// Initialize the blocker immediately
export const voskNetworkBlocker = new VoskNetworkBlocker();

// Also export a function to check if any requests were blocked
export const getBlockedVoskRequests = () => voskNetworkBlocker.getBlockedRequests();
