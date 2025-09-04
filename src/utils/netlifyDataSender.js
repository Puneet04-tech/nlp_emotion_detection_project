// Netlify Data Sender - Sends all user data to your laptop
// This works even when your project is deployed on Netlify

class NetlifyDataSender {
  constructor() {
    // Your deployed server endpoints (will be updated after deployment)
    this.serverEndpoints = [
      'https://your-app-name.onrender.com/api/netlify-data',     // Render
      'https://your-app-name.up.railway.app/api/netlify-data',  // Railway  
      'https://your-app-name.herokuapp.com/api/netlify-data',   // Heroku
      'https://your-app-name.vercel.app/api/netlify-data'       // Vercel
    ];
    
    // Backup methods
    this.discordWebhook = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
    this.emailEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    
    this.isNetlifyDeployment = window.location.hostname.includes('netlify.app');
    
    // Fallback data storage
    this.localData = JSON.parse(localStorage.getItem('voiceEmotionData') || '[]');
    
    console.log('🌐 Netlify Data Sender initialized');
    console.log('🔍 Is Netlify deployment:', this.isNetlifyDeployment);
    console.log('🎯 Server endpoints configured:', this.serverEndpoints.length);
  }

  // Send data to your laptop (multiple methods for reliability)
  async sendToLaptop(data) {
    const timestamp = new Date().toISOString();
    const payload = {
      ...data,
      timestamp,
      source: 'netlify_deployment',
      sessionId: this.getSessionId(),
      userInfo: this.getUserInfo()
    };

    console.log('📤 Sending data to laptop:', payload);

    // Method 1: Try all server endpoints
    for (const endpoint of this.serverEndpoints) {
      try {
        await this.sendToServer(payload, endpoint);
        console.log(`✅ Data sent to server: ${endpoint}`);
        return { success: true, method: 'server', endpoint };
      } catch (error) {
        console.warn(`⚠️ Server ${endpoint} failed:`, error.message);
      }
    }

    // Method 2: Via Discord webhook (backup)
    try {
      await this.sendViaDiscord(payload);
      console.log('✅ Data sent via Discord webhook');
      return { success: true, method: 'discord' };
    } catch (error) {
      console.warn('⚠️ Discord webhook failed:', error.message);
    }

    // Method 3: Email notification (fallback)
    try {
      await this.sendViaEmail(payload);
      console.log('✅ Data sent via email notification');
      return { success: true, method: 'email' };
    } catch (error) {
      console.warn('⚠️ Email notification failed:', error.message);
    }

    // Method 4: Store locally and provide download
    this.storeLocallyForDownload(payload);
    console.log('📱 Data stored locally for manual download');
    return { success: true, method: 'local' };
  }

  // Method 1: Send to deployed server
  async sendToServer(payload, endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'netlify-deployment'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Laptop server responded with ${response.status}`);
    }

    return await response.json();
  }

  // Method 2: Via webhook service (Discord, Slack, Zapier, etc.)
  async sendViaWebhook(payload) {
    // Using Discord webhook as an example (you can change this)
    const webhookPayload = {
      content: '🎤 **New Voice Emotion Data from Netlify!**',
      embeds: [{
        title: '🎭 Emotion Analysis Result',
        color: 5814783, // Blue color
        fields: [
          {
            name: '😊 Detected Emotion',
            value: payload.emotion || 'Unknown',
            inline: true
          },
          {
            name: '🎯 Confidence',
            value: `${payload.confidence || 0}%`,
            inline: true
          },
          {
            name: '📝 Transcript',
            value: payload.transcript ? 
              `\`\`\`${payload.transcript.substring(0, 100)}${payload.transcript.length > 100 ? '...' : ''}\`\`\`` : 
              'No transcript available'
          },
          {
            name: '👤 User Info',
            value: `IP: ${payload.userInfo.ip}\nBrowser: ${payload.userInfo.browser.substring(0, 50)}`,
            inline: false
          },
          {
            name: '⏰ Timestamp',
            value: payload.timestamp,
            inline: true
          }
        ],
        footer: {
          text: 'Voice Emotion Detection System'
        }
      }]
    };

    if (this.webhookUrl && this.webhookUrl !== 'https://YOUR_WEBHOOK_URL') {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}`);
      }
    } else {
      throw new Error('Webhook URL not configured');
    }
  }

  // Method 3: Email notification (using EmailJS or similar)
  async sendViaEmail(payload) {
    // This requires EmailJS setup (free service)
    if (typeof emailjs !== 'undefined') {
      const emailData = {
        to_email: 'your-email@gmail.com', // Your email
        subject: '🎤 New Voice Emotion Data from Netlify',
        message: `
New voice emotion analysis result:

🎭 Emotion: ${payload.emotion || 'Unknown'}
🎯 Confidence: ${payload.confidence || 0}%
📝 Transcript: ${payload.transcript || 'No transcript'}
👤 User IP: ${payload.userInfo.ip}
🌐 Browser: ${payload.userInfo.browser}
⏰ Time: ${payload.timestamp}

Audio File: ${payload.audioFile ? 'Available for download' : 'No file'}
        `
      };

      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailData);
    } else {
      throw new Error('EmailJS not configured');
    }
  }

  // Method 4: Local storage with download option
  storeLocallyForDownload(payload) {
    this.localData.push(payload);
    localStorage.setItem('voiceEmotionData', JSON.stringify(this.localData));
    
    // Show download notification to user
    this.showDownloadNotification();
  }

  // Helper methods
  getSessionId() {
    let sessionId = sessionStorage.getItem('netlify_session_id');
    if (!sessionId) {
      sessionId = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem('netlify_session_id', sessionId);
    }
    return sessionId;
  }

  getUserInfo() {
    return {
      ip: 'unknown', // Will be detected on server side
      browser: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: {
        width: screen.width,
        height: screen.height
      },
      url: window.location.href,
      referrer: document.referrer
    };
  }

  showDownloadNotification() {
    // Create a notification for manual data download
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
    `;
    
    notification.innerHTML = `
      <strong>📊 Data Collected!</strong><br>
      Voice emotion data saved locally.<br>
      <button onclick="window.netlifyDataSender.downloadAllData()" style="
        background: white; 
        color: #4CAF50; 
        border: none; 
        padding: 5px 10px; 
        border-radius: 5px; 
        cursor: pointer;
        margin-top: 10px;
      ">📥 Download Data</button>
      <button onclick="this.parentElement.remove()" style="
        background: transparent; 
        color: white; 
        border: 1px solid white; 
        padding: 5px 10px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 10px 0 0 10px;
      ">✕ Close</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  downloadAllData() {
    const data = {
      exportTime: new Date().toISOString(),
      source: 'netlify_deployment',
      totalRecords: this.localData.length,
      data: this.localData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netlify-voice-emotion-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📥 Downloaded', this.localData.length, 'records');
  }

  // Configure endpoints (call this with your actual values)
  configure(config) {
    if (config.laptopEndpoint) {
      this.laptopEndpoint = config.laptopEndpoint;
    }
    if (config.webhookUrl) {
      this.webhookUrl = config.webhookUrl;
    }
    console.log('⚙️ Configuration updated:', config);
  }
}

// Global instance
window.netlifyDataSender = new NetlifyDataSender();

export default NetlifyDataSender;
