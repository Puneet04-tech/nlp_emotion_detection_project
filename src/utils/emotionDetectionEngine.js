// Emotion Detection Engine - Step 2
// Combines audio analysis with text patterns to detect emotional nuances

import { SpeechNuanceAnalyzer } from './speechNuanceAnalyzer.js';

/**
 * Basic Emotion Detection Engine
 * Detects sarcasm, genuine emotion, frustration, and other speech nuances
 */
export class EmotionDetectionEngine {
  constructor() {
    this.nuanceAnalyzer = new SpeechNuanceAnalyzer();
    this.isInitialized = false;
    
    // Emotion detection patterns and thresholds
    this.emotionPatterns = {
      sarcasm: {
        textMarkers: [
          'oh great', 'wonderful', 'fantastic', 'perfect', 'exactly what i wanted', 'love this',
          'brilliant', 'outstanding', 'just what i needed', 'how lovely', 'terrific', 'marvelous',
          'absolutely brilliant', 'just perfect', 'goes perfectly wrong', 'another wonderful',
          'everything goes perfectly wrong', 'love how nothing', 'nothing ever works',
          'brilliant system', 'exactly what i wanted to happen'
        ],
        audioThresholds: {
          pitchVariance: { min: 0, max: 15 }, // Sarcasm often has low variance
          pitchRange: { min: 0, max: 30 }, // Limited pitch range
          monotone: true, // Flat delivery
          elongation: true, // Drawn out words
          volumeConsistency: { min: 70, max: 100 } // Controlled volume
        },
        confidence: {
          textMatch: 30, // Points for text markers
          audioMatch: 50, // Points for audio patterns
          contextMatch: 20 // Points for situational context
        }
      },
      
      genuineEnthusiasm: {
        textMarkers: [
          'excited', 'amazing', 'incredible', 'awesome', 'thrilled', 'love',
          'breakthrough', 'exceeded expectations', 'ahead of schedule', 'incredible news',
          'genuinely proud', 'hard work', 'dedication', 'accomplished'
        ],
        audioThresholds: {
          pitchVariance: { min: 25, max: 100 }, // High variance shows excitement
          pitchRange: { min: 40, max: 200 }, // Wide pitch range
          volumeVariance: { min: 15, max: 50 }, // Natural volume changes
          energy: { min: 60, max: 100 }, // High energy
          voiceQuality: { min: 70, max: 100 } // Clear, rich voice
        },
        confidence: {
          textMatch: 25,
          audioMatch: 60,
          contextMatch: 15
        }
      },
      
      frustration: {
        textMarkers: [
          'annoying', 'frustrated', 'ridiculous', 'seriously', 'enough',
          'tired', 'issues', 'problems', 'dont know', 'multiple issues',
          'this is ridiculous', 'are you kidding', 'come on', 'what the hell', 
          'this is stupid', 'fed up', 'whatever', 'fine'
        ],
        audioThresholds: {
          tension: { min: 40, max: 100 }, // Vocal tension
          pitchRange: { min: 30, max: 80 }, // Moderate but tense range
          volumeSpikes: true, // Sudden volume increases
          articulationHard: true, // Clipped consonants
          breathSupport: { min: 30, max: 70 } // Shallow breathing
        },
        confidence: {
          textMatch: 35,
          audioMatch: 55,
          contextMatch: 10
        }
      },
      
      politeLie: {
        textMarkers: [
          'I suppose it\'s fine', 'I guess it\'s okay', 'not bad I suppose', 
          'if you say so', 'sure whatever', 'fine I guess', 'I suppose that works',
          'okay if you think so', 'whatever you say', 'I guess that\'s fine',
          'it\'s fine I suppose', 'good enough I guess', 'whatever works for you'
        ],
        audioThresholds: {
          hesitation: true, // Pauses before positive words
          controlledTone: true, // Very controlled delivery
          pitchVariance: { min: 5, max: 20 }, // Limited variation
          volumeConsistency: { min: 80, max: 100 }, // Very consistent
          artificialBrightness: true // Forced positive tone
        },
        confidence: {
          textMatch: 20,
          audioMatch: 60,
          contextMatch: 20
        }
      },
      
      sadness: {
        textMarkers: [
          'sad', 'disappointed', 'upset', 'hurt', 'depressed', 'feeling down',
          'feeling tired', 'exhausted', 'drained', 'I don\'t know', 'maybe', 
          'I suppose', 'whatever', 'doesn\'t matter', 'I give up', 'tired'
        ],
        audioThresholds: {
          lowPitch: true, // Overall lower pitch
          lowEnergy: { min: 0, max: 40 }, // Reduced energy
          breathiness: { min: 40, max: 100 }, // Breathy voice
          slowPace: true, // Slower speech rate
          longPauses: true // Extended pauses
        },
        confidence: {
          textMatch: 30,
          audioMatch: 50,
          contextMatch: 20
        }
      },
      
      confidence: {
        textMarkers: [
          'certain', 'sure', 'confident', 'positive results', 'happy with the progress',
          'working good', 'making progress', 'absolutely', 'definitely', 'certainly', 
          'without a doubt', 'I know', 'I\'m sure', 'positive', 'guaranteed'
        ],
        audioThresholds: {
          clearArticulation: { min: 70, max: 100 },
          steadyPitch: { min: 70, max: 100 },
          goodBreathSupport: { min: 70, max: 100 },
          consistentVolume: { min: 70, max: 100 },
          richTone: { min: 60, max: 100 }
        },
        confidence: {
          textMatch: 25,
          audioMatch: 55,
          contextMatch: 20
        }
      }
    };
    
    // Current emotion analysis state
    this.currentEmotionState = {
      detected: 'neutral',
      confidence: 0,
      breakdown: {},
      audioEvidence: {},
      textEvidence: {},
      timestamp: null
    };
    
    this.emotionHistory = [];
  }

  /**
   * Initialize the emotion detection system
   */
  async initialize() {
    try {
      const success = await this.nuanceAnalyzer.initialize();
      if (success) {
        this.isInitialized = true;
        console.log('🧠 Emotion Detection Engine initialized');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize emotion detection:', error);
      return false;
    }
  }

  /**
   * Start emotion detection
   */
  startDetection() {
    if (!this.isInitialized) {
      console.error('❌ Emotion detection not initialized');
      return false;
    }
    
    this.nuanceAnalyzer.startAnalysis();
    console.log('🎭 Started emotion detection');
    return true;
  }

  /**
   * Stop emotion detection
   */
  stopDetection() {
    this.nuanceAnalyzer.stopAnalysis();
    console.log('⏹️ Stopped emotion detection');
  }

  /**
   * Analyze current speech for emotional content
   */
  analyzeCurrentEmotion(transcriptText = '') {
    try {
      // Get current audio analysis
      const audioAnalysis = this.nuanceAnalyzer.getCurrentAnalysisSummary();
      
      // If no transcript provided, can't analyze
      if (!transcriptText || !transcriptText.trim()) {
        return { 
          detected: 'no_text', 
          confidence: 0,
          breakdown: {
            no_text: {
              textScore: 0,
              audioScore: 0,
              contextScore: 0
            }
          },
          timestamp: Date.now()
        };
      }

      // Analyze each emotion type (works with or without audio)
      const emotionScores = {};
      
      for (const [emotionType, pattern] of Object.entries(this.emotionPatterns)) {
        try {
          emotionScores[emotionType] = this.calculateEmotionScore(
            emotionType, 
            pattern, 
            audioAnalysis, 
            transcriptText
          );
        } catch (error) {
          console.warn(`Error calculating score for ${emotionType}:`, error);
          // Provide fallback score
          emotionScores[emotionType] = {
            totalScore: 0,
            textScore: 0,
            audioScore: 0,
            contextScore: 0,
            breakdown: {
              textMatches: [],
              audioEvidence: null,
              contextFactors: []
            }
          };
        }
      }
      
      // Find the highest scoring emotion
      const topEmotion = Object.entries(emotionScores).reduce((best, [emotion, score]) => {
        return score.totalScore > best.score ? { emotion, score: score.totalScore, details: score } : best;
      }, { emotion: 'neutral', score: 0, details: {} });
      
      // Update current state
      this.currentEmotionState = {
        detected: topEmotion.emotion,
        confidence: topEmotion.score,
        breakdown: emotionScores,
        audioEvidence: audioAnalysis,
        textEvidence: this.analyzeTextEvidence(transcriptText),
        timestamp: Date.now()
      };
      
      // Add to history
      this.emotionHistory.push({...this.currentEmotionState});
      this.trimEmotionHistory();
      
      return this.currentEmotionState;
    } catch (error) {
      console.error('Error in emotion analysis:', error);
      // Return fallback result
      return {
        detected: 'neutral',
        confidence: 0,
        breakdown: {
          neutral: {
            textScore: 0,
            audioScore: 0,
            contextScore: 0
          }
        },
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Calculate emotion score for a specific emotion type
   */
  calculateEmotionScore(emotionType, pattern, audioAnalysis, transcriptText) {
    let textScore = 0;
    let audioScore = 0;
    let contextScore = 0;
    
    // Text Analysis Score
    if (transcriptText && pattern.textMarkers) {
      const textLower = transcriptText.toLowerCase();
      const matchedMarkers = pattern.textMarkers.filter(marker => 
        textLower.includes(marker.toLowerCase())
      );
      
      // Give full points for any matches, with bonus for multiple matches
      if (matchedMarkers.length > 0) {
        textScore = pattern.confidence.textMatch;
        // Bonus points for multiple matches (up to 50% more)
        if (matchedMarkers.length > 1) {
          const bonusMultiplier = Math.min(1.5, 1 + (matchedMarkers.length - 1) * 0.2);
          textScore = Math.min(pattern.confidence.textMatch * bonusMultiplier, pattern.confidence.textMatch * 1.5);
        }
      }
    }
    
    // Audio Analysis Score
    if (audioAnalysis && audioAnalysis.current && pattern.audioThresholds) {
      audioScore = this.calculateAudioScore(pattern.audioThresholds, audioAnalysis);
    }
    
    // Context Score (simplified for now)
    contextScore = this.calculateContextScore(emotionType, transcriptText);
    
    const totalScore = textScore + audioScore + contextScore;
    
    return {
      totalScore: Math.round(totalScore),
      textScore: Math.round(textScore),
      audioScore: Math.round(audioScore),
      contextScore: Math.round(contextScore),
      breakdown: {
        textMatches: transcriptText ? this.getTextMatches(transcriptText, pattern.textMarkers) : [],
        audioEvidence: this.getAudioEvidence(pattern.audioThresholds, audioAnalysis),
        contextFactors: this.getContextFactors(emotionType, transcriptText)
      }
    };
  }

  /**
   * Calculate audio score based on thresholds
   */
  calculateAudioScore(thresholds, audioAnalysis) {
    // Safety check
    if (!audioAnalysis || !audioAnalysis.current) {
      return 0;
    }
    
    let score = 0;
    const maxPossibleScore = 50; // Maximum audio score
    let criteriaCount = 0;
    let metCriteria = 0;
    
    const current = audioAnalysis.current || {};
    const summary = audioAnalysis.summary || {};
    
    // Check pitch variance
    if (thresholds.pitchVariance) {
      criteriaCount++;
      const pitchVariance = summary.pitchStability ? (100 - summary.pitchStability) : 50;
      if (pitchVariance >= thresholds.pitchVariance.min && pitchVariance <= thresholds.pitchVariance.max) {
        metCriteria++;
      }
    }
    
    // Check pitch range
    if (thresholds.pitchRange && current.pitch) {
      criteriaCount++;
      const pitchRange = current.pitch.range || 0;
      if (pitchRange >= thresholds.pitchRange.min && pitchRange <= thresholds.pitchRange.max) {
        metCriteria++;
      }
    }
    
    // Check monotone delivery
    if (thresholds.monotone) {
      criteriaCount++;
      const isMonotone = (summary.pitchStability || 0) > 85;
      if (isMonotone) metCriteria++;
    }
    
    // Check volume consistency
    if (thresholds.volumeConsistency) {
      criteriaCount++;
      const volumeConsistency = summary.volumeConsistency || 50;
      if (volumeConsistency >= thresholds.volumeConsistency.min && volumeConsistency <= thresholds.volumeConsistency.max) {
        metCriteria++;
      }
    }
    
    // Check energy levels
    if (thresholds.energy && current.temporal) {
      criteriaCount++;
      const energy = current.temporal.energyLevel || 0;
      if (energy >= thresholds.energy.min && energy <= thresholds.energy.max) {
        metCriteria++;
      }
    }
    
    // Check vocal tension
    if (thresholds.tension && current.tonal) {
      criteriaCount++;
      const tension = current.tonal.tensionMarkers?.level || 0;
      if (tension >= thresholds.tension.min && tension <= thresholds.tension.max) {
        metCriteria++;
      }
    }
    
    // Check voice quality
    if (thresholds.voiceQuality && current.tonal) {
      criteriaCount++;
      const voiceQuality = current.tonal.voiceQuality?.overall || 50;
      if (voiceQuality >= thresholds.voiceQuality.min && voiceQuality <= thresholds.voiceQuality.max) {
        metCriteria++;
      }
    }
    
    // Calculate final score
    if (criteriaCount > 0) {
      score = (metCriteria / criteriaCount) * maxPossibleScore;
    }
    
    return score;
  }

  /**
   * Calculate basic context score
   */
  calculateContextScore(emotionType, transcriptText) {
    // Basic context analysis - can be enhanced later
    let score = 0;
    
    if (!transcriptText) return score;
    
    const textLower = transcriptText.toLowerCase();
    
    // Context clues for different emotions
    const contextClues = {
      sarcasm: ['problem', 'issue', 'complaint', 'wrong', 'broken', 'failed'],
      genuineEnthusiasm: ['success', 'achievement', 'good news', 'celebration', 'win'],
      frustration: ['delay', 'wait', 'problem', 'error', 'mistake', 'again'],
      politeLie: ['meeting', 'presentation', 'required', 'mandatory', 'professional'],
      sadness: ['loss', 'end', 'over', 'goodbye', 'failed', 'disappointed'],
      confidence: ['plan', 'strategy', 'will', 'going to', 'ready', 'prepared']
    };
    
    if (contextClues[emotionType]) {
      const matches = contextClues[emotionType].filter(clue => textLower.includes(clue));
      score = Math.min(20, matches.length * 5);
    }
    
    return score;
  }

  /**
   * Get text matches for evidence
   */
  getTextMatches(transcriptText, markers) {
    if (!transcriptText || !markers) return [];
    
    const textLower = transcriptText.toLowerCase();
    return markers.filter(marker => textLower.includes(marker.toLowerCase()));
  }

  /**
   * Get audio evidence details
   */
  getAudioEvidence(thresholds, audioAnalysis) {
    const evidence = [];
    const current = audioAnalysis.current;
    const summary = audioAnalysis.summary;
    
    if (thresholds.monotone && (summary.pitchStability || 0) > 85) {
      evidence.push('Monotone delivery detected');
    }
    
    if (thresholds.tension && current.tonal?.tensionMarkers?.level > 40) {
      evidence.push('Vocal tension detected');
    }
    
    if (thresholds.energy?.min && current.temporal?.energyLevel > thresholds.energy.min) {
      evidence.push('High energy level');
    }
    
    if (thresholds.lowEnergy?.max && current.temporal?.energyLevel < thresholds.lowEnergy.max) {
      evidence.push('Low energy level');
    }
    
    return evidence;
  }

  /**
   * Get context factors
   */
  getContextFactors(emotionType, transcriptText) {
    const factors = [];
    
    if (!transcriptText) return factors;
    
    // Add basic context analysis
    if (emotionType === 'sarcasm' && transcriptText.includes('great')) {
      factors.push('Positive word in potentially negative context');
    }
    
    if (emotionType === 'frustration' && transcriptText.includes('again')) {
      factors.push('Repetition indicator suggests frustration');
    }
    
    return factors;
  }

  /**
   * Analyze text evidence separately
   */
  analyzeTextEvidence(transcriptText) {
    if (!transcriptText) return {};
    
    return {
      length: transcriptText.length,
      wordCount: transcriptText.split(' ').length,
      hasPositiveWords: /\b(good|great|love|amazing|wonderful|excellent|fantastic)\b/i.test(transcriptText),
      hasNegativeWords: /\b(bad|terrible|awful|hate|horrible|worst|problem)\b/i.test(transcriptText),
      hasHesitation: /\b(um|uh|well|like|you know|sort of|kind of)\b/i.test(transcriptText),
      hasIntensifiers: /\b(very|really|extremely|incredibly|absolutely|totally)\b/i.test(transcriptText)
    };
  }

  /**
   * Get current emotion state
   */
  getCurrentEmotion() {
    return this.currentEmotionState;
  }

  /**
   * Get emotion detection summary
   */
  getEmotionSummary() {
    const current = this.getCurrentEmotion();
    
    return {
      primaryEmotion: current.detected,
      confidence: current.confidence,
      timestamp: current.timestamp,
      evidence: {
        strongestIndicators: this.getStrongestIndicators(current),
        audioSupport: current.audioEvidence?.summary || {},
        textSupport: current.textEvidence || {}
      },
      interpretation: this.getEmotionInterpretation(current.detected, current.confidence)
    };
  }

  /**
   * Get strongest indicators for detected emotion
   */
  getStrongestIndicators(emotionState) {
    const breakdown = emotionState.breakdown[emotionState.detected];
    if (!breakdown) return [];
    
    const indicators = [];
    
    if (breakdown.textScore > 15) {
      indicators.push(`Text markers (${breakdown.textScore} points)`);
    }
    
    if (breakdown.audioScore > 25) {
      indicators.push(`Audio patterns (${breakdown.audioScore} points)`);
    }
    
    if (breakdown.contextScore > 10) {
      indicators.push(`Context clues (${breakdown.contextScore} points)`);
    }
    
    return indicators;
  }

  /**
   * Get human-readable interpretation
   */
  getEmotionInterpretation(emotion, confidence) {
    const interpretations = {
      sarcasm: {
        high: 'Strong sarcasm detected - speaker likely means the opposite of what they said',
        medium: 'Possible sarcasm - speaker may be expressing frustration indirectly',
        low: 'Mild sarcastic undertones detected'
      },
      genuineEnthusiasm: {
        high: 'Authentic enthusiasm - speaker is genuinely excited',
        medium: 'Positive emotion detected - likely genuine approval',
        low: 'Mild positive sentiment'
      },
      frustration: {
        high: 'Clear frustration - speaker is upset or annoyed',
        medium: 'Moderate irritation detected',
        low: 'Slight tension or impatience'
      },
      politeLie: {
        high: 'Polite disagreement - speaker being diplomatic while disagreeing',
        medium: 'Possible social politeness - may not fully agree',
        low: 'Mild reservation detected'
      },
      sadness: {
        high: 'Sadness or disappointment detected',
        medium: 'Low mood or mild disappointment',
        low: 'Subdued emotional state'
      },
      confidence: {
        high: 'Strong confidence - speaker is very certain',
        medium: 'Good confidence level detected',
        low: 'Mild confidence or certainty'
      }
    };
    
    const level = confidence > 70 ? 'high' : confidence > 40 ? 'medium' : 'low';
    return interpretations[emotion]?.[level] || 'Emotion detected with moderate confidence';
  }

  /**
   * Trim emotion history for performance
   */
  trimEmotionHistory() {
    const maxHistory = 50;
    if (this.emotionHistory.length > maxHistory) {
      this.emotionHistory = this.emotionHistory.slice(-maxHistory);
    }
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.stopDetection();
    this.nuanceAnalyzer.dispose();
    this.isInitialized = false;
    console.log('🧹 Emotion Detection Engine disposed');
  }
}

// Export for integration
export default EmotionDetectionEngine;
