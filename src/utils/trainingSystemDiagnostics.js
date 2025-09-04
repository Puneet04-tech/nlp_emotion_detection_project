// Training System Diagnostic and Enhancement
// This file checks and enhances the voice emotion training connections

export class TrainingSystemDiagnostics {
  constructor() {
    this.results = {
      trainingServer: null,
      trainingSamples: null,
      mlModel: null,
      trainingCenter: null,
      voiceEmotionConnection: null
    };
  }

  async checkTrainingServer() {
    try {
      const response = await fetch('http://localhost:4000/status');
      if (response.ok) {
        this.results.trainingServer = {
          status: 'connected',
          message: '✅ Training server is running on port 4000',
          details: await response.json()
        };
      } else {
        this.results.trainingServer = {
          status: 'error',
          message: '❌ Training server responded with error',
          details: response.status
        };
      }
    } catch (error) {
      this.results.trainingServer = {
        status: 'disconnected',
        message: '❌ Training server not running or not accessible',
        details: error.message,
        solution: 'Start training server: cd server && node train-server.js'
      };
    }
  }

  async checkTrainingSamples() {
    try {
      const response = await fetch('http://localhost:4000/samples');
      if (response.ok) {
        const samples = await response.json();
        this.results.trainingSamples = {
          status: 'available',
          message: `✅ Found ${samples.length} training samples`,
          details: samples,
          emotions: [...new Set(samples.map(s => s.emotion))],
          totalSamples: samples.length
        };
      } else {
        this.results.trainingSamples = {
          status: 'error',
          message: '❌ Cannot access training samples',
          details: response.status
        };
      }
    } catch (error) {
      this.results.trainingSamples = {
        status: 'error',
        message: '❌ Training samples check failed',
        details: error.message
      };
    }
  }

  async checkMLModel() {
    try {
      // Check local storage for saved model
      const meta = localStorage.getItem('local-voice-model_meta');
      const modelExists = localStorage.getItem('local-voice-model');
      
      if (meta && modelExists) {
        const parsedMeta = JSON.parse(meta);
        this.results.mlModel = {
          status: 'available',
          message: '✅ ML model found in local storage',
          details: {
            emotions: Object.keys(parsedMeta.labelsMap || {}),
            lastTrained: parsedMeta.lastTrained || 'unknown',
            accuracy: parsedMeta.accuracy || 'unknown',
            samples: parsedMeta.trainingSize || 'unknown'
          }
        };
      } else {
        this.results.mlModel = {
          status: 'missing',
          message: '⚠️ No trained ML model found',
          details: 'Need to train a model in Training Center',
          solution: 'Go to Training tab and collect samples, then train model'
        };
      }
    } catch (error) {
      this.results.mlModel = {
        status: 'error',
        message: '❌ ML model check failed',
        details: error.message
      };
    }
  }

  checkTrainingCenter() {
    // Check if training center component is accessible
    try {
      const trainingTab = document.querySelector('[data-tab="training"]');
      if (trainingTab) {
        this.results.trainingCenter = {
          status: 'accessible',
          message: '✅ Training Center is accessible via Training tab',
          details: 'Click "🎯 Training" tab to access training interface'
        };
      } else {
        this.results.trainingCenter = {
          status: 'not_found',
          message: '❌ Training tab not found in navigation',
          details: 'Training center may not be properly integrated'
        };
      }
    } catch (error) {
      this.results.trainingCenter = {
        status: 'error',
        message: '❌ Training center check failed',
        details: error.message
      };
    }
  }

  checkVoiceEmotionConnection() {
    try {
      // Check if voice emotion analyzer can use ML model
      const mlToggle = document.querySelector('input[type="checkbox"][checked]');
      if (mlToggle) {
        this.results.voiceEmotionConnection = {
          status: 'connected',
          message: '✅ Voice emotion analyzer can use ML model',
          details: 'ML Detection checkbox is available'
        };
      } else {
        this.results.voiceEmotionConnection = {
          status: 'available',
          message: '⚠️ Voice emotion analyzer ready for ML connection',
          details: 'Need to load ML model and enable ML detection'
        };
      }
    } catch (error) {
      this.results.voiceEmotionConnection = {
        status: 'error',
        message: '❌ Voice emotion connection check failed',
        details: error.message
      };
    }
  }

  async runFullDiagnostic() {
    console.log('🔍 Running Training System Diagnostics...');
    
    await this.checkTrainingServer();
    await this.checkTrainingSamples();
    await this.checkMLModel();
    this.checkTrainingCenter();
    this.checkVoiceEmotionConnection();
    
    return this.results;
  }

  generateReport() {
    const report = {
      summary: {
        totalChecks: 5,
        passed: 0,
        warnings: 0,
        errors: 0
      },
      details: this.results,
      recommendations: []
    };

    // Count results
    Object.values(this.results).forEach(result => {
      if (result?.status === 'connected' || result?.status === 'available' || result?.status === 'accessible') {
        report.summary.passed++;
      } else if (result?.status === 'missing' || result?.status === 'not_found') {
        report.summary.warnings++;
      } else {
        report.summary.errors++;
      }
    });

    // Generate recommendations
    if (this.results.trainingServer?.status === 'disconnected') {
      report.recommendations.push({
        priority: 'high',
        action: 'Start Training Server',
        command: 'cd server && node train-server.js',
        description: 'Training server is required for collecting and managing training samples'
      });
    }

    if (this.results.mlModel?.status === 'missing') {
      report.recommendations.push({
        priority: 'medium',
        action: 'Train ML Model',
        steps: [
          '1. Go to Training tab',
          '2. Collect voice samples for different emotions',
          '3. Click "Train Model" button',
          '4. Load trained model in Voice Emotion tab'
        ],
        description: 'ML model will improve emotion detection accuracy'
      });
    }

    if (this.results.trainingSamples?.details?.length < 10) {
      report.recommendations.push({
        priority: 'medium',
        action: 'Collect More Training Samples',
        description: 'More training samples will improve model accuracy. Aim for 20+ samples per emotion.',
        target: '20+ samples per emotion (joy, anger, sadness, fear, surprise, neutral)'
      });
    }

    return report;
  }
}

// Enhanced Training Server Connection
export class TrainingServerConnection {
  constructor(serverUrl = 'http://localhost:4000') {
    this.serverUrl = serverUrl;
    this.isConnected = false;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/status`);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  async uploadTrainingSample(emotion, audioBlob, voiceFeatures, transcript) {
    if (!this.isConnected) {
      await this.testConnection();
    }

    const formData = new FormData();
    formData.append('emotion', emotion);
    formData.append('audio', audioBlob, `${emotion}_${Date.now()}.ogg`);
    formData.append('features', JSON.stringify(voiceFeatures));
    formData.append('transcript', transcript || '');

    try {
      const response = await fetch(`${this.serverUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Training sample uploaded:', result);
        return result;
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Training sample upload failed:', error);
      throw error;
    }
  }

  async getTrainingSamples() {
    try {
      const response = await fetch(`${this.serverUrl}/samples`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get samples: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to get training samples:', error);
      return [];
    }
  }
}

// Training Status Monitor
export class TrainingStatusMonitor {
  constructor() {
    this.diagnostics = new TrainingSystemDiagnostics();
    this.serverConnection = new TrainingServerConnection();
    this.status = {
      lastCheck: null,
      isTrainingReady: false,
      issues: [],
      recommendations: []
    };
  }

  async checkStatus() {
    const results = await this.diagnostics.runFullDiagnostic();
    const report = this.diagnostics.generateReport();
    
    this.status = {
      lastCheck: new Date().toISOString(),
      isTrainingReady: report.summary.errors === 0,
      issues: Object.values(results).filter(r => r?.status === 'error' || r?.status === 'disconnected'),
      recommendations: report.recommendations,
      fullReport: report
    };

    return this.status;
  }

  getStatusSummary() {
    if (!this.status.lastCheck) {
      return '⚠️ Training status not checked yet';
    }

    if (this.status.isTrainingReady) {
      return '✅ Training system is ready and connected';
    } else {
      const issueCount = this.status.issues.length;
      return `❌ Training system has ${issueCount} issue${issueCount > 1 ? 's' : ''}`;
    }
  }
}

export const trainingMonitor = new TrainingStatusMonitor();
