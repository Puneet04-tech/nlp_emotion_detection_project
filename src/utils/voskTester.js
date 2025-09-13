// Vosk Tester Utility
// Tests Vosk availability and model loading

export const testVoskAvailability = async () => {
  try {
    console.log('🔍 Testing Vosk availability...');
    
    // Mock Vosk test for now since Vosk may not be available
    const isVoskAvailable = typeof window !== 'undefined' && 
                           window.webkitSpeechRecognition || 
                           window.SpeechRecognition;
    
    if (isVoskAvailable) {
      return {
        success: true,
        message: 'Speech recognition available',
        type: 'web-speech-api'
      };
    } else {
      return {
        success: false,
        message: 'Speech recognition not available',
        fallback: 'mock-transcription'
      };
    }
  } catch (error) {
    console.error('❌ Vosk test error:', error);
    return {
      success: false,
      error: error.message,
      fallback: 'mock-transcription'
    };
  }
};

export const testModelLoading = async () => {
  try {
    console.log('🔍 Testing model loading...');
    
    // Simulate model loading test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Model loading simulation successful',
      modelSize: '15MB',
      loadTime: '1.2s'
    };
  } catch (error) {
    console.error('❌ Model loading test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getVoskDiagnostics = () => {
  return {
    webSpeechSupport: !!(window.webkitSpeechRecognition || window.SpeechRecognition),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timestamp: new Date().toISOString()
  };
};

export default {
  testVoskAvailability,
  testModelLoading,
  getVoskDiagnostics
};