// Voice Emotion Testing Utilities
// This file helps test and validate the enhanced emotion detection

export const createTestAudio = (emotion = 'joy', duration = 2) => {
  const sampleRate = 16000;
  const samples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);
  
  // Generate audio data based on emotion characteristics
  const emotionParams = {
    joy: { freq: 440, amplitude: 0.4, variation: 0.8 },
    anger: { freq: 200, amplitude: 0.7, variation: 1.2 },
    sadness: { freq: 150, amplitude: 0.2, variation: 0.3 },
    fear: { freq: 350, amplitude: 0.3, variation: 1.5 },
    surprise: { freq: 500, amplitude: 0.5, variation: 1.0 },
    neutral: { freq: 220, amplitude: 0.3, variation: 0.5 }
  };
  
  const params = emotionParams[emotion] || emotionParams.neutral;
  
  for (let i = 0; i < samples; i++) {
    // Create more complex waveform that simulates emotional characteristics
    const time = i / sampleRate;
    const baseFreq = params.freq;
    const modulation = Math.sin(2 * Math.PI * 5 * time) * params.variation;
    const frequency = baseFreq + modulation;
    
    // Add some harmonics for more realistic voice-like sound
    const fundamental = Math.sin(2 * Math.PI * frequency * time);
    const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.3;
    const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.1;
    
    const sample = (fundamental + harmonic2 + harmonic3) * params.amplitude;
    
    // Add some noise for realism
    const noise = (Math.random() - 0.5) * 0.05;
    const finalSample = sample + noise;
    
    view.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, finalSample * 32767)), true);
  }
  
  return new File([buffer], `test-${emotion}-audio.wav`, { type: 'audio/wav' });
};

export const emotionTestSuite = [
  { emotion: 'joy', expectedKeywords: ['happy', 'excited', 'wonderful', 'amazing'] },
  { emotion: 'anger', expectedKeywords: ['angry', 'frustrated', 'terrible', 'awful'] },
  { emotion: 'sadness', expectedKeywords: ['sad', 'disappointed', 'hurt', 'cry'] },
  { emotion: 'fear', expectedKeywords: ['scared', 'terrified', 'anxious', 'worried'] },
  { emotion: 'surprise', expectedKeywords: ['shocking', 'unexpected', 'amazing', 'wow'] },
  { emotion: 'neutral', expectedKeywords: ['standard', 'normal', 'analysis', 'system'] }
];

export const validateEmotionDetection = (detectedEmotion, expectedEmotion, confidence) => {
  const isCorrect = detectedEmotion === expectedEmotion;
  const isHighConfidence = confidence > 0.6;
  
  return {
    isCorrect,
    isHighConfidence,
    score: isCorrect ? (isHighConfidence ? 1.0 : 0.7) : 0.0,
    message: isCorrect ? 
      `✅ Correct! Detected ${detectedEmotion} (confidence: ${(confidence * 100).toFixed(1)}%)` :
      `❌ Incorrect. Expected ${expectedEmotion}, got ${detectedEmotion} (confidence: ${(confidence * 100).toFixed(1)}%)`
  };
};
