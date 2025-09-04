// Enhanced Vosk Model Loader
// This module provides better integration with vosk-browser to avoid TAR.GZ extraction issues

export class VoskModelManager {
  constructor() {
    this.loadedModel = null;
    this.modelPath = null;
    this.vosk = null;
  }

  async initialize(onProgress = null) {
    try {
      if (onProgress) onProgress('🔍 Initializing Vosk speech recognition...');

      // Import vosk-browser
      this.vosk = await import('vosk-browser');
      console.log('✅ vosk-browser imported successfully');

      // Load the best available model
      await this.loadBestModel(onProgress);
      
      return true;
    } catch (error) {
      console.error('❌ VoskModelManager initialization failed:', error);
      throw error;
    }
  }

  async loadBestModel(onProgress = null) {
    const modelConfigs = [
      {
        path: '/models/vosk-model-small-en-us-0.15',
        name: 'English (Local)',
        language: 'en'
      },
      {
        path: '/models/vosk-model-small-hi-0.22', 
        name: 'Hindi (Local)',
        language: 'hi'
      }
    ];

    if (onProgress) onProgress('📋 Testing Vosk models...');

    for (const config of modelConfigs) {
      try {
        if (onProgress) onProgress(`📥 Loading ${config.name}...`);
        console.log(`🔍 Testing Vosk model: ${config.name}`);
        
        // First verify the model files are accessible
        const isAccessible = await this.verifyModelAccess(config.path);
        if (!isAccessible) {
          console.warn(`⚠️ Model ${config.name} files not accessible`);
          continue;
        }

        // Try to create the model with proper error handling
        console.log(`🚀 Creating model instance for ${config.name}...`);
        
        const model = await this.createModelWithTimeout(config.path, 30000);
        
        this.loadedModel = model;
        this.modelPath = config.path;
        console.log(`✅ Successfully loaded: ${config.name}`);
        if (onProgress) onProgress(`✅ Active model: ${config.name}`);
        return true;
        
      } catch (modelError) {
        console.warn(`⚠️ Failed to load ${config.name}:`, modelError.message);
        
        if (modelError.message.includes('archive format') || modelError.message.includes('Unrecognized')) {
          console.warn(`   📁 ${config.name}: Model format incompatible with vosk-browser`);
          if (onProgress) onProgress(`⚠️ ${config.name}: Format issue`);
        } else if (modelError.message.includes('timeout')) {
          console.warn(`   ⏰ ${config.name}: Loading timed out`);
          if (onProgress) onProgress(`⚠️ ${config.name}: Timeout`);
        } else {
          console.warn(`   ❓ ${config.name}: ${modelError.message}`);
          if (onProgress) onProgress(`⚠️ ${config.name}: Failed`);
        }
        continue;
      }
    }

    throw new Error('No Vosk models could be loaded. All models failed to initialize.');
  }

  async verifyModelAccess(modelPath) {
    try {
      // Check essential files
      const essentialFiles = ['mfcc.conf', 'final.mdl', 'model.conf'];
      let accessCount = 0;

      for (const file of essentialFiles) {
        try {
          const response = await fetch(`${modelPath}/${file}`, { method: 'HEAD' });
          if (response.ok) {
            accessCount++;
          }
        } catch (error) {
          // File not accessible
        }
      }

      const isAccessible = accessCount >= 2; // At least 2/3 files should be accessible
      console.log(`📊 Model accessibility: ${accessCount}/${essentialFiles.length} files accessible`);
      return isAccessible;
    } catch (error) {
      console.warn('⚠️ Model verification failed:', error.message);
      return false;
    }
  }

  async createModelWithTimeout(modelPath, timeoutMs = 30000) {
    if (!this.vosk) {
      throw new Error('Vosk not initialized');
    }

    const { createModel } = this.vosk;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Model creation timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      createModel(modelPath)
        .then(model => {
          clearTimeout(timeoutId);
          resolve(model);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  async createRecognizer(sampleRate = 16000) {
    if (!this.loadedModel || !this.vosk) {
      throw new Error('No Vosk model loaded');
    }

    const { createRecognizer } = this.vosk;
    return await createRecognizer({ 
      model: this.loadedModel, 
      sampleRate 
    });
  }

  isReady() {
    return this.loadedModel !== null && this.vosk !== null;
  }

  getModelInfo() {
    return {
      isReady: this.isReady(),
      modelPath: this.modelPath,
      hasVosk: this.vosk !== null
    };
  }
}

// Create singleton instance
export const voskManager = new VoskModelManager();
