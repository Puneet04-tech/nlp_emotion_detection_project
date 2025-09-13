// Emotion Detection Engine
// Core emotion analysis and detection functionality

export class EmotionDetectionEngine {
  constructor() {
    this.emotions = [
      'neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
      'excitement', 'calm', 'frustrated', 'confident', 'nervous',
      'melancholy', 'euphoria', 'serenity', 'determination', 'curiosity',
      'admiration', 'envy', 'gratitude', 'contempt', 'anticipation', 'trust'
    ];
    
    this.initialized = false;
    console.log('🧠 EmotionDetectionEngine created');
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Emotion Detection Engine...');
      
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.initialized = true;
      console.log('✅ Emotion Detection Engine initialized');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Emotion engine initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  analyzeText(text) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultEmotionResult();
    }

    const lowerText = text.toLowerCase();
    const emotions = {};

    // Joy indicators
    const joyWords = ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'great', 'fantastic', 'excellent'];
    const joyScore = this.calculateWordScore(lowerText, joyWords);
    if (joyScore > 0) emotions.joy = Math.min(joyScore * 20 + 60, 95);

    // Sadness indicators
    const sadWords = ['sad', 'down', 'disappointed', 'depressed', 'unhappy', 'miserable'];
    const sadScore = this.calculateWordScore(lowerText, sadWords);
    if (sadScore > 0) emotions.sadness = Math.min(sadScore * 25 + 65, 90);

    // Anger indicators
    const angerWords = ['angry', 'furious', 'mad', 'annoyed', 'frustrated', 'irritated'];
    const angerScore = this.calculateWordScore(lowerText, angerWords);
    if (angerScore > 0) emotions.anger = Math.min(angerScore * 30 + 70, 95);

    // Fear indicators
    const fearWords = ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'frightened'];
    const fearScore = this.calculateWordScore(lowerText, fearWords);
    if (fearScore > 0) emotions.fear = Math.min(fearScore * 25 + 60, 88);

    // Surprise indicators
    const surpriseWords = ['wow', 'amazing', 'unexpected', 'shocking', 'surprising'];
    const surpriseScore = this.calculateWordScore(lowerText, surpriseWords);
    if (surpriseScore > 0) emotions.surprise = Math.min(surpriseScore * 20 + 55, 85);

    // If no specific emotions found, default to neutral
    if (Object.keys(emotions).length === 0) {
      emotions.neutral = 70 + Math.random() * 20;
    }

    return this.normalizeEmotions(emotions);
  }

  analyzeVoice(audioFeatures) {
    const emotions = {};

    if (audioFeatures) {
      // Analyze pitch for emotion
      if (audioFeatures.pitch > 300) {
        emotions.excitement = 75 + Math.random() * 20;
      } else if (audioFeatures.pitch < 150) {
        emotions.sadness = 70 + Math.random() * 15;
      }

      // Analyze energy
      if (audioFeatures.energy > 0.8) {
        emotions.joy = 80 + Math.random() * 15;
      } else if (audioFeatures.energy < 0.3) {
        emotions.calm = 75 + Math.random() * 20;
      }

      // Analyze tempo/rhythm
      if (audioFeatures.tempo && audioFeatures.tempo > 0.7) {
        emotions.excitement = Math.max(emotions.excitement || 0, 70 + Math.random() * 25);
      }
    }

    if (Object.keys(emotions).length === 0) {
      emotions.neutral = 65 + Math.random() * 25;
    }

    return this.normalizeEmotions(emotions);
  }

  calculateWordScore(text, words) {
    let score = 0;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    return score;
  }

  normalizeEmotions(emotions) {
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      return { neutral: 100 };
    }

    const normalized = {};
    Object.entries(emotions).forEach(([emotion, score]) => {
      normalized[emotion] = Math.round((score / total) * 100);
    });

    return normalized;
  }

  getDefaultEmotionResult() {
    return {
      neutral: 70,
      joy: 15,
      calm: 10,
      curiosity: 5
    };
  }

  getDominantEmotion(emotions) {
    return Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0] || ['neutral', 70];
  }
}

export const createEmotionEngine = () => new EmotionDetectionEngine();

export default EmotionDetectionEngine;
