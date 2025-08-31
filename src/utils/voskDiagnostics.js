// Simple Vosk test to verify installation
export const testVoskInstallation = async (onProgress = null) => {
  try {
    if (onProgress) {
      onProgress('🔍 Testing Vosk installation...');
    }

    // Test if vosk-browser can be imported
    const { createModel, createRecognizer } = await import('vosk-browser');
    
    if (onProgress) {
      onProgress('✅ Vosk-browser imported successfully');
    }

    // Test model loading
    const modelPath = '/models/vosk-model-small-en-us-0.15';
    
    if (onProgress) {
      onProgress(`📥 Testing model loading from: ${modelPath}`);
    }

    const model = await createModel(modelPath);
    
    if (onProgress) {
      onProgress('✅ Vosk model loaded successfully');
    }

    // Test recognizer creation
    const recognizer = new model.KaldiRecognizer(16000);
    
    if (onProgress) {
      onProgress('✅ Vosk recognizer created successfully');
    }

    // Test with dummy audio data
    const dummyAudioData = new Int16Array(1024);
    for (let i = 0; i < dummyAudioData.length; i++) {
      dummyAudioData[i] = Math.sin(i * 0.1) * 1000;
    }

    const result = recognizer.AcceptWaveform(dummyAudioData);
    
    if (onProgress) {
      onProgress('✅ Vosk audio processing test completed');
    }

    const finalResult = JSON.parse(recognizer.FinalResult());
    
    if (onProgress) {
      onProgress('✅ Vosk installation test passed!');
    }

    return {
      success: true,
      message: 'Vosk is properly installed and working',
      modelPath: modelPath,
      recognizerReady: true,
      testResult: finalResult
    };

  } catch (error) {
    console.error('Vosk installation test failed:', error);
    
    if (onProgress) {
      onProgress(`❌ Vosk test failed: ${error.message}`);
    }

    return {
      success: false,
      message: `Vosk installation test failed: ${error.message}`,
      error: error.message,
      stack: error.stack
    };
  }
};

// Test function to check model accessibility
export const testVoskModelAccess = async (onProgress = null) => {
  try {
    if (onProgress) {
      onProgress('🔍 Testing Vosk model accessibility...');
    }

    // Test if model files are accessible
    const modelPath = '/models/vosk-model-small-en-us-0.15';
    
    // Try to fetch model files directly
    const testFiles = [
      `${modelPath}/README`,
      `${modelPath}/conf/model.conf`,
      `${modelPath}/am/final.mdl`
    ];

    for (const file of testFiles) {
      try {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.status}`);
        }
        if (onProgress) {
          onProgress(`✅ Model file accessible: ${file}`);
        }
      } catch (error) {
        if (onProgress) {
          onProgress(`❌ Model file not accessible: ${file}`);
        }
        throw new Error(`Model file not accessible: ${file} - ${error.message}`);
      }
    }

    return {
      success: true,
      message: 'All Vosk model files are accessible',
      modelPath: modelPath
    };

  } catch (error) {
    console.error('Vosk model access test failed:', error);
    
    if (onProgress) {
      onProgress(`❌ Model access test failed: ${error.message}`);
    }

    return {
      success: false,
      message: `Vosk model access test failed: ${error.message}`,
      error: error.message
    };
  }
};

// Combined test function
export const runVoskDiagnostics = async (onProgress = null) => {
  try {
    if (onProgress) {
      onProgress('🔍 Running Vosk diagnostics...');
    }

    // Test 1: Model accessibility
    const modelTest = await testVoskModelAccess(onProgress);
    
    if (!modelTest.success) {
      return {
        success: false,
        message: 'Model accessibility test failed',
        tests: { modelAccess: modelTest }
      };
    }

    // Test 2: Vosk installation
    const voskTest = await testVoskInstallation(onProgress);
    
    if (!voskTest.success) {
      return {
        success: false,
        message: 'Vosk installation test failed',
        tests: { modelAccess: modelTest, voskInstall: voskTest }
      };
    }

    if (onProgress) {
      onProgress('✅ All Vosk diagnostics passed!');
    }

    return {
      success: true,
      message: 'Vosk is properly installed and configured',
      tests: { modelAccess: modelTest, voskInstall: voskTest }
    };

  } catch (error) {
    console.error('Vosk diagnostics failed:', error);
    
    if (onProgress) {
      onProgress(`❌ Vosk diagnostics failed: ${error.message}`);
    }

    return {
      success: false,
      message: `Vosk diagnostics failed: ${error.message}`,
      error: error.message
    };
  }
};
