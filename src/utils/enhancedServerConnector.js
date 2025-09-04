// Enhanced Server Connector - Connects frontend to backend server
// This handles all communication between the frontend and your enhanced server

class EnhancedServerConnector {
  constructor() {
    this.serverUrl = 'http://localhost:4000'; // Default server URL
    this.wsUrl = 'ws://localhost:4001'; // WebSocket URL
    this.sessionId = null;
    this.ws = null;
    this.isConnected = false;
    
    this.init();
  }

  async init() {
    try {
      // Start a new session
      await this.startSession();
      
      // Connect to WebSocket for real-time updates
      this.connectWebSocket();
      
      console.log('✅ Enhanced server connector initialized');
    } catch (error) {
      console.warn('⚠️ Enhanced server not available:', error.message);
      console.log('💡 Running in offline mode');
    }
  }

  async startSession() {
    try {
      const response = await fetch(`${this.serverUrl}/api/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId;
        this.isConnected = true;
        
        console.log(`🆕 Session started: ${this.sessionId}`);
        console.log('🌐 Server info:', data.serverInfo);
        
        return data;
      } else {
        throw new Error(`Session start failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Session start failed:', error);
      throw error;
    }
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket connected to enhanced server');
        
        // Identify as a regular client (not admin)
        this.ws.send(JSON.stringify({
          type: 'client_connect',
          sessionId: this.sessionId
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message.type);
        } catch (err) {
          console.warn('WebSocket message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.isConnected) {
            console.log('🔄 Attempting WebSocket reconnection...');
            this.connectWebSocket();
          }
        }, 5000);
      };

      this.ws.onerror = (error) => {
        console.warn('❌ WebSocket error:', error);
      };

    } catch (error) {
      console.warn('WebSocket connection failed:', error);
    }
  }

  // Upload audio file with complete metadata
  async uploadAudioFile(file, analysisData) {
    if (!this.isConnected) {
      console.log('⚠️ Server not connected - analysis only');
      return { success: true, offline: true };
    }

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('sessionId', this.sessionId);
      
      // Add all analysis data
      if (analysisData.emotion) {
        formData.append('emotion', analysisData.emotion);
      }
      if (analysisData.transcript) {
        formData.append('transcript', analysisData.transcript);
      }
      if (analysisData.confidence) {
        formData.append('confidence', analysisData.confidence.toString());
      }
      if (analysisData.features) {
        formData.append('features', JSON.stringify(analysisData.features));
      }
      if (analysisData.voiceFeatures) {
        formData.append('voiceFeatures', JSON.stringify(analysisData.voiceFeatures));
      }
      if (analysisData.bertAnalysis) {
        formData.append('bertAnalysis', JSON.stringify(analysisData.bertAnalysis));
      }
      if (analysisData.processingTime) {
        formData.append('processingTime', analysisData.processingTime.toString());
      }
      if (analysisData.audioMetadata) {
        formData.append('audioMetadata', JSON.stringify(analysisData.audioMetadata));
      }

      const response = await fetch(`${this.serverUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📤 File uploaded to server: ${result.id}`);
        return result;
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }

    } catch (error) {
      console.warn('❌ Upload to server failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send recording data
  async sendRecording(recordingData) {
    if (!this.isConnected) {
      console.log('⚠️ Server not connected - recording analysis only');
      return { success: true, offline: true };
    }

    try {
      const payload = {
        sessionId: this.sessionId,
        ...recordingData,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.serverUrl}/api/recording`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`🎙️ Recording sent to server: ${result.id}`);
        return result;
      } else {
        throw new Error(`Recording upload failed: ${response.status}`);
      }

    } catch (error) {
      console.warn('❌ Recording upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check server health
  async checkHealth() {
    try {
      const response = await fetch(`${this.serverUrl}/api/health`);
      if (response.ok) {
        const health = await response.json();
        return health;
      }
    } catch (error) {
      console.warn('Health check failed:', error);
    }
    return null;
  }

  // Disconnect
  disconnect() {
    this.isConnected = false;
    if (this.ws) {
      this.ws.close();
    }
    console.log('🔌 Disconnected from enhanced server');
  }
}

// Create global instance
window.enhancedServerConnector = new EnhancedServerConnector();

export default EnhancedServerConnector;
