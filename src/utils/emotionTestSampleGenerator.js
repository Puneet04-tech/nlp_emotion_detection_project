// Enhanced Test Audio Sample Generator for Ultra-Emotion Detection
// Generates synthetic audio samples with specific emotional characteristics

class EmotionTestSampleGenerator {
  constructor() {
    this.audioContext = null;
    this.sampleRate = 48000;
    this.duration = 2.0; // 2 seconds per sample
  }

  async initialize() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return true;
  }

  // Generate test samples for all 18+ emotions
  async generateEmotionTestSamples() {
    const emotions = {
      joy: { 
        pitch: 280, volume: 0.7, tempo: 1.4, 
        text: "This is absolutely wonderful! I'm so happy right now!",
        characteristics: { vibrato: 0.8, brightness: 0.9 }
      },
      sadness: { 
        pitch: 120, volume: 0.3, tempo: 0.7,
        text: "I feel so down and disappointed about everything.",
        characteristics: { vibrato: 0.2, brightness: 0.1 }
      },
      anger: { 
        pitch: 350, volume: 0.9, tempo: 1.6,
        text: "I'm absolutely furious about this situation!",
        characteristics: { vibrato: 0.1, brightness: 0.8, harshness: 0.9 }
      },
      excitement: { 
        pitch: 320, volume: 0.8, tempo: 1.5,
        text: "This is so exciting! I can't believe it's happening!",
        characteristics: { vibrato: 0.9, brightness: 0.95 }
      },
      fear: { 
        pitch: 250, volume: 0.4, tempo: 1.2,
        text: "I'm really scared and worried about what might happen.",
        characteristics: { vibrato: 0.6, brightness: 0.3, tremor: 0.7 }
      },
      surprise: { 
        pitch: 290, volume: 0.6, tempo: 1.3,
        text: "Wow! That's completely unexpected and shocking!",
        characteristics: { vibrato: 0.5, brightness: 0.7, suddenness: 0.9 }
      },
      contempt: { 
        pitch: 180, volume: 0.5, tempo: 0.9,
        text: "That's absolutely ridiculous and beneath my attention.",
        characteristics: { vibrato: 0.1, brightness: 0.2, coldness: 0.8 }
      },
      anticipation: { 
        pitch: 220, volume: 0.6, tempo: 1.1,
        text: "I'm eagerly waiting and expecting something great.",
        characteristics: { vibrato: 0.4, brightness: 0.6, building: 0.8 }
      },
      trust: { 
        pitch: 200, volume: 0.5, tempo: 1.0,
        text: "I have complete confidence and trust in this.",
        characteristics: { vibrato: 0.3, brightness: 0.5, stability: 0.9 }
      },
      melancholy: { 
        pitch: 150, volume: 0.4, tempo: 0.8,
        text: "There's a bittersweet feeling of nostalgia here.",
        characteristics: { vibrato: 0.4, brightness: 0.2, wistfulness: 0.8 }
      },
      euphoria: { 
        pitch: 380, volume: 0.9, tempo: 1.7,
        text: "I'm experiencing pure bliss and overwhelming joy!",
        characteristics: { vibrato: 1.0, brightness: 1.0, intensity: 0.95 }
      },
      serenity: { 
        pitch: 160, volume: 0.4, tempo: 0.9,
        text: "I feel completely peaceful and at ease with everything.",
        characteristics: { vibrato: 0.2, brightness: 0.4, calmness: 0.9 }
      },
      determination: { 
        pitch: 240, volume: 0.7, tempo: 1.2,
        text: "I'm absolutely determined to achieve this goal.",
        characteristics: { vibrato: 0.3, brightness: 0.7, strength: 0.9 }
      },
      curiosity: { 
        pitch: 210, volume: 0.6, tempo: 1.1,
        text: "I'm really curious to understand how this works.",
        characteristics: { vibrato: 0.5, brightness: 0.6, inquisitiveness: 0.8 }
      },
      disgust: { 
        pitch: 140, volume: 0.5, tempo: 0.8,
        text: "That's absolutely disgusting and repulsive.",
        characteristics: { vibrato: 0.1, brightness: 0.1, revulsion: 0.8 }
      },
      admiration: { 
        pitch: 230, volume: 0.6, tempo: 1.0,
        text: "I have tremendous respect and admiration for this.",
        characteristics: { vibrato: 0.4, brightness: 0.7, warmth: 0.8 }
      },
      envy: { 
        pitch: 190, volume: 0.5, tempo: 0.9,
        text: "I wish I had what they have, it's not fair.",
        characteristics: { vibrato: 0.3, brightness: 0.3, bitterness: 0.7 }
      },
      gratitude: { 
        pitch: 200, volume: 0.6, tempo: 1.0,
        text: "I'm so grateful and thankful for everything.",
        characteristics: { vibrato: 0.4, brightness: 0.8, warmth: 0.9 }
      }
    };

    return emotions;
  }

  // Generate synthetic audio blob for testing
  async generateSyntheticAudio(emotionConfig) {
    const { pitch, volume, tempo, characteristics } = emotionConfig;
    const bufferLength = this.sampleRate * this.duration;
    const buffer = this.audioContext.createBuffer(1, bufferLength, this.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < bufferLength; i++) {
      const time = i / this.sampleRate;
      const frequency = pitch + (characteristics.vibrato * 10 * Math.sin(time * 6));
      
      // Generate base tone
      let sample = Math.sin(2 * Math.PI * frequency * time) * volume;
      
      // Add harmonics for realism
      sample += 0.3 * Math.sin(2 * Math.PI * frequency * 2 * time) * volume;
      sample += 0.1 * Math.sin(2 * Math.PI * frequency * 3 * time) * volume;
      
      // Add characteristics
      if (characteristics.tremor) {
        sample *= (1 + characteristics.tremor * 0.2 * Math.sin(time * 12));
      }
      
      if (characteristics.harshness) {
        sample += characteristics.harshness * 0.1 * Math.random();
      }
      
      // Apply tempo envelope
      const envelope = Math.sin(Math.PI * i / bufferLength) * tempo;
      channelData[i] = sample * envelope * 0.3;
    }

    return this.bufferToBlob(buffer);
  }

  bufferToBlob(buffer) {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(i * 2, sample * 0x7FFF, true);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Generate test samples for UI
  async createTestSampleButtons() {
    const emotions = await this.generateEmotionTestSamples();
    const testSamples = {};

    for (const [emotion, config] of Object.entries(emotions)) {
      testSamples[emotion] = {
        audio: await this.generateSyntheticAudio(config),
        text: config.text,
        expectedResults: {
          dominantEmotion: emotion,
          confidence: 0.85 + Math.random() * 0.15,
          characteristics: config.characteristics
        }
      };
    }

    return testSamples;
  }
}

export default EmotionTestSampleGenerator;
