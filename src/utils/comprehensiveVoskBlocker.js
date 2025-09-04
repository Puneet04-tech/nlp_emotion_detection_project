// Comprehensive Vosk Download Blocker
// This blocks ALL external downloads by vosk-browser more aggressively

class ComprehensiveVoskBlocker {
  constructor() {
    this.originalFetch = null;
    this.originalXMLHttpRequest = null;
    this.blockedRequests = [];
    this.isActive = false;
  }

  activate() {
    if (this.isActive || typeof window === 'undefined') return;
    
    this.originalFetch = window.fetch;
    this.originalXMLHttpRequest = window.XMLHttpRequest;
    
    console.log('🔒 Activating comprehensive Vosk download blocker...');
    
    // Block fetch requests
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      if (this.shouldBlockRequest(url)) {
        console.warn(`🚫 BLOCKED fetch request: ${url}`);
        this.blockedRequests.push({ url, method: 'fetch', timestamp: new Date() });
        
        // Return fake response that will cause graceful failure
        return new Response(null, {
          status: 404,
          statusText: 'Download blocked by system'
        });
      }
      
      return this.originalFetch.call(window, input, init);
    };

    // Block XMLHttpRequest
    const self = this;
    window.XMLHttpRequest = function() {
      const xhr = new self.originalXMLHttpRequest();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url, ...args) {
        if (self.shouldBlockRequest(url)) {
          console.warn(`🚫 BLOCKED XHR request: ${url}`);
          self.blockedRequests.push({ url, method: 'XHR', timestamp: new Date() });
          
          // Override with a URL that will fail
          url = '/blocked-download-attempt';
        }
        return originalOpen.call(this, method, url, ...args);
      };
      
      return xhr;
    };

    // Override WebAssembly to prevent WASM downloads
    if (window.WebAssembly && window.WebAssembly.instantiateStreaming) {
      const originalInstantiateStreaming = window.WebAssembly.instantiateStreaming;
      window.WebAssembly.instantiateStreaming = async (source, importObject) => {
        console.warn('🚫 BLOCKED WebAssembly.instantiateStreaming attempt');
        throw new Error('WebAssembly downloads blocked');
      };
    }

    this.isActive = true;
    console.log('✅ Comprehensive Vosk blocker activated');
  }

  shouldBlockRequest(url) {
    if (!url) return false;
    
    const blockPatterns = [
      'tar.gz',
      'vosk-model',
      'models.tar',
      'download',
      '.wasm',
      'vosk-browser/dist',
      'alphacephei',
      'kaldi',
      'vosk.js',
      'vosk-model-small-en-us',
      'vosk-model-small-hi'
    ];
    
    const urlLower = url.toLowerCase();
    return blockPatterns.some(pattern => urlLower.includes(pattern)) && 
           !urlLower.includes(window.location.origin) &&
           !urlLower.includes('localhost');
  }

  deactivate() {
    if (!this.isActive) return;
    
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXMLHttpRequest;
    this.isActive = false;
    console.log('🔓 Vosk blocker deactivated');
  }

  getBlockedRequests() {
    return this.blockedRequests;
  }
}

// Create and conditionally activate the blocker
export const comprehensiveVoskBlocker = new ComprehensiveVoskBlocker();

// Only activate if we're in a browser environment
if (typeof window !== 'undefined') {
  comprehensiveVoskBlocker.activate();
}

// Export a function to get blocked requests
export const getBlockedRequests = () => comprehensiveVoskBlocker.getBlockedRequests();
