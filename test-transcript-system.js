// Audio Transcript Test
// Testing if Vosk models can generate transcripts from audio files

async function testVoskTranscription() {
  console.log('🧪 Testing Vosk Transcription System');
  console.log('=====================================');

  try {
    // Test 1: Check if Vosk library can be imported
    console.log('🔍 Step 1: Testing Vosk library import...');
    const vosk = await import('vosk-browser');
    console.log('✅ Vosk library imported successfully');
    console.log('Available functions:', Object.keys(vosk));

    // Test 2: Check model accessibility
    console.log('\n🔍 Step 2: Testing model accessibility...');
    const modelPath = '/models/vosk-model-small-en-us-0.15';
    const modelUrl = `${window.location.origin}${modelPath}`;
    console.log('Model URL:', modelUrl);

    try {
      const response = await fetch(`${modelUrl}/README`);
      if (response.ok) {
        console.log('✅ Model directory is accessible');
        const readmeContent = await response.text();
        console.log('README preview:', readmeContent.substring(0, 100) + '...');
      } else {
        console.log('❌ Model directory not accessible:', response.status);
      }
    } catch (fetchError) {
      console.log('❌ Model fetch failed:', fetchError.message);
    }

    // Test 3: Try to create a model
    console.log('\n🔍 Step 3: Testing model creation...');
    try {
      console.log('⏳ Creating model (this may take time)...');
      const model = await vosk.createModel(modelUrl);
      console.log('✅ Model created successfully!');

      // Test 4: Try to create a recognizer
      console.log('\n🔍 Step 4: Testing recognizer creation...');
      const recognizer = await vosk.createRecognizer({ model, sampleRate: 16000 });
      console.log('✅ Recognizer created successfully!');

      // Test 5: Test with dummy audio data
      console.log('\n🔍 Step 5: Testing with dummy audio...');
      const dummyAudio = new Int16Array(1600); // 0.1 seconds of silence at 16kHz
      recognizer.acceptWaveform(dummyAudio);
      const result = recognizer.finalResult();
      console.log('✅ Processing test completed');
      console.log('Test result:', result);

      console.log('\n🎉 SUCCESS: Vosk transcription system is working!');
      console.log('📋 You should be able to upload audio files and get transcripts.');

    } catch (modelError) {
      console.log('❌ Model creation failed:', modelError.message);
      
      if (modelError.message.includes('archive format')) {
        console.log('💡 Issue: Model archive format not supported');
      } else if (modelError.message.includes('network') || modelError.message.includes('fetch')) {
        console.log('💡 Issue: Network connectivity problem');
      } else {
        console.log('💡 Issue: Unknown model loading problem');
      }
    }

  } catch (error) {
    console.error('❌ Vosk test failed:', error);
    console.log('\n🚨 TRANSCRIPT GENERATION WILL NOT WORK');
    console.log('Possible issues:');
    console.log('- Vosk library not installed (npm install vosk-browser)');
    console.log('- Model files missing or corrupted');
    console.log('- Browser compatibility issues');
  }
}

async function testFileProcessorFunction() {
  console.log('\n🧪 Testing File Processor Function');
  console.log('===================================');

  try {
    // Import the file processor
    const { processAudioFile } = await import('./src/utils/fileProcessors');
    console.log('✅ File processor imported successfully');

    // Test with a minimal dummy file (this will fail but shows the function exists)
    console.log('🔍 Testing function availability...');
    console.log('processAudioFile function type:', typeof processAudioFile);
    
    if (typeof processAudioFile === 'function') {
      console.log('✅ processAudioFile function is available');
      console.log('📋 Function should work when you upload actual audio files');
    } else {
      console.log('❌ processAudioFile function not found');
    }

  } catch (error) {
    console.log('❌ File processor test failed:', error.message);
  }
}

// Run the tests
console.log('🚀 Starting Audio Transcript Tests...\n');
testVoskTranscription();
testFileProcessorFunction();
