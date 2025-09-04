// Enhanced BERT Emotion API with Advanced Text Analysis
// Improved BERT integration with context awareness, ensemble methods, and confidence calibration

import { analyzeEmotionWithBERT as originalBertAnalysis } from './bertEmotionApi.js';

/**
 * Enhanced BERT Analysis with multiple strategies and confidence calibration
 */
export class EnhancedBERTAnalyzer {
  constructor() {
    this.modelEndpoints = {
      primary: null, // Will be set from localStorage or environment
      fallback: 'lexical',
      ensemble: [] // Multiple models for ensemble voting
    };
    
    this.analysisStrategies = {
      sentence_level: true,
      context_window: true,
      emotion_specific: true,
      confidence_calibration: true,
      ensemble_voting: true
    };
    
    this.emotionHierarchy = {
      primary: ['joy', 'sadness', 'anger', 'fear'],
      secondary: ['surprise', 'frustration', 'sarcasm'],
      neutral: ['neutral', 'calm', 'content']
    };
    
    this.confidenceCalibration = {
      bertBase: 0.7,        // Base confidence for BERT predictions
      lexicalBase: 0.5,     // Base confidence for lexical fallback
      ensembleBonus: 0.2,   // Bonus for ensemble agreement
      contextBonus: 0.15,   // Bonus for contextual consistency
      lengthPenalty: 0.1    // Penalty for very short texts
    };
    
    this.contextCache = new Map(); // Cache for context-aware analysis
    this.analysisHistory = []; // Track analysis history for learning
  }

  /**
   * Enhanced emotion analysis with multiple strategies
   */
  async analyzeEmotionEnhanced(text, options = {}) {
    const analysisOptions = {
      includeConfidenceCalibration: true,
      useContextWindow: true,
      enableEnsemble: false, // Disabled by default due to API costs
      sentenceLevel: true,
      ...options
    };

    try {
      // 1. Preprocess text
      const processedText = this.preprocessText(text);
      if (!processedText.trim()) {
        return this.createEmptyResult();
      }

      // 2. Strategy selection based on text characteristics
      const strategy = this.selectAnalysisStrategy(processedText, analysisOptions);
      
      // 3. Run analysis with selected strategy
      let results;
      switch (strategy) {
        case 'sentence_level':
          results = await this.analyzeSentenceLevel(processedText, analysisOptions);
          break;
        case 'context_window':
          results = await this.analyzeWithContext(processedText, analysisOptions);
          break;
        case 'ensemble':
          results = await this.analyzeEnsemble(processedText, analysisOptions);
          break;
        default:
          results = await this.analyzeStandard(processedText, analysisOptions);
      }

      // 4. Apply confidence calibration
      if (analysisOptions.includeConfidenceCalibration) {
        results = this.calibrateConfidence(results, processedText, strategy);
      }

      // 5. Add metadata and cache
      results.metadata = {
        strategy: strategy,
        textLength: processedText.length,
        wordCount: processedText.split(/\s+/).length,
        processingTime: Date.now(),
        version: '2.0'
      };

      this.cacheResult(processedText, results);
      this.updateAnalysisHistory(results);

      return results;

    } catch (error) {
      console.error('❌ Enhanced BERT analysis failed:', error);
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * Preprocess text for better BERT analysis
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Basic cleaning
    let processed = text.trim();
    
    // Normalize whitespace
    processed = processed.replace(/\s+/g, ' ');
    
    // Handle special characters that might confuse BERT
    processed = processed.replace(/[^\w\s.,!?;:'"()-]/g, ' ');
    
    // Ensure proper sentence endings
    if (processed.length > 0 && !/[.!?]$/.test(processed)) {
      processed += '.';
    }
    
    return processed;
  }

  /**
   * Select optimal analysis strategy based on text characteristics
   */
  selectAnalysisStrategy(text, options) {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Very short texts - use standard analysis
    if (wordCount < 5) {
      return 'standard';
    }
    
    // Multiple sentences - use sentence-level analysis
    if (sentenceCount > 1 && options.sentenceLevel) {
      return 'sentence_level';
    }
    
    // Medium length with context - use context window
    if (wordCount > 15 && options.useContextWindow) {
      return 'context_window';
    }
    
    // Long texts with ensemble option
    if (wordCount > 50 && options.enableEnsemble) {
      return 'ensemble';
    }
    
    return 'standard';
  }

  /**
   * Standard BERT analysis with enhancements
   */
  async analyzeStandard(text, options) {
    try {
      const result = await originalBertAnalysis(text, {
        candidates: this.getAllEmotionLabels()
      });

      return this.enhanceResult(result, 'standard');
    } catch (error) {
      console.warn('Standard BERT analysis failed, using lexical fallback:', error);
      return this.lexicalFallback(text);
    }
  }

  /**
   * Sentence-level analysis for complex texts
   */
  async analyzeSentenceLevel(text, options) {
    const sentences = this.splitIntoSentences(text);
    
    if (sentences.length <= 1) {
      return this.analyzeStandard(text, options);
    }

    try {
      // Analyze each sentence
      const sentenceResults = await Promise.all(
        sentences.map(sentence => originalBertAnalysis(sentence.trim(), {
          candidates: this.getAllEmotionLabels()
        }))
      );

      // Aggregate results
      const aggregated = this.aggregateSentenceResults(sentenceResults, sentences);
      return this.enhanceResult(aggregated, 'sentence_level');

    } catch (error) {
      console.warn('Sentence-level analysis failed:', error);
      return this.analyzeStandard(text, options);
    }
  }

  /**
   * Context-aware analysis using sliding window
   */
  async analyzeWithContext(text, options) {
    const contextKey = this.generateContextKey(text);
    
    // Check cache first
    if (this.contextCache.has(contextKey)) {
      return this.contextCache.get(contextKey);
    }

    try {
      // Create context windows
      const windows = this.createContextWindows(text, 3); // 3-sentence windows
      
      // Analyze each window
      const windowResults = await Promise.all(
        windows.map(window => originalBertAnalysis(window, {
          candidates: this.getAllEmotionLabels()
        }))
      );

      // Merge context results
      const contextResult = this.mergeContextResults(windowResults);
      const enhanced = this.enhanceResult(contextResult, 'context_window');
      
      this.contextCache.set(contextKey, enhanced);
      return enhanced;

    } catch (error) {
      console.warn('Context analysis failed:', error);
      return this.analyzeStandard(text, options);
    }
  }

  /**
   * Ensemble analysis using multiple strategies
   */
  async analyzeEnsemble(text, options) {
    try {
      // Run multiple analysis strategies in parallel
      const [standard, sentenceLevel, contextAware] = await Promise.all([
        this.analyzeStandard(text, options),
        this.analyzeSentenceLevel(text, options),
        this.analyzeWithContext(text, options)
      ]);

      // Ensemble voting
      const ensembleResult = this.ensembleVoting([
        { result: standard, weight: 0.4 },
        { result: sentenceLevel, weight: 0.35 },
        { result: contextAware, weight: 0.25 }
      ]);

      return this.enhanceResult(ensembleResult, 'ensemble');

    } catch (error) {
      console.warn('Ensemble analysis failed:', error);
      return this.analyzeStandard(text, options);
    }
  }

  /**
   * Split text into sentences intelligently
   */
  splitIntoSentences(text) {
    // Enhanced sentence splitting that handles common edge cases
    return text
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Aggregate results from sentence-level analysis
   */
  aggregateSentenceResults(results, sentences) {
    const emotionCounts = {};
    const emotionScores = {};
    let totalWeight = 0;

    results.forEach((result, index) => {
      if (!result || !result.array) return;

      // Weight sentences by length
      const sentenceWeight = Math.max(0.1, sentences[index].split(/\s+/).length / 10);
      totalWeight += sentenceWeight;

      result.array.forEach(item => {
        const emotion = item.label;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        emotionScores[emotion] = (emotionScores[emotion] || 0) + (item.score * sentenceWeight);
      });
    });

    // Normalize scores
    Object.keys(emotionScores).forEach(emotion => {
      emotionScores[emotion] = emotionScores[emotion] / totalWeight;
    });

    // Create aggregated result
    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([label, score]) => ({ label, score }));

    return {
      array: sortedEmotions,
      map: emotionScores
    };
  }

  /**
   * Create context windows for analysis
   */
  createContextWindows(text, windowSize = 3) {
    const sentences = this.splitIntoSentences(text);
    const windows = [];

    for (let i = 0; i < sentences.length; i += windowSize - 1) {
      const window = sentences.slice(i, i + windowSize).join(' ');
      if (window.trim().length > 0) {
        windows.push(window);
      }
    }

    return windows.length > 0 ? windows : [text];
  }

  /**
   * Merge results from context windows
   */
  mergeContextResults(results) {
    const emotionScores = {};
    let validResults = 0;

    results.forEach(result => {
      if (!result || !result.array) return;
      validResults++;

      result.array.forEach(item => {
        emotionScores[item.label] = (emotionScores[item.label] || 0) + item.score;
      });
    });

    // Average the scores
    if (validResults > 0) {
      Object.keys(emotionScores).forEach(emotion => {
        emotionScores[emotion] = emotionScores[emotion] / validResults;
      });
    }

    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([label, score]) => ({ label, score }));

    return {
      array: sortedEmotions,
      map: emotionScores
    };
  }

  /**
   * Ensemble voting from multiple results
   */
  ensembleVoting(weightedResults) {
    const emotionScores = {};
    let totalWeight = 0;

    weightedResults.forEach(({ result, weight }) => {
      if (!result || !result.array) return;
      totalWeight += weight;

      result.array.forEach(item => {
        emotionScores[item.label] = (emotionScores[item.label] || 0) + (item.score * weight);
      });
    });

    // Normalize by total weight
    if (totalWeight > 0) {
      Object.keys(emotionScores).forEach(emotion => {
        emotionScores[emotion] = emotionScores[emotion] / totalWeight;
      });
    }

    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([label, score]) => ({ label, score }));

    return {
      array: sortedEmotions,
      map: emotionScores
    };
  }

  /**
   * Calibrate confidence scores based on various factors
   */
  calibrateConfidence(result, text, strategy) {
    if (!result || !result.array || result.array.length === 0) {
      return result;
    }

    const wordCount = text.split(/\s+/).length;
    const topScore = result.array[0].score;
    const secondScore = result.array[1]?.score || 0;
    
    // Base confidence adjustment
    let calibrationFactor = 1.0;
    
    // Strategy-based adjustment
    switch (strategy) {
      case 'ensemble':
        calibrationFactor *= (1 + this.confidenceCalibration.ensembleBonus);
        break;
      case 'context_window':
        calibrationFactor *= (1 + this.confidenceCalibration.contextBonus);
        break;
      case 'sentence_level':
        calibrationFactor *= (1 + this.confidenceCalibration.contextBonus * 0.5);
        break;
    }
    
    // Length-based adjustment
    if (wordCount < 5) {
      calibrationFactor *= (1 - this.confidenceCalibration.lengthPenalty);
    } else if (wordCount > 20) {
      calibrationFactor *= (1 + this.confidenceCalibration.lengthPenalty * 0.5);
    }
    
    // Confidence separation bonus
    const separation = topScore - secondScore;
    if (separation > 0.3) {
      calibrationFactor *= 1.1;
    } else if (separation < 0.1) {
      calibrationFactor *= 0.9;
    }
    
    // Apply calibration
    const calibratedArray = result.array.map(item => ({
      ...item,
      score: Math.min(0.95, Math.max(0.05, item.score * calibrationFactor))
    }));
    
    // Renormalize
    const total = calibratedArray.reduce((sum, item) => sum + item.score, 0);
    if (total > 0) {
      calibratedArray.forEach(item => {
        item.score = item.score / total;
      });
    }
    
    // Update map
    const calibratedMap = {};
    calibratedArray.forEach(item => {
      calibratedMap[item.label] = item.score;
    });
    
    return {
      array: calibratedArray,
      map: calibratedMap
    };
  }

  /**
   * Enhanced lexical fallback with improved patterns
   */
  lexicalFallback(text) {
    const t = (text || '').toLowerCase();
    const scores = {};
    
    // Enhanced emotion patterns
    const patterns = {
      joy: {
        patterns: [
          /(happy|joy|excited|amazing|wonderful|love|great|awesome|fantastic|brilliant|excellent|perfect|outstanding|superb|magnificent|marvelous|thrilled|delighted|elated|cheerful|joyful|pleased|glad)/g,
          /(yay|hooray|wow|yes|definitely|absolutely|certainly|incredible|terrific)/g,
          /(celebrate|celebration|party|fun|laughter|smile|laughing|smiling|cheering|upbeat|positive|optimistic)/g
        ],
        weight: 1.0
      },
      sadness: {
        patterns: [
          /(sad|depressed|upset|disappointed|hurt|miserable|unhappy|sorrowful|gloomy|dejected|melancholy|blue|down|low)/g,
          /(terrible|awful|horrible|devastating|heartbreaking|tragic|unfortunate|hopeless|despair|lonely|empty|broken)/g,
          /(crying|tears|weeping|sobbing|grieving|mourning|sorrow|regret|loss|grief|anguish|pain|suffering)/g,
          /(failed|failure|lost|losing|gone|dead|died|death|goodbye|farewell|end|over|finished)/g
        ],
        weight: 1.0
      },
      anger: {
        patterns: [
          /(angry|mad|furious|irritated|annoyed|frustrated|outraged|livid|enraged|irate|hostile|pissed|rage|raging)/g,
          /(hate|disgusted|appalled|infuriated|incensed|aggravated|fed up|sick of|can't stand)/g,
          /(damn|hell|stupid|ridiculous|unacceptable|outrageous|bullshit|crap|nonsense|idiotic|moronic)/g,
          /(what the hell|what the fuck|are you kidding me|this is bullshit|enough is enough)/g
        ],
        weight: 1.0
      },
      fear: {
        patterns: [
          /(scared|afraid|terrified|panic|anxious|worried|nervous|frightened|alarmed|concerned)/g,
          /(danger|dangerous|risky|threat|threatening|menacing|ominous|sinister)/g,
          /(help|support|assistance|guidance|advice|protection|safety|security)/g
        ],
        weight: 1.0
      },
      surprise: {
        patterns: [
          /(surprised|shocked|amazed|astonished|stunned|bewildered|startled|speechless)/g,
          /(wow|whoa|oh my|really|seriously|no way|unbelievable|incredible|shocking)/g,
          /(sudden|unexpected|out of nowhere|all of a sudden|without warning)/g
        ],
        weight: 1.0
      },
      frustration: {
        patterns: [
          /(frustrat|annoy|difficult|problem|issue|trouble|struggle|challenge)/g,
          /(ugh|sigh|tired of|fed up|had enough|over this|can't deal)/g,
          /(why me|why now|not again|seriously|come on|give me a break)/g
        ],
        weight: 1.0
      },
      sarcasm: {
        patterns: [
          /(yeah right|sure|as if|nice going|big surprise|how convenient)/g,
          /(obviously|clearly|of course|naturally|brilliant|perfect|wonderful)/g,
          /(great|fantastic|amazing|excellent) (job|work|idea|plan)/g
        ],
        weight: 0.8 // Sarcasm is harder to detect lexically
      }
    };

    // Calculate scores for each emotion
    Object.entries(patterns).forEach(([emotion, config]) => {
      let emotionScore = 0;
      
      config.patterns.forEach(pattern => {
        const matches = t.match(pattern) || [];
        emotionScore += matches.length * 0.2;
      });
      
      scores[emotion] = Math.min(0.9, emotionScore * config.weight);
    });

    // Add neutral baseline
    scores.neutral = 0.1;

    // Apply intensifiers
    const intensifiers = t.match(/(very|extremely|really|so|completely|absolutely|totally|incredibly|amazingly)/g) || [];
    if (intensifiers.length > 0) {
      Object.keys(scores).forEach(emotion => {
        if (emotion !== 'neutral') {
          scores[emotion] = Math.min(0.95, scores[emotion] * (1 + 0.1 * intensifiers.length));
        }
      });
    }

    // Normalize scores
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(scores).forEach(emotion => {
        scores[emotion] = scores[emotion] / total;
      });
    }

    const sortedEmotions = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([label, score]) => ({ label, score }));

    return {
      array: sortedEmotions,
      map: scores
    };
  }

  /**
   * Enhance result with additional metadata
   */
  enhanceResult(result, strategy) {
    if (!result) return this.createEmptyResult();

    return {
      ...result,
      enhancedMetadata: {
        strategy: strategy,
        timestamp: Date.now(),
        confidence_level: this.getConfidenceLevel(result),
        dominant_emotion: result.array?.[0]?.label || 'neutral',
        emotion_diversity: this.calculateEmotionDiversity(result)
      }
    };
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(result) {
    if (!result.array || result.array.length === 0) return 'very_low';
    
    const topScore = result.array[0].score;
    if (topScore > 0.8) return 'very_high';
    if (topScore > 0.6) return 'high';
    if (topScore > 0.4) return 'medium';
    if (topScore > 0.2) return 'low';
    return 'very_low';
  }

  /**
   * Calculate emotion diversity score
   */
  calculateEmotionDiversity(result) {
    if (!result.array || result.array.length < 2) return 0;
    
    // Shannon entropy calculation
    const entropy = result.array.reduce((sum, item) => {
      if (item.score > 0) {
        return sum - (item.score * Math.log2(item.score));
      }
      return sum;
    }, 0);
    
    return Math.round(entropy * 100) / 100;
  }

  /**
   * Get all emotion labels
   */
  getAllEmotionLabels() {
    return [
      ...this.emotionHierarchy.primary,
      ...this.emotionHierarchy.secondary,
      ...this.emotionHierarchy.neutral
    ];
  }

  /**
   * Generate context key for caching
   */
  generateContextKey(text) {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `ctx_${Math.abs(hash)}`;
  }

  /**
   * Cache analysis result
   */
  cacheResult(text, result) {
    // Limit cache size
    if (this.contextCache.size > 100) {
      const firstKey = this.contextCache.keys().next().value;
      this.contextCache.delete(firstKey);
    }
    
    const key = this.generateContextKey(text);
    this.contextCache.set(key, { ...result, cached: true });
  }

  /**
   * Update analysis history for learning
   */
  updateAnalysisHistory(result) {
    this.analysisHistory.push({
      timestamp: Date.now(),
      strategy: result.enhancedMetadata?.strategy,
      confidence: result.array?.[0]?.score || 0,
      emotion: result.array?.[0]?.label || 'neutral'
    });
    
    // Keep only recent history
    if (this.analysisHistory.length > 1000) {
      this.analysisHistory = this.analysisHistory.slice(-500);
    }
  }

  /**
   * Create empty result for error cases
   */
  createEmptyResult() {
    return {
      array: [{ label: 'neutral', score: 0.5 }],
      map: { neutral: 0.5 },
      enhancedMetadata: {
        strategy: 'fallback',
        timestamp: Date.now(),
        confidence_level: 'low',
        dominant_emotion: 'neutral',
        emotion_diversity: 0
      }
    };
  }

  /**
   * Get analyzer statistics
   */
  getStats() {
    return {
      totalAnalyses: this.analysisHistory.length,
      cacheSize: this.contextCache.size,
      averageConfidence: this.getAverageConfidence(),
      mostCommonEmotion: this.getMostCommonEmotion(),
      strategyUsage: this.getStrategyUsage()
    };
  }

  /**
   * Get average confidence from history
   */
  getAverageConfidence() {
    if (this.analysisHistory.length === 0) return 0;
    
    const sum = this.analysisHistory.reduce((total, item) => total + item.confidence, 0);
    return Math.round((sum / this.analysisHistory.length) * 100) / 100;
  }

  /**
   * Get most common emotion from history
   */
  getMostCommonEmotion() {
    if (this.analysisHistory.length === 0) return 'neutral';
    
    const counts = {};
    this.analysisHistory.forEach(item => {
      counts[item.emotion] = (counts[item.emotion] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  /**
   * Get strategy usage statistics
   */
  getStrategyUsage() {
    const usage = {};
    this.analysisHistory.forEach(item => {
      if (item.strategy) {
        usage[item.strategy] = (usage[item.strategy] || 0) + 1;
      }
    });
    return usage;
  }
}

// Export enhanced BERT analyzer
export const enhancedBertAnalyzer = new EnhancedBERTAnalyzer();

// Export enhanced analysis function that uses the new analyzer
export async function analyzeEmotionWithEnhancedBERT(text, options = {}) {
  return enhancedBertAnalyzer.analyzeEmotionEnhanced(text, options);
}

export default EnhancedBERTAnalyzer;
