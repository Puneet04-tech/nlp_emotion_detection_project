// Vosk Tester Utility
// Attempts to detect vosk-browser and load a local model. Falls back to
// browser SpeechRecognition or a mock result when unavailable.

const DEFAULT_MODEL_PATH = '/models/vosk-model-small-en-us-0.15';

export const testVoskAvailability = async () => {
  try {
    console.log('🔍 Testing Vosk availability by importing vosk-browser...');

    // Try to dynamically import vosk-browser first
    try {
      const vosk = await import('vosk-browser');
      if (vosk) {
        return {
          success: true,
          message: 'vosk-browser module available',
          module: vosk
        };
      }
    } catch (impErr) {
      // Import failed; we'll try the browser SpeechRecognition API next
      console.warn('vosk-browser import failed:', impErr.message || impErr);
    }

    // Fallback: detect Web Speech API in the browser
    const hasWebSpeech = typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition);
    if (hasWebSpeech) {
      return {
        success: false,
        message: 'vosk-browser not available, browser SpeechRecognition available',
        type: 'web-speech-api'
      };
    }

    // No ASR available
    return {
      success: false,
      message: 'No speech recognition available (vosk-browser and Web Speech API unavailable)',
      fallback: 'mock-transcription'
    };
  } catch (error) {
    console.error('❌ Vosk test error:', error);
    return {
      success: false,
      error: error.message || String(error),
      fallback: 'mock-transcription'
    };
  }
};

export const testModelLoading = async (modelPath = DEFAULT_MODEL_PATH) => {
  try {
    console.log('🔍 Testing model loading for path:', modelPath);

    // Attempt to import vosk-browser and create/load the model
    const vosk = await import('vosk-browser');

    // Different vosk-browser versions expose different APIs
    let model = null;
    if (vosk.createModel) {
      // createModel is async in some builds
      try {
        model = await vosk.createModel(modelPath);
      } catch (e) {
        console.warn('vosk.createModel failed, attempting alternative instantiation:', e.message || e);
      }
    }

    if (!model && vosk.Model) {
      try {
        // Some builds expose a constructor
        model = new vosk.Model(modelPath);
      } catch (e) {
        console.warn('vosk.Model constructor failed:', e.message || e);
      }
    }

    if (!model) {
      // If nothing worked, throw to be handled by caller
      throw new Error('Failed to load Vosk model from ' + modelPath);
    }

    return {
      success: true,
      message: 'Vosk model loaded successfully',
      model
    };
  } catch (error) {
    console.error('❌ Model loading test error:', error);
    return {
      success: false,
      error: error.message || String(error)
    };
  }
};

export const getVoskDiagnostics = async () => {
  const availability = await testVoskAvailability();
  return {
    voskDetected: !!(availability && availability.module),
    voskMessage: availability.message,
    webSpeechSupport: !!(window && (window.webkitSpeechRecognition || window.SpeechRecognition)),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    timestamp: new Date().toISOString()
  };
};

export default {
  testVoskAvailability,
  testModelLoading,
  getVoskDiagnostics
};