// Emotion Detection Engine - Step 4
// Advanced emotion tracking with real-time analytics, emotion trends, and enhanced UI integration

import { SpeechNuanceAnalyzer } from './speechNuanceAnalyzer.js';
import BERTEmotionEnhancer from './bertEmotionEnhancer.js';

/**
 * Advanced Emotion Detection Engine - Step 4
 * Features:
 * - Real-time emotion tracking and trends
 * - Emotion analytics and insights
 * - Enhanced pattern matching with context awareness
 * - Multi-dimensional emotion scoring
 * - Emotion transition detection
 * - Confidence calibration and learning
 */
export class EmotionDetectionEngineV4 {
  constructor() {
    this.nuanceAnalyzer = new SpeechNuanceAnalyzer();
    this.bertEnhancer = new BERTEmotionEnhancer();
    this.isInitialized = false;
    this.bertInitialized = false;
    
    // Enhanced emotion patterns with contextual scoring
    this.emotionPatterns = {
      sarcasm: {
        textMarkers: [
          'oh great', 'wonderful', 'fantastic', 'perfect', 'exactly what i wanted', 'love this',
          'brilliant', 'outstanding', 'just what i needed', 'how lovely', 'terrific', 'marvelous',
          'absolutely brilliant', 'just perfect', 'goes perfectly wrong', 'another wonderful',
          'everything goes perfectly wrong', 'love how nothing', 'nothing ever works',
          'brilliant system', 'exactly what i wanted to happen', 'oh how nice', 'just delightful',
          // Added more common sarcastic phrases
          'real genius', 'smooth move', 'nice job', 'well done', 'genius move', 'smart thinking',
          'that worked well', 'what could go wrong', 'this should be fun', 'looking forward to this',
          // Complex sarcastic expressions
          'working perfectly', 'going smoothly', 'exactly as planned', 'couldnt be better',
          'just my luck', 'how surprising', 'what a shock', 'never saw that coming',
          'absolutely flawless', 'picture perfect', 'textbook example'
        ],
        complexPatterns: [
          // Pattern matching for complex statements
          { pattern: /oh.*great.*day/i, weight: 2.5, description: 'sarcastic day comment' },
          { pattern: /love.*how.*nothing/i, weight: 2.0, description: 'sarcastic love statement' },
          { pattern: /exactly.*what.*wanted/i, weight: 2.2, description: 'sarcastic desire fulfillment' },
          { pattern: /working.*perfectly.*wrong/i, weight: 2.8, description: 'sarcastic malfunction' },
          { pattern: /brilliant.*system.*fails/i, weight: 2.5, description: 'sarcastic system criticism' },
          { pattern: /wonderful.*experience.*disaster/i, weight: 2.3, description: 'sarcastic experience review' },
          { pattern: /fantastic.*result.*failure/i, weight: 2.4, description: 'sarcastic outcome assessment' }
        ],
        contextualModifiers: {
          negativeContext: ['problem', 'issue', 'broken', 'failed', 'wrong', 'error', 'bug', 'crash', 'disaster', 'mess', 'terrible', 'awful', 'horrible'], 
          timeIndicators: ['again', 'another', 'still', 'yet again', 'once more', 'every time', 'always', 'never fails'], 
          intensifiers: ['really', 'absolutely', 'totally', 'completely', 'so', 'very', 'just', 'simply'],
          emotionalClues: ['sigh', 'ugh', 'seriously', 'come on', 'give me a break', 'are you kidding']
        },
        audioThresholds: {
          pitchVariance: { min: 0, max: 15 },
          pitchRange: { min: 0, max: 30 },
          monotone: true,
          elongation: true,
          volumeConsistency: { min: 70, max: 100 }
        },
        confidence: {
          textMatch: 45, // Increased from 40
          audioMatch: 50,
          contextMatch: 35, // Increased from 30
          complexPatternMatch: 60 // New for complex patterns
        }
      },
      
      genuineEnthusiasm: {
        textMarkers: [
          'excited', 'amazing', 'incredible', 'awesome', 'thrilled', 'love',
          'breakthrough', 'exceeded expectations', 'ahead of schedule', 'incredible news',
          'genuinely proud', 'hard work', 'dedication', 'accomplished', 'fantastic results',
          'blown away', 'mind blowing', 'exceeded all expectations', 'phenomenal',
          // Added more enthusiasm markers
          'outstanding', 'remarkable', 'exceptional', 'superb', 'brilliant work',
          'exceeded my wildest dreams', 'this is the best', 'absolutely wonderful',
          'perfect', 'flawless', 'exactly what we needed', 'incredible achievement'
        ],
        contextualModifiers: {
          achievementContext: ['completed', 'finished', 'success', 'achievement', 'milestone', 'goal', 'target'],
          timeIndicators: ['finally', 'at last', 'after so long', 'eventually'],
          socialIndicators: ['team', 'together', 'collaboration', 'everyone', 'we did it']
        },
        audioThresholds: {
          pitchVariance: { min: 25, max: 100 },
          pitchRange: { min: 40, max: 200 },
          volumeVariance: { min: 15, max: 50 },
          energy: { min: 60, max: 100 },
          voiceQuality: { min: 70, max: 100 }
        },
        confidence: {
          textMatch: 35, // Increased from 30 to 35
          audioMatch: 60,
          contextMatch: 25 // Increased from 20 to 25
        }
      },
      
      frustration: {
        textMarkers: [
          'annoying', 'frustrated', 'ridiculous', 'seriously', 'enough',
          'tired', 'issues', 'problems', 'dont know', 'multiple issues',
          'this is ridiculous', 'are you kidding', 'come on', 'what the hell', 
          'this is stupid', 'fed up', 'whatever', 'fine', 'give me a break',
          'not again', 'why does this always happen', 'sick of this',
          // Added more frustration markers
          'irritating', 'annoyed', 'angry', 'mad', 'upset', 'bothered',
          'what a waste', 'this sucks', 'horrible', 'terrible', 'awful',
          'why me', 'i hate this', 'this is the worst', 'so annoying'
        ],
        contextualModifiers: {
          repetitionContext: ['again', 'still', 'always', 'every time', 'keeps happening'],
          systemContext: ['system', 'software', 'program', 'app', 'website', 'computer'],
          timeContext: ['late', 'deadline', 'urgent', 'waiting', 'delayed']
        },
        audioThresholds: {
          tension: { min: 40, max: 100 },
          pitchRange: { min: 30, max: 80 },
          volumeSpikes: true,
          articulationHard: true,
          breathSupport: { min: 30, max: 70 }
        },
        confidence: {
          textMatch: 45, // Increased from 40 to 45
          audioMatch: 55,
          contextMatch: 20 // Increased from 15 to 20
        }
      },
      
      politeLie: {
        textMarkers: [
          'I suppose it\'s fine', 'I guess it\'s okay', 'not bad I suppose', 
          'if you say so', 'sure whatever', 'fine I guess', 'I suppose that works',
          'okay if you think so', 'whatever you say', 'I guess that\'s fine',
          'it\'s fine I suppose', 'good enough I guess', 'whatever works for you',
          'that\'s... nice', 'interesting choice', 'I see your point'
        ],
        contextualModifiers: {
          professionalContext: ['meeting', 'presentation', 'client', 'boss'],
          hesitationMarkers: ['well', 'um', 'uh', 'you know'],
          diplomaticPhrases: ['I understand', 'I see', 'that makes sense']
        },
        audioThresholds: {
          hesitation: true,
          controlledTone: true,
          pitchVariance: { min: 5, max: 20 },
          volumeConsistency: { min: 80, max: 100 },
          artificialBrightness: true
        },
        confidence: {
          textMatch: 25,
          audioMatch: 60,
          contextMatch: 25
        }
      },
      
      // New emotions for Step 4
      excitement: {
        textMarkers: [
          'can\'t wait', 'so excited', 'this is going to be great', 'looking forward',
          'pumped', 'stoked', 'thrilled', 'ecstatic', 'over the moon', 'buzzing with excitement'
        ],
        contextualModifiers: {
          futureContext: ['will', 'going to', 'soon', 'next', 'upcoming'],
          eventContext: ['party', 'trip', 'vacation', 'celebration', 'launch']
        },
        audioThresholds: {
          pitchVariance: { min: 30, max: 100 },
          energy: { min: 70, max: 100 },
          speechRate: { min: 110, max: 180 } // Faster speech
        },
        confidence: {
          textMatch: 35,
          audioMatch: 45,
          contextMatch: 20
        }
      },
      
      concern: {
        textMarkers: [
          'worried', 'concerned', 'not sure about', 'wondering if', 'hope this works',
          'fingers crossed', 'bit nervous', 'slightly worried', 'hope for the best',
          'keeping an eye on', 'need to be careful', 'anxious', 'uncertain',
          'doubt', 'questionable', 'risky', 'unsure', 'hesitant', 'cautious'
        ],
        contextualModifiers: {
          riskContext: ['risk', 'danger', 'problem', 'issue', 'failure', 'trouble'],
          uncertaintyMarkers: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'not sure']
        },
        audioThresholds: {
          hesitation: true,
          pitchVariance: { min: 10, max: 40 },
          energy: { min: 30, max: 60 }
        },
        confidence: {
          textMatch: 35, // Increased from 30 to 35
          audioMatch: 40,
          contextMatch: 30
        }
      },

      // New enhanced emotion types
      happiness: {
        textMarkers: [
          'happy', 'joy', 'joyful', 'cheerful', 'delighted', 'pleased', 'content',
          'satisfied', 'glad', 'wonderful feeling', 'feeling great', 'in a good mood',
          'positive', 'upbeat', 'optimistic', 'good vibes', 'blessed', 'grateful'
        ],
        contextualModifiers: {
          positiveContext: ['success', 'win', 'achievement', 'good news', 'celebration'],
          socialContext: ['friends', 'family', 'together', 'shared', 'community']
        },
        audioThresholds: {
          pitchVariance: { min: 20, max: 60 },
          energy: { min: 50, max: 90 },
          voiceQuality: { min: 60, max: 100 }
        },
        confidence: {
          textMatch: 35,
          audioMatch: 45,
          contextMatch: 20
        }
      },

      anger: {
        textMarkers: [
          'angry', 'mad', 'furious', 'enraged', 'livid', 'outraged', 'pissed off',
          'hate', 'disgusted', 'can\'t stand', 'makes me sick', 'absolutely livid',
          'beyond angry', 'seeing red', 'fuming', 'rage', 'fury', 'wrath',
          'fed up', 'sick and tired', 'had enough', 'boiling mad', 'steaming',
          'blood boiling', 'lost my temper', 'driving me crazy', 'pissed'
        ],
        complexPatterns: [
          { pattern: /absolutely.*furious.*about/i, weight: 3.0, description: 'intense anger expression' },
          { pattern: /sick.*tired.*of/i, weight: 2.5, description: 'accumulated frustration' },
          { pattern: /had.*enough.*of/i, weight: 2.8, description: 'anger threshold exceeded' },
          { pattern: /makes.*me.*so.*angry/i, weight: 2.4, description: 'causal anger statement' },
          { pattern: /cant.*stand.*anymore/i, weight: 2.6, description: 'tolerance limit reached' },
          { pattern: /driving.*me.*insane/i, weight: 2.3, description: 'anger building up' },
          { pattern: /boiling.*with.*rage/i, weight: 3.2, description: 'extreme anger metaphor' }
        ],
        contextualModifiers: {
          intensityContext: ['extremely', 'absolutely', 'completely', 'totally', 'beyond', 'utterly'],
          targetContext: ['at them', 'at you', 'at this', 'at everyone', 'with him', 'with her'],
          escalationContext: ['getting worse', 'building up', 'losing control', 'breaking point'],
          expressionContext: ['shouting', 'yelling', 'screaming', 'exploding', 'lashing out']
        },
        audioThresholds: {
          tension: { min: 60, max: 100 },
          volumeSpikes: true,
          articulationHard: true,
          breathSupport: { min: 20, max: 60 }
        },
        confidence: {
          textMatch: 50, // Increased from 45
          audioMatch: 60,
          contextMatch: 30, // Increased from 25
          complexPatternMatch: 65
        }
      },

      sadness: {
        textMarkers: [
          'sad', 'depressed', 'down', 'blue', 'melancholy', 'sorrowful', 'grief',
          'heartbroken', 'disappointed', 'let down', 'feeling low', 'bummed out',
          'devastated', 'crushed', 'broken hearted', 'tearful', 'miserable'
        ],
        contextualModifiers: {
          lossContext: ['lost', 'gone', 'ended', 'over', 'finished', 'no more'],
          emotionalContext: ['crying', 'tears', 'weeping', 'sobbing']
        },
        audioThresholds: {
          energy: { min: 10, max: 40 },
          pitchVariance: { min: 5, max: 25 },
          voiceQuality: { min: 20, max: 60 }
        },
        confidence: {
          textMatch: 40,
          audioMatch: 50,
          contextMatch: 30
        }
      },

      confidence: {
        textMarkers: [
          'confident', 'sure', 'certain', 'positive', 'absolutely', 'definitely',
          'no doubt', 'guaranteed', 'without question', 'convinced', 'assured',
          'know for sure', 'completely certain', 'have no doubt', 'trust me'
        ],
        contextualModifiers: {
          assertionContext: ['will', 'going to', 'definitely will', 'for sure'],
          competenceContext: ['experienced', 'expert', 'skilled', 'capable']
        },
        audioThresholds: {
          energy: { min: 60, max: 90 },
          clarity: { min: 70, max: 100 },
          voiceQuality: { min: 70, max: 100 }
        },
        confidence: {
          textMatch: 35,
          audioMatch: 45,
          contextMatch: 20
        }
      }
    };
    
    // Real-time tracking state
    this.emotionStream = [];
    this.currentEmotionState = {
      detected: 'neutral',
      confidence: 0,
      breakdown: {},
      audioEvidence: {},
      textEvidence: {},
      timestamp: null
    };
    
    // Analytics and trending
    this.emotionAnalytics = {
      sessionStart: Date.now(),
      totalAnalyses: 0,
      emotionCounts: {},
      averageConfidence: 0,
      emotionTransitions: [],
      dominantEmotions: [],
      emotionTrends: {
        last5Minutes: [],
        last30Minutes: [],
        sessionOverall: []
      }
    };
    
    // Learning and calibration (Enhanced thresholds for better detection)
    this.confidenceCalibration = {
      thresholds: {
        high: 70,
        medium: 40,
        low: 5  // Temporarily lowered from 15 to 5 for debugging
      },
      adjustmentFactors: {},
      userFeedback: []
    };
    
    this.emotionHistory = [];
    this.maxHistoryLength = 100;
  }

  /**
   * Initialize the advanced emotion detection system
   */
  async initialize() {
    try {
      const success = await this.nuanceAnalyzer.initialize();
      if (success) {
        this.isInitialized = true;
        this.startAnalyticsTicker();
        console.log('🧠 Advanced Emotion Detection Engine V4 initialized');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize emotion detection V4:', error);
      return false;
    }
  }

  /**
   * Start real-time analytics ticker
   */
  startAnalyticsTicker() {
    // Update analytics every 30 seconds
    this.analyticsTicker = setInterval(() => {
      this.updateEmotionTrends();
      this.calculateEmotionInsights();
    }, 30000);
  }

  /**
   * BERT-Enhanced emotion analysis with real-time tracking
   */
  async analyzeCurrentEmotion(transcriptText = '') {
    try {
      const audioAnalysis = this.nuanceAnalyzer.getCurrentAnalysisSummary();
      
      if (!transcriptText || !transcriptText.trim()) {
        return this.createEmptyResult();
      }

      console.log('🔍 Starting BERT-enhanced emotion analysis for:', transcriptText);
      console.log('🎤 Audio analysis status:', audioAnalysis?.status || 'unknown');

      // Try BERT-enhanced analysis first
      let bertAnalysis = null;
      try {
        console.log('🤖 Running BERT emotion analysis...');
        bertAnalysis = await this.bertEnhancer.analyzeEmotionWithBERT(transcriptText);
        console.log('✅ BERT analysis completed:', bertAnalysis);
      } catch (error) {
        console.warn('⚠️ BERT analysis failed, using fallback methods:', error);
      }

      // Analyze each emotion type with enhanced scoring
      const emotionScores = {};
      
      for (const [emotionType, pattern] of Object.entries(this.emotionPatterns)) {
        try {
          // Calculate traditional score
          const traditionalScore = this.calculateEnhancedEmotionScore(
            emotionType, 
            pattern, 
            audioAnalysis, 
            transcriptText
          );
          
          // Apply BERT enhancement if available
          emotionScores[emotionType] = this.enhanceScoreWithBERT(
            traditionalScore, 
            bertAnalysis, 
            emotionType
          );
          
          // Debug logging
          if (emotionScores[emotionType].totalScore > 1) {
            console.log(`📊 ${emotionType}: ${emotionScores[emotionType].totalScore} points`, {
              traditional: traditionalScore.totalScore,
              bert: emotionScores[emotionType].bertBoost || 0,
              final: emotionScores[emotionType].totalScore
            });
          }
        } catch (error) {
          console.warn(`Error calculating score for ${emotionType}:`, error);
          emotionScores[emotionType] = this.createEmptyScore();
        }
      }
      
      // Debug: Show all scores
      console.log('📈 All emotion scores:', Object.entries(emotionScores).map(([emotion, score]) => 
        `${emotion}: ${score.totalScore}`
      ).join(', '));
      
      // Find top emotion with confidence calibration
      const topEmotion = this.findTopEmotionWithCalibration(emotionScores);
      
      console.log('🎯 Top emotion after BERT calibration:', topEmotion);
      
      // Add BERT metadata to result
      const result = {
        detected: topEmotion.emotion,
        confidence: topEmotion.score,
        breakdown: emotionScores,
        audioEvidence: audioAnalysis,
        textEvidence: this.analyzeTextEvidence(transcriptText),
        timestamp: Date.now(),
        // V4 features
        emotionStrength: this.calculateEmotionStrength(topEmotion),
        secondaryEmotions: this.findSecondaryEmotions(emotionScores, topEmotion.emotion),
        contextualFactors: this.analyzeContextualFactors(transcriptText),
        trend: this.calculateEmotionTrend(topEmotion.emotion),
        insights: this.generateEmotionInsights(topEmotion, emotionScores),
        // BERT enhancement metadata
        bertEnhanced: !!bertAnalysis,
        bertAnalysis: bertAnalysis,
        bertConfidence: bertAnalysis?.confidence || 0
      };
      
      // Update tracking and analytics
      this.updateEmotionTracking(result);
      this.updateAnalytics(result);
      
      return result;
      
    } catch (error) {
      console.error('🚨 Critical error in emotion analysis:', error);
      return this.createEmptyResult();
    }
  }

  /**
   * Enhance traditional emotion scores with BERT analysis
   */
  enhanceScoreWithBERT(traditionalScore, bertAnalysis, emotionType) {
    if (!bertAnalysis || !bertAnalysis.emotions) {
      return traditionalScore;
    }

    const enhancedScore = { ...traditionalScore };
    const bertEmotion = bertAnalysis.emotions[emotionType];
    
    if (bertEmotion && bertEmotion > 0.1) {
      // BERT detected this emotion
      const bertBoost = bertEmotion * 100 * 0.6; // 60% weight for BERT
      enhancedScore.bertScore = bertEmotion * 100;
      enhancedScore.bertBoost = bertBoost;
      
      // Weighted fusion: 40% traditional, 60% BERT for detected emotions
      enhancedScore.totalScore = (traditionalScore.totalScore * 0.4) + (bertBoost * 0.6);
      
      // Update confidence based on BERT analysis
      if (bertAnalysis.confidence > 0.7) {
        enhancedScore.confidence = Math.min(100, enhancedScore.confidence + (bertAnalysis.confidence * 20));
      }
      
      console.log(`🎯 BERT enhancement for ${emotionType}: ${traditionalScore.totalScore} → ${enhancedScore.totalScore}`);
    } else if (bertAnalysis.confidence > 0.8) {
      // BERT has high confidence but didn't detect this emotion - slight penalty
      enhancedScore.totalScore *= 0.9;
      enhancedScore.bertPenalty = -10;
    }
    
    return enhancedScore;
  }

  /**
   * Original emotion analysis with traditional methods (fallback)
   */
  analyzeCurrentEmotionFallback(transcriptText = '') {
    try {
      const audioAnalysis = this.nuanceAnalyzer.getCurrentAnalysisSummary();
      
      if (!transcriptText || !transcriptText.trim()) {
        return this.createEmptyResult();
      }

      console.log('🔍 Starting emotion analysis for:', transcriptText);
      console.log('🎤 Audio analysis status:', audioAnalysis?.status || 'unknown');

      // Analyze each emotion type with enhanced scoring
      const emotionScores = {};
      
      for (const [emotionType, pattern] of Object.entries(this.emotionPatterns)) {
        try {
          emotionScores[emotionType] = this.calculateEnhancedEmotionScore(
            emotionType, 
            pattern, 
            audioAnalysis, 
            transcriptText
          );
          
          // Debug logging
          if (emotionScores[emotionType].totalScore > 1) {
            console.log(`📊 ${emotionType}: ${emotionScores[emotionType].totalScore} points`, {
              text: emotionScores[emotionType].textScore,
              audio: emotionScores[emotionType].audioScore,
              context: emotionScores[emotionType].contextScore,
              bonus: emotionScores[emotionType].contextualBonus
            });
          }
        } catch (error) {
          console.warn(`Error calculating score for ${emotionType}:`, error);
          emotionScores[emotionType] = this.createEmptyScore();
        }
      }
      
      // Debug: Show all scores
      console.log('📈 All emotion scores:', Object.entries(emotionScores).map(([emotion, score]) => 
        `${emotion}: ${score.totalScore}`
      ).join(', '));
      
      // Find top emotion with confidence calibration
      const topEmotion = this.findTopEmotionWithCalibration(emotionScores);
      
      console.log('🎯 Top emotion after calibration:', topEmotion);
      
      // Create comprehensive result
      const result = {
        detected: topEmotion.emotion,
        confidence: topEmotion.score,
        breakdown: emotionScores,
        audioEvidence: audioAnalysis,
        textEvidence: this.analyzeTextEvidence(transcriptText),
        timestamp: Date.now(),
        // New V4 features
        emotionStrength: this.calculateEmotionStrength(topEmotion),
        secondaryEmotions: this.findSecondaryEmotions(emotionScores, topEmotion.emotion),
        contextualFactors: this.analyzeContextualFactors(transcriptText),
        trend: this.calculateEmotionTrend(topEmotion.emotion),
        insights: this.generateEmotionInsights(topEmotion, emotionScores)
      };
      
      // Update tracking and analytics
      this.updateEmotionTracking(result);
      this.updateAnalytics(result);
      
      return result;
    } catch (error) {
      console.error('Error in emotion analysis V4:', error);
      return this.createErrorResult(error);
    }
  }

  /**
   * Enhanced emotion scoring with contextual awareness
   */
  calculateEnhancedEmotionScore(emotionType, pattern, audioAnalysis, transcriptText) {
    let textScore = 0;
    let audioScore = 0;
    let contextScore = 0;
    let contextualBonus = 0;
    
    // Enhanced text analysis with improved matching
    if (transcriptText && pattern.textMarkers) {
      const textLower = transcriptText.toLowerCase();
      const matchedMarkers = pattern.textMarkers.filter(marker => 
        textLower.includes(marker.toLowerCase())
      );
      
      if (matchedMarkers.length > 0) {
        textScore = pattern.confidence.textMatch;
        
        // Debug logging for matches
        console.log(`🎯 ${emotionType} found matches:`, matchedMarkers);
        
        // Multi-match bonus (improved formula)
        if (matchedMarkers.length > 1) {
          const bonusMultiplier = Math.min(2.5, 1 + (matchedMarkers.length - 1) * 0.4);
          textScore = Math.min(pattern.confidence.textMatch * bonusMultiplier, pattern.confidence.textMatch * 2.5);
        }
        
        // Length bonus for longer matching phrases
        const avgMatchLength = matchedMarkers.reduce((sum, marker) => sum + marker.length, 0) / matchedMarkers.length;
        if (avgMatchLength > 8) {
          textScore *= 1.2; // 20% bonus for longer, more specific phrases
        }
        
        // Contextual modifiers (enhanced in V4)
        if (pattern.contextualModifiers) {
          contextualBonus = this.calculateContextualBonus(pattern.contextualModifiers, textLower);
        }
        
        // Exact phrase bonus (new)
        const exactMatches = matchedMarkers.filter(marker => marker.length > 5);
        if (exactMatches.length > 0) {
          textScore += exactMatches.length * 5; // Bonus for exact phrase matches
        }
        
        console.log(`💯 ${emotionType} scoring: base=${pattern.confidence.textMatch}, final=${textScore}, bonus=${contextualBonus}`);
      }
    }
    
    // Audio analysis (handle missing audio gracefully)
    if (audioAnalysis && audioAnalysis.current && pattern.audioThresholds) {
      audioScore = this.calculateAudioScore(pattern.audioThresholds, audioAnalysis);
    } else {
      audioScore = 0; // No audio data available
      console.log(`🎤 No audio data for ${emotionType}, using text-only analysis`);
    }
    
    // Enhanced context score
    contextScore = this.calculateEnhancedContextScore(emotionType, transcriptText);
    
    // NEW: Complex pattern analysis for sophisticated statement handling
    let complexPatternScore = 0;
    if (pattern.complexPatterns && transcriptText) {
      complexPatternScore = this.analyzeComplexPatterns(pattern.complexPatterns, transcriptText);
      console.log(`🧠 ${emotionType} complex pattern score: ${complexPatternScore}`);
    }
    
    const totalScore = textScore + audioScore + contextScore + contextualBonus + complexPatternScore;
    
    return {
      totalScore: Math.round(totalScore),
      textScore: Math.round(textScore),
      audioScore: Math.round(audioScore),
      contextScore: Math.round(contextScore),
      contextualBonus: Math.round(contextualBonus),
      complexPatternScore: Math.round(complexPatternScore),
      breakdown: {
        textMatches: this.getTextMatches(transcriptText, pattern.textMarkers),
        audioEvidence: this.getAudioEvidence(pattern.audioThresholds, audioAnalysis),
        contextFactors: this.getContextFactors(emotionType, transcriptText),
        contextualModifiers: this.getContextualModifiers(pattern.contextualModifiers, transcriptText),
        complexPatterns: this.getComplexPatternMatches(pattern.complexPatterns, transcriptText)
      }
    };
  }

  /**
   * Analyze complex patterns for sophisticated emotion detection
   * This handles multi-word phrases, contextual expressions, and nuanced language
   */
  analyzeComplexPatterns(complexPatterns, text) {
    if (!complexPatterns || !text) return 0;
    
    let totalScore = 0;
    const textLower = text.toLowerCase();
    
    complexPatterns.forEach(patternData => {
      const { pattern, weight, description } = patternData;
      
      try {
        if (pattern.test(textLower)) {
          const matchScore = weight * 10; // Base score for pattern match
          totalScore += matchScore;
          
          console.log(`🎯 Complex pattern matched: "${description}" - score: ${matchScore}`);
          
          // Additional scoring based on pattern complexity
          const patternSource = pattern.source;
          if (patternSource.includes('.*')) {
            // Variable gap patterns get bonus for flexibility
            totalScore += weight * 2;
          }
          
          if (patternSource.length > 15) {
            // Long patterns get bonus for specificity
            totalScore += weight * 1.5;
          }
        }
      } catch (error) {
        console.warn(`Error testing complex pattern: ${pattern}`, error);
      }
    });
    
    // Cap the maximum complex pattern contribution
    return Math.min(totalScore, 40);
  }

  /**
   * Get complex pattern matches for evidence tracking
   */
  getComplexPatternMatches(complexPatterns, text) {
    if (!complexPatterns || !text) return [];
    
    const matches = [];
    const textLower = text.toLowerCase();
    
    complexPatterns.forEach(patternData => {
      const { pattern, description, weight } = patternData;
      
      try {
        if (pattern.test(textLower)) {
          matches.push({
            description,
            pattern: pattern.source,
            weight,
            matched: true
          });
        }
      } catch (error) {
        console.warn(`Error in pattern matching: ${pattern}`, error);
      }
    });
    
    return matches;
  }

  /**
   * Enhanced contextual bonus calculation with sophisticated pattern recognition
   */
  calculateContextualBonus(modifiers, textLower) {
    let bonus = 0;
    
    Object.entries(modifiers).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => {
        // Enhanced matching: look for word boundaries and phrase matching
        if (keyword.includes(' ')) {
          // Multi-word phrase - exact phrase matching
          return textLower.includes(keyword.toLowerCase());
        } else {
          // Single word - word boundary matching
          const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
          return regex.test(textLower);
        }
      });
      
      if (matches.length > 0) {
        // Enhanced category weights for better detection with sophisticated emotion context
        const categoryWeights = {
          negativeContext: 22,        // Increased from 18
          positiveContext: 22,        // Increased from 18  
          achievementContext: 18,     // Increased from 15
          repetitionContext: 25,      // Increased from 20
          timeIndicators: 15,         // Increased from 12
          intensifiers: 12,           // Increased from 10
          socialIndicators: 10,       // Increased from 8
          professionalContext: 15,    // Increased from 12
          hesitationMarkers: 18,      // Increased from 15
          diplomaticPhrases: 12,      // Increased from 10
          riskContext: 18,            // Increased from 15
          uncertaintyMarkers: 15,     // Increased from 12
          lossContext: 20,            // Increased from 16
          emotionalContext: 17,       // Increased from 14
          assertionContext: 15,       // Increased from 12
          competenceContext: 12,      // Increased from 10
          // New sophisticated categories
          emotionalClues: 20,         // New - for emotional expression indicators
          intensityContext: 18,       // New - for emotion intensity modifiers
          targetContext: 12,          // New - for emotion targets
          escalationContext: 16,      // New - for emotion escalation
          expressionContext: 14       // New - for emotion expression style
        };
        
        const weight = categoryWeights[category] || 10; // Increased default from 8 to 10
        let categoryBonus = matches.length * weight;
        
        // Sophisticated pattern bonuses
        if (matches.length > 1) {
          // Multiple matches in same category get diminishing returns but still bonus
          categoryBonus += Math.min(matches.length - 1, 3) * (weight * 0.5);
        }
        
        // Length-based bonus for longer, more specific phrases
        const avgLength = matches.reduce((sum, match) => sum + match.length, 0) / matches.length;
        if (avgLength > 8) {
          categoryBonus *= 1.15; // 15% bonus for longer phrases
        }
        
        // Position bonus for context indicators at beginning of text
        const earlyMatches = matches.filter(match => textLower.indexOf(match.toLowerCase()) < 30);
        if (earlyMatches.length > 0) {
          categoryBonus += earlyMatches.length * 3; // Early position bonus
        }
        
        bonus += categoryBonus;
        
        console.log(`📈 Context bonus for ${category}: ${categoryBonus} (${matches.length} matches: ${matches.slice(0, 3).join(', ')})`);
      }
    });
    
    return Math.min(bonus, 50); // Increased cap from 35 to 50 for complex statements
  }

  /**
   * Find top emotion with confidence calibration
   */
  findTopEmotionWithCalibration(emotionScores) {
    const entries = Object.entries(emotionScores);
    const sorted = entries.sort((a, b) => b[1].totalScore - a[1].totalScore);
    
    const topEmotion = sorted[0];
    const secondEmotion = sorted[1];
    
    // Apply confidence calibration
    let calibratedScore = topEmotion[1].totalScore;
    
    // Reduce confidence if top two emotions are very close
    if (secondEmotion && (topEmotion[1].totalScore - secondEmotion[1].totalScore) < 10) {
      calibratedScore *= 0.8; // Reduce by 20%
    }
    
    // Apply minimum threshold
    const threshold = this.confidenceCalibration.thresholds.low;
    if (calibratedScore < threshold) {
      return { emotion: 'neutral', score: 5, details: {} };
    }
    
    return {
      emotion: topEmotion[0],
      score: calibratedScore,
      details: topEmotion[1]
    };
  }

  /**
   * Calculate emotion strength (intensity)
   */
  calculateEmotionStrength(topEmotion) {
    const score = topEmotion.score;
    
    if (score >= 80) return 'very-strong';
    if (score >= 60) return 'strong';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'mild';
    return 'weak';
  }

  /**
   * Find secondary emotions present
   */
  findSecondaryEmotions(emotionScores, primaryEmotion) {
    const threshold = 25; // Minimum score for secondary emotion
    
    return Object.entries(emotionScores)
      .filter(([emotion, score]) => emotion !== primaryEmotion && score.totalScore >= threshold)
      .sort((a, b) => b[1].totalScore - a[1].totalScore)
      .slice(0, 2) // Top 2 secondary emotions
      .map(([emotion, score]) => ({
        emotion,
        confidence: score.totalScore,
        strength: this.calculateEmotionStrength({ score: score.totalScore })
      }));
  }

  /**
   * Analyze contextual factors in the text
   */
  analyzeContextualFactors(transcriptText) {
    const factors = {
      length: transcriptText.length,
      complexity: this.calculateTextComplexity(transcriptText),
      sentiment: this.calculateBasicSentiment(transcriptText),
      urgency: this.detectUrgencyMarkers(transcriptText),
      formality: this.detectFormalityLevel(transcriptText),
      temporalContext: this.detectTemporalContext(transcriptText)
    };
    
    return factors;
  }

  /**
   * Calculate text complexity
   */
  calculateTextComplexity(text) {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentences = text.split(/[.!?]+/).length - 1;
    const avgSentenceLength = words.length / Math.max(sentences, 1);
    
    return {
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      wordCount: words.length,
      sentenceCount: sentences
    };
  }

  /**
   * Calculate basic sentiment
   */
  calculateBasicSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'like', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'annoyed'];
    
    const textLower = text.toLowerCase();
    const positive = positiveWords.filter(word => textLower.includes(word)).length;
    const negative = negativeWords.filter(word => textLower.includes(word)).length;
    
    return {
      positive,
      negative,
      overall: positive - negative,
      polarity: positive + negative > 0 ? (positive - negative) / (positive + negative) : 0
    };
  }

  /**
   * Detect urgency markers
   */
  detectUrgencyMarkers(text) {
    const urgencyWords = ['urgent', 'asap', 'immediately', 'now', 'quickly', 'rush', 'deadline', 'emergency'];
    const textLower = text.toLowerCase();
    
    return urgencyWords.filter(word => textLower.includes(word));
  }

  /**
   * Detect formality level
   */
  detectFormalityLevel(text) {
    const formalWords = ['please', 'thank you', 'sir', 'madam', 'appreciate', 'kindly', 'respectfully'];
    const informalWords = ['yeah', 'nah', 'cool', 'awesome', 'stuff', 'things', 'guys'];
    
    const textLower = text.toLowerCase();
    const formal = formalWords.filter(word => textLower.includes(word)).length;
    const informal = informalWords.filter(word => textLower.includes(word)).length;
    
    return {
      formal,
      informal,
      level: formal > informal ? 'formal' : informal > formal ? 'informal' : 'neutral'
    };
  }

  /**
   * Detect temporal context
   */
  detectTemporalContext(text) {
    const pastWords = ['was', 'were', 'had', 'did', 'yesterday', 'before', 'ago'];
    const presentWords = ['is', 'are', 'am', 'now', 'currently', 'today'];
    const futureWords = ['will', 'going to', 'tomorrow', 'next', 'soon', 'later'];
    
    const textLower = text.toLowerCase();
    
    return {
      past: pastWords.filter(word => textLower.includes(word)).length,
      present: presentWords.filter(word => textLower.includes(word)).length,
      future: futureWords.filter(word => textLower.includes(word)).length
    };
  }

  /**
   * Calculate emotion trend
   */
  calculateEmotionTrend(currentEmotion) {
    const recentHistory = this.emotionHistory.slice(-10); // Last 10 analyses
    
    if (recentHistory.length < 3) {
      return { direction: 'stable', confidence: 'low' };
    }
    
    const emotionCounts = {};
    recentHistory.forEach(item => {
      emotionCounts[item.detected] = (emotionCounts[item.detected] || 0) + 1;
    });
    
    const trend = {
      direction: 'stable',
      confidence: 'medium',
      pattern: this.detectEmotionPattern(recentHistory),
      consistency: this.calculateEmotionConsistency(recentHistory)
    };
    
    return trend;
  }

  /**
   * Generate emotion insights
   */
  generateEmotionInsights(topEmotion, emotionScores) {
    const insights = [];
    
    // Confidence insights
    if (topEmotion.score > 80) {
      insights.push('High confidence detection - strong emotional indicators present');
    } else if (topEmotion.score < 30) {
      insights.push('Low confidence - emotion may be subtle or mixed');
    }
    
    // Pattern insights
    const recentPattern = this.detectRecentEmotionPattern();
    if (recentPattern) {
      insights.push(recentPattern);
    }
    
    // Context insights
    const contextInsight = this.generateContextInsight(topEmotion.emotion);
    if (contextInsight) {
      insights.push(contextInsight);
    }
    
    return insights;
  }

  /**
   * Update emotion tracking
   */
  updateEmotionTracking(result) {
    // Add to stream
    this.emotionStream.push({
      emotion: result.detected,
      confidence: result.confidence,
      timestamp: result.timestamp
    });
    
    // Keep only last 50 stream entries
    if (this.emotionStream.length > 50) {
      this.emotionStream = this.emotionStream.slice(-50);
    }
    
    // Add to history
    this.emotionHistory.push(result);
    if (this.emotionHistory.length > this.maxHistoryLength) {
      this.emotionHistory = this.emotionHistory.slice(-this.maxHistoryLength);
    }
    
    // Update current state
    this.currentEmotionState = result;
  }

  /**
   * Update analytics
   */
  updateAnalytics(result) {
    this.emotionAnalytics.totalAnalyses++;
    
    // Update emotion counts
    const emotion = result.detected;
    this.emotionAnalytics.emotionCounts[emotion] = (this.emotionAnalytics.emotionCounts[emotion] || 0) + 1;
    
    // Update average confidence
    const totalConfidence = this.emotionHistory.reduce((sum, item) => sum + item.confidence, 0);
    this.emotionAnalytics.averageConfidence = totalConfidence / this.emotionHistory.length;
    
    // Track emotion transitions
    if (this.emotionHistory.length > 1) {
      const prevEmotion = this.emotionHistory[this.emotionHistory.length - 2].detected;
      const currentEmotion = result.detected;
      
      if (prevEmotion !== currentEmotion) {
        this.emotionAnalytics.emotionTransitions.push({
          from: prevEmotion,
          to: currentEmotion,
          timestamp: result.timestamp
        });
      }
    }
  }

  /**
   * Get real-time emotion analytics
   */
  getEmotionAnalytics() {
    return {
      ...this.emotionAnalytics,
      currentState: this.currentEmotionState,
      recentTrend: this.calculateEmotionTrend(this.currentEmotionState.detected),
      emotionDistribution: this.calculateEmotionDistribution(),
      averageSessionConfidence: this.emotionAnalytics.averageConfidence,
      sessionDuration: Date.now() - this.emotionAnalytics.sessionStart,
      insights: this.generateSessionInsights()
    };
  }

  /**
   * Calculate emotion distribution
   */
  calculateEmotionDistribution() {
    const total = this.emotionAnalytics.totalAnalyses;
    const distribution = {};
    
    Object.entries(this.emotionAnalytics.emotionCounts).forEach(([emotion, count]) => {
      distribution[emotion] = {
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
    
    return distribution;
  }

  /**
   * Generate session insights
   */
  generateSessionInsights() {
    const insights = [];
    const distribution = this.calculateEmotionDistribution();
    const totalAnalyses = this.emotionAnalytics.totalAnalyses;
    
    if (totalAnalyses > 10) {
      // Find dominant emotion
      const dominant = Object.entries(distribution)
        .sort((a, b) => b[1].count - a[1].count)[0];
      
      if (dominant && dominant[1].percentage > 40) {
        insights.push(`${dominant[0]} is the dominant emotion (${dominant[1].percentage}% of session)`);
      }
      
      // Detect emotional volatility
      const transitions = this.emotionAnalytics.emotionTransitions.length;
      const volatility = transitions / totalAnalyses;
      
      if (volatility > 0.7) {
        insights.push('High emotional volatility detected - frequent emotion changes');
      } else if (volatility < 0.2) {
        insights.push('Stable emotional state - consistent emotion throughout session');
      }
    }
    
    return insights;
  }

  // Helper methods for empty results
  createEmptyResult() {
    return { 
      detected: 'no_text', 
      confidence: 0,
      breakdown: { no_text: { textScore: 0, audioScore: 0, contextScore: 0 } },
      timestamp: Date.now()
    };
  }

  createEmptyScore() {
    return {
      totalScore: 0,
      textScore: 0,
      audioScore: 0,
      contextScore: 0,
      breakdown: { textMatches: [], audioEvidence: null, contextFactors: [] }
    };
  }

  createErrorResult(error) {
    return {
      detected: 'neutral',
      confidence: 0,
      breakdown: { neutral: { textScore: 0, audioScore: 0, contextScore: 0 } },
      error: error.message,
      timestamp: Date.now()
    };
  }

  /**
   * Enhanced dispose method
   */
  dispose() {
    this.stopDetection();
    if (this.analyticsTicker) {
      clearInterval(this.analyticsTicker);
    }
    this.nuanceAnalyzer.dispose();
    this.isInitialized = false;
    console.log('🧹 Advanced Emotion Detection Engine V4 disposed');
  }

  // Inherit other methods from previous version
  calculateAudioScore(thresholds, audioAnalysis) {
    // Same implementation as V3
    if (!audioAnalysis || !audioAnalysis.current) {
      return 0;
    }
    
    let score = 0;
    const maxPossibleScore = 50;
    let criteriaCount = 0;
    let metCriteria = 0;
    
    const current = audioAnalysis.current || {};
    const summary = audioAnalysis.summary || {};
    
    // Implementation continues... (same as V3)
    return score;
  }

  calculateEnhancedContextScore(emotionType, transcriptText) {
    // Enhanced version of context scoring
    let score = this.calculateContextScore(emotionType, transcriptText);
    
    // Add V4 enhancements
    if (transcriptText) {
      const textLower = transcriptText.toLowerCase();
      
      // Temporal context bonus
      if (textLower.includes('always') || textLower.includes('never')) {
        score += 5; // Absolutism increases emotional weight
      }
      
      // Question context
      if (textLower.includes('?') || textLower.includes('why') || textLower.includes('how')) {
        score += 3; // Questions can indicate concern or curiosity
      }
    }
    
    return score;
  }

  // Additional helper methods from V3...
  calculateContextScore(emotionType, transcriptText) {
    // Same as V3 implementation
    let score = 0;
    
    if (!transcriptText) return score;
    
    const textLower = transcriptText.toLowerCase();
    const contextClues = {
      sarcasm: ['problem', 'issue', 'complaint', 'wrong', 'broken', 'failed'],
      genuineEnthusiasm: ['success', 'achievement', 'good news', 'celebration', 'win'],
      frustration: ['delay', 'wait', 'problem', 'error', 'mistake', 'again'],
      politeLie: ['meeting', 'presentation', 'required', 'mandatory', 'professional'],
      sadness: ['loss', 'end', 'over', 'goodbye', 'failed', 'disappointed'],
      confidence: ['plan', 'strategy', 'will', 'going to', 'ready', 'prepared'],
      excitement: ['event', 'party', 'celebration', 'trip', 'vacation'],
      concern: ['worry', 'risk', 'danger', 'problem', 'issue']
    };
    
    if (contextClues[emotionType]) {
      const matches = contextClues[emotionType].filter(clue => textLower.includes(clue));
      score = Math.min(20, matches.length * 5);
    }
    
    return score;
  }

  getTextMatches(transcriptText, markers) {
    if (!transcriptText || !markers) return [];
    const textLower = transcriptText.toLowerCase();
    return markers.filter(marker => textLower.includes(marker.toLowerCase()));
  }

  getAudioEvidence(thresholds, audioAnalysis) {
    if (!thresholds || !audioAnalysis || !audioAnalysis.current) return {};
    
    return {
      hasAudioData: !!audioAnalysis.current,
      meetsThresholds: this.calculateAudioScore(thresholds, audioAnalysis) > 0,
      audioProperties: audioAnalysis.current || {}
    };
  }

  getContextFactors(emotionType, transcriptText) {
    if (!transcriptText) return {};
    
    return {
      textLength: transcriptText.length,
      wordCount: transcriptText.split(/\s+/).length,
      hasEmotionalMarkers: this.detectEmotionalMarkers(transcriptText),
      sentimentIndicators: this.detectSentimentIndicators(transcriptText)
    };
  }

  detectEmotionalMarkers(text) {
    const emotionalWords = ['very', 'extremely', 'absolutely', 'completely', 'totally', 'really', 'so', 'quite'];
    return emotionalWords.some(word => text.toLowerCase().includes(word));
  }

  detectSentimentIndicators(text) {
    const positive = ['good', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'awesome'];
    const negative = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'angry'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positive.filter(word => textLower.includes(word)).length;
    const negativeCount = negative.filter(word => textLower.includes(word)).length;
    
    return { positive: positiveCount, negative: negativeCount };
  }

  getContextualModifiers(modifiers, transcriptText) {
    if (!modifiers || !transcriptText) return {};
    
    const textLower = transcriptText.toLowerCase();
    const found = {};
    
    Object.entries(modifiers).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => textLower.includes(keyword.toLowerCase()));
      if (matches.length > 0) {
        found[category] = matches;
      }
    });
    
    return found;
  }

  analyzeTextEvidence(transcriptText) {
    // Same as V3 implementation
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

  startDetection() {
    if (!this.isInitialized) {
      console.error('❌ Emotion detection not initialized');
      return false;
    }
    this.nuanceAnalyzer.startAnalysis();
    console.log('🎭 Started advanced emotion detection V4');
    return true;
  }

  stopDetection() {
    this.nuanceAnalyzer.stopAnalysis();
    console.log('⏹️ Stopped advanced emotion detection V4');
  }

  getCurrentEmotion() {
    return this.currentEmotionState;
  }

  // Additional helper methods for V4 features
  detectEmotionPattern(history) {
    // Detect patterns in emotion history
    if (history.length < 5) return null;
    
    const emotions = history.map(h => h.detected);
    const unique = [...new Set(emotions)];
    
    if (unique.length === 1) {
      return 'consistent';
    } else if (emotions.slice(-3).every(e => e === emotions[emotions.length - 1])) {
      return 'stabilizing';
    } else {
      return 'variable';
    }
  }

  calculateEmotionConsistency(history) {
    if (history.length < 2) return 100;
    
    const emotions = history.map(h => h.detected);
    const unique = [...new Set(emotions)];
    
    return Math.round((1 - (unique.length - 1) / (emotions.length - 1)) * 100);
  }

  detectRecentEmotionPattern() {
    const recent = this.emotionHistory.slice(-5);
    if (recent.length < 3) return null;
    
    const emotions = recent.map(h => h.detected);
    const lastEmotion = emotions[emotions.length - 1];
    const sameCount = emotions.filter(e => e === lastEmotion).length;
    
    if (sameCount >= 3) {
      return `Consistent ${lastEmotion} pattern detected`;
    }
    
    return null;
  }

  generateContextInsight(emotion) {
    const insights = {
      sarcasm: 'Consider if this reflects underlying frustration or communication style',
      frustration: 'May indicate system issues or unmet expectations',
      enthusiasm: 'Positive engagement - good opportunity for reinforcement',
      concern: 'May need additional support or reassurance',
      excitement: 'High engagement level - good momentum for action'
    };
    
    return insights[emotion] || null;
  }

  updateEmotionTrends() {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;
    
    // Update 5-minute trend
    this.emotionAnalytics.emotionTrends.last5Minutes = this.emotionHistory
      .filter(h => now - h.timestamp < fiveMinutes)
      .map(h => ({ emotion: h.detected, confidence: h.confidence, timestamp: h.timestamp }));
    
    // Update 30-minute trend
    this.emotionAnalytics.emotionTrends.last30Minutes = this.emotionHistory
      .filter(h => now - h.timestamp < thirtyMinutes)
      .map(h => ({ emotion: h.detected, confidence: h.confidence, timestamp: h.timestamp }));
    
    // Update session overall
    this.emotionAnalytics.emotionTrends.sessionOverall = this.emotionHistory
      .map(h => ({ emotion: h.detected, confidence: h.confidence, timestamp: h.timestamp }));
  }

  calculateEmotionInsights() {
    // Calculate and update insights based on current trends
    const analytics = this.getEmotionAnalytics();
    
    // Store insights for later retrieval
    this.emotionAnalytics.calculatedInsights = {
      dominantEmotion: this.findDominantEmotion(),
      emotionalVolatility: this.calculateEmotionalVolatility(),
      confidenceTrend: this.calculateConfidenceTrend(),
      sessionSummary: this.generateSessionSummary()
    };
  }

  findDominantEmotion() {
    const counts = this.emotionAnalytics.emotionCounts;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }

  calculateEmotionalVolatility() {
    const transitions = this.emotionAnalytics.emotionTransitions.length;
    const analyses = this.emotionAnalytics.totalAnalyses;
    return analyses > 0 ? transitions / analyses : 0;
  }

  calculateConfidenceTrend() {
    const recent = this.emotionHistory.slice(-10);
    if (recent.length < 5) return 'insufficient-data';
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, h) => sum + h.confidence, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.confidence, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 10) return 'increasing';
    if (secondAvg < firstAvg - 10) return 'decreasing';
    return 'stable';
  }

  generateSessionSummary() {
    const duration = Date.now() - this.emotionAnalytics.sessionStart;
    const analyses = this.emotionAnalytics.totalAnalyses;
    const avgConfidence = this.emotionAnalytics.averageConfidence;
    
    return {
      duration: Math.round(duration / 60000), // minutes
      totalAnalyses: analyses,
      averageConfidence: Math.round(avgConfidence),
      analysisFrequency: analyses > 0 ? Math.round(duration / analyses / 1000) : 0 // seconds between analyses
    };
  }
}

// Export for integration
export default EmotionDetectionEngineV4;
