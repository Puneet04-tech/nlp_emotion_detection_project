// Quick Vosk Diagnostic Tool
// Check if Vosk is working and identify specific issues

export async function diagnoseVoskSystem() {
  const results = {
    libraryImport: false,
    modelAccess: false,
    modelLoading: false,
    recognizerCreation: false,
    errors: []
  };

  console.log('🔧 Starting Vosk System Diagnosis...');

  // Test 1: Library Import
  try {
    const vosk = await import('vosk-browser');
    results.libraryImport = true;
    console.log('✅ Vosk library imported successfully');
    
    // Test 2: Model Access
    try {
      const modelPath = '/models/vosk-model-small-en-us-0.15';
      const response = await fetch(`${modelPath}/README`);
      if (response.ok) {
        results.modelAccess = true;
        console.log('✅ Model files accessible');
        
        // Test 3: Model Loading
        try {
          console.log('⏳ Testing model loading...');
          const model = await vosk.createModel(modelPath);
          results.modelLoading = true;
          console.log('✅ Model loaded successfully');
          
          // Test 4: Recognizer Creation
          try {
            const recognizer = await vosk.createRecognizer({ model, sampleRate: 16000 });
            results.recognizerCreation = true;
            console.log('✅ Recognizer created successfully');
            console.log('🎉 Vosk system is fully operational!');
          } catch (recognizerError) {
            results.errors.push(`Recognizer creation failed: ${recognizerError.message}`);
            console.error('❌ Recognizer creation failed:', recognizerError.message);
          }
        } catch (modelError) {
          results.errors.push(`Model loading failed: ${modelError.message}`);
          console.error('❌ Model loading failed:', modelError.message);
        }
      } else {
        results.errors.push(`Model access failed: HTTP ${response.status}`);
        console.error('❌ Model files not accessible');
      }
    } catch (accessError) {
      results.errors.push(`Model access failed: ${accessError.message}`);
      console.error('❌ Model access failed:', accessError.message);
    }
  } catch (importError) {
    results.errors.push(`Library import failed: ${importError.message}`);
    console.error('❌ Vosk library import failed:', importError.message);
  }

  return results;
}

export async function quickTranscriptTest(audioFile) {
  console.log('🧪 Quick Transcript Test for:', audioFile.name);
  
  try {
    // First check if Vosk is working
    const diagnosis = await diagnoseVoskSystem();
    
    if (!diagnosis.libraryImport) {
      return {
        success: false,
        method: 'none',
        error: 'Vosk library not available',
        transcript: 'Library import failed'
      };
    }

    if (!diagnosis.modelLoading) {
      return {
        success: false,
        method: 'vosk-failed',
        error: 'Vosk model loading failed',
        transcript: 'Model loading issues detected'
      };
    }

    // Try basic file processing
    try {
      const { processAudioFile } = await import('./fileProcessors.js');
      const result = await processAudioFile(audioFile, 
        (progress) => console.log('Progress:', progress)
      );
      
      const { extractTranscriptFromVoskResult } = await import('./transcriptExtractor.js');
      const transcript = extractTranscriptFromVoskResult(result);
      
      if (transcript && transcript.trim().length > 5) {
        return {
          success: true,
          method: 'vosk',
          transcript: transcript,
          result: result
        };
      } else {
        return {
          success: false,
          method: 'vosk-no-content',
          error: 'No transcript content extracted',
          transcript: 'No speech content detected',
          result: result
        };
      }
    } catch (processingError) {
      return {
        success: false,
        method: 'processing-failed',
        error: processingError.message,
        transcript: 'File processing failed'
      };
    }

  } catch (error) {
    return {
      success: false,
      method: 'test-failed',
      error: error.message,
      transcript: 'Test execution failed'
    };
  }
}

export default {
  diagnoseVoskSystem,
  quickTranscriptTest
};
