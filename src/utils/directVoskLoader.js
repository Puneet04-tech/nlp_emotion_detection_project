// Custom Vosk Loader - Direct Local Model Access
// This bypasses vosk-browser's model loading to prevent downloads

export class DirectVoskLoader {
  constructor() {
    this.isLoaded = false;
    this.model = null;
    this.vosk = null;
  }

  async initialize(onProgress = null) {
    try {
      if (onProgress) onProgress('🔍 Loading vosk-browser with direct model access...');

      // Import vosk-browser
      this.vosk = await import('vosk-browser');
      
      // Instead of using createModel which might trigger downloads,
      // let's try to create the model more directly
      if (onProgress) onProgress('🔍 Attempting direct model initialization...');

      // Check if we can access the Model constructor directly
      if (this.vosk.Model) {
        // Try direct Model instantiation if available
        this.model = new this.vosk.Model('/models/vosk-model-small-en-us-0.15');
      } else if (this.vosk.createModel) {
        // Use createModel but with strict local path
        this.model = await this.vosk.createModel('/models/vosk-model-small-en-us-0.15');
      } else {
        throw new Error('No suitable model creation method found in vosk-browser');
      }

      this.isLoaded = true;
      if (onProgress) onProgress('✅ Direct Vosk model loaded successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Direct Vosk loader failed:', error);
      if (onProgress) onProgress(`❌ Direct loading failed: ${error.message}`);
      throw error;
    }
  }

  async createRecognizer(sampleRate = 16000) {
    if (!this.isLoaded || !this.model) {
      throw new Error('Vosk model not loaded. Call initialize() first.');
    }

    return new this.model.KaldiRecognizer(sampleRate);
  }

  getStatus() {
    return {
      loaded: this.isLoaded,
      model: !!this.model,
      vosk: !!this.vosk
    };
  }
}

// Create singleton instance
export const directVoskLoader = new DirectVoskLoader();
