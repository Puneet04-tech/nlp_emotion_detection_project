// Test Audio File Generator for Transcript Extraction Testing
// This script creates a simple test audio file that can be used to verify
// that the transcript extraction system is working properly

const fs = require('fs');

// Create a simple WAV file header for testing
// This creates a minimal WAV file that can be processed by Vosk
function createTestWavFile(filename, durationSeconds = 3) {
    const sampleRate = 16000; // 16kHz as required by Vosk
    const bitsPerSample = 16;
    const channels = 1; // Mono
    const samplesPerSecond = sampleRate * channels;
    const bytesPerSample = bitsPerSample / 8;
    const totalSamples = sampleRate * durationSeconds;
    const dataSize = totalSamples * bytesPerSample;
    const fileSize = dataSize + 44; // WAV header is 44 bytes

    const buffer = Buffer.alloc(fileSize);
    let offset = 0;

    // WAV file header
    buffer.write('RIFF', offset); offset += 4;
    buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
    buffer.write('WAVE', offset); offset += 4;
    
    // Format chunk
    buffer.write('fmt ', offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4; // Chunk size
    buffer.writeUInt16LE(1, offset); offset += 2; // Audio format (PCM)
    buffer.writeUInt16LE(channels, offset); offset += 2;
    buffer.writeUInt32LE(sampleRate, offset); offset += 4;
    buffer.writeUInt32LE(samplesPerSecond * bytesPerSample, offset); offset += 4; // Byte rate
    buffer.writeUInt16LE(channels * bytesPerSample, offset); offset += 2; // Block align
    buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
    
    // Data chunk
    buffer.write('data', offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;
    
    // Generate simple tone (sine wave for test)
    const frequency = 440; // A note
    for (let i = 0; i < totalSamples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3; // Low volume
        const value = Math.round(sample * 32767); // Convert to 16-bit
        buffer.writeInt16LE(value, offset);
        offset += 2;
    }

    fs.writeFileSync(filename, buffer);
    console.log(`✅ Created test audio file: ${filename}`);
    console.log(`📊 Duration: ${durationSeconds}s, Sample Rate: ${sampleRate}Hz, Format: WAV`);
}

// Create test files
createTestWavFile('test-speech.wav', 3);

console.log('\n🎙️ Test Instructions:');
console.log('1. Upload test-speech.wav to the voice emotion analyzer');
console.log('2. Check if transcript extraction works properly');
console.log('3. Verify that real speech content is detected (or proper "no speech" message)');
console.log('4. Test with actual speech recordings for full validation');
