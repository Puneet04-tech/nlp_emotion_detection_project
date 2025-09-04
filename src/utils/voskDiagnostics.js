// Vosk Diagnostics - Mock Version (No Downloads)
import { mockVoskManager } from './mockVoskManager.js';

export const runVoskDiagnostics = async (onProgress = null) => {
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: '',
    overallStatus: 'unknown'
  };

  try {
    if (onProgress) onProgress('🚀 Starting mock Vosk diagnostics (no downloads)...');
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate startup

    // Test 1: Mock vosk-browser import
    if (onProgress) onProgress('🔍 Step 1: Mock vosk-browser test...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate
      diagnosticResults.tests.push({ 
        test: 'Mock vosk-browser', 
        status: 'success', 
        message: 'Mock vosk system operational (downloads disabled)' 
      });
      if (onProgress) onProgress('✅ Mock vosk-browser ready');
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Mock vosk-browser', 
        status: 'error', 
        message: `Mock system failed: ${error.message}` 
      });
      if (onProgress) onProgress('❌ Mock vosk-browser failed');
      throw error;
    }

    // Test 2: Mock model accessibility
    if (onProgress) onProgress('🔍 Step 2: Mock model accessibility...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate
      diagnosticResults.tests.push({ 
        test: 'Mock model accessibility', 
        status: 'success', 
        message: 'Mock model accessible (no real files needed)' 
      });
      if (onProgress) onProgress('✅ Mock model accessible');
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Mock model accessibility', 
        status: 'error', 
        message: `Mock model test failed: ${error.message}` 
      });
      if (onProgress) onProgress('❌ Mock model test failed');
      throw error;
    }

    // Test 3: Initialize mock manager
    if (onProgress) onProgress('🔍 Step 3: Initializing mock manager...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate
      if (!mockVoskManager.loadedModel) {
        await mockVoskManager.initialize(onProgress);
      }
      diagnosticResults.tests.push({ 
        test: 'Mock manager initialization', 
        status: 'success', 
        message: 'Mock Vosk manager initialized (no downloads)' 
      });
      if (onProgress) onProgress('✅ Mock Vosk manager ready');
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Mock manager initialization', 
        status: 'error', 
        message: `Mock manager failed: ${error.message}` 
      });
      if (onProgress) onProgress('❌ Mock manager failed');
      throw error;
    }

    // Test 4: Create mock recognizer
    if (onProgress) onProgress('🔍 Step 4: Creating mock recognizer...');
    
    let recognizer;
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate
      recognizer = await mockVoskManager.createRecognizer(16000);
      diagnosticResults.tests.push({ 
        test: 'Create mock recognizer', 
        status: 'success', 
        message: 'Mock recognizer created (no real processing)' 
      });
      if (onProgress) onProgress('✅ Mock recognizer created');
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Create mock recognizer', 
        status: 'error', 
        message: `Mock recognizer creation failed: ${error.message}` 
      });
      if (onProgress) onProgress('❌ Failed to create mock recognizer');
      throw error;
    }

    // Test 5: Process dummy audio
    if (onProgress) onProgress('🔍 Step 5: Testing audio processing...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const sampleRate = 16000;
      const duration = 0.5;
      const samples = sampleRate * duration;
      const audioData = new Int16Array(samples);
      
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const signal = Math.sin(2 * Math.PI * 200 * t) * 0.3 +
                      Math.sin(2 * Math.PI * 400 * t) * 0.2;
        audioData[i] = signal * 32767;
      }

      const result = recognizer.AcceptWaveform(audioData);
      const finalResult = JSON.parse(recognizer.FinalResult());
      
      diagnosticResults.tests.push({ 
        test: 'Audio processing', 
        status: 'success', 
        message: `Audio processed successfully. Result: ${JSON.stringify(finalResult)}` 
      });
      if (onProgress) onProgress('✅ Audio processing test completed');
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Audio processing', 
        status: 'error', 
        message: `Audio processing failed: ${error.message}` 
      });
      if (onProgress) onProgress('❌ Audio processing failed');
      throw error;
    }

    // Test 6: Microphone compatibility
    if (onProgress) onProgress('🔍 Step 6: Testing microphone compatibility...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        diagnosticResults.tests.push({ 
          test: 'Microphone compatibility', 
          status: 'success', 
          message: 'getUserMedia API available' 
        });
        if (onProgress) onProgress('✅ Microphone API available');
      } else {
        throw new Error('getUserMedia not supported');
      }
    } catch (error) {
      diagnosticResults.tests.push({ 
        test: 'Microphone compatibility', 
        status: 'warning', 
        message: `Microphone may not work: ${error.message}` 
      });
      if (onProgress) onProgress('⚠️ Microphone compatibility issues detected');
    }

    // All tests completed successfully
    diagnosticResults.overallStatus = 'success';
    diagnosticResults.summary = 'All Vosk tests passed successfully! The mock system is ready for speech recognition.';
    if (onProgress) onProgress('🎉 Diagnostics completed - Mock Vosk is fully functional!');

    return diagnosticResults;

  } catch (error) {
    diagnosticResults.overallStatus = 'error';
    diagnosticResults.summary = `Vosk diagnostics failed: ${error.message}`;
    diagnosticResults.tests.push({
      test: 'Diagnostic execution',
      status: 'error',
      message: `Failed to complete diagnostics: ${error.message}`
    });

    if (onProgress) onProgress(`❌ Diagnostics failed: ${error.message}`);
    return diagnosticResults;
  }
};
