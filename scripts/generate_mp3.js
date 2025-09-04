// Generate Test Audio for Transcript Testing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple WAV file generator for testing transcription
function generateTestWAV() {
  const sampleRate = 16000; // Vosk prefers 16kHz
  const duration = 3; // 3 seconds
  const frequency = 440; // A note
  const samples = sampleRate * duration;
  
  // Create a simple sine wave (this won't be transcribable, but tests the pipeline)
  const pcmData = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    pcmData[i] = Math.sin(2 * Math.PI * frequency * t) * 32767 * 0.5;
  }
  
  // Create WAV header
  const wavBuffer = createWAVFile(pcmData, sampleRate);
  
  const outputPath = path.join(__dirname, '..', 'test-audio.wav');
  fs.writeFileSync(outputPath, wavBuffer);
  
  console.log(`✅ Generated test audio file: ${outputPath}`);
  console.log(`📋 File size: ${wavBuffer.length} bytes`);
  console.log(`📋 Duration: ${duration} seconds`);
  console.log(`📋 Sample rate: ${sampleRate}Hz`);
  
  return outputPath;
}

function createWAVFile(pcmData, sampleRate) {
  const dataLength = pcmData.length * 2; // 16-bit samples
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  // PCM data
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(44 + i * 2, pcmData[i], true);
  }
  
  return Buffer.from(buffer);
}

// Also create a simple test that generates speech-like audio
function generateSpeechLikeTest() {
  console.log('\n🎤 Generating speech-like test audio...');
  
  const sampleRate = 16000;
  const duration = 2;
  const samples = sampleRate * duration;
  const pcmData = new Int16Array(samples);
  
  // Generate formant-like frequencies (speech simulation)
  const formants = [800, 1200, 2500]; // Typical vowel formants
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // Mix multiple formants with varying amplitudes
    for (let f = 0; f < formants.length; f++) {
      const freq = formants[f] * (1 + 0.1 * Math.sin(2 * Math.PI * 2 * t)); // slight frequency modulation
      const amplitude = (0.3 / (f + 1)) * (1 + 0.2 * Math.sin(2 * Math.PI * 5 * t)); // amplitude modulation
      sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
    }
    
    // Add some envelope to make it more speech-like
    const envelope = Math.sin(Math.PI * t / duration);
    sample *= envelope;
    
    pcmData[i] = Math.max(-32767, Math.min(32767, sample * 10000));
  }
  
  const wavBuffer = createWAVFile(pcmData, sampleRate);
  const outputPath = path.join(__dirname, '..', 'test-speech.wav');
  fs.writeFileSync(outputPath, wavBuffer);
  
  console.log(`✅ Generated speech-like test audio: ${outputPath}`);
  return outputPath;
}

// Always run when script is executed directly
console.log('🎵 Generating test audio files for transcript testing...\n');

try {
  generateTestWAV();
  generateSpeechLikeTest();
  
  console.log('\n📋 Test files created successfully!');
  console.log('💡 Note: These are synthetic audio files.');
  console.log('💡 For real transcription testing, use actual speech recordings.');
  console.log('\n🚀 You can now test the transcript system by uploading these files.');
  
} catch (error) {
  console.error('❌ Error generating test audio:', error);
}

export { generateTestWAV, generateSpeechLikeTest };
