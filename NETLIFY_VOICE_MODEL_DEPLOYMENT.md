# 🌐 Netlify Deployment Guide for Voice Emotion Model

This guide explains how to deploy your trained voice emotion detection model to Netlify for global sharing.

## 🚀 Quick Start

### 1. Deploy to Netlify

1. **Fork or Clone** this repository to your GitHub account
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Deploy settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Get Your Netlify URL**:
   - After deployment, copy your Netlify URL (e.g., `https://your-app.netlify.app`)

### 2. Configure in Training Center

1. **Open Training Center** in your local app
2. **Find Netlify Section** (orange deployment box)
3. **Enter your Netlify URL** in the input field
4. **Save URL** by clicking the 💾 Save button

### 3. Deploy Your Model

1. **Train your model** with voice samples
2. **Click "🚀 Deploy Model"** to upload your trained model to Netlify
3. **Share the public API** using the "🔗 View Public API" button

## 📡 API Endpoints

Once deployed, your Netlify app provides these endpoints:

### Get Trained Model
```bash
GET https://your-app.netlify.app/.netlify/functions/voice-model
```

**Response:**
```json
{
  "success": true,
  "model": {
    "modelWeights": { /* emotion weights */ },
    "emotionThresholds": { /* detection thresholds */ },
    "metadata": {
      "version": "2025.1.6.1234",
      "accuracy": 87,
      "totalSamples": 150,
      "supportedEmotions": ["happy", "sad", "angry", ...]
    }
  },
  "usage": {
    "instructions": "Import this model data into your voice emotion analyzer"
  }
}
```

### Send Training Data
```bash
POST https://your-app.netlify.app/.netlify/functions/training-data
```

**Payload:**
```json
{
  "emotion": "happy",
  "voiceFeatures": {
    "pitch": 180,
    "volume": 65,
    "spectralCentroid": 2200
  },
  "transcript": "I'm feeling great today!",
  "confidence": 0.92
}
```

## 🔧 Integration Examples

### JavaScript Integration
```javascript
// Download model from Netlify
const response = await fetch('https://your-app.netlify.app/.netlify/functions/voice-model');
const { model } = await response.json();

// Use the model weights in your analyzer
analyzer.setModelWeights(model.modelWeights);
```

### Python Integration
```python
import requests

# Get model from Netlify
response = requests.get('https://your-app.netlify.app/.netlify/functions/voice-model')
model_data = response.json()['model']

print(f"Model accuracy: {model_data['metadata']['accuracy']}%")
```

## 🛡️ Privacy & Security

- **No Audio Storage**: Only voice features are transmitted, not raw audio
- **Anonymous**: No personal identification required
- **Open Source**: Model weights are publicly accessible
- **Contribution-Based**: Community-driven model improvement

## 🎯 Use Cases

1. **Research Projects**: Share models for academic research
2. **Open Source**: Contribute to community voice emotion detection
3. **Integration**: Use pre-trained models in other applications
4. **Collaboration**: Team-based model development

## 📊 Model Performance

- **Supported Emotions**: 12 emotions (happy, sad, angry, excited, calm, nervous, confident, surprised, neutral, frustrated, fear, joy)
- **Expected Accuracy**: 85-90% for general voice patterns
- **Real-time Processing**: Browser-based, no server required
- **Multi-language**: Works with various languages

## 🚀 Advanced Features

### Environment Variables
Set these in Netlify dashboard → Site settings → Environment variables:

```bash
TRAINING_SERVER_URL=https://your-training-server.herokuapp.com
NODE_VERSION=18
```

### Custom Domain
1. Go to Netlify dashboard → Domain settings
2. Add custom domain (e.g., `voice-emotion.yoursite.com`)
3. Update Training Center with new URL

## 🔄 Continuous Deployment

Every push to your main branch automatically:
1. Builds the latest app version
2. Updates the deployed model API
3. Maintains backward compatibility

## 📱 Sharing Your Model

Once deployed, share your model by providing:

1. **API URL**: `https://your-app.netlify.app/.netlify/functions/voice-model`
2. **Web App**: `https://your-app.netlify.app`
3. **Integration Code**: See examples above

## 🆘 Troubleshooting

### Common Issues

1. **Build Failed**: Check `npm run build` works locally
2. **Function Error**: Verify Netlify functions are in `/netlify/functions/`
3. **CORS Issues**: Functions include CORS headers automatically
4. **URL Not Set**: Ensure Netlify URL is saved in Training Center

### Debug Steps

1. Check Netlify deploy logs
2. Test API endpoints directly
3. Verify model data exists locally
4. Check browser console for errors

## 📞 Support

- **GitHub Issues**: Report bugs or feature requests
- **Netlify Docs**: [netlify.com/docs](https://docs.netlify.com)
- **Community**: Share experiences with other users

---

🎉 **Start sharing your voice emotion models with the world!**
