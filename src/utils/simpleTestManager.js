// Simple Test Manager
// Provides simple testing functionality for audio processing

export class SimpleTestManager {
  constructor() {
    this.tests = [];
    this.isRunning = false;
    console.log('🧪 SimpleTestManager initialized');
  }

  async runAudioTest(audioBlob, testType = 'basic') {
    try {
      console.log(`🧪 Running ${testType} audio test...`);
      this.isRunning = true;

      // Simulate test processing
      await new Promise(resolve => setTimeout(resolve, 1200));

      const testResult = {
        success: true,
        testType: testType,
        audioSize: audioBlob?.size || 0,
        duration: Math.random() * 10 + 2,
        quality: 'good',
        sampleRate: 44100,
        channels: 1,
        format: 'wav',
        timestamp: new Date().toISOString()
      };

      this.tests.push(testResult);
      this.isRunning = false;

      console.log('✅ Audio test completed:', testResult);
      return testResult;
    } catch (error) {
      this.isRunning = false;
      console.error('❌ Audio test error:', error);
      return {
        success: false,
        error: error.message,
        testType: testType
      };
    }
  }

  async runMockTranscription(text) {
    try {
      console.log('🧪 Running mock transcription test...');
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = {
        success: true,
        originalText: text,
        processedText: text || 'Sample transcription text',
        confidence: 0.85 + Math.random() * 0.12,
        processingTime: Math.random() * 2 + 0.5,
        wordCount: (text || '').split(' ').length
      };

      console.log('✅ Mock transcription completed');
      return result;
    } catch (error) {
      console.error('❌ Mock transcription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testEmotionDetection(text, audioFeatures = {}) {
    try {
      console.log('🧪 Running emotion detection test...');
      
      // Simulate emotion processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const emotions = ['joy', 'sadness', 'anger', 'surprise', 'fear', 'neutral'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      const result = {
        success: true,
        dominantEmotion: randomEmotion,
        confidence: 75 + Math.random() * 20,
        allEmotions: {
          [randomEmotion]: 75 + Math.random() * 20,
          neutral: 60 + Math.random() * 15,
          joy: 50 + Math.random() * 25
        },
        audioFeatures: audioFeatures,
        processingTime: Math.random() * 1.5 + 0.8
      };

      console.log('✅ Emotion detection test completed');
      return result;
    } catch (error) {
      console.error('❌ Emotion detection test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getTestHistory() {
    return this.tests;
  }

  clearTests() {
    this.tests = [];
    console.log('🧪 Test history cleared');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      totalTests: this.tests.length,
      lastTest: this.tests[this.tests.length - 1] || null
    };
  }
}

export const simpleTestManager = new SimpleTestManager();
export default SimpleTestManager;
