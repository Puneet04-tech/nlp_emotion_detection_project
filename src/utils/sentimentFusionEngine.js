// Multi-Algorithm Sentiment Fusion System
// Combines multiple sentiment analysis approaches for maximum accuracy

import AdvancedBERTEmotionAnalyzer from './advancedBERTAnalyzer.js';

class SentimentFusionEngine {
  constructor() {
    this.bertAnalyzer = new AdvancedBERTEmotionAnalyzer();
    this.lexiconAnalyzers = this.initializeLexiconAnalyzers();
    this.patternAnalyzers = this.initializePatternAnalyzers();
    this.contextAnalyzers = this.initializeContextAnalyzers();
    this.vaderAnalyzer = this.initializeVaderAnalyzer();
    this.textBlobAnalyzer = this.initializeTextBlobAnalyzer();
    // Algorithm weights for fusion
    this.algorithmWeights = {
      bert: 0.30,
      lexicon: 0.20,
      pattern: 0.15,
      context: 0.10,
      vader: 0.15,
      textBlob: 0.10
    };
  }

    // --- Use ES6 class method syntax for all methods below ---
  initializeVaderAnalyzer() {
    return {
      analyze: (text) => {
        // Expanded VADER sentiment analysis for all major emotions
        const lower = text.toLowerCase();
        if (lower.includes('happy') || lower.includes('joy') || lower.includes('delighted') || lower.includes('ecstatic')) return { emotions: { joy: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('sad') || lower.includes('down') || lower.includes('miserable') || lower.includes('depressed')) return { emotions: { sadness: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('angry') || lower.includes('furious') || lower.includes('annoyed') || lower.includes('irritated')) return { emotions: { anger: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('scared') || lower.includes('afraid') || lower.includes('worried') || lower.includes('anxious')) return { emotions: { fear: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('excited') || lower.includes('enthusiastic')) return { emotions: { excitement: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('confident') || lower.includes('determined')) return { emotions: { confidence: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('peaceful') || lower.includes('calm') || lower.includes('serene')) return { emotions: { serenity: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('surprised') || lower.includes('astonished') || lower.includes('shocked')) return { emotions: { surprise: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('grateful') || lower.includes('thankful')) return { emotions: { gratitude: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('nostalgic')) return { emotions: { nostalgia: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('curious')) return { emotions: { curiosity: 80 }, confidence: 80, method: 'vader' };
        if (lower.includes('frustrated') || lower.includes('disappointed')) return { emotions: { frustration: 80 }, confidence: 80, method: 'vader' };
        return { emotions: { neutral: 80 }, confidence: 80, method: 'vader' };
      }
    };
  }

  initializeTextBlobAnalyzer() {
    return {
      analyze: (text) => {
        // Expanded TextBlob sentiment analysis for all major emotions
        const lower = text.toLowerCase();
        if (lower.includes('happy') || lower.includes('joy') || lower.includes('delighted') || lower.includes('ecstatic')) return { emotions: { joy: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('sad') || lower.includes('down') || lower.includes('miserable') || lower.includes('depressed')) return { emotions: { sadness: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('angry') || lower.includes('mad') || lower.includes('furious') || lower.includes('annoyed')) return { emotions: { anger: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('scared') || lower.includes('afraid') || lower.includes('worried') || lower.includes('anxious')) return { emotions: { fear: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('excited') || lower.includes('enthusiastic')) return { emotions: { excitement: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('confident') || lower.includes('determined')) return { emotions: { confidence: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('peaceful') || lower.includes('calm') || lower.includes('serene')) return { emotions: { serenity: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('surprised') || lower.includes('astonished') || lower.includes('shocked')) return { emotions: { surprise: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('grateful') || lower.includes('thankful')) return { emotions: { gratitude: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('nostalgic')) return { emotions: { nostalgia: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('curious')) return { emotions: { curiosity: 70 }, confidence: 70, method: 'textblob' };
        if (lower.includes('frustrated') || lower.includes('disappointed')) return { emotions: { frustration: 70 }, confidence: 70, method: 'textblob' };
        return { emotions: { neutral: 70 }, confidence: 70, method: 'textblob' };
      }
    };
  }
  // Remove misplaced closing brace so all methods are inside the class

  initializeLexiconAnalyzers() {
    return {
      // Emotion lexicons with intensity scores
      emotionLexicon: {
        // Joy/Happiness spectrum
        ecstatic: { emotion: 'euphoria', intensity: 0.95 },
        thrilled: { emotion: 'excitement', intensity: 0.90 },
        delighted: { emotion: 'joy', intensity: 0.85 },
        happy: { emotion: 'joy', intensity: 0.75 },
        pleased: { emotion: 'satisfaction', intensity: 0.65 },
        content: { emotion: 'serenity', intensity: 0.55 },
        
        // Sadness spectrum
        devastated: { emotion: 'grief', intensity: 0.95 },
        heartbroken: { emotion: 'sadness', intensity: 0.90 },
        miserable: { emotion: 'sadness', intensity: 0.85 },
        sad: { emotion: 'sadness', intensity: 0.75 },
        disappointed: { emotion: 'disappointment', intensity: 0.65 },
        melancholy: { emotion: 'melancholy', intensity: 0.60 },
        
        // Anger spectrum
        furious: { emotion: 'rage', intensity: 0.95 },
        enraged: { emotion: 'anger', intensity: 0.90 },
        angry: { emotion: 'anger', intensity: 0.80 },
        annoyed: { emotion: 'frustration', intensity: 0.60 },
        irritated: { emotion: 'irritation', intensity: 0.55 },
        
        // Fear/Anxiety spectrum
        terrified: { emotion: 'terror', intensity: 0.95 },
        petrified: { emotion: 'fear', intensity: 0.90 },
        scared: { emotion: 'fear', intensity: 0.75 },
        worried: { emotion: 'anxiety', intensity: 0.65 },
        nervous: { emotion: 'nervousness', intensity: 0.55 },
        anxious: { emotion: 'anxiety', intensity: 0.70 },
        
        // Surprise spectrum
        astonished: { emotion: 'amazement', intensity: 0.90 },
        shocked: { emotion: 'shock', intensity: 0.85 },
        surprised: { emotion: 'surprise', intensity: 0.75 },
        
        // Complex emotions
        grateful: { emotion: 'gratitude', intensity: 0.80 },
        nostalgic: { emotion: 'nostalgia', intensity: 0.70 },
        curious: { emotion: 'curiosity', intensity: 0.65 },
        confident: { emotion: 'confidence', intensity: 0.75 },
        peaceful: { emotion: 'serenity', intensity: 0.70 },
        determined: { emotion: 'determination', intensity: 0.80 },
        enthusiastic: { emotion: 'enthusiasm', intensity: 0.85 }
      },

      // Intensity modifiers
      intensifiers: {
        extreme: ['extremely', 'incredibly', 'absolutely', 'completely', 'utterly', 'totally'],
        high: ['very', 'really', 'quite', 'rather', 'tremendously', 'immensely'],
        medium: ['somewhat', 'fairly', 'pretty', 'kind of', 'sort of'],
        low: ['slightly', 'a bit', 'a little', 'barely', 'hardly']
      },

      // Negation handling
      negations: {
        direct: ['not', 'no', 'never', 'none', 'nothing', 'nowhere', 'nobody'],
        indirect: ['barely', 'hardly', 'scarcely', 'rarely', 'seldom'],
        contextual: ['without', 'lack', 'absence', 'missing', 'void']
      }
    };
  }

  initializePatternAnalyzers() {
    return {
      // Grammatical patterns that indicate emotions
      emotionalPatterns: {
        exclamation: {
          pattern: /[!]{1,3}$/,
          emotions: ['excitement', 'surprise', 'anger'],
          intensityBoost: 0.2
        },
        
        question: {
          pattern: /\?+$/,
          emotions: ['curiosity', 'confusion', 'surprise'],
          intensityBoost: 0.1
        },
        
        ellipsis: {
          pattern: /\.{2,}$/,
          emotions: ['uncertainty', 'sadness', 'contemplation'],
          intensityBoost: 0.15
        },
        
        capitalization: {
          pattern: /[A-Z]{2,}/,
          emotions: ['anger', 'excitement', 'emphasis'],
          intensityBoost: 0.25
        },
        
        repetition: {
          pattern: /(.)\1{2,}/,
          emotions: ['emphasis', 'frustration', 'excitement'],
          intensityBoost: 0.2
        }
      },

      // Syntactic patterns
      syntacticPatterns: {
        conditional: {
          markers: ['if', 'when', 'unless', 'provided'],
          emotionModifier: -0.1 // Reduces certainty
        },
        
        comparative: {
          markers: ['better', 'worse', 'more', 'less', 'than'],
          emotionModifier: 0.05 // Slight emphasis
        },
        
        temporal: {
          past: ['was', 'were', 'had', 'did'],
          present: ['am', 'is', 'are', 'do'],
          future: ['will', 'shall', 'going to', 'plan to']
        }
      },

      // Emotional progression patterns
      progressionPatterns: {
        escalation: ['first', 'then', 'next', 'finally', 'ultimately'],
        contrast: ['but', 'however', 'although', 'despite', 'nevertheless'],
        addition: ['and', 'also', 'furthermore', 'moreover', 'additionally']
      }
    };
  }

  initializeContextAnalyzers() {
    return {
      // Contextual emotion indicators
      contextualCues: {
        social: {
          relationships: ['friend', 'family', 'partner', 'colleague', 'stranger'],
          interactions: ['meeting', 'conversation', 'argument', 'celebration'],
          emotionInfluence: {
            positive: 0.1,
            negative: -0.1
          }
        },
        
        temporal: {
          timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
          duration: ['briefly', 'quickly', 'slowly', 'forever'],
          frequency: ['always', 'often', 'sometimes', 'rarely', 'never']
        },
        
        environmental: {
          locations: ['home', 'work', 'school', 'outside', 'public'],
          conditions: ['quiet', 'noisy', 'crowded', 'empty', 'peaceful']
        }
      },

      // Cultural and demographic considerations
      culturalFactors: {
        expressiveness: {
          high: ['excited', 'passionate', 'dramatic'],
          low: ['reserved', 'subtle', 'understated']
        },
        
        emotionalDisplay: {
          direct: ['clearly', 'obviously', 'definitely'],
          indirect: ['perhaps', 'maybe', 'somewhat']
        }
      }
    };
  }

  async analyzeSentimentFusion(text, voiceFeatures = null) {
    if (!text || text.trim().length < 2) {
      return this.getDefaultAnalysis();
    }

    console.log('🔬 Multi-Algorithm Sentiment Fusion Analysis Starting...');
    
    try {
      // Run all analyzers in parallel
      const [bertResult, lexiconResult, patternResult, contextResult] = await Promise.allSettled([
        this.bertAnalyzer.analyzeWithMultipleModels(text),
        this.analyzeLexiconBased(text),
        this.analyzePatternBased(text),
        this.analyzeContextBased(text, voiceFeatures)
      ]);

      // Run VADER and TextBlob (simulated, sync)
      const vaderResult = this.vaderAnalyzer.analyze(text);
      const textBlobResult = this.textBlobAnalyzer.analyze(text);

      // Collect results
      const results = {
        bert: bertResult.status === 'fulfilled' ? bertResult.value : null,
        lexicon: lexiconResult.status === 'fulfilled' ? lexiconResult.value : null,
        pattern: patternResult.status === 'fulfilled' ? patternResult.value : null,
        context: contextResult.status === 'fulfilled' ? contextResult.value : null,
        vader: vaderResult,
        textBlob: textBlobResult
      };

      // Perform fusion
      const fusedEmotions = this.performFusion(results, text);

      // Apply final enhancements
      const enhancedEmotions = this.applyFinalEnhancements(fusedEmotions, text, voiceFeatures);

      return this.finalizeAnalysis(enhancedEmotions, results);

    } catch (error) {
      console.error('❌ Sentiment fusion analysis failed:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  async analyzeLexiconBased(text) {
    const words = text.toLowerCase().split(/\s+/);
    const emotions = {};
    let totalIntensity = 0;

    // Direct lexicon matching
    words.forEach(word => {
      if (this.lexiconAnalyzers.emotionLexicon[word]) {
        const { emotion, intensity } = this.lexiconAnalyzers.emotionLexicon[word];
        emotions[emotion] = (emotions[emotion] || 0) + intensity * 100;
        totalIntensity += intensity;
      }
    });

    // Handle intensifiers
    const intensityMultiplier = this.calculateIntensityMultiplier(words);
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] *= intensityMultiplier;
    });

    // Handle negations
    const negationEffect = this.calculateNegationEffect(words);
    if (negationEffect > 0) {
      this.applyNegation(emotions, negationEffect);
    }

    return {
      emotions: emotions,
      confidence: Math.min(90, 60 + (totalIntensity * 30)),
      method: 'lexicon-based',
      intensityMultiplier: intensityMultiplier,
      negationEffect: negationEffect
    };
  }

  async analyzePatternBased(text) {
    const emotions = {};
    let totalPatternScore = 0;

    // Analyze emotional patterns
    Object.entries(this.patternAnalyzers.emotionalPatterns).forEach(([patternName, pattern]) => {
      if (pattern.pattern.test(text)) {
        pattern.emotions.forEach(emotion => {
          emotions[emotion] = (emotions[emotion] || 0) + (pattern.intensityBoost * 50);
          totalPatternScore += pattern.intensityBoost;
        });
      }
    });

    // Analyze syntactic patterns
    const words = text.toLowerCase().split(/\s+/);
    const syntacticScore = this.analyzeSyntacticPatterns(words);
    
    // Apply syntactic modifications
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] *= (1 + syntacticScore);
    });

    return {
      emotions: emotions,
      confidence: Math.min(85, 50 + (totalPatternScore * 40)),
      method: 'pattern-based',
      patternScore: totalPatternScore,
      syntacticScore: syntacticScore
    };
  }

  async analyzeContextBased(text, voiceFeatures) {
    const words = text.toLowerCase().split(/\s+/);
    const emotions = {};
    
    // Social context analysis
    const socialContext = this.analyzeSocialContext(words);
    
    // Temporal context analysis
    const temporalContext = this.analyzeTemporalContext(words);
    
    // Environmental context analysis
    const environmentalContext = this.analyzeEnvironmentalContext(words);
    
    // Voice-text alignment (if voice features available)
    const alignmentScore = voiceFeatures ? this.analyzeVoiceTextAlignment(text, voiceFeatures) : 0;
    
    // Calculate contextual emotion scores
    const contextScore = (socialContext + temporalContext + environmentalContext) / 3;
    
    // Apply context to base emotions
    if (contextScore > 0.5) {
      emotions['confidence'] = contextScore * 30;
      emotions['clarity'] = contextScore * 25;
    } else if (contextScore < -0.5) {
      emotions['uncertainty'] = Math.abs(contextScore) * 30;
      emotions['confusion'] = Math.abs(contextScore) * 20;
    }

    return {
      emotions: emotions,
      confidence: Math.min(80, 45 + (Math.abs(contextScore) * 30)),
      method: 'context-based',
      socialContext: socialContext,
      temporalContext: temporalContext,
      environmentalContext: environmentalContext,
      alignmentScore: alignmentScore
    };
  }

  performFusion(results, text) {
    const fusedEmotions = {};
    let totalWeight = 0;

    // Combine results from all analyzers
    Object.entries(results).forEach(([method, result]) => {
      if (result && result.emotions) {
        const weight = this.algorithmWeights[method] || 0;
        
        Object.entries(result.emotions).forEach(([emotion, score]) => {
          fusedEmotions[emotion] = (fusedEmotions[emotion] || 0) + (score * weight);
        });
        
        totalWeight += weight;
      }
    });

    // Normalize by total weight
    if (totalWeight > 0) {
      Object.keys(fusedEmotions).forEach(emotion => {
        fusedEmotions[emotion] /= totalWeight;
      });
    }

    // Add fusion bonuses for consistent detection
    this.applyConsistencyBonus(fusedEmotions, results);

    return fusedEmotions;
  }

  applyFinalEnhancements(emotions, text, voiceFeatures) {
    const enhanced = { ...emotions };

    // Real-world nuance adjustments
    const textLength = text.split(/\s+/).length;
    
    // Short text adjustments
    if (textLength < 5) {
      Object.keys(enhanced).forEach(emotion => {
        enhanced[emotion] *= 0.8; // Reduce confidence for very short text
      });
    }
    
    // Long text adjustments
    if (textLength > 50) {
      Object.keys(enhanced).forEach(emotion => {
        enhanced[emotion] *= 1.1; // Increase confidence for longer, more detailed text
      });
    }

    // Voice-text coherence boost
    if (voiceFeatures) {
      const coherenceBoost = this.calculateCoherenceBoost(enhanced, voiceFeatures);
      Object.keys(enhanced).forEach(emotion => {
        enhanced[emotion] *= (1 + coherenceBoost);
      });
    }

    return enhanced;
  }

  finalizeAnalysis(emotions, results) {
    // Filter out low-confidence emotions
    const filtered = {};
    Object.entries(emotions).forEach(([emotion, score]) => {
      if (score > 8) { // 8% threshold
        filtered[emotion] = Math.max(8, score);
      }
    });

    // Ensure we have at least one emotion
    if (Object.keys(filtered).length === 0) {
      filtered.neutral = 100;
    }

    // Normalize to 100%
    const total = Object.values(filtered).reduce((sum, score) => sum + score, 0);
    const normalized = {};
    
    Object.entries(filtered).forEach(([emotion, score]) => {
      normalized[emotion] = Math.round((score / total) * 100);
    });

    // Calculate overall confidence
    const confidences = Object.values(results)
      .filter(r => r && r.confidence)
      .map(r => r.confidence);
    
    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length 
      : 70;

    return {
      emotions: normalized,
      confidence: Math.round(Math.min(95, avgConfidence + 10)), // Fusion bonus
      algorithmsCombined: Object.keys(results).filter(k => results[k]).length,
      enhancedAnalysis: true,
      fusionMethod: 'multi-algorithm-weighted',
      details: {
        bertUsed: !!results.bert,
        lexiconUsed: !!results.lexicon,
        patternUsed: !!results.pattern,
        contextUsed: !!results.context
      }
    };
  }

  // Helper methods for calculations
  calculateIntensityMultiplier(words) {
    let multiplier = 1.0;
    
    this.lexiconAnalyzers.intensifiers.extreme.forEach(intensifier => {
      if (words.includes(intensifier)) multiplier += 0.5;
    });
    
    this.lexiconAnalyzers.intensifiers.high.forEach(intensifier => {
      if (words.includes(intensifier)) multiplier += 0.3;
    });
    
    this.lexiconAnalyzers.intensifiers.low.forEach(intensifier => {
      if (words.includes(intensifier)) multiplier -= 0.2;
    });
    
    return Math.max(0.3, Math.min(2.0, multiplier));
  }

  calculateNegationEffect(words) {
    let negationStrength = 0;
    
    this.lexiconAnalyzers.negations.direct.forEach(negation => {
      if (words.includes(negation)) negationStrength += 0.8;
    });
    
    this.lexiconAnalyzers.negations.indirect.forEach(negation => {
      if (words.includes(negation)) negationStrength += 0.4;
    });
    
    return Math.min(1.0, negationStrength);
  }

  applyNegation(emotions, negationEffect) {
    // Flip positive emotions to negative counterparts
    const emotionFlips = {
      'joy': 'sadness',
      'happiness': 'sadness',
      'excitement': 'disappointment',
      'satisfaction': 'frustration',
      'confidence': 'doubt'
    };
    
    Object.keys(emotions).forEach(emotion => {
      if (emotionFlips[emotion]) {
        const flippedEmotion = emotionFlips[emotion];
        emotions[flippedEmotion] = (emotions[flippedEmotion] || 0) + 
          (emotions[emotion] * negationEffect * 0.7);
        emotions[emotion] *= (1 - negationEffect);
      }
    });
  }

  analyzeSyntacticPatterns(words) {
    let score = 0;
    
    // Check for conditional markers
    if (this.patternAnalyzers.syntacticPatterns.conditional.markers.some(marker => 
        words.includes(marker))) {
      score += this.patternAnalyzers.syntacticPatterns.conditional.emotionModifier;
    }
    
    // Check for comparative markers
    if (this.patternAnalyzers.syntacticPatterns.comparative.markers.some(marker => 
        words.includes(marker))) {
      score += this.patternAnalyzers.syntacticPatterns.comparative.emotionModifier;
    }
    
    return score;
  }

  analyzeSocialContext(words) {
    // Implementation for social context analysis
    return 0; // Placeholder
  }

  analyzeTemporalContext(words) {
    // Implementation for temporal context analysis
    return 0; // Placeholder
  }

  analyzeEnvironmentalContext(words) {
    // Implementation for environmental context analysis
    return 0; // Placeholder
  }

  analyzeVoiceTextAlignment(text, voiceFeatures) {
    // Implementation for voice-text alignment analysis
    return 0; // Placeholder
  }

  applyConsistencyBonus(emotions, results) {
    // Boost emotions detected by multiple algorithms
    Object.keys(emotions).forEach(emotion => {
      let detectionCount = 0;
      Object.values(results).forEach(result => {
        if (result && result.emotions && result.emotions[emotion]) {
          detectionCount++;
        }
      });
      
      if (detectionCount > 1) {
        emotions[emotion] *= (1 + (detectionCount - 1) * 0.1); // 10% bonus per additional detection
      }
    });
  }

  calculateCoherenceBoost(emotions, voiceFeatures) {
    // Implementation for voice-text coherence calculation
    return 0.05; // Placeholder 5% boost
  }

  getDefaultAnalysis() {
    return {
      emotions: { neutral: 100 },
      confidence: 60,
      algorithmsCombined: 0,
      enhancedAnalysis: false
    };
  }

  getFallbackAnalysis(text) {
    // Simple keyword-based fallback
    const words = text.toLowerCase().split(/\s+/);
    const emotions = { neutral: 70 };
    
    // Expanded basic emotion keywords for all major emotions
    const basicKeywords = {
      joy: ['happy', 'joy', 'great', 'amazing', 'wonderful', 'delighted', 'ecstatic'],
      sadness: ['sad', 'unhappy', 'terrible', 'awful', 'down', 'miserable', 'depressed'],
      anger: ['angry', 'mad', 'hate', 'annoyed', 'furious', 'irritated'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
      excitement: ['excited', 'enthusiastic'],
      confidence: ['confident', 'determined'],
      serenity: ['peaceful', 'calm', 'serene'],
      surprise: ['surprised', 'astonished', 'shocked'],
      gratitude: ['grateful', 'thankful'],
      nostalgia: ['nostalgic'],
      curiosity: ['curious'],
      frustration: ['frustrated', 'disappointed']
    };

    Object.entries(basicKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        emotions[emotion] = 30;
        emotions.neutral = Math.max(20, emotions.neutral - 30);
      }
    });

    return {
      emotions: emotions,
      confidence: 55,
      algorithmsCombined: 1,
      enhancedAnalysis: false,
      fallback: true
    };
  }
}

export default SentimentFusionEngine;
