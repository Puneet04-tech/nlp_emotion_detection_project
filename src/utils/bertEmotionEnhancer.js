/**
 * BERT-Enhanced Emotion Detection System
 * Provides pre-trained BERT model integration for improved emotion classification
 */

class BERTEmotionEnhancer {
  constructor() {
    this.modelLoaded = false;
    this.model = null;
    this.tokenizer = null;
    this.emotionLabels = [
      'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral',
      'enthusiasm', 'confidence', 'concern', 'frustration', 'sarcasm',
      'excitement', 'happiness', 'anxiety', 'contempt', 'pride', 'shame'
    ];
    
    // Enhanced emotion mappings based on BERT fine-tuning
    this.bertEmotionMappings = {
      'LABEL_0': 'sadness',
      'LABEL_1': 'joy', 
      'LABEL_2': 'love',
      'LABEL_3': 'anger',
      'LABEL_4': 'fear',
      'LABEL_5': 'surprise',
      'LABEL_6': 'neutral',
      'LABEL_7': 'disgust',
      'LABEL_8': 'enthusiasm',
      'LABEL_9': 'confidence',
      'LABEL_10': 'concern',
      'LABEL_11': 'frustration',
      'LABEL_12': 'sarcasm',
      'LABEL_13': 'excitement',
      'LABEL_14': 'happiness',
      'LABEL_15': 'anxiety',
      'LABEL_16': 'contempt',
      'LABEL_17': 'pride'
    };

    // Emotion intensity patterns for BERT enhancement
    this.emotionIntensityPatterns = {
      high_intensity: [
        'absolutely', 'completely', 'totally', 'extremely', 'incredibly', 
        'tremendously', 'enormously', 'exceptionally', 'remarkably', 'utterly',
        'devastating', 'overwhelming', 'fantastic', 'amazing', 'terrible',
        'brilliant', 'awful', 'wonderful', 'horrible', 'magnificent'
      ],
      medium_intensity: [
        'very', 'quite', 'rather', 'fairly', 'pretty', 'somewhat', 'moderately',
        'considerably', 'significantly', 'notably', 'reasonably', 'substantially'
      ],
      low_intensity: [
        'slightly', 'a bit', 'a little', 'mildly', 'somewhat', 'barely',
        'hardly', 'scarcely', 'just', 'almost', 'nearly'
      ]
    };

    // Contextual emotion enhancers
    this.contextualEnhancers = {
      sarcasm_indicators: [
        'oh great', 'wonderful', 'perfect', 'just fantastic', 'obviously',
        'clearly', 'sure', 'right', 'of course', 'definitely'
      ],
      enthusiasm_boosters: [
        'can\'t wait', 'so excited', 'thrilled', 'pumped', 'buzzing',
        'incredible', 'amazing', 'breakthrough', 'fantastic news'
      ],
      confidence_markers: [
        'certain', 'sure', 'confident', 'positive', 'convinced',
        'guaranteed', 'definitely will', 'no doubt', 'absolutely'
      ],
      concern_signals: [
        'worried', 'concerned', 'anxious', 'nervous', 'uneasy',
        'troubled', 'apprehensive', 'fearful', 'not sure'
      ]
    };

    this.initializeBERT();
  }

  /**
   * Initialize BERT model using Hugging Face Transformers.js
   */
  async initializeBERT() {
    try {
      console.log('🤖 Initializing BERT Emotion Enhancement...');
      
      // Use Transformers.js for client-side BERT inference
      if (typeof window !== 'undefined') {
        try {
          // Load transformers library dynamically
          const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
          
          // Configure for local inference
          env.allowRemoteModels = true;
          env.allowLocalModels = false;
          
          console.log('📦 Loading BERT emotion classification model...');
          
          // Try to use emotion-specific model first, fallback to sentiment
          try {
            this.emotionClassifier = await pipeline(
              'text-classification',
              'j-hartmann/emotion-english-distilroberta-base'
            );
            console.log('✅ Emotion-specific BERT model loaded successfully');
          } catch (emotionModelError) {
            console.warn('⚠️ Emotion model failed, using sentiment model:', emotionModelError);
            this.emotionClassifier = await pipeline(
              'text-classification',
              'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
            );
            console.log('✅ Sentiment BERT model loaded successfully');
          }
          
          this.modelLoaded = true;
          return true;
          
        } catch (importError) {
          console.warn('⚠️ Failed to import transformers library:', importError);
          throw importError;
        }
      } else {
        console.log('🖥️ Not in browser environment, skipping BERT initialization');
        this.modelLoaded = false;
        return false;
      }
    } catch (error) {
      console.warn('⚠️ BERT model loading failed, using enhanced fallback methods:', error);
      this.modelLoaded = false;
      return false;
    }
  }

  /**
   * Real-time speech emotion analysis for live transcription
   * Optimized for speech-to-text scenarios with immediate feedback
   */
  async analyzeSpeechEmotionRealTime(transcriptText, isPartial = false) {
    if (!transcriptText || transcriptText.trim().length === 0) {
      return this.getDefaultEmotionResult('neutral', 0.1, 'No text provided');
    }

    try {
      console.log('🎤 Real-time BERT speech analysis:', transcriptText);
      
      // For partial transcripts, use faster analysis
      if (isPartial && transcriptText.length < 10) {
        return this.getQuickEmotionPreview(transcriptText);
      }
      
      // Full BERT analysis for complete sentences
      const bertResult = await this.analyzeEmotionWithBERT(transcriptText);
      
      // Add speech-specific enhancements
      const speechEnhanced = this.enhanceForSpeechContext(bertResult, transcriptText);
      
      console.log('📊 Real-time speech emotion result:', speechEnhanced);
      return speechEnhanced;
      
    } catch (error) {
      console.error('❌ Real-time speech analysis failed:', error);
      return this.getFallbackSpeechAnalysis(transcriptText);
    }
  }

  /**
   * Quick emotion preview for partial transcripts
   */
  getQuickEmotionPreview(partialText) {
    const words = partialText.toLowerCase().split(' ');
    const positiveWords = ['good', 'great', 'love', 'happy', 'amazing', 'wonderful', 'excellent'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'horrible', 'worst'];
    const sarcasticWords = ['oh', 'great', 'fantastic', 'perfect', 'wonderful'];
    
    let emotion = 'neutral';
    let confidence = 0.3;
    
    if (words.some(word => positiveWords.includes(word))) {
      emotion = 'happiness';
      confidence = 0.6;
    } else if (words.some(word => negativeWords.includes(word))) {
      emotion = 'frustration';
      confidence = 0.6;
    } else if (words.length >= 2 && sarcasticWords.includes(words[0])) {
      emotion = 'sarcasm';
      confidence = 0.4;
    }
    
    return {
      primaryEmotion: emotion,
      confidence: confidence,
      emotions: { [emotion]: confidence, neutral: 1 - confidence },
      analysis: 'Quick preview (partial transcript)',
      isPartial: true,
      bertEnhanced: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enhance BERT results specifically for speech context
   */
  enhanceForSpeechContext(bertResult, speechText) {
    // Speech-specific adjustments
    const enhanced = { ...bertResult };
    
    // Boost confidence for clear speech patterns
    if (this.hasClearSpeechPatterns(speechText)) {
      enhanced.confidence = Math.min(enhanced.confidence * 1.2, 0.95);
    }
    
    // Adjust for common speech vs text differences
    enhanced.speechOptimized = true;
    enhanced.originalText = speechText;
    enhanced.analysisType = 'speech-to-text';
    
    return enhanced;
  }

  /**
   * Check for clear speech emotion patterns
   */
  hasClearSpeechPatterns(text) {
    const clearPatterns = [
      /^(oh\s+)?(wow|great|amazing|terrible|awful)\s+/i,
      /\b(absolutely|completely|totally)\s+\w+/i,
      /\b(I\s+(love|hate|really)\s+)/i,
      /\b(this\s+is\s+(great|awful|amazing|terrible))/i
    ];
    
    return clearPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Fallback analysis for speech when BERT fails
   */
  getFallbackSpeechAnalysis(speechText) {
    // Enhanced rule-based analysis for speech
    const analysis = this.getFallbackAnalysis(speechText);
    
    return {
      ...analysis,
      analysisType: 'speech-fallback',
      speechOptimized: true,
      fallbackReason: 'BERT unavailable - using enhanced speech rules'
    };
  }

  /**
   * Enhanced emotion analysis using BERT + traditional methods
   */
  async analyzeEmotionWithBERT(text, acousticFeatures = null) {
    if (!text || typeof text !== 'string') {
      return this.getFallbackAnalysis(text, acousticFeatures);
    }

    try {
      let bertAnalysis = null;
      
      if (this.modelLoaded && this.emotionClassifier) {
        // Get BERT predictions
        console.log('🧠 Running BERT emotion analysis...');
        const bertResults = await this.emotionClassifier(text);
        bertAnalysis = this.processBERTResults(bertResults);
      }

      // Enhanced rule-based analysis
      const enhancedAnalysis = this.getEnhancedRuleBasedAnalysis(text);
      
      // Acoustic features integration (if available)
      const acousticAnalysis = acousticFeatures ? 
        this.integrateAcousticFeatures(acousticFeatures) : null;

      // Fusion of all analysis methods
      const finalAnalysis = this.fuseAnalysisMethods(
        bertAnalysis, 
        enhancedAnalysis, 
        acousticAnalysis
      );

      console.log('🎯 BERT-Enhanced Analysis Complete:', finalAnalysis);
      return finalAnalysis;

    } catch (error) {
      console.warn('⚠️ BERT analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(text, acousticFeatures);
    }
  }

  /**
   * Process BERT model results
   */
  processBERTResults(bertResults) {
    if (!bertResults || !Array.isArray(bertResults)) {
      return null;
    }

    const emotions = {};
    let totalScore = 0;

    bertResults.forEach(result => {
      const emotion = this.mapBERTLabel(result.label);
      const score = result.score;
      
      if (emotion && score > 0.1) { // Filter low confidence
        emotions[emotion] = score;
        totalScore += score;
      }
    });

    // Normalize scores
    if (totalScore > 0) {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion] = emotions[emotion] / totalScore;
      });
    }

    return {
      source: 'BERT',
      emotions: emotions,
      confidence: Object.values(emotions).length > 0 ? Math.max(...Object.values(emotions).filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v))) : 0,
      method: 'transformer_neural_network'
    };
  }

  /**
   * Map BERT labels to our emotion system
   */
  mapBERTLabel(label) {
    // Map common BERT sentiment labels to our emotions
    const mappings = {
      'POSITIVE': 'joy',
      'NEGATIVE': 'sadness',
      'NEUTRAL': 'neutral',
      'LABEL_0': 'sadness',
      'LABEL_1': 'joy',
      'LABEL_2': 'anger',
      'LABEL_3': 'fear',
      'LABEL_4': 'surprise',
      'LABEL_5': 'disgust'
    };
    
    return mappings[label] || label.toLowerCase();
  }

  /**
   * Enhanced rule-based analysis with BERT insights
   */
  getEnhancedRuleBasedAnalysis(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    
    const analysis = {
      emotions: {},
      features: {
        intensity: this.calculateIntensity(lowerText),
        context: this.analyzeContext(lowerText),
        sentiment_flow: this.analyzeSentimentFlow(sentences),
        linguistic_patterns: this.analyzeLinguisticPatterns(words)
      }
    };

    // Enhanced emotion detection with context
    analysis.emotions = this.detectEmotionsWithContext(lowerText, analysis.features);
    
    return {
      source: 'Enhanced_Rules',
      emotions: analysis.emotions,
      features: analysis.features,
      confidence: this.calculateRuleConfidence(analysis),
      method: 'contextual_rule_based'
    };
  }

  /**
   * Calculate emotion intensity based on language patterns
   */
  calculateIntensity(text) {
    let intensity = 0;
    let intensityLevel = 'medium';
    
    // Check for high intensity markers
    this.emotionIntensityPatterns.high_intensity.forEach(marker => {
      if (text.includes(marker)) {
        intensity += 0.8;
      }
    });
    
    // Check for medium intensity markers
    this.emotionIntensityPatterns.medium_intensity.forEach(marker => {
      if (text.includes(marker)) {
        intensity += 0.5;
      }
    });
    
    // Check for low intensity markers
    this.emotionIntensityPatterns.low_intensity.forEach(marker => {
      if (text.includes(marker)) {
        intensity += 0.2;
      }
    });
    
    // Capitalization and punctuation intensity
    const caps = (text.match(/[A-Z]/g) || []).length;
    const exclamations = (text.match(/!/g) || []).length;
    
    intensity += caps * 0.1 + exclamations * 0.3;
    
    if (intensity > 1.0) intensityLevel = 'high';
    else if (intensity < 0.3) intensityLevel = 'low';
    
    return { score: Math.min(intensity, 2.0), level: intensityLevel };
  }

  /**
   * Analyze contextual emotion indicators
   */
  analyzeContext(text) {
    const context = {
      sarcasm: 0,
      enthusiasm: 0,
      confidence: 0,
      concern: 0
    };
    
    // Sarcasm detection
    this.contextualEnhancers.sarcasm_indicators.forEach(indicator => {
      if (text.includes(indicator)) {
        context.sarcasm += 0.3;
      }
    });
    
    // Enthusiasm detection
    this.contextualEnhancers.enthusiasm_boosters.forEach(booster => {
      if (text.includes(booster)) {
        context.enthusiasm += 0.4;
      }
    });
    
    // Confidence detection
    this.contextualEnhancers.confidence_markers.forEach(marker => {
      if (text.includes(marker)) {
        context.confidence += 0.3;
      }
    });
    
    // Concern detection
    this.contextualEnhancers.concern_signals.forEach(signal => {
      if (text.includes(signal)) {
        context.concern += 0.3;
      }
    });
    
    return context;
  }

  /**
   * Analyze sentiment flow across sentences
   */
  analyzeSentimentFlow(sentences) {
    const flow = sentences.map(sentence => {
      return this.getBasicSentiment(sentence.trim());
    });
    
    return {
      pattern: flow,
      consistency: this.calculateConsistency(flow),
      transitions: this.analyzeTransitions(flow)
    };
  }

  /**
   * Analyze linguistic patterns
   */
  analyzeLinguisticPatterns(words) {
    return {
      word_count: words.length,
      avg_word_length: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      question_marks: (words.join(' ').match(/\?/g) || []).length,
      exclamations: (words.join(' ').match(/!/g) || []).length,
      repetitions: this.findRepetitions(words)
    };
  }

  /**
   * Detect emotions with enhanced context awareness
   */
  detectEmotionsWithContext(text, features) {
    const emotions = {};
    
    // Enhanced emotion keywords with more comprehensive coverage
    const emotionKeywords = {
      joy: ['happy', 'joy', 'great', 'wonderful', 'fantastic', 'amazing', 'excellent', 'brilliant', 'delighted', 'pleased', 'thrilled', 'excited', 'cheerful', 'glad', 'joyful', 'elated', 'euphoric'],
      sadness: ['sad', 'down', 'depressed', 'disappointed', 'heartbroken', 'sorrowful', 'melancholy', 'gloomy', 'miserable', 'upset', 'blue', 'dejected', 'despondent'],
      anger: ['angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'outraged', 'livid', 'enraged', 'pissed', 'frustrated', 'irate', 'heated', 'boiling'],
      fear: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'frightened', 'fearful', 'panicked', 'alarmed', 'concerned', 'apprehensive'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'astounded', 'startled', 'flabbergasted', 'dumbfounded'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'horrified', 'nauseated', 'repelled', 'grossed'],
      enthusiasm: ['excited', 'enthusiastic', 'eager', 'thrilled', 'pumped', 'energetic', 'passionate', 'motivated', 'inspired', 'fired up'],
      confidence: ['confident', 'sure', 'certain', 'positive', 'assured', 'convinced', 'determined', 'bold', 'self-assured', 'definite'],
      concern: ['concerned', 'worried', 'troubled', 'uneasy', 'apprehensive', 'anxious', 'bothered', 'disturbed'],
      sarcasm: ['obviously', 'clearly', 'sure', 'right', 'perfect', 'wonderful', 'great', 'fantastic'] // Context-dependent
    };
    
    // Intensity words that boost emotion scores
    const intensityWords = ['very', 'really', 'extremely', 'absolutely', 'completely', 'totally', 'incredibly', 'amazingly', 'tremendously', 'utterly', 'quite', 'rather', 'pretty', 'fairly'];
    
    // Check for intensity modifiers
    let intensityMultiplier = 1.0;
    intensityWords.forEach(word => {
      if (text.includes(word)) {
        intensityMultiplier += 0.3;
      }
    });
    intensityMultiplier = Math.min(intensityMultiplier, 2.0);
    
    // Score emotions based on keywords and context
    Object.keys(emotionKeywords).forEach(emotion => {
      let score = 0;
      let keywordMatches = 0;
      
      emotionKeywords[emotion].forEach(keyword => {
        if (text.includes(keyword)) {
          score += 0.4;
          keywordMatches++;
        }
        
        // Check for partial matches (for compound words)
        if (text.includes(keyword.substring(0, Math.max(4, keyword.length - 2)))) {
          score += 0.2;
        }
      });
      
      // Apply context modifiers
      if (emotion === 'sarcasm' && features.context.sarcasm > 0.5) {
        score += features.context.sarcasm * 0.6;
      }
      
      if (emotion === 'enthusiasm' && features.context.enthusiasm > 0.3) {
        score += features.context.enthusiasm * 0.5;
      }
      
      if (emotion === 'confidence' && features.context.confidence > 0.3) {
        score += features.context.confidence * 0.5;
      }
      
      if (emotion === 'concern' && features.context.concern > 0.3) {
        score += features.context.concern * 0.5;
      }
      
      // Apply intensity modifiers
      score *= intensityMultiplier;
      
      // Boost score for multiple keyword matches
      if (keywordMatches > 1) {
        score *= 1.2;
      }
      
      // Apply intensity feature boost
      score *= (1 + features.intensity.score * 0.4);
      
      // Lower threshold for emotion detection and ensure at least some emotions are detected
      if (score > 0.05) {
        emotions[emotion] = Math.min(score, 1.0);
      }
    });
    
    // If no emotions detected, add basic sentiment-based emotions
    if (Object.keys(emotions).length === 0) {
      console.log('🔄 No keyword-based emotions found, applying basic sentiment analysis');
      
      // Basic positive/negative sentiment detection
      const positiveWords = ['good', 'nice', 'love', 'like', 'enjoy', 'appreciate', 'fine', 'okay', 'yes'];
      const negativeWords = ['bad', 'hate', 'dislike', 'terrible', 'awful', 'no', 'never', 'not'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
      
      if (positiveCount > negativeCount) {
        emotions.joy = 0.3 + (positiveCount * 0.1);
      } else if (negativeCount > positiveCount) {
        emotions.sadness = 0.3 + (negativeCount * 0.1);
      } else {
        emotions.neutral = 0.5;
      }
    }
    
    return emotions;
  }

  /**
   * Fuse multiple analysis methods
   */
  fuseAnalysisMethods(bertAnalysis, ruleAnalysis, acousticAnalysis) {
    const fusedEmotions = {};
    let weights = {
      bert: 0.6,  // Higher weight for BERT if available
      rules: 0.4,
      acoustic: 0.3
    };
    
    // Adjust weights based on availability
    if (!bertAnalysis) {
      weights.rules = 0.7;
      weights.acoustic = 0.3;
    }
    
    if (!acousticAnalysis) {
      weights.bert = bertAnalysis ? 0.7 : 0;
      weights.rules = bertAnalysis ? 0.3 : 1.0;
    }
    
    // Combine emotion scores
    const allEmotions = new Set();
    
    if (bertAnalysis?.emotions) {
      Object.keys(bertAnalysis.emotions).forEach(emotion => allEmotions.add(emotion));
    }
    
    if (ruleAnalysis?.emotions) {
      Object.keys(ruleAnalysis.emotions).forEach(emotion => allEmotions.add(emotion));
    }
    
    if (acousticAnalysis?.emotions) {
      Object.keys(acousticAnalysis.emotions).forEach(emotion => allEmotions.add(emotion));
    }
    
    allEmotions.forEach(emotion => {
      let score = 0;
      let totalWeight = 0;
      
      if (bertAnalysis?.emotions?.[emotion]) {
        score += bertAnalysis.emotions[emotion] * weights.bert;
        totalWeight += weights.bert;
      }
      
      if (ruleAnalysis?.emotions?.[emotion]) {
        score += ruleAnalysis.emotions[emotion] * weights.rules;
        totalWeight += weights.rules;
      }
      
      if (acousticAnalysis?.emotions?.[emotion]) {
        score += acousticAnalysis.emotions[emotion] * weights.acoustic;
        totalWeight += weights.acoustic;
      }
      
      if (totalWeight > 0) {
        fusedEmotions[emotion] = score / totalWeight;
      }
    });
    
    // Calculate overall confidence
    const bertConfidence = bertAnalysis?.confidence || 0;
    const ruleConfidence = ruleAnalysis?.confidence || 0;
    const acousticConfidence = acousticAnalysis?.confidence || 0;
    
    const overallConfidence = (
      bertConfidence * weights.bert + 
      ruleConfidence * weights.rules + 
      acousticConfidence * weights.acoustic
    ) / (weights.bert + weights.rules + weights.acoustic);
    
    return {
      emotions: fusedEmotions,
      confidence: overallConfidence,
      methods_used: {
        bert: !!bertAnalysis,
        rules: !!ruleAnalysis,
        acoustic: !!acousticAnalysis
      },
      analysis_details: {
        bert: bertAnalysis,
        rules: ruleAnalysis,
        acoustic: acousticAnalysis
      },
      fusion_weights: weights
    };
  }

  /**
   * Integrate acoustic features for voice emotion analysis
   */
  integrateAcousticFeatures(acousticFeatures) {
    const emotions = {};
    
    // Map acoustic features to emotions based on research
    const { pitch, volume, spectralCentroid, zeroCrossingRate } = acousticFeatures;
    
    // Joy/Happiness: Higher pitch, higher volume, bright timbre
    if (pitch?.mean > 200 && volume > 0.6 && spectralCentroid > 1500) {
      emotions.joy = 0.7;
      emotions.happiness = 0.6;
    }
    
    // Sadness: Lower pitch, lower volume, darker timbre
    if (pitch?.mean < 150 && volume < 0.4 && spectralCentroid < 1200) {
      emotions.sadness = 0.8;
    }
    
    // Anger: Higher pitch variation, higher volume, harsh timbre
    if (pitch?.variation > 0.3 && volume > 0.7 && zeroCrossingRate > 0.1) {
      emotions.anger = 0.7;
    }
    
    // Fear/Anxiety: Higher pitch, trembling (high variation)
    if (pitch?.mean > 220 && pitch?.variation > 0.4) {
      emotions.fear = 0.6;
      emotions.anxiety = 0.5;
    }
    
    return {
      source: 'Acoustic',
      emotions: emotions,
      confidence: Math.max(...Object.values(emotions)) || 0,
      method: 'acoustic_feature_analysis'
    };
  }

  /**
   * Fallback analysis when BERT is unavailable
   */
  getFallbackAnalysis(text, acousticFeatures) {
    console.log('🔄 Using fallback emotion analysis');
    
    const ruleAnalysis = this.getEnhancedRuleBasedAnalysis(text || '');
    const acousticAnalysis = acousticFeatures ? 
      this.integrateAcousticFeatures(acousticFeatures) : null;
    
    return this.fuseAnalysisMethods(null, ruleAnalysis, acousticAnalysis);
  }

  /**
   * Helper methods
   */
  getBasicSentiment(sentence) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy', 'positive','cheerful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'disappointed'];
    
    const words = sentence.toLowerCase().split(/\s+/);
    let positive = 0, negative = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positive++;
      if (negativeWords.includes(word)) negative++;
    });
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  calculateConsistency(flow) {
    if (flow.length < 2) return 1;
    
    let consistent = 0;
    for (let i = 1; i < flow.length; i++) {
      if (flow[i] === flow[i-1]) consistent++;
    }
    
    return consistent / (flow.length - 1);
  }

  analyzeTransitions(flow) {
    const transitions = [];
    for (let i = 1; i < flow.length; i++) {
      if (flow[i] !== flow[i-1]) {
        transitions.push(`${flow[i-1]} -> ${flow[i]}`);
      }
    }
    return transitions;
  }

  findRepetitions(words) {
    const counts = {};
    words.forEach(word => {
      counts[word] = (counts[word] || 0) + 1;
    });
    
    return Object.keys(counts).filter(word => counts[word] > 1).length;
  }

  calculateRuleConfidence(analysis) {
    const emotionCount = Object.keys(analysis.emotions || {}).length;
    const emotionValues = Object.values(analysis.emotions || {}).filter(val => 
      typeof val === 'number' && !isNaN(val) && isFinite(val)
    );
    const maxScore = emotionValues.length > 0 ? Math.max(...emotionValues) : 0;
    const intensityBonus = (analysis.features?.intensity?.score || 0) * 0.2;
    
    return Math.min((maxScore + intensityBonus) * (emotionCount > 0 ? 1 : 0.5), 1.0);
  }

  /**
   * Get model status
   */
  getModelStatus() {
    return {
      bertLoaded: this.modelLoaded,
      ready: this.modelLoaded || true, // Always ready with fallback
      version: '2.0.0-BERT-Enhanced'
    };
  }
}

export default BERTEmotionEnhancer;
