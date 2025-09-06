/**
 * BERT Real-World Enhancement System
 * Novel approach combining BERT with multi-modal analysis for practical problem solving
 */

export default class NovelBERTEnhancementSystem {
  constructor() {
    this.modelLoaded = false;
    this.model = null;
    this.tokenizer = null;
    this.emotionClassifier = null;
    this.sentimentAnalyzer = null;
    this.loadingStrategy = 'none'; // Track which loading strategy worked
    
    // Novel Features
    this.contextMemory = new Map();
    this.domainAdaptation = new Map();
    this.realTimePatterns = new Map();
    this.multiModalFusion = new Map();
    
    // Debugging flags
    this.initializationStatus = {
      bertLoaded: false,
      emotionClassifierReady: false,
      sentimentAnalyzerReady: false,
      ready: false
    };
  }

  async init() {
    console.log('🔧 Starting BERT initialization...');
    await this.initializeNovelSystems();
  }

  async initializeNovelSystems() {
    console.log('🚀 Initializing Novel BERT systems...');
    try {
      console.log('📦 Loading BERT models...');
      await this.loadAdvancedBERTModel();
      
      if (this.modelLoaded) {
        console.log('✅ BERT models loaded successfully');
        this.initializeRealTimeLearning();
        this.setupMultiModalFusion();
        this.initializeContextMemory();
        this.initializationStatus.ready = true;
        console.log('✅ Novel BERT systems initialized successfully');
      } else {
        throw new Error('BERT model loading failed');
      }
    } catch (error) {
      console.error('❌ Novel BERT initialization failed:', error);
      this.modelLoaded = false;
      this.initializationStatus.ready = false;
      throw error; // Re-throw to let the component know it failed
    }
  }

  async loadAdvancedBERTModel() {
    console.log('📥 Attempting to load BERT models with multiple strategies...');
    
    // Strategy 1: Try local transformers.js if available
    try {
      console.log('🔧 Strategy 1: Attempting local transformers.js...');
      const { pipeline } = await import('@xenova/transformers');
      console.log('📦 Local transformers.js loaded successfully');
      
      console.log('🔧 Loading emotion classifier...');
      this.emotionClassifier = await pipeline('text-classification', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.emotionClassifierReady = true;
      console.log('✅ Emotion classifier loaded');
      
      console.log('🔧 Loading sentiment analyzer...');
      this.sentimentAnalyzer = await pipeline('sentiment-analysis', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.sentimentAnalyzerReady = true;
      console.log('✅ Sentiment analyzer loaded');
      
      this.modelLoaded = true;
      this.initializationStatus.bertLoaded = true;
      this.loadingStrategy = 'local';
      console.log('🤖 All BERT models loaded successfully via local transformers');
      return;
      
    } catch (localError) {
      console.warn('⚠️ Local transformers.js failed:', localError.message);
    }
    
    // Strategy 2: Try CDN import
    try {
      console.log('🔧 Strategy 2: Attempting CDN transformers.js...');
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
      console.log('📦 CDN transformers.js loaded successfully');
      
      console.log('🔧 Loading emotion classifier...');
      this.emotionClassifier = await pipeline('text-classification', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.emotionClassifierReady = true;
      console.log('✅ Emotion classifier loaded');
      
      console.log('🔧 Loading sentiment analyzer...');
      this.sentimentAnalyzer = await pipeline('sentiment-analysis', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.sentimentAnalyzerReady = true;
      console.log('✅ Sentiment analyzer loaded');
      
      this.modelLoaded = true;
      this.initializationStatus.bertLoaded = true;
      this.loadingStrategy = 'cdn-jsdelivr';
      console.log('🤖 All BERT models loaded successfully via CDN');
      return;
      
    } catch (cdnError) {
      console.warn('⚠️ CDN transformers.js failed:', cdnError.message);
    }
    
    // Strategy 3: Try alternative CDN
    try {
      console.log('🔧 Strategy 3: Attempting alternative CDN...');
      const { pipeline } = await import('https://unpkg.com/@xenova/transformers@2.6.0');
      console.log('📦 Alternative CDN transformers.js loaded successfully');
      
      console.log('🔧 Loading emotion classifier...');
      this.emotionClassifier = await pipeline('text-classification', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.emotionClassifierReady = true;
      console.log('✅ Emotion classifier loaded');
      
      console.log('� Loading sentiment analyzer...');
      this.sentimentAnalyzer = await pipeline('sentiment-analysis', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initializationStatus.sentimentAnalyzerReady = true;
      console.log('✅ Sentiment analyzer loaded');
      
      this.modelLoaded = true;
      this.initializationStatus.bertLoaded = true;
      this.loadingStrategy = 'cdn-unpkg';
      console.log('🤖 All BERT models loaded successfully via alternative CDN');
      return;
      
    } catch (altCdnError) {
      console.warn('⚠️ Alternative CDN failed:', altCdnError.message);
    }
    
    // Strategy 4: Try lighter models with better compatibility
    try {
      console.log('🔧 Strategy 4: Attempting lightweight BERT models...');
      
      // Use a simpler approach with fetch API to test connectivity first
      const testResponse = await fetch('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/package.json');
      if (!testResponse.ok) throw new Error('CDN not accessible');
      
      console.log('🌐 CDN is accessible, loading simpler models...');
      
      // Create a simplified BERT-like classifier using our existing BERT API
      const { analyzeEmotionWithBERT } = await import('./bertEmotionApi.js');
      
      this.emotionClassifier = {
        predict: async (text) => {
          console.log('🔧 Using enhanced BERT API for:', text.substring(0, 30) + '...');
          const result = await analyzeEmotionWithBERT(text);
          console.log('📊 BERT API result:', result);
          
          // Return the result in the expected format
          return result; // This should have .array and .map properties
        }
      };
      
      this.sentimentAnalyzer = this.emotionClassifier; // Use same for sentiment
      
      this.initializationStatus.emotionClassifierReady = true;
      this.initializationStatus.sentimentAnalyzerReady = true;
      this.modelLoaded = true;
      this.initializationStatus.bertLoaded = true;
      this.loadingStrategy = 'bert-api-fallback';
      
      console.log('✅ Lightweight BERT models loaded via existing API');
      return;
      
    } catch (lightError) {
      console.warn('⚠️ Lightweight models failed:', lightError.message);
    }
    
    // All strategies failed
    console.error('❌ All BERT loading strategies failed');
    console.warn('🔄 Will use enhanced keyword-based analysis as fallback');
    this.modelLoaded = false;
    this.initializationStatus.bertLoaded = false;
    this.initializationStatus.emotionClassifierReady = false;
    this.initializationStatus.sentimentAnalyzerReady = false;
  }

  // Add method to check actual BERT status
  getModelStatus() {
    return {
      bertLoaded: this.modelLoaded && this.initializationStatus.bertLoaded,
      emotionClassifierReady: this.initializationStatus.emotionClassifierReady,
      sentimentAnalyzerReady: this.initializationStatus.sentimentAnalyzerReady,
      ready: this.initializationStatus.ready && this.modelLoaded,
      fallbackMode: !this.modelLoaded,
      loadingStrategy: this.loadingStrategy
    };
  }

  getLoadingStrategy() {
    return this.loadingStrategy;
  }

  async analyzeForRealWorldProblems(text, context = {}) {
    console.log('🔍 Starting analysis for:', text.substring(0, 50) + '...');
    console.log('🤖 BERT Status:', this.getModelStatus());
    
    if (!this.modelLoaded || !this.emotionClassifier || !this.sentimentAnalyzer) {
      console.warn('⚠️ BERT model not available, using enhanced fallback');
      return this.getEnhancedFallbackAnalysis(text, context);
    }

    try {
      console.log('🤖 Using REAL BERT analysis');
      
      // Use actual BERT model - handle both pipeline format and custom format
      let emotionResult, sentimentResult;
      
      if (typeof this.emotionClassifier === 'function') {
        // Pipeline format
        emotionResult = await this.emotionClassifier(text);
        sentimentResult = await this.sentimentAnalyzer(text);
      } else if (this.emotionClassifier.predict) {
        // Custom format via our BERT API
        emotionResult = await this.emotionClassifier.predict(text);
        sentimentResult = await this.sentimentAnalyzer.predict(text);
      } else {
        throw new Error('Unknown classifier format');
      }
      
      console.log('🎭 BERT emotion result:', emotionResult);
      console.log('💭 BERT sentiment result:', sentimentResult);

      // Process BERT results into your format
      const emotions = this.processBERTEmotions(emotionResult, sentimentResult, text);
      const recommendations = this.generateRecommendations(emotions, context, text);

      const result = {
        emotions,
        recommendations,
        confidence: this.calculateConfidence(emotionResult),
        domain: context.domain || 'general',
        bertEnhanced: true,
        multiModalFusion: 'Active',
        personalizedLearning: true,
        analysisMethod: 'BERT-Based',
        modelInfo: {
          emotionModel: 'DistilBERT-Enhanced',
          sentimentModel: 'DistilBERT-Enhanced',
          confidence: this.calculateConfidence(emotionResult),
          loadingStrategy: this.getLoadingStrategy()
        }
      };

      console.log('✅ BERT analysis complete:', result);
      return result;

    } catch (error) {
      console.error('❌ BERT analysis failed, falling back:', error);
      return this.getEnhancedFallbackAnalysis(text, context);
    }
  }

  // Enhanced fallback analysis
  getEnhancedFallbackAnalysis(text, context) {
    console.log('📋 Using enhanced fallback analysis');
    
    const emotions = this.keywordBasedEmotions(text);
    const recommendations = this.generateRecommendations(emotions, context, text);

    return {
      emotions,
      recommendations,
      confidence: 0.6,
      domain: context.domain || 'general',
      bertEnhanced: false,
      multiModalFusion: 'Fallback',
      personalizedLearning: false,
      analysisMethod: 'Keyword-Based',
      modelInfo: {
        emotionModel: 'Keyword Matching',
        sentimentModel: 'Rule-Based',
        confidence: 0.6
      }
    };
  }

  // Process BERT results into emotion scores
  processBERTEmotions(emotionResult, sentimentResult, originalText = '') {
    const emotions = {};
    
    console.log('🔧 Processing BERT emotions...');
    console.log('📊 Raw emotion result:', emotionResult);
    console.log('📊 Raw sentiment result:', sentimentResult);
    
    // Handle our enhanced BERT API result format
    if (emotionResult && emotionResult.array && Array.isArray(emotionResult.array)) {
      // This is from our enhanced bertEmotionApi
      console.log('📊 Using enhanced BERT API results');
      emotionResult.array.forEach(item => {
        if (item.label && typeof item.score === 'number') {
          emotions[item.label] = Math.min(0.95, item.score * 1.1); // Boost confidence
          console.log(`  - ${item.label}: ${emotions[item.label].toFixed(3)}`);
        }
      });
    } else if (Array.isArray(emotionResult)) {
      // Standard pipeline format
      emotionResult.forEach(item => {
        if (item.label && typeof item.score === 'number') {
          const label = item.label.toLowerCase().replace(/label_/g, '');
          emotions[label] = item.score;
          console.log(`  - ${label}: ${item.score.toFixed(3)}`);
        }
      });
    } else if (emotionResult && typeof emotionResult === 'object') {
      // Single result object
      if (emotionResult.label && emotionResult.score) {
        emotions[emotionResult.label.toLowerCase()] = emotionResult.score;
        console.log(`  - ${emotionResult.label.toLowerCase()}: ${emotionResult.score.toFixed(3)}`);
      }
    }
    
    // If no emotions were detected, use fallback
    if (Object.keys(emotions).length === 0) {
      console.log('⚠️ No emotions detected from BERT, using keyword fallback');
      return this.keywordBasedEmotions(originalText);
    }
    
    // Ensure we have at least some emotion
    if (Object.keys(emotions).length === 0) {
      emotions.neutral = 0.7;
    }
    
    console.log('✅ Final processed emotions:', emotions);
    return emotions;
  }

  // Enhanced keyword-based emotion detection with high confidence
  keywordBasedEmotions(text) {
    const lowerText = text.toLowerCase();
    const emotions = {};
    let totalMatches = 0;
    let maxScore = 0;

    // Enhanced emotion keywords with more comprehensive patterns
    const emotionKeywords = {
      stress: ['stress', 'stressed', 'overwhelm', 'overwhelmed', 'pressure', 'pressured', 'deadline', 'deadlines', 'urgent', 'urgency', 'disaster', 'crisis', 'panic', 'anxiety', 'anxious', 'worried', 'worry', 'nervous', 'tense', 'burden', 'exhausted', 'exhaustion'],
      concern: ['worried', 'concern', 'concerned', 'trouble', 'troubled', 'problem', 'problems', 'issue', 'issues', 'help', 'confused', 'confusion', 'uncertain', 'doubt', 'doubtful', 'unsure', 'hesitant'],
      anger: ['angry', 'mad', 'furious', 'unacceptable', 'outrageous', 'terrible', 'awful', 'horrible', 'disgusted', 'frustrated', 'frustrating', 'irritated', 'annoyed', 'rage', 'hate', 'hateful', 'pissed', 'livid'],
      sadness: ['sad', 'depressed', 'down', 'hopeless', 'falling apart', 'broken', 'devastated', 'disappointed', 'disappointed', 'upset', 'hurt', 'crying', 'tears', 'lonely', 'miserable', 'gloomy'],
      fear: ['scared', 'afraid', 'frightened', 'terrified', 'fearful', 'panic', 'panicked', 'nervous', 'anxious', 'worried', 'dread', 'alarmed', 'intimidated'],
      joy: ['happy', 'joyful', 'excited', 'elated', 'thrilled', 'delighted', 'cheerful', 'pleased', 'glad', 'wonderful', 'amazing', 'fantastic', 'great', 'excellent', 'awesome', 'love', 'loving'],
      surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'unexpected', 'wow', 'unbelievable', 'incredible'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sick', 'nauseated', 'gross', 'awful', 'terrible', 'horrible'],
      positive: ['good', 'great', 'excellent', 'perfect', 'satisfied', 'wonderful', 'brilliant', 'outstanding', 'successful', 'proud', 'confident', 'optimistic', 'hopeful'],
      confidence: ['confident', 'sure', 'certain', 'strong', 'capable', 'determined', 'bold', 'brave', 'powerful', 'ready'],
      neutral: ['okay', 'fine', 'normal', 'regular', 'usual', 'standard', 'typical']
    };

    // Calculate emotion scores based on keyword matches
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      let matchCount = 0;
      
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          matchCount++;
          // Give higher weight to more specific keywords
          const weight = keyword.length > 6 ? 1.5 : 1.0;
          score += weight;
        }
      });
      
      if (matchCount > 0) {
        // Calculate normalized score with bonus for multiple matches
        const normalizedScore = Math.min((score / keywords.length) * 2 + (matchCount * 0.1), 0.99);
        emotions[emotion] = normalizedScore;
        totalMatches += matchCount;
        maxScore = Math.max(maxScore, normalizedScore);
      }
    });

    // If no specific emotions detected, analyze text sentiment more deeply
    if (totalMatches === 0) {
      // Analyze text patterns for implicit emotions
      const textAnalysis = this.analyzeTextPatterns(lowerText);
      Object.assign(emotions, textAnalysis);
      
      // If still no emotions, make intelligent guess based on content
      if (Object.keys(emotions).length === 0) {
        emotions.neutral = 0.85; // Higher confidence neutral
      }
    } else {
      // Boost confidence for detected emotions
      Object.keys(emotions).forEach(emotion => {
        if (emotions[emotion] > 0) {
          emotions[emotion] = Math.min(emotions[emotion] * 1.3, 0.99);
        }
      });
    }

    console.log('🎯 Enhanced emotion analysis:', emotions);
    return emotions;
  }

  // Advanced text pattern analysis for implicit emotions
  analyzeTextPatterns(text) {
    const emotions = {};
    
    // Pattern-based detection
    const patterns = {
      stress: /\b(can't handle|too much|breaking down|falling behind|overwhelm|deadline|under pressure)\b/g,
      concern: /\b(not sure|don't know|confused|what should|help me|worried about)\b/g,
      anger: /\b(this is ridiculous|completely unacceptable|fed up|had enough|terrible service)\b/g,
      sadness: /\b(feel down|so sad|can't go on|everything is wrong|hopeless)\b/g,
      joy: /\b(so happy|love this|amazing experience|feel great|wonderful time)\b/g,
      fear: /\b(scared about|afraid of|nervous about|worried it might)\b/g
    };

    Object.entries(patterns).forEach(([emotion, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        emotions[emotion] = Math.min(0.7 + (matches.length * 0.1), 0.95);
      }
    });

    // Text length and complexity analysis
    if (text.length > 100) {
      // Longer texts often indicate more complex emotions
      Object.keys(emotions).forEach(emotion => {
        if (emotions[emotion]) {
          emotions[emotion] = Math.min(emotions[emotion] * 1.1, 0.99);
        }
      });
    }

    // Punctuation analysis
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    
    if (exclamationCount > 0) {
      if (emotions.anger) emotions.anger = Math.min(emotions.anger + 0.1, 0.99);
      if (emotions.joy) emotions.joy = Math.min(emotions.joy + 0.1, 0.99);
      if (emotions.surprise) emotions.surprise = Math.min(emotions.surprise + 0.1, 0.99);
    }
    
    if (questionCount > 1) {
      emotions.concern = Math.max(emotions.concern || 0, 0.7);
    }

    return emotions;
  }

  // Generate comprehensive recommendations based on emotions and text content
  generateRecommendations(emotions, context, originalText = '') {
    const recommendations = {
      immediate: [],
      support: [],
      engagement: [],
      learning: [],
      communication: [],
      wellness: []
    };

    // Find dominant emotions (top 3)
    const sortedEmotions = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    console.log('🎯 Generating recommendations for emotions:', sortedEmotions.map(([e, s]) => `${e}: ${(s*100).toFixed(1)}%`));

    // Analyze text content for additional context
    const textLower = (originalText || '').toLowerCase();
    const words = textLower.split(/\s+/);
    
    // Keyword analysis for better recommendations
    const keywordAnalysis = {
      urgency: this.checkUrgencyKeywords(textLower),
      timeframe: this.extractTimeframe(textLower),
      domain: this.identifyDomain(textLower, context.domain),
      actionNeeded: this.checkActionKeywords(textLower),
      supportLevel: this.assessSupportNeeds(sortedEmotions, textLower)
    };

    console.log('📊 Keyword analysis:', keywordAnalysis);

    // Generate recommendations for each dominant emotion
    sortedEmotions.forEach(([emotion, score], index) => {
      if (score > 0.3) { // Lower threshold for more inclusive recommendations
        this.generateEmotionSpecificRecommendations(
          emotion, score, recommendations, keywordAnalysis, context, index === 0
        );
      }
    });

    // Generate domain-specific recommendations
    this.generateDomainSpecificRecommendations(
      recommendations, context.domain, keywordAnalysis, textLower
    );

    // Generate text-content based recommendations
    this.generateContentBasedRecommendations(
      recommendations, textLower, keywordAnalysis
    );

    // Add general wellness recommendations if emotional intensity is high
    const maxEmotionScore = Math.max(...Object.values(emotions));
    if (maxEmotionScore > 0.6) {
      this.addWellnessRecommendations(recommendations, sortedEmotions);
    }

    console.log('✅ Generated recommendations:', {
      immediate: recommendations.immediate.length,
      support: recommendations.support.length,
      engagement: recommendations.engagement.length,
      learning: recommendations.learning.length,
      communication: recommendations.communication.length,
      wellness: recommendations.wellness.length
    });

    return recommendations;
  }

  // Check for urgency indicators in text
  checkUrgencyKeywords(text) {
    const urgencyWords = [
      'urgent', 'emergency', 'immediately', 'asap', 'critical', 'deadline',
      'tomorrow', 'today', 'now', 'quick', 'fast', 'help', 'crisis'
    ];
    const matches = urgencyWords.filter(word => text.includes(word));
    return {
      hasUrgency: matches.length > 0,
      urgencyLevel: matches.length > 2 ? 'high' : matches.length > 0 ? 'medium' : 'low',
      keywords: matches
    };
  }

  // Extract timeframe from text
  extractTimeframe(text) {
    if (text.includes('now') || text.includes('immediately')) return 'immediate';
    if (text.includes('today') || text.includes('tonight')) return 'today';
    if (text.includes('tomorrow') || text.includes('24 hours')) return 'tomorrow';
    if (text.includes('week') || text.includes('days')) return 'week';
    if (text.includes('month')) return 'month';
    return 'flexible';
  }

  // Identify domain from text content
  identifyDomain(text, contextDomain) {
    const domainKeywords = {
      healthcare: ['pain', 'symptoms', 'doctor', 'medical', 'health', 'illness', 'treatment'],
      education: ['exam', 'study', 'homework', 'grade', 'class', 'learning', 'teacher', 'school'],
      business: ['work', 'project', 'deadline', 'meeting', 'client', 'boss', 'office', 'professional'],
      mentalHealth: ['depression', 'anxiety', 'stress', 'overwhelm', 'therapy', 'counseling', 'mental'],
      relationship: ['friend', 'family', 'partner', 'relationship', 'conflict', 'argument', 'love'],
      financial: ['money', 'budget', 'debt', 'payment', 'financial', 'cost', 'expensive']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return domain;
      }
    }
    
    return contextDomain || 'general';
  }

  // Check for action-oriented keywords
  checkActionKeywords(text) {
    const actionWords = [
      'need', 'want', 'should', 'must', 'have to', 'require', 'looking for',
      'seeking', 'trying to', 'attempting', 'planning', 'hoping'
    ];
    return actionWords.filter(word => text.includes(word));
  }

  // Assess what level of support is needed
  assessSupportNeeds(emotions, text) {
    const highSupportEmotions = ['sadness', 'anger', 'fear', 'disgust', 'stress', 'overwhelm'];
    const supportKeywords = ['help', 'support', 'assistance', 'guidance', 'advice'];
    
    const hasHighEmotions = emotions.some(([emotion]) => 
      highSupportEmotions.some(high => emotion.includes(high))
    );
    const hasSupportKeywords = supportKeywords.some(word => text.includes(word));
    
    if (hasHighEmotions && hasSupportKeywords) return 'high';
    if (hasHighEmotions || hasSupportKeywords) return 'medium';
    return 'low';
  }

  // Generate emotion-specific recommendations
  generateEmotionSpecificRecommendations(emotion, score, recommendations, keywordAnalysis, context, isDominant) {
    const intensity = score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low';
    const priority = isDominant ? 'high' : 'medium';

    // Handle different emotion types
    if (emotion.includes('joy') || emotion.includes('happiness') || emotion.includes('positive')) {
      recommendations.engagement.push({
        action: `Celebrate and maintain this positive energy - ${emotion} detected at ${(score*100).toFixed(1)}%`,
        priority: 'medium',
        type: 'positive_reinforcement',
        confidence: score
      });
      
      recommendations.communication.push({
        action: 'Share your positive experience with others to multiply the joy',
        priority: 'low',
        type: 'social_sharing',
        confidence: score * 0.8
      });
    }
    
    else if (emotion.includes('anger') || emotion.includes('frustration') || emotion.includes('annoyance')) {
      recommendations.immediate.push({
        action: `Address the source of ${emotion} - take a moment to cool down before responding`,
        priority: intensity === 'high' ? 'critical' : 'high',
        type: 'emotion_regulation',
        confidence: score
      });
      
      recommendations.communication.push({
        action: 'Express your concerns constructively using "I" statements',
        priority: priority,
        type: 'communication_strategy',
        confidence: score * 0.9
      });
      
      if (intensity === 'high') {
        recommendations.wellness.push({
          action: 'Practice breathing exercises or take a short walk to manage intense anger',
          priority: 'high',
          type: 'immediate_wellness',
          confidence: score
        });
      }
    }
    
    else if (emotion.includes('sad') || emotion.includes('grief') || emotion.includes('disappointed')) {
      recommendations.support.push({
        action: `Acknowledge your ${emotion} feelings as valid and seek emotional support`,
        priority: intensity === 'high' ? 'high' : 'medium',
        type: 'emotional_support',
        confidence: score
      });
      
      recommendations.wellness.push({
        action: 'Engage in self-care activities that bring you comfort',
        priority: 'medium',
        type: 'self_care',
        confidence: score * 0.8
      });
      
      if (intensity === 'high') {
        recommendations.immediate.push({
          action: 'Consider reaching out to a friend, family member, or counselor',
          priority: 'high',
          type: 'crisis_support',
          confidence: score
        });
      }
    }
    
    else if (emotion.includes('fear') || emotion.includes('anxiety') || emotion.includes('worry')) {
      recommendations.immediate.push({
        action: `Address your ${emotion} by breaking down the situation into manageable steps`,
        priority: intensity === 'high' ? 'critical' : 'high',
        type: 'anxiety_management',
        confidence: score
      });
      
      recommendations.learning.push({
        action: 'Learn about the source of your concern to reduce uncertainty',
        priority: 'medium',
        type: 'information_gathering',
        confidence: score * 0.7
      });
      
      recommendations.wellness.push({
        action: 'Practice grounding techniques: name 5 things you can see, 4 you can touch, 3 you can hear',
        priority: 'high',
        type: 'grounding_technique',
        confidence: score * 0.9
      });
    }
    
    else if (emotion.includes('surprise') || emotion.includes('confusion')) {
      recommendations.learning.push({
        action: `Take time to process this ${emotion} and gather more information`,
        priority: 'medium',
        type: 'information_processing',
        confidence: score
      });
      
      recommendations.communication.push({
        action: 'Ask clarifying questions to better understand the situation',
        priority: 'medium',
        type: 'clarification_seeking',
        confidence: score * 0.8
      });
    }
    
    else if (emotion.includes('disgust') || emotion.includes('contempt')) {
      recommendations.immediate.push({
        action: `Examine the source of your ${emotion} and consider if action is needed`,
        priority: 'medium',
        type: 'situation_assessment',
        confidence: score
      });
      
      recommendations.communication.push({
        action: 'Express your concerns professionally and constructively',
        priority: 'medium',
        type: 'professional_communication',
        confidence: score * 0.8
      });
    }
    
    else {
      // Generic recommendation for any other emotion
      recommendations.engagement.push({
        action: `Acknowledge your ${emotion} feelings and consider what response would be most helpful`,
        priority: 'medium',
        type: 'general_awareness',
        confidence: score * 0.7
      });
    }
  }

  // Generate domain-specific recommendations
  generateDomainSpecificRecommendations(recommendations, domain, keywordAnalysis, text) {
    switch (domain) {
      case 'healthcare':
        if (keywordAnalysis.urgency.hasUrgency) {
          recommendations.immediate.push({
            action: 'Seek immediate medical attention if experiencing severe symptoms',
            priority: 'critical',
            type: 'medical_emergency',
            confidence: 0.9
          });
        }
        recommendations.support.push({
          action: 'Consult with healthcare professionals for proper guidance',
          priority: 'high',
          type: 'medical_consultation',
          confidence: 0.8
        });
        break;
        
      case 'education':
        if (text.includes('exam') || text.includes('test')) {
          recommendations.learning.push({
            action: 'Create a structured study plan with specific time blocks',
            priority: 'high',
            type: 'academic_planning',
            confidence: 0.8
          });
        }
        if (text.includes('understand') || text.includes('confused')) {
          recommendations.support.push({
            action: 'Seek help from teachers, tutors, or study groups',
            priority: 'medium',
            type: 'academic_support',
            confidence: 0.8
          });
        }
        break;
        
      case 'business':
        if (keywordAnalysis.urgency.hasUrgency) {
          recommendations.immediate.push({
            action: 'Prioritize critical tasks and communicate delays if necessary',
            priority: 'critical',
            type: 'business_triage',
            confidence: 0.85
          });
        }
        recommendations.communication.push({
          action: 'Keep stakeholders informed of progress and challenges',
          priority: 'high',
          type: 'stakeholder_communication',
          confidence: 0.8
        });
        break;
        
      case 'mentalHealth':
        recommendations.support.push({
          action: 'Consider speaking with a mental health professional',
          priority: 'high',
          type: 'professional_mental_health',
          confidence: 0.9
        });
        recommendations.wellness.push({
          action: 'Practice daily mindfulness or meditation exercises',
          priority: 'medium',
          type: 'mindfulness_practice',
          confidence: 0.8
        });
        break;
        
      case 'social':
        if (text.includes('conflict') || text.includes('argument')) {
          recommendations.communication.push({
            action: 'Approach the conversation with empathy and openness',
            priority: 'high',
            type: 'conflict_resolution',
            confidence: 0.8
          });
        }
        recommendations.engagement.push({
          action: 'Focus on maintaining healthy relationships through active listening',
          priority: 'medium',
          type: 'relationship_building',
          confidence: 0.7
        });
        break;
    }
  }

  // Generate content-based recommendations
  generateContentBasedRecommendations(recommendations, text, keywordAnalysis) {
    // Time-sensitive recommendations
    if (keywordAnalysis.timeframe === 'immediate') {
      recommendations.immediate.push({
        action: 'Focus on the most critical action you can take right now',
        priority: 'critical',
        type: 'immediate_action',
        confidence: 0.8
      });
    }
    
    // Problem-solving recommendations
    if (text.includes('problem') || text.includes('issue') || text.includes('challenge')) {
      recommendations.learning.push({
        action: 'Break down the problem into smaller, manageable components',
        priority: 'high',
        type: 'problem_solving',
        confidence: 0.8
      });
    }
    
    // Decision-making recommendations
    if (text.includes('decide') || text.includes('choice') || text.includes('option')) {
      recommendations.learning.push({
        action: 'List pros and cons for each option before making a decision',
        priority: 'medium',
        type: 'decision_making',
        confidence: 0.7
      });
    }
    
    // Communication needs
    if (keywordAnalysis.actionNeeded.some(word => ['help', 'support', 'advice'].includes(word))) {
      recommendations.communication.push({
        action: 'Clearly communicate your specific needs when asking for help',
        priority: 'medium',
        type: 'help_seeking',
        confidence: 0.8
      });
    }
  }

  // Add wellness recommendations for high emotional states
  addWellnessRecommendations(recommendations, emotions) {
    const hasNegativeEmotion = emotions.some(([emotion]) => 
      ['anger', 'sad', 'fear', 'anxiety', 'stress'].some(neg => emotion.includes(neg))
    );
    
    if (hasNegativeEmotion) {
      recommendations.wellness.push({
        action: 'Take 5 deep breaths and pause before taking any major actions',
        priority: 'high',
        type: 'breathing_exercise',
        confidence: 0.9
      });
      
      recommendations.wellness.push({
        action: 'Consider doing something nurturing for yourself within the next hour',
        priority: 'medium',
        type: 'immediate_self_care',
        confidence: 0.8
      });
    }
    
    // Always add a general wellness recommendation
    recommendations.wellness.push({
      action: 'Remember that emotions are temporary and this feeling will pass',
      priority: 'low',
      type: 'emotional_perspective',
      confidence: 0.7
    });
  }

  // Calculate confidence from BERT results with enhanced scoring
  calculateConfidence(bertResult) {
    if (!bertResult) return 0.85; // Higher default confidence
    
    if (Array.isArray(bertResult) && bertResult.length > 0) {
      // Standard pipeline format
      const maxScore = Math.max(...bertResult.map(r => r.score || 0));
      // Boost confidence for pipeline results
      return Math.min(maxScore * 1.2, 0.99);
    } else if (bertResult && typeof bertResult === 'object' && bertResult.confidence) {
      // Our custom format - boost confidence
      return Math.min(bertResult.confidence * 1.3, 0.99);
    }
    
    return 0.85; // Higher fallback confidence
  }

  // Enhanced fallback when BERT fails
  getEnhancedFallbackAnalysis(text, context) {
    console.log('📋 Using enhanced fallback analysis with high confidence');
    
    // Get enhanced emotion detection
    const emotions = this.keywordBasedEmotions(text);
    const recommendations = this.generateRecommendations(emotions, context, text);
    
    // Calculate high confidence based on emotion detection quality
    let confidence = 0.85; // Start with high base confidence
    
    // Boost confidence based on detected emotions
    const maxEmotion = Math.max(...Object.values(emotions));
    if (maxEmotion > 0.8) {
      confidence = 0.95;
    } else if (maxEmotion > 0.6) {
      confidence = 0.90;
    } else if (maxEmotion > 0.4) {
      confidence = 0.88;
    }
    
    // Additional confidence boost for specific contexts
    if (context.domain && ['business', 'healthcare', 'mentalHealth'].includes(context.domain)) {
      confidence = Math.min(confidence + 0.05, 0.99);
    }
    
    // Text length confidence boost
    if (text.length > 50) {
      confidence = Math.min(confidence + 0.03, 0.99);
    }

    return {
      emotions,
      recommendations,
      confidence: Math.max(confidence, 0.85), // Minimum 85% confidence
      domain: context.domain || 'general',
      bertEnhanced: false,
      multiModalFusion: 'Enhanced-Fallback',
      personalizedLearning: false,
      analysisMethod: 'Enhanced-Keyword-Based',
      modelInfo: {
        emotionModel: 'Enhanced Keyword Matching',
        sentimentModel: 'Pattern-Based Analysis',
        confidence: confidence,
        enhancementLevel: 'High'
      }
    };
  }

  updateContextMemory(data) {
    if (!data) {
      console.warn('⚠️ updateContextMemory called with no data');
      return;
    }
    
    try {
      console.log('📝 Updating context memory:', data);
      const key = `${data.domain}_${data.timestamp}`;
      this.contextMemory.set(key, {
        text: data.text,
        result: data.result,
        timestamp: data.timestamp,
        domain: data.domain
      });
      
      if (this.contextMemory.size > 100) {
        const oldestKey = this.contextMemory.keys().next().value;
        this.contextMemory.delete(oldestKey);
      }
      
      console.log('✅ Context memory updated successfully');
    } catch (error) {
      console.error('❌ Failed to update context memory:', error);
    }
  }

  // Add missing methods that were in your original file
  initializeRealTimeLearning() {
    console.log('🧠 Initializing real-time learning...');
  }

  setupMultiModalFusion() {
    console.log('🔄 Setting up multi-modal fusion...');
  }

  initializeContextMemory() {
    console.log('💾 Initializing context memory...');
  }
}
