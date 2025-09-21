// Mock Vosk Manager
// Provides mock functionality for Vosk speech recognition

class MockVoskManager {
  constructor() {
    this.isInitialized = false;
    this.isRecording = false;
    this.model = null;
    this.recognizer = null;
    console.log('🎙️ MockVoskManager initialized');
  }

  // Provide a recognizer-like object so diagnostics and other code can call
  // createRecognizer(...) and use AcceptWaveform/FinalResult style APIs.
  async createRecognizer(sampleRate = 16000) {
    if (!this.isInitialized) {
      // initialize with default model if not already
      await this.initialize();
    }

    // simple internal buffer to collect audio (not used for real ASR)
    let buffer = [];
    let lastFinal = '';

    const makeResult = (text) => JSON.stringify({ text });

    const recognizer = {
      // CamelCase and lowercase aliases
      AcceptWaveform: (data) => {
        try {
          // Accept Int16Array or array-like
          if (data && data.length) {
            buffer.push(data.length);
          }
          // create a pseudo-transcript based on buffer length
          lastFinal = `mock transcription (${buffer.reduce((a,b)=>a+b,0)} samples)`;
          return true;
        } catch (e) { return false; }
      },
      acceptWaveform: function(data) { return recognizer.AcceptWaveform(data); },

      FinalResult: () => makeResult(lastFinal || 'mock final result'),
      finalResult: () => recognizer.FinalResult(),

      PartialResult: () => JSON.stringify({ partial: lastFinal ? lastFinal.slice(0, 20) : 'mock partial' }),
      partialResult: () => recognizer.PartialResult(),

      // optional helper to reset internal state
      reset: () => { buffer = []; lastFinal = ''; }
    };

    return recognizer;
  }

  async initialize(modelPath = 'vosk-model-small-en-us-0.15') {
    try {
      console.log('🔄 Initializing mock Vosk model...');
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.model = {
        name: modelPath,
        language: 'en-US',
        size: '39MB',
        loaded: true
      };
      
      this.isInitialized = true;
      console.log('✅ Mock Vosk model initialized:', this.model);
      
      return {
        success: true,
        model: this.model
      };
    } catch (error) {
      console.error('❌ Mock Vosk initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async startRecognition(callback) {
    if (!this.isInitialized) {
      throw new Error('Vosk not initialized');
    }

    this.isRecording = true;
    console.log('🎙️ Mock Vosk recording started');

    // Mock speech recognition with periodic results
    const mockResults = [
      'hello',
      'hello world',
      'hello world this',
      'hello world this is',
      'hello world this is a test',
      'hello world this is a test of speech recognition'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (!this.isRecording || index >= mockResults.length) {
        clearInterval(interval);
        return;
      }

      const result = {
        partial: index < mockResults.length - 1,
        text: mockResults[index],
        confidence: 0.85 + Math.random() * 0.15
      };

      if (callback) {
        callback(result);
      }

      index++;
    }, 800);

    return interval;
  }

  stopRecognition() {
    this.isRecording = false;
    console.log('⏹️ Mock Vosk recording stopped');
  }

  async transcribeAudio(audioBlob) {
    try {
      console.log('🔄 Mock transcribing audio blob...');
      
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcription results
      const mockTranscriptions = [
        'This is a sample transcription of your audio',
        'Hello, this is a test of the speech recognition system',
        'The weather is nice today and I feel great',
        'I am testing the emotion detection system with voice input',
        'This is an example of speech to text conversion'
      ];
      
      const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      return {
        success: true,
        text: transcription,
        confidence: 0.82 + Math.random() * 0.15,
        duration: Math.random() * 10 + 2,
        language: 'en-US'
      };
    } catch (error) {
      console.error('❌ Mock transcription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      recording: this.isRecording,
      model: this.model,
      type: 'mock'
    };
  }
}

// Create and export instance
export const mockVoskManager = new MockVoskManager();

export default MockVoskManager;
export { MockVoskManager };
