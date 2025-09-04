// Discord Webhook Setup for Voice Emotion Data Collection
// Use this to receive notifications from your Netlify deployment

class DiscordDataCollector {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.rateLimitDelay = 2000; // 2 seconds between messages
    this.lastSentTime = 0;
  }

  async sendEmotionData(data) {
    const currentTime = Date.now();
    
    // Rate limiting to avoid Discord spam
    if (currentTime - this.lastSentTime < this.rateLimitDelay) {
      console.log('🚫 Rate limited - skipping Discord notification');
      return false;
    }

    try {
      const embed = {
        title: '🎤 Voice Emotion Detection Result',
        color: this.getColorForEmotion(data.emotion),
        fields: [
          {
            name: '🎭 Detected Emotion',
            value: data.emotion || 'Unknown',
            inline: true
          },
          {
            name: '🎯 Confidence',
            value: `${data.confidence || 0}%`,
            inline: true
          },
          {
            name: '📍 Source',
            value: data.type === 'file_upload' ? '📤 File Upload' : '🎙️ Live Recording',
            inline: true
          },
          {
            name: '📝 Transcript Preview',
            value: data.transcript ? 
              '```' + data.transcript.substring(0, 200) + (data.transcript.length > 200 ? '...' : '') + '```' :
              'No transcript available'
          },
          {
            name: '👤 User Information',
            value: `**Browser:** ${data.userInfo?.browser?.substring(0, 50) || 'Unknown'}\n**Platform:** ${data.userInfo?.platform || 'Unknown'}\n**Language:** ${data.userInfo?.language || 'Unknown'}`,
            inline: false
          },
          {
            name: '⏰ Timestamp',
            value: new Date(data.timestamp).toLocaleString(),
            inline: true
          }
        ],
        footer: {
          text: `Session: ${data.sessionId || 'Unknown'} | Netlify Deployment`,
          icon_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3a4.png'
        },
        timestamp: new Date().toISOString()
      };

      // Add audio file info if available
      if (data.audioMetadata) {
        embed.fields.push({
          name: '🎵 Audio File',
          value: `**Name:** ${data.audioMetadata.name}\n**Size:** ${(data.audioMetadata.size / 1024 / 1024).toFixed(2)} MB\n**Type:** ${data.audioMetadata.type}`,
          inline: true
        });
      }

      const payload = {
        username: 'Voice Emotion Bot',
        avatar_url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f916.png',
        content: this.getMessageForEmotion(data.emotion),
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.lastSentTime = currentTime;
        console.log('✅ Discord notification sent successfully');
        return true;
      } else {
        console.error('❌ Discord webhook failed:', response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ Discord notification error:', error);
      return false;
    }
  }

  getColorForEmotion(emotion) {
    const colors = {
      happy: 0x00ff00,      // Green
      sad: 0x0099ff,        // Blue
      angry: 0xff0000,      // Red
      fear: 0x800080,       // Purple
      surprise: 0xffff00,   // Yellow
      disgust: 0x8B4513,    // Brown
      neutral: 0x808080,    // Gray
      excited: 0xff69b4,    // Hot Pink
      calm: 0x87ceeb,       // Sky Blue
      anxious: 0xffa500     // Orange
    };
    return colors[emotion?.toLowerCase()] || 0x5865f2; // Discord blue as default
  }

  getMessageForEmotion(emotion) {
    const messages = {
      happy: '😊 Someone is feeling happy!',
      sad: '😢 Detected sadness in voice',
      angry: '😠 Anger detected in speech',
      fear: '😨 Fear emotion identified',
      surprise: '😲 Surprise detected!',
      disgust: '🤢 Disgust emotion found',
      neutral: '😐 Neutral emotion detected',
      excited: '🤩 High excitement level!',
      calm: '😌 Calm and peaceful emotion',
      anxious: '😰 Anxiety detected in voice'
    };
    return messages[emotion?.toLowerCase()] || '🎭 New emotion analysis result';
  }
}

// Example usage and setup instructions
console.log(`
🎯 Discord Webhook Setup Instructions:

1. Create a Discord server (or use existing)
2. Go to Server Settings → Integrations → Webhooks
3. Click "Create Webhook"
4. Copy the webhook URL
5. Use this code in your Netlify deployment:

// In your Netlify site console:
window.netlifyDataSender.configure({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE'
});

💡 Test webhook:
const collector = new DiscordDataCollector('YOUR_WEBHOOK_URL');
collector.sendEmotionData({
  emotion: 'happy',
  confidence: 95,
  transcript: 'This is a test message',
  type: 'file_upload',
  timestamp: new Date().toISOString(),
  sessionId: 'test-session',
  userInfo: { browser: 'Test Browser', platform: 'Test Platform' }
});
`);

// Export for use in Netlify data sender
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiscordDataCollector;
} else if (typeof window !== 'undefined') {
  window.DiscordDataCollector = DiscordDataCollector;
}
