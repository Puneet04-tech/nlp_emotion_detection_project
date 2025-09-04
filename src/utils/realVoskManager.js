// Real Vosk Manager - Uses actual models but prevents downloads
import { voskNetworkBlocker } from './voskNetworkBlocker.js';
import { testVoskAvailability, testModelLoading } from './voskTester.js';

export class RealVoskManager {
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
      
      if (onProgress) onProgress('🔍 Testing Vosk availability...');
      
      // Test if Vosk is available
      const voskTest = await testVoskAvailability();
      if (!voskTest.success) {
        throw new Error(`Vosk not available: ${voskTest.error}`);
      }
      
      this.vosk = voskTest.module;
      if (onProgress) onProgress('✅ Vosk library loaded');
      
      if (onProgress) onProgress('📁 Loading local model...');
      
      // Test model loading
      const modelTest = await testModelLoading();
      if (!modelTest.success) {
        throw new Error(`Model loading failed: ${modelTest.error}`);
      }
      
      this.loadedModel = modelTest.model;
      this.isReady = true;
      
      if (onProgress) onProgress('✅ Real Vosk ready with local model');
      console.log('Real Vosk initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Real Vosk initialization failed:', error);
      if (onProgress) onProgress(`❌ Real Vosk failed: ${error.message}`);
      this.isReady = false;
      this.loadedModel = null;
      throw error;
    }
  }

  async createRecognizer(sampleRate = 16000) {
    if (!this.isReady || !this.loadedModel) {
      throw new Error('Real Vosk not initialized');
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
      console.error('Failed to create real recognizer:', error);
      throw error;
    }
  }

  getModelInfo() {
    return {
      loaded: this.isReady,
      path: this.modelPath,
      type: 'Real Vosk Model'
    };
  }
}

// Create the real manager instance
export const realVoskManager = new RealVoskManager();
