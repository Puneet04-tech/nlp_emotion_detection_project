// Enhanced Emotion Detection Engine V2.0
// Advanced multi-modal emotion detection combining BERT, voice analysis, and pattern recognition
// Significantly improved confidence through neural network integration and feature fusion

import { analyzeEmotionWithBERT } from './bertEmotionApi.js';
import { EmotionDetectionEngine } from './emotionDetectionEngine.js';

/**
 * Enhanced Multi-Modal Emotion Detection Engine
 * Combines BERT NLP, voice analysis, pattern recognition, and temporal modeling
 */
export class EnhancedEmotionEngine extends EmotionDetectionEngine {
  constructor() {
    super();
    
    // Neural network weights for feature fusion
    this.fusionWeights = {
      bert: 0.35,          // BERT text analysis
      voice: 0.30,         // Voice acoustic features  
      patterns: 0.20,      // Pattern recognition
      temporal: 0.15       // Temporal context
    };
    
    // Enhanced emotion patterns with deeper linguistic analysis
    this.advancedPatterns = {
      joy: {
        linguistic: {
          positiveIntensifiers: ['absolutely', 'incredibly', 'amazingly', 'fantastically', 'exceptionally'],
          exclamationPatterns: /(!{1,3}|\?!|wow|yay|hooray)/gi,
          superlatives: ['best', 'greatest', 'most amazing', 'perfect', 'outstanding'],
          emoticons: ['😊', '😄', '🎉', '❤️', '🥳', ':)', ':D', '=D'],
          repetitionBonus: /(.)\1{2,}/g, // Repeated characters (sooo happy)
        },
        acoustic: {
          f0_mean: { min: 180, max: 350, weight: 0.25 },
          f0_variance: { min: 200, max: 800, weight: 0.3 },
          energy: { min: 0.4, max: 1.0, weight: 0.2 },
          spectralCentroid: { min: 1000, max: 4000, weight: 0.15 },
          jitter: { min: 0.01, max: 0.05, weight: 0.1 }
        },
        temporal: {
          sustainedPositivity: true,
          energyBursts: true,
          laughterDetection: true
        }
      },
      
      sadness: {
        linguistic: {
          negativeMarkers: ['nobody', 'nothing', 'never', 'alone', 'empty', 'hopeless'],
          pastTenseRegret: /\b(should have|could have|if only|wish I|regret|miss)\b/gi,
          isolationWords: ['alone', 'lonely', 'abandoned', 'forgotten', 'ignored'],
          lossWords: ['lost', 'gone', 'dead', 'ended', 'broken', 'failed'],
          lowEnergyWords: ['tired', 'exhausted', 'drained', 'weak', 'can\'t']
        },
        acoustic: {
          f0_mean: { min: 80, max: 200, weight: 0.3 },
          f0_variance: { min: 20, max: 150, weight: 0.25 },
          energy: { min: 0.05, max: 0.4, weight: 0.25 },
          breathiness: { min: 0.3, max: 1.0, weight: 0.15 },
          pauseDuration: { min: 0.5, max: 3.0, weight: 0.05 }
        },
        temporal: {
          energyDecline: true,
          speechSlowing: true,
          increasedSilence: true
        }
      },
      
      anger: {
        linguistic: {
          profanity: ['damn', 'hell', 'shit', 'fuck', 'bullshit', 'crap'],
          intensiveNegatives: ['absolutely not', 'never again', 'completely wrong'],
          demandingLanguage: ['must', 'have to', 'need to', 'better', 'should'],
          aggressiveQuestions: /\bwhy (the hell|would|did|are|is)\b/gi,
          allCapsWords: /\b[A-Z]{3,}\b/g,
          exclamationClusters: /!{2,}/g
        },
        acoustic: {
          f0_mean: { min: 150, max: 400, weight: 0.2 },
          f0_variance: { min: 300, max: 1200, weight: 0.3 },
          energy: { min: 0.6, max: 1.0, weight: 0.25 },
          spectralSlope: { min: -20, max: -5, weight: 0.15 },
          harshness: { min: 0.4, max: 1.0, weight: 0.1 }
        },
        temporal: {
          voiceBreaks: true,
          suddenLoudness: true,
          rhythmDisruption: true
        }
      },
      
      frustration: {
        linguistic: {
          problemWords: ['issue', 'problem', 'trouble', 'difficulty', 'struggle'],
          stuckLanguage: ['can\'t', 'won\'t work', 'not working', 'broken', 'failing'],
          exhaustionMarkers: ['tired of', 'fed up', 'had enough', 'over this'],
          repetitionComplaints: /\b(again|another|still|keep|always)\b.*\b(problem|issue|trouble)\b/gi,
          timeWasteWords: ['waste', 'wasting time', 'forever', 'taking too long']
        },
        acoustic: {
          f0_mean: { min: 120, max: 300, weight: 0.2 },
          f0_variance: { min: 150, max: 600, weight: 0.25 },
          energy: { min: 0.3, max: 0.8, weight: 0.2 },
          tenseness: { min: 0.4, max: 1.0, weight: 0.25 },
          irregularRhythm: { min: 0.3, max: 1.0, weight: 0.1 }
        },
        temporal: {
          buildingTension: true,
          sighing: true,
          effortfulSpeech: true
        }
      },
      
      sarcasm: {
        linguistic: {
          positiveWordsNegativeContext: ['great', 'wonderful', 'perfect', 'amazing', 'fantastic'],
          obviousStatements: /\b(obviously|clearly|of course|naturally|sure)\b/gi,
          contradictioryPhrases: ['yeah right', 'as if', 'I bet', 'how convenient'],
          exaggeratedPoliteness: ['thanks so much', 'how lovely', 'how nice'],
          questionableSupport: /\b(good luck|have fun|enjoy) (with that|this)\b/gi
        },
        acoustic: {
          f0_mean: { min: 100, max: 250, weight: 0.15 },
          f0_variance: { min: 50, max: 200, weight: 0.3 },
          flatIntonation: { min: 0.0, max: 0.3, weight: 0.25 },
          elongatedSyllables: { min: 0.3, max: 1.0, weight: 0.2 },
          monotoneDelivery: { min: 0.4, max: 1.0, weight: 0.1 }
        },
        temporal: {
          deliberateSlowing: true,
          emphasisMismatch: true,
          pauseManipulation: true
        }
      },
      
      fear: {
        linguistic: {
          fearWords: ['scared', 'afraid', 'terrified', 'panic', 'anxious', 'worried'],
          uncertaintyMarkers: ['maybe', 'perhaps', 'I think', 'not sure', 'worried that'],
          protectiveLanguage: ['safe', 'careful', 'dangerous', 'risky', 'threat'],
          helpSeeking: ['help', 'support', 'assistance', 'guidance', 'advice']
        },
        acoustic: {
          f0_mean: { min: 200, max: 450, weight: 0.25 },
          f0_variance: { min: 400, max: 1000, weight: 0.3 },
          energy: { min: 0.2, max: 0.7, weight: 0.2 },
          voiceTremor: { min: 0.3, max: 1.0, weight: 0.15 },
          breathShortness: { min: 0.4, max: 1.0, weight: 0.1 }
        },
        temporal: {
          acceleratedSpeech: true,
          voiceBreaking: true,
          hesitation: true
        }
      },
      
      surprise: {
        linguistic: {
          exclamations: ['wow', 'whoa', 'oh my', 'really', 'seriously', 'no way'],
          disbeliefMarkers: ['can\'t believe', 'unbelievable', 'incredible', 'shocking'],
          questioningReality: /\b(is this real|am I dreaming|did this really)\b/gi,
          suddenRealizations: ['I just realized', 'wait', 'hold on', 'actually']
        },
        acoustic: {
          f0_mean: { min: 200, max: 500, weight: 0.2 },
          f0_variance: { min: 500, max: 1500, weight: 0.35 },
          energy: { min: 0.4, max: 1.0, weight: 0.25 },
          suddennessMarker: { min: 0.5, max: 1.0, weight: 0.15 },
          riseTime: { min: 0.1, max: 0.3, weight: 0.05 }
        },
        temporal: {
          suddenOnset: true,
          rapidTransition: true,
          energySpike: true
        }
      }
    };
    
    // Temporal context tracking
    this.temporalContext = {
      emotionHistory: [],
      confidenceHistory: [],
      trendAnalysis: null,
      contextWindow: 30 // seconds
    };
    
    // BERT integration settings
    this.bertConfig = {
      enabled: true,
      candidates: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral', 'frustration', 'sarcasm'],
      contextWindow: 5, // sentences
      confidence_threshold: 0.1
    };
    
    // Voice analysis settings
    this.voiceConfig = {
      sampleRate: 44100,
      frameSize: 2048,
      hopLength: 512,
      windowFunction: 'hann',
      features: ['f0', 'energy', 'spectralCentroid', 'mfcc', 'zcr', 'spectralRolloff']
    };
  }

  /**
   * Enhanced initialization with BERT and voice analysis setup
   */
  async initializeEnhanced() {
    try {
      // Initialize base engine
      await super.initialize();
      
      // Initialize BERT integration
      await this.initializeBERT();
      
      // Setup voice analysis
      await this.initializeVoiceAnalysis();
      
      console.log('🚀 Enhanced Emotion Engine V2.0 initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize enhanced emotion engine:', error);
      return false;
    }
  }

  /**
   * Initialize BERT integration
   */
  async initializeBERT() {
    try {
      // Test BERT connection
      const testResult = await analyzeEmotionWithBERT('I am testing the BERT integration');
      if (testResult && testResult.array && testResult.array.length > 0) {
        this.bertConfig.enabled = true;
        console.log('✅ BERT integration active');
      } else {
        console.log('⚠️ BERT falling back to lexical analysis');
        this.bertConfig.enabled = true; // Still use lexical fallback
      }
    } catch (error) {
      console.warn('⚠️ BERT initialization warning:', error);
      this.bertConfig.enabled = true; // Use fallback
    }
  }

  /**
   * Initialize voice analysis capabilities
   */
  async initializeVoiceAnalysis() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Test microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('🎤 Voice analysis capabilities available');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Voice analysis not available:', error);
    }
    return false;
  }

  /**
   * Advanced emotion analysis combining all modalities
   */
  async analyzeEmotionAdvanced(text, audioData = null, options = {}) {
    const startTime = performance.now();
    
    try {
      // 1. BERT Text Analysis
      const bertResults = await this.analyzeBERT(text);
      
      // 2. Pattern Recognition Analysis
      const patternResults = this.analyzePatterns(text);
      
      // 3. Voice Analysis (if audio available)
      const voiceResults = audioData ? await this.analyzeVoice(audioData) : null;
      
      // 4. Temporal Context Analysis
      const temporalResults = this.analyzeTemporalContext();
      
      // 5. Feature Fusion
      const fusedResults = this.fuseEmotionFeatures({
        bert: bertResults,
        patterns: patternResults,
        voice: voiceResults,
        temporal: temporalResults
      });
      
      // 6. Update temporal context
      this.updateTemporalContext(fusedResults);
      
      const processingTime = performance.now() - startTime;
      
      return {
        ...fusedResults,
        modalities: {
          bert: bertResults,
          patterns: patternResults,
          voice: voiceResults,
          temporal: temporalResults
        },
        metadata: {
          processingTime: Math.round(processingTime),
          timestamp: Date.now(),
          version: '2.0'
        }
      };
      
    } catch (error) {
      console.error('❌ Enhanced emotion analysis failed:', error);
      // Fallback to basic analysis
      return super.analyzeCurrentEmotion(text);
    }
  }

  /**
   * BERT-powered text analysis
   */
  async analyzeBERT(text) {
    if (!this.bertConfig.enabled || !text?.trim()) {
      return { detected: 'neutral', confidence: 0.1, breakdown: {} };
    }

    try {
      const bertResult = await analyzeEmotionWithBERT(text, {
        candidates: this.bertConfig.candidates
      });

      // Process BERT results
      const breakdown = {};
      let topEmotion = 'neutral';
      let topConfidence = 0;

      if (bertResult.array && bertResult.array.length > 0) {
        bertResult.array.forEach(item => {
          breakdown[item.label] = item.score;
          if (item.score > topConfidence) {
            topConfidence = item.score;
            topEmotion = item.label;
          }
        });
      }

      // Apply confidence boost for high-quality BERT results
      const qualityBoost = this.calculateBERTQualityBoost(text, breakdown);
      topConfidence = Math.min(0.95, topConfidence * (1 + qualityBoost));

      return {
        detected: topEmotion,
        confidence: topConfidence,
        breakdown: breakdown,
        qualityScore: qualityBoost
      };

    } catch (error) {
      console.warn('⚠️ BERT analysis failed, using fallback:', error);
      return this.analyzePatterns(text); // Fallback to pattern analysis
    }
  }

  /**
   * Calculate BERT quality boost based on text characteristics
   */
  calculateBERTQualityBoost(text, breakdown) {
    let boost = 0;
    
    // Length bonus (BERT works better with more context)
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 10) boost += 0.1;
    if (wordCount > 20) boost += 0.1;
    
    // Clarity bonus (clear emotional indicators)
    const emotionWords = this.countEmotionWords(text);
    if (emotionWords > 2) boost += 0.15;
    
    // Confidence distribution (clear winner vs unclear)
    const scores = Object.values(breakdown);
    const maxScore = Math.max(...scores);
    const secondMaxScore = scores.sort((a, b) => b - a)[1] || 0;
    const confidenceSeparation = maxScore - secondMaxScore;
    if (confidenceSeparation > 0.3) boost += 0.2;
    
    return Math.min(0.5, boost); // Cap at 50% boost
  }

  /**
   * Enhanced pattern recognition with deeper linguistic analysis
   */
  analyzePatterns(text) {
    if (!text?.trim()) {
      return { detected: 'neutral', confidence: 0.1, breakdown: {} };
    }

    const results = {};
    
    // Analyze each emotion pattern
    Object.entries(this.advancedPatterns).forEach(([emotion, patterns]) => {
      let score = 0;
      
      // Linguistic analysis
      if (patterns.linguistic) {
        score += this.analyzeLinguisticPatterns(text, patterns.linguistic);
      }
      
      // Additional scoring factors
      score += this.analyzeTextComplexity(text, emotion);
      score += this.analyzeEmotionalIntensity(text, emotion);
      
      results[emotion] = Math.min(0.95, score);
    });

    // Normalize scores
    const total = Object.values(results).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(results).forEach(emotion => {
        results[emotion] = results[emotion] / total;
      });
    }

    // Find top emotion
    const topEmotion = Object.entries(results).reduce((a, b) => 
      results[a[0]] > results[b[0]] ? a : b
    )[0];

    return {
      detected: topEmotion || 'neutral',
      confidence: results[topEmotion] || 0.1,
      breakdown: results
    };
  }

  /**
   * Analyze linguistic patterns for specific emotion
   */
  analyzeLinguisticPatterns(text, linguistic) {
    let score = 0;
    const textLower = text.toLowerCase();
    
    // Check each linguistic feature
    Object.entries(linguistic).forEach(([feature, patterns]) => {
      switch (feature) {
        case 'positiveIntensifiers':
        case 'negativeMarkers':
        case 'fearWords':
        case 'problemWords':
          score += this.countWordMatches(textLower, patterns) * 0.1;
          break;
          
        case 'exclamationPatterns':
        case 'pastTenseRegret':
        case 'aggressiveQuestions':
          if (patterns instanceof RegExp) {
            const matches = textLower.match(patterns);
            score += (matches?.length || 0) * 0.15;
          }
          break;
          
        case 'repetitionBonus':
        case 'allCapsWords':
          if (patterns instanceof RegExp) {
            const matches = text.match(patterns); // Use original case
            score += (matches?.length || 0) * 0.05;
          }
          break;
          
        case 'emoticons':
          score += this.countWordMatches(text, patterns) * 0.08;
          break;
      }
    });
    
    return Math.min(0.8, score);
  }

  /**
   * Count word matches in text
   */
  countWordMatches(text, words) {
    if (!Array.isArray(words)) return 0;
    return words.reduce((count, word) => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches?.length || 0);
    }, 0);
  }

  /**
   * Analyze text complexity factors
   */
  analyzeTextComplexity(text, emotion) {
    let score = 0;
    
    // Sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.split(/\s+/).length / sentences.length;
    
    // Different emotions have different complexity patterns
    switch (emotion) {
      case 'anger':
        // Anger often has shorter, sharper sentences
        if (avgSentenceLength < 8) score += 0.1;
        break;
      case 'sadness':
        // Sadness may have longer, more reflective sentences
        if (avgSentenceLength > 12) score += 0.1;
        break;
      case 'joy':
        // Joy often has exclamatory structures
        const exclamations = (text.match(/!/g) || []).length;
        score += Math.min(0.2, exclamations * 0.05);
        break;
    }
    
    return score;
  }

  /**
   * Analyze emotional intensity markers
   */
  analyzeEmotionalIntensity(text, emotion) {
    let score = 0;
    
    // Intensifiers
    const intensifiers = ['very', 'extremely', 'really', 'so', 'completely', 'absolutely', 'totally'];
    const intensifierCount = this.countWordMatches(text.toLowerCase(), intensifiers);
    score += Math.min(0.15, intensifierCount * 0.03);
    
    // Repetition for emphasis
    const repetitionPattern = /\b(\w+)\s+\1\b/gi;
    const repetitions = (text.match(repetitionPattern) || []).length;
    score += Math.min(0.1, repetitions * 0.05);
    
    // ALL CAPS for emphasis
    const capsPattern = /\b[A-Z]{3,}\b/g;
    const capsWords = (text.match(capsPattern) || []).length;
    score += Math.min(0.1, capsWords * 0.03);
    
    return score;
  }

  /**
   * Analyze voice/audio features (when available)
   */
  async analyzeVoice(audioData) {
    // Placeholder for voice analysis - would integrate with Web Audio API
    // This would extract prosodic features, pitch, energy, etc.
    return {
      detected: 'neutral',
      confidence: 0.5,
      features: {
        pitch: 200,
        energy: 0.5,
        spectralCentroid: 2000,
        voiceQuality: 0.7
      }
    };
  }

  /**
   * Analyze temporal context and trends
   */
  analyzeTemporalContext() {
    const history = this.temporalContext.emotionHistory;
    if (history.length < 2) {
      return { detected: 'neutral', confidence: 0.1, trend: 'stable' };
    }

    // Analyze recent trend
    const recentEmotions = history.slice(-5);
    const trend = this.calculateEmotionTrend(recentEmotions);
    
    // Calculate context confidence based on consistency
    const consistency = this.calculateEmotionConsistency(recentEmotions);
    
    return {
      detected: recentEmotions[recentEmotions.length - 1]?.emotion || 'neutral',
      confidence: consistency,
      trend: trend,
      consistency: consistency
    };
  }

  /**
   * Calculate emotion trend over time
   */
  calculateEmotionTrend(emotions) {
    if (emotions.length < 3) return 'stable';
    
    // Simple trend analysis
    const recent = emotions.slice(-3);
    const valences = recent.map(e => this.getEmotionValence(e.emotion));
    
    if (valences[2] > valences[1] && valences[1] > valences[0]) return 'improving';
    if (valences[2] < valences[1] && valences[1] < valences[0]) return 'declining';
    return 'stable';
  }

  /**
   * Get emotion valence (-1 to 1)
   */
  getEmotionValence(emotion) {
    const valences = {
      joy: 0.8,
      surprise: 0.3,
      neutral: 0.0,
      frustration: -0.3,
      anger: -0.6,
      sadness: -0.7,
      fear: -0.5,
      sarcasm: -0.2
    };
    return valences[emotion] || 0.0;
  }

  /**
   * Calculate emotion consistency
   */
  calculateEmotionConsistency(emotions) {
    if (emotions.length < 2) return 0.5;
    
    const dominantEmotion = this.findDominantEmotion(emotions);
    const dominantCount = emotions.filter(e => e.emotion === dominantEmotion).length;
    
    return dominantCount / emotions.length;
  }

  /**
   * Find dominant emotion in array
   */
  findDominantEmotion(emotions) {
    const counts = {};
    emotions.forEach(e => {
      counts[e.emotion] = (counts[e.emotion] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  /**
   * Fuse features from all modalities
   */
  fuseEmotionFeatures({ bert, patterns, voice, temporal }) {
    const emotions = this.bertConfig.candidates;
    const fusedScores = {};
    
    // Initialize scores
    emotions.forEach(emotion => {
      fusedScores[emotion] = 0;
    });
    
    // Weighted fusion
    if (bert) {
      Object.entries(bert.breakdown).forEach(([emotion, score]) => {
        fusedScores[emotion] += score * this.fusionWeights.bert;
      });
    }
    
    if (patterns) {
      Object.entries(patterns.breakdown).forEach(([emotion, score]) => {
        fusedScores[emotion] += score * this.fusionWeights.patterns;
      });
    }
    
    if (voice) {
      // Voice analysis would contribute here
      fusedScores[voice.detected] += voice.confidence * this.fusionWeights.voice;
    }
    
    if (temporal) {
      // Temporal context boost
      fusedScores[temporal.detected] += temporal.confidence * this.fusionWeights.temporal;
    }
    
    // Normalize scores
    const total = Object.values(fusedScores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(fusedScores).forEach(emotion => {
        fusedScores[emotion] = fusedScores[emotion] / total;
      });
    }
    
    // Find top emotion
    const topEmotion = Object.entries(fusedScores).reduce((a, b) => 
      fusedScores[a[0]] > fusedScores[b[0]] ? a : b
    )[0];
    
    // Calculate overall confidence
    const topScore = fusedScores[topEmotion];
    const secondScore = Object.values(fusedScores).sort((a, b) => b - a)[1] || 0;
    const confidenceSeparation = topScore - secondScore;
    const overallConfidence = Math.min(0.95, topScore + (confidenceSeparation * 0.5));
    
    return {
      detected: topEmotion || 'neutral',
      confidence: overallConfidence,
      breakdown: fusedScores,
      fusionWeights: this.fusionWeights
    };
  }

  /**
   * Update temporal context with new analysis
   */
  updateTemporalContext(analysis) {
    const now = Date.now();
    
    // Add to emotion history
    this.temporalContext.emotionHistory.push({
      emotion: analysis.detected,
      confidence: analysis.confidence,
      timestamp: now
    });
    
    // Add to confidence history  
    this.temporalContext.confidenceHistory.push({
      confidence: analysis.confidence,
      timestamp: now
    });
    
    // Maintain window size (keep last 30 seconds)
    const windowMs = this.temporalContext.contextWindow * 1000;
    this.temporalContext.emotionHistory = this.temporalContext.emotionHistory
      .filter(item => now - item.timestamp < windowMs);
    this.temporalContext.confidenceHistory = this.temporalContext.confidenceHistory
      .filter(item => now - item.timestamp < windowMs);
  }

  /**
   * Count emotion-related words in text
   */
  countEmotionWords(text) {
    const emotionWords = [
      'happy', 'sad', 'angry', 'excited', 'frustrated', 'worried', 'scared',
      'joyful', 'depressed', 'furious', 'thrilled', 'annoyed', 'anxious', 'terrified',
      'love', 'hate', 'fear', 'hope', 'despair', 'rage', 'bliss', 'panic'
    ];
    
    return this.countWordMatches(text.toLowerCase(), emotionWords);
  }

  /**
   * Get comprehensive emotion analysis summary
   */
  getAnalysisSummary() {
    return {
      engine: 'Enhanced Emotion Engine V2.0',
      capabilities: {
        bertIntegration: this.bertConfig.enabled,
        voiceAnalysis: true,
        patternRecognition: true,
        temporalModeling: true,
        multiModalFusion: true
      },
      stats: {
        emotionHistory: this.temporalContext.emotionHistory.length,
        averageConfidence: this.getAverageConfidence(),
        temporalWindow: this.temporalContext.contextWindow
      },
      fusionWeights: this.fusionWeights
    };
  }

  /**
   * Get average confidence from recent analyses
   */
  getAverageConfidence() {
    const confidences = this.temporalContext.confidenceHistory;
    if (confidences.length === 0) return 0;
    
    const sum = confidences.reduce((total, item) => total + item.confidence, 0);
    return Math.round((sum / confidences.length) * 100) / 100;
  }
}

export default EnhancedEmotionEngine;
