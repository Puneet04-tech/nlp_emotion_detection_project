// Simple Test Manager - Guaranteed to work without any dependencies
export class SimpleTestManager {
  constructor() {
    this.isReady = true;
    this.transcripts = [
      // Joy/Happiness
      "I'm feeling absolutely fantastic about this amazing analysis, it's working wonderfully!",
      "This is so exciting and brilliant, I love how well the emotion detection is performing!",
      "Wow, this is incredible! The system is absolutely awesome and I'm thrilled with the results!",
      
      // Anger/Frustration  
      "I'm really angry and frustrated with this terrible situation, it's absolutely awful!",
      "This is completely stupid and ridiculous, I hate how badly this is going!",
      "I'm furious about this horrible mess, it's driving me absolutely crazy!",
      
      // Sadness/Disappointment
      "I feel so sad and disappointed, this is really hurting me deeply inside.",
      "I'm crying because this is so painful and depressing, I feel completely broken.",
      "This makes me feel lonely and empty, I'm sorry but I'm just so hurt by this.",
      
      // Fear/Anxiety
      "I'm really scared and terrified about what might happen, I'm so anxious and worried.",
      "This is frightening me and making me panic, I'm afraid something terrible will occur.",
      "I'm nervous and worried sick about this situation, it's making me feel anxious.",
      
      // Surprise
      "Oh wow, that's absolutely shocking and unexpected! I can't believe this amazing surprise!",
      "This is so sudden and surprising, I'm completely amazed by this unbelievable result!",
      "What?! That's incredibly surprising and shocking, I never expected this!",
      
      // Neutral/Calm
      "This is a normal analysis of the audio processing system functionality.",
      "The voice emotion detection is operating within standard parameters today."
    ];
  }

  async initialize() {
    console.log('✅ Simple Test Manager initialized');
    return true;
  }

  async transcribeAudio(audioData) {
    // Simple deterministic selection based on audio length
    const index = audioData ? (audioData.length % this.transcripts.length) : 0;
    const transcript = this.transcripts[index];
    
    console.log(`🎵 Simple transcription: "${transcript}"`);
    return transcript;
  }

  async processAudio(audioData) {
    const transcript = await this.transcribeAudio(audioData);
    return {
      transcript,
      confidence: 0.95,
      manager: 'simple-test'
    };
  }

  getStatus() {
    return {
      isReady: true,
      manager: 'simple-test',
      transcriptCount: this.transcripts.length
    };
  }

  cleanup() {
    console.log('🧹 Simple Test Manager cleaned up');
  }
}

export default SimpleTestManager;
