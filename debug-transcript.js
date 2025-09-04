// Debug Transcript System - Test Audio File Processing
// This script helps debug exactly what happens during audio upload

console.log('🚀 Starting Transcript System Debug Tool...\n');

async function debugTranscriptSystem() {
  try {
    console.log('📋 Step 1: Testing Vosk Library Import');
    let vosk;
    try {
      vosk = await import('vosk-browser');
      console.log('✅ Vosk-browser imported successfully');
      console.log('Available methods:', Object.keys(vosk));
    } catch (voskError) {
      console.error('❌ Vosk import failed:', voskError);
      return;
    }

    console.log('\n📋 Step 2: Testing Model Loading');
    const modelPaths = [
      '/models/vosk-model-small-en-us-0.15',
      '/models/vosk-model-small-hi-0.22'
    ];

    let model = null;
    let workingModelPath = null;

    for (const path of modelPaths) {
      try {
        console.log(`🔍 Trying model: ${path}`);
        const fullURL = `${window.location.origin}${path}`;
        console.log(`Full URL: ${fullURL}`);
        
        // Test model accessibility first
        try {
          const testResponse = await fetch(`${fullURL}/README`);
          if (testResponse.ok) {
            console.log(`✅ Model directory accessible at ${path}`);
          } else {
            console.log(`⚠️ Model directory not accessible (status: ${testResponse.status})`);
            continue;
          }
        } catch (fetchError) {
          console.log(`❌ Cannot reach model directory: ${fetchError.message}`);
          continue;
        }

        console.log(`⏳ Loading model from ${path}...`);
        model = await vosk.createModel(path);
        workingModelPath = path;
        console.log(`✅ Successfully loaded model from ${path}`);
        break;
        
      } catch (modelError) {
        console.error(`❌ Model loading failed for ${path}:`, modelError.message);
        
        if (modelError.message.includes('archive format') || modelError.message.includes('Unrecognized')) {
          console.log('   📁 Issue: Archive format not supported');
        } else if (modelError.message.includes('fetch') || modelError.message.includes('network')) {
          console.log('   🌐 Issue: Network/connectivity problem');
        }
      }
    }

    if (!model) {
      console.error('❌ No working Vosk models found!');
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if model files exist in public/models/');
      console.log('2. Verify model files are not corrupted');
      console.log('3. Check browser console for specific errors');
      console.log('4. Try refreshing the page');
      return;
    }

    console.log('\n📋 Step 3: Testing Recognizer Creation');
    try {
      const recognizer = await vosk.createRecognizer({ model, sampleRate: 16000 });
      console.log('✅ Recognizer created successfully');

      console.log('\n📋 Step 4: Testing with Dummy Audio');
      // Create 1 second of silence
      const dummyAudio = new Int16Array(16000); // 1 second at 16kHz
      recognizer.acceptWaveform(dummyAudio);
      
      const result = recognizer.finalResult ? recognizer.finalResult() : recognizer.result();
      console.log('Test result:', result);
      
      if (result && result.text !== undefined) {
        console.log('✅ Vosk is processing audio correctly');
        console.log('✅ TRANSCRIPT SYSTEM SHOULD WORK!');
        
        console.log('\n📋 Step 5: Testing File Processor Import');
        try {
          const { processAudioFile } = await import('/src/utils/fileProcessors.js');
          console.log('✅ processAudioFile imported successfully');
          console.log('Function type:', typeof processAudioFile);
          
          console.log('\n📋 Step 6: Testing Transcript Extractor');
          try {
            const { extractTranscriptFromVoskResult, validateTranscript } = await import('/src/utils/transcriptExtractor.js');
            console.log('✅ Transcript extractor utilities imported successfully');
            
            // Test with sample Vosk result
            const sampleResult = '🎵 AUDIO SPEECH EXTRACTION COMPLETE\n\n🎤 EXTRACTED SPEECH TRANSCRIPT:\n"hello this is a test"';
            const extracted = extractTranscriptFromVoskResult(sampleResult);
            console.log('Sample extraction test:', extracted);
            
            const validation = validateTranscript(extracted);
            console.log('Validation test:', validation);
            
            console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
            console.log('💡 If transcripts still don\'t appear, the issue might be:');
            console.log('   - Audio file format not supported');
            console.log('   - Audio file has no speech content');
            console.log('   - Browser security restrictions');
            console.log('   - UI update not working properly');
            
          } catch (extractorError) {
            console.error('❌ Transcript extractor import failed:', extractorError);
          }
          
        } catch (processorError) {
          console.error('❌ File processor import failed:', processorError);
        }
        
      } else {
        console.log('⚠️ Vosk returned unexpected result format');
      }
      
    } catch (recognizerError) {
      console.error('❌ Recognizer creation failed:', recognizerError);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Run the debug test
debugTranscriptSystem();
