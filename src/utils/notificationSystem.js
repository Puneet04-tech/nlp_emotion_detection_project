// 📧 Email Notification System for Data Collection
// Get notified when friends use your voice emotion system

class EmailNotificationSystem {
  constructor() {
    this.emailJSConfig = {
      serviceID: 'gmail', // or your email service
      templateID: 'voice_data_template',
      userID: 'your_emailjs_user_id'
    };
    
    this.notificationSettings = {
      enabled: true,
      frequency: 'immediate', // 'immediate', 'hourly', 'daily'
      includeAudioData: false, // Set to true if you want audio files in email
      maxEmailsPerHour: 10 // Prevent spam
    };
  }

  // Send email notification when new voice data arrives
  async sendDataNotification(voiceData) {
    if (!this.notificationSettings.enabled) return;

    const emailData = {
      to_email: 'your-email@gmail.com',
      subject: `🎙️ New Voice Data: ${voiceData.emotion} (${voiceData.confidence}%)`,
      message: this.formatEmailMessage(voiceData),
      timestamp: new Date().toLocaleString(),
      user_info: voiceData.userInfo,
      emotion: voiceData.emotion,
      confidence: voiceData.confidence,
      transcript: voiceData.transcript
    };

    try {
      // Send via EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: this.emailJSConfig.serviceID,
          template_id: this.emailJSConfig.templateID,
          user_id: this.emailJSConfig.userID,
          template_params: emailData
        })
      });

      if (response.ok) {
        console.log('📧 Email notification sent successfully');
        return { success: true };
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('❌ Email notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  formatEmailMessage(data) {
    return `
🎙️ NEW VOICE EMOTION DATA RECEIVED

👤 User Information:
- Location: ${data.userInfo?.location || 'Unknown'}
- Device: ${data.userInfo?.device || 'Unknown'}
- Browser: ${data.userInfo?.browser || 'Unknown'}

🎭 Analysis Results:
- Detected Emotion: ${data.emotion}
- Confidence Level: ${data.confidence}%
- Transcript: "${data.transcript}"

⏰ Timestamp: ${data.timestamp}
🌐 Source: ${data.source}

📊 View Real-time Dashboard:
https://nlp-emotion-detection-project.onrender.com/admin

📥 Download All Data:
https://nlp-emotion-detection-project.onrender.com/api/data/export

This data has been automatically saved to your cloud server.
No action required - just thought you'd like to know! 😊
    `;
  }
}

// 🔔 Discord Webhook Notification System
class DiscordNotificationSystem {
  constructor() {
    this.webhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
    this.enabled = false; // Set to true after configuring webhook
  }

  async sendDiscordNotification(voiceData) {
    if (!this.enabled || !this.webhookUrl.includes('discord.com')) return;

    const discordEmbed = {
      title: '🎙️ New Voice Data Collected',
      color: 0x00ff00, // Green color
      fields: [
        {
          name: '🎭 Detected Emotion',
          value: `${voiceData.emotion} (${voiceData.confidence}% confidence)`,
          inline: true
        },
        {
          name: '📝 Transcript',
          value: voiceData.transcript || 'No transcript available',
          inline: false
        },
        {
          name: '👤 User Info',
          value: `${voiceData.userInfo?.location || 'Unknown location'}\n${voiceData.userInfo?.device || 'Unknown device'}`,
          inline: true
        },
        {
          name: '🔗 Quick Actions',
          value: '[View Dashboard](https://nlp-emotion-detection-project.onrender.com/admin) | [Download Data](https://nlp-emotion-detection-project.onrender.com/api/data/export)',
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Voice Emotion Detection System'
      }
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          embeds: [discordEmbed]
        })
      });

      if (response.ok) {
        console.log('📱 Discord notification sent');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Discord notification failed:', error);
    }
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EmailNotificationSystem, DiscordNotificationSystem };
}

/* 
🔧 SETUP INSTRUCTIONS:

1. 📧 Email Notifications (EmailJS):
   - Go to https://emailjs.com
   - Create free account
   - Set up email template
   - Update emailJSConfig above

2. 📱 Discord Notifications:
   - Create Discord server webhook
   - Update webhookUrl above
   - Set enabled = true

3. 🎯 Integration:
   - This system works with your Render server
   - Notifications sent automatically when data arrives
   - Works 24/7 even when laptop is off

✅ BENEFITS:
- Instant notifications when friends use system
- No laptop required for notifications
- Rich formatting with user details
- Quick access links to dashboard/data
*/
