// Alternative Vosk Manager with better compatibility
import { voskNetworkBlocker } from './voskNetworkBlocker.js';

export class AlternativeVoskManager {
  constructor() {
    this.isReady = false;
    this.loadedModel = null;
    this.vosk = null;
    this.modelPath = '/models/vosk-model-small-en-us-0.15';
  }

  async initialize(onProgress = null) {
    try {
      // Network blocking is automatic - just log that it's active
      if (onProgress) onProgress('🔒 Network blocking active for external downloads...');
      
      if (onProgress) onProgress('🔍 Importing Vosk with compatibility mode...');
      
      // Try different import methods
      let voskModule = null;
      
      try {
        // Method 1: Direct import
        voskModule = await import('vosk-browser');
        console.log('✅ Direct import successful');
      } catch (error) {
        console.warn('Direct import failed:', error.message);
        
        try {
          // Method 2: Dynamic import with different syntax
          voskModule = await import('vosk-browser/dist/vosk.js');
          console.log('✅ Alternative import successful');
        } catch (error2) {
          console.warn('Alternative import failed:', error2.message);
          throw new Error('Unable to import Vosk library');
        }
      }
      
      this.vosk = voskModule;
      
      if (onProgress) onProgress('📁 Attempting model load with compatibility settings...');
      
      // Try different model loading approaches
      const modelUrl = `${window.location.origin}${this.modelPath}`;
      console.log('Attempting to load model from:', modelUrl);
      
      // Method 1: Standard createModel
      try {
        console.log('Trying standard createModel...');
        this.loadedModel = await this.loadModelWithTimeout(voskModule.createModel(modelUrl), 30000);
        console.log('✅ Standard model loading successful');
      } catch (error) {
        console.warn('Standard model loading failed:', error.message);
        
        // Method 2: Try with different configuration
        try {
          console.log('Trying alternative model loading...');
          const config = { 
            modelUrl: modelUrl,
            wasmPath: '/node_modules/vosk-browser/dist/',
            sampleRate: 16000
          };
          this.loadedModel = await this.loadModelWithTimeout(voskModule.createModel(config), 45000);
          console.log('✅ Alternative model loading successful');
        } catch (error2) {
          console.warn('Alternative model loading failed:', error2.message);
          throw new Error(`Model loading failed: ${error2.message}`);
        }
      }
      
      this.isReady = true;
      if (onProgress) onProgress('✅ Alternative Vosk initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Alternative Vosk initialization failed:', error);
      if (onProgress) onProgress(`❌ Alternative Vosk failed: ${error.message}`);
      this.isReady = false;
      this.loadedModel = null;
      throw error;
    }
  }

  async loadModelWithTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Model loading timeout (${timeoutMs/1000}s)`));
      }, timeoutMs);

      promise.then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  async createRecognizer(sampleRate = 16000) {
    if (!this.isReady || !this.loadedModel) {
      throw new Error('Alternative Vosk not initialized');
    }

    try {
      const recognizer = new this.vosk.KaldiRecognizer(this.loadedModel, sampleRate);
      return {
        AcceptWaveform: (audioData) => recognizer.AcceptWaveform(audioData),
        acceptWaveform: (audioData) => recognizer.AcceptWaveform(audioData),
        FinalResult: () => recognizer.FinalResult(),
        finalResult: () => {
          const result = recognizer.FinalResult();
          return typeof result === 'string' ? JSON.parse(result) : result;
        },
        PartialResult: () => recognizer.PartialResult(),
        partialResult: () => {
          const result = recognizer.PartialResult();
          return typeof result === 'string' ? JSON.parse(result) : result;
        }
      };
    } catch (error) {
      console.error('Failed to create alternative recognizer:', error);
      throw error;
    }
  }

  getModelInfo() {
    return {
      loaded: this.isReady,
      path: this.modelPath,
      type: 'Alternative Vosk Model'
    };
  }
}

export const alternativeVoskManager = new AlternativeVoskManager();
