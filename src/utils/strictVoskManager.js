// Strict Local-Only Vosk Model Manager
// This prevents vosk-browser from attempting any downloads

export class StrictLocalVoskManager {
  constructor() {
    this.loadedModel = null;
    this.modelPath = null;
    this.vosk = null;
  }

  async initialize(onProgress = null) {
    try {
      if (onProgress) onProgress('🔍 Initializing local-only Vosk...');

      // Import vosk-browser with strict local-only configuration
      this.vosk = await import('vosk-browser');
      
      // Verify local models exist before attempting to load
      const localModelPath = '/models/vosk-model-small-en-us-0.15';
      
      // Pre-verify all critical files exist
      const criticalFiles = [
        'am/final.mdl',
        'graph/Gr.fst', 
        'graph/HCLr.fst',
        'conf/model.conf',
        'conf/mfcc.conf'
      ];

      if (onProgress) onProgress('🔍 Verifying local model files...');
      
      for (const file of criticalFiles) {
        const response = await fetch(`${localModelPath}/${file}`, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Critical model file missing: ${file}`);
        }
      }

      if (onProgress) onProgress('✅ Local model files verified');

      // Load the model with explicit local path
      if (onProgress) onProgress('📥 Loading local Vosk model...');
      
      // Use createModel with the verified local path
      this.loadedModel = await this.vosk.createModel(localModelPath);
      this.modelPath = localModelPath;
      
      if (onProgress) onProgress('✅ Local Vosk model loaded successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Strict local Vosk initialization failed:', error);
      throw error;
    }
  }

  async createRecognizer(sampleRate = 16000) {
    if (!this.loadedModel) {
      throw new Error('No Vosk model loaded. Call initialize() first.');
    }
    
    return new this.loadedModel.KaldiRecognizer(sampleRate);
  }

  getModelInfo() {
    return {
      loaded: !!this.loadedModel,
      path: this.modelPath,
      type: 'Local English Model'
    };
  }
}

// Create a singleton instance
export const strictVoskManager = new StrictLocalVoskManager();
