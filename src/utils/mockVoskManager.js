// Vosk Replacement - Non-downloading version
// This provides a working interface without any external downloads

export class MockVoskManager {
  constructor() {
    this.isReady = true;
    this.loadedModel = { mock: true };
  }

  async initialize(onProgress = null) {
    if (onProgress) onProgress('🔍 Using mock Vosk (no downloads)...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate loading
    if (onProgress) onProgress('✅ Mock Vosk ready');
    return true;
  }

  async createRecognizer(sampleRate = 16000) {
    // Generate emotionally diverse mock transcripts
    const mockTranscripts = [
      // Joy/Happiness
      "I'm absolutely thrilled and excited about this amazing breakthrough in emotion detection!",
      "This is fantastic news and I'm so happy with these wonderful results!",
      "I love this incredible system, it's working brilliantly and making me feel joyful!",
      
      // Anger/Frustration
      "I'm really angry and frustrated with this terrible situation, it's completely awful!",
      "This is stupid and I hate how badly this is performing, it's driving me crazy!",
      "I'm furious about this horrible mess, this is absolutely ridiculous!",
      
      // Sadness/Disappointment
      "I feel so sad and disappointed about this painful situation, it really hurts.",
      "This is making me cry because it's so depressing and heartbreaking.",
      "I'm feeling lonely and empty, this whole thing just makes me feel broken.",
      
      // Fear/Anxiety
      "I'm scared and terrified about what might happen, this is really frightening me.",
      "This situation is making me panic and feel anxious, I'm worried something bad will occur.",
      "I'm nervous and afraid about this uncertain outcome, it's causing me anxiety.",
      
      // Surprise
      "Wow, that's absolutely shocking and unexpected! I can't believe this amazing surprise!",
      "This is so sudden and surprising, what an incredible and unbelievable result!",
      "Oh my goodness, that's completely shocking! I never expected this!",
      
      // Neutral/Standard
      "This is a standard analysis of the audio processing system functionality.",
      "The voice emotion detection is operating within normal parameters."
    ];
    
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    return {
      AcceptWaveform: () => true,
      acceptWaveform: () => true,
      FinalResult: () => JSON.stringify({ text: randomTranscript }),
      finalResult: () => ({ text: randomTranscript }),
      PartialResult: () => JSON.stringify({ partial: "Processing..." }),
      partialResult: () => ({ partial: "Processing..." })
    };
  }

  getModelInfo() {
    return {
      loaded: true,
      path: 'mock',
      type: 'Mock (No Downloads)'
    };
  }
}

// Create a mock that prevents any real vosk operations
export const mockVoskManager = new MockVoskManager();
