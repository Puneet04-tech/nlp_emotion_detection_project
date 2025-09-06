// Netlify Model Deployment Utility
class NetlifyModelDeployer {
  constructor(netlifyUrl = null) {
    this.netlifyUrl = netlifyUrl || 'https://your-app.netlify.app'; // Replace with your actual Netlify URL
    this.modelEndpoint = '/.netlify/functions/voice-model';
    this.trainingEndpoint = '/.netlify/functions/training-data';
  }

  // Send your trained model data to Netlify
  async deployModel(trainingData, modelWeights, userCalibration, sessionStats) {
    try {
      console.log('🚀 Deploying model to Netlify...');

      const modelPayload = {
        type: 'model_deployment',
        timestamp: new Date().toISOString(),
        trainingData,
        modelWeights,
        userCalibration,
        sessionStats,
        metadata: {
          version: this.generateVersion(),
          totalSamples: this.calculateTotalSamples(trainingData),
          averageAccuracy: sessionStats?.averageAccuracy || 0,
          deployedBy: navigator.userAgent || 'Unknown',
          supportedEmotions: Object.keys(trainingData || {}),
        }
      };

      const response = await fetch(`${this.netlifyUrl}${this.trainingEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Model deployed successfully:', result);
        return {
          success: true,
          deploymentId: result.id,
          message: 'Your trained model has been deployed to Netlify!',
          publicUrl: `${this.netlifyUrl}${this.modelEndpoint}`,
          result
        };
      } else {
        throw new Error(`Deployment failed: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Model deployment failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to deploy model to Netlify'
      };
    }
  }

  // Download model from Netlify
  async downloadModel() {
    try {
      console.log('📥 Downloading model from Netlify...');

      const response = await fetch(`${this.netlifyUrl}${this.modelEndpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const modelData = await response.json();
        console.log('✅ Model downloaded successfully:', modelData);
        return {
          success: true,
          model: modelData.model,
          metadata: modelData.model?.metadata,
          usage: modelData.usage,
          message: 'Model downloaded from Netlify successfully!'
        };
      } else {
        throw new Error(`Download failed: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Model download failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to download model from Netlify'
      };
    }
  }

  // Send training sample to Netlify
  async sendTrainingSample(emotion, voiceFeatures, transcript, confidence) {
    try {
      const samplePayload = {
        emotion,
        voiceFeatures,
        transcript,
        confidence,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent || 'Unknown'
      };

      const response = await fetch(`${this.netlifyUrl}${this.trainingEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplePayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Training sample sent:', result);
        return {
          success: true,
          contribution: result.contribution,
          result
        };
      } else {
        throw new Error(`Failed to send sample: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to send training sample:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate version number
  generateVersion() {
    const date = new Date();
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}${date.getMinutes()}`;
  }

  // Calculate total samples
  calculateTotalSamples(trainingData) {
    if (!trainingData) return 0;
    return Object.values(trainingData).reduce((total, emotionSamples) => {
      return total + (Array.isArray(emotionSamples) ? emotionSamples.length : 0);
    }, 0);
  }

  // Set Netlify URL
  setNetlifyUrl(url) {
    this.netlifyUrl = url;
  }

  // Get deployment status
  getDeploymentInfo() {
    return {
      netlifyUrl: this.netlifyUrl,
      modelEndpoint: `${this.netlifyUrl}${this.modelEndpoint}`,
      trainingEndpoint: `${this.netlifyUrl}${this.trainingEndpoint}`,
      status: 'Ready for deployment'
    };
  }
}

// Export for use in other modules
export default NetlifyModelDeployer;

// Also make available globally
window.NetlifyModelDeployer = NetlifyModelDeployer;
