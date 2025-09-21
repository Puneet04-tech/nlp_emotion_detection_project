// Enhanced Audio File Processor with Real Vosk (No Downloads)
import { realVoskManager } from './realVoskManager.js';
import { alternativeVoskManager } from './alternativeVoskManager.js';
import { mockVoskManager } from './mockVoskManager.js';
import { cloudSttManager } from './cloudSttManager.js';

/**
 * Enhanced audio file processing with real Vosk transcription
 */
export const processAudioFileEnhanced = async (file, onProgress = null, language = 'en-US', translationSettings = {}, forceVosk = false, forceCloud = false) => {
  if (onProgress) onProgress(`🎵 Processing audio file: ${file.name}...`);

  try {
    // Try multiple Vosk approaches in order of preference
    let voskManager = null;
    let managerType = 'mock';
    
    if (onProgress) onProgress('🔍 Initializing speech recognition...');

    // Try 1: Real Vosk Manager
    try {
      if (!realVoskManager.loadedModel) {
        await realVoskManager.initialize(onProgress);
      }
      if (realVoskManager.loadedModel) {
        voskManager = realVoskManager;
        managerType = 'real';
        console.log('✅ Using Real Vosk Manager');
      }
    } catch (error) {
      console.warn('Real Vosk failed:', error.message);
    }

    // Try 2: Alternative Vosk Manager (if real failed)
    if (!voskManager) {
      try {
        if (onProgress) onProgress('⚠️ Trying alternative Vosk method...');
        if (!alternativeVoskManager.loadedModel) {
          await alternativeVoskManager.initialize(onProgress);
        }
        if (alternativeVoskManager.loadedModel) {
          voskManager = alternativeVoskManager;
          managerType = 'alternative';
          console.log('✅ Using Alternative Vosk Manager');
        }
      } catch (error) {
        console.warn('Alternative Vosk failed:', error.message);
      }
    }

    // Fallback 3: Cloud STT (if requested) or Mock Manager
    if (!voskManager) {
      if (forceCloud) {
        if (onProgress) onProgress('☁️ Using Cloud STT as fallback (forceCloud=true)...');
        try {
          // initialize cloud manager with a config read from environment or translationSettings
          const cloudConfig = (translationSettings && translationSettings.cloudStt) || {};
          await cloudSttManager.initialize(cloudConfig);
          const cloudRes = await cloudSttManager.transcribeAudio(file, onProgress);
          if (cloudRes && cloudRes.success && cloudRes.text) {
            return {
              success: true,
              transcript: cloudRes.text,
              audioTranscript: cloudRes.text,
              content: cloudRes.text,
              audioInfo: { fileName: file.name },
              processingInfo: { method: 'Cloud STT', provider: cloudRes.provider || cloudConfig.provider }
            };
          }
          // If cloud failed, fall through to mock
          if (onProgress) onProgress('⚠️ Cloud STT failed, falling back to mock');
        } catch (err) {
          console.warn('Cloud STT error:', err && err.message ? err.message : err);
          if (onProgress) onProgress('⚠️ Cloud STT initialization failed - falling back to mock');
        }
      }

      if (onProgress) onProgress('⚠️ Real Vosk unavailable, using mock transcription...');
      if (!mockVoskManager.loadedModel) {
        await mockVoskManager.initialize(onProgress);
      }
      voskManager = mockVoskManager;
      managerType = 'mock';
      console.log('⚠️ Using Mock Vosk Manager');
    }

    // Timeout protection
    let processingTimedOut = false;
    const processingTimeout = setTimeout(() => {
      processingTimedOut = true;
      if (onProgress) onProgress('❌ Audio processing timed out (120s).');
    }, 120000);

    if (processingTimedOut) throw new Error('Audio processing timed out');

    if (onProgress) onProgress('♻️ Converting audio to 16kHz for speech recognition...');

    // Convert audio file to the format expected by Vosk
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const decodedAudio = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    
    if (processingTimedOut) throw new Error('Audio conversion timed out');

    // Resample to 16kHz mono for Vosk
    const offlineContext = new OfflineAudioContext(1, Math.ceil(decodedAudio.duration * 16000), 16000);
    const source = offlineContext.createBufferSource();
    source.buffer = decodedAudio;
    source.connect(offlineContext.destination);
    source.start(0);
    const renderedBuffer = await offlineContext.startRendering();
    
    if (processingTimedOut) throw new Error('Audio resampling timed out');

    const samples = renderedBuffer.getChannelData(0);

    // Convert float32 samples to Int16 PCM as expected by Vosk
    const int16Samples = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      let sample = Math.max(-1, Math.min(1, samples[i]));
      int16Samples[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    if (onProgress) onProgress('🧠 Creating recognizer...');
    
    // Create recognizer from the selected manager
    const recognizer = await voskManager.createRecognizer(16000);
    
    if (processingTimedOut) throw new Error('Recognizer creation timed out');

    if (onProgress) onProgress('🎤 Processing speech...');

    // Process audio in chunks
    const chunkSize = 4096;
    let transcriptParts = [];
    
    for (let i = 0; i < int16Samples.length; i += chunkSize) {
      if (processingTimedOut) throw new Error('Speech processing timed out');
      
      const chunk = int16Samples.subarray(i, Math.min(i + chunkSize, int16Samples.length));
      recognizer.acceptWaveform(chunk);
      
      // Update progress periodically
      if (onProgress && i % (chunkSize * 25) === 0) {
        const progress = Math.round((i / int16Samples.length) * 100);
        onProgress(`🎤 Processing speech: ${progress}%`);
      }
    }

    // Get final result
    const finalResult = recognizer.finalResult();
    clearTimeout(processingTimeout);

    let transcript = '';
    if (finalResult && finalResult.text) {
      transcript = finalResult.text.trim();
    }

    if (onProgress) onProgress('✅ Audio processing completed!');

    console.log(`✅ Audio file processed successfully. Transcript length: ${transcript.length} characters`);

    return {
      success: true,
      transcript: transcript,
      audioTranscript: transcript, // Add this for compatibility
      content: transcript, // Add this for fallback compatibility
      audioInfo: {
        duration: decodedAudio.duration,
        sampleRate: 16000,
        channels: 1,
        fileName: file.name
      },
      processingInfo: {
        method: managerType === 'real' ? 'Real Vosk' : managerType === 'alternative' ? 'Alternative Vosk' : 'Mock Vosk',
        modelPath: voskManager.modelPath || 'mock-model',
        language: language
      }
    };

  } catch (error) {
    console.error('❌ Audio processing failed:', error.message);
    
    if (onProgress) {
      if (error.message.includes('Vosk')) {
        onProgress('❌ Speech recognition failed - using audio analysis only');
      } else if (error.message.includes('timeout')) {
        onProgress('❌ Processing timeout - file may be too large');
      } else {
        onProgress(`❌ Processing failed: ${error.message}`);
      }
    }

    // Return a graceful failure result
    return {
      success: false,
      transcript: '',
      audioTranscript: '', // Add for compatibility
      content: '', // Add for fallback compatibility
      error: error.message,
      audioInfo: {
        fileName: file.name
      },
      processingInfo: {
        method: 'Failed',
        error: error.message
      }
    };
  }
};
