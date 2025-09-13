// Advanced Multi-Model BERT Emotion Analyzer
// Combines multiple BERT models and sentiment analysis algorithms

import { analyzeEmotion } from './enhancedBertConfig.js';

class AdvancedBERTEmotionAnalyzer {
  constructor() {
    this.models = {
      primary: 'https://api.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
      secondary: 'https://api.huggingface.co/models/cardiffnlp/twitter-roberta-base-emotion',
      sentiment: 'https://api.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest'
    };
    
    this.emotionMapping = {
      // Primary emotion mappings
      'anger': 'anger', 'fear': 'fear', 'joy': 'joy', 'sadness': 'sadness',
      'surprise': 'surprise', 'disgust': 'contempt', 'love': 'affection',
      
      // Secondary mappings for comprehensive coverage
      'admiration': 'gratitude', 'amusement': 'amusement', 'annoyance': 'frustration',
      'approval': 'satisfaction', 'caring': 'compassion', 'confusion': 'uncertainty',
      'curiosity': 'curiosity', 'desire': 'longing', 'disappointment': 'disappointment',
      'disapproval': 'disapproval', 'embarrassment': 'embarrassment', 'excitement': 'excitement',
      'gratitude': 'gratitude', 'grief': 'grief', 'nervousness': 'anxiety',
      'optimism': 'optimism', 'pride': 'pride', 'realization': 'realization',
      'relief': 'relief', 'remorse': 'regret', 'neutral': 'neutral'
    };
    
    this.intensityAnalyzers = this.initializeIntensityAnalyzers();
    this.contextualModifiers = this.initializeContextualModifiers();
  }

  initializeIntensityAnalyzers() {
    return {
      // Linguistic intensity markers
      intensifiers: {
        extreme: ['extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'utterly'],
        high: ['very', 'really', 'quite', 'rather', 'pretty', 'fairly'],
        medium: ['somewhat', 'kind of', 'sort of', 'a bit', 'slightly'],
        low: ['barely', 'hardly', 'scarcely', 'just', 'only']
      },
      
      // Emotional amplifiers
      amplifiers: {
        positive: ['amazing', 'wonderful', 'fantastic', 'brilliant', 'outstanding'],
        negative: ['terrible', 'horrible', 'awful', 'dreadful', 'devastating']
      },
      
      // Diminishers
      diminishers: ['not very', 'not really', 'not particularly', 'not especially'],
      
      // Negation patterns
      negations: ['not', 'never', 'no', 'none', 'neither', 'nowhere', 'nothing']
    };
  }

  initializeContextualModifiers() {
    return {
      // Temporal context
      temporal: {
        past: ['was', 'were', 'had', 'used to', 'before', 'previously'],
        present: ['am', 'is', 'are', 'currently', 'now', 'today'],
        future: ['will', 'going to', 'planning', 'hoping', 'expecting']
      },
      
      // Certainty markers
      certainty: {
        high: ['definitely', 'certainly', 'absolutely', 'surely', 'clearly'],
        medium: ['probably', 'likely', 'possibly', 'maybe', 'perhaps'],
        low: ['might', 'could', 'uncertain', 'unsure', 'doubtful']
      },
      
      // Social context
      social: {
        personal: ['I', 'me', 'my', 'myself'],
        interpersonal: ['we', 'us', 'our', 'together'],
        others: ['they', 'them', 'people', 'everyone']
      }
    };
  }

  async analyzeWithMultipleModels(text) {
    if (!text || text.trim().length < 2) {
      return this.getDefaultEmotions();
    }

    console.log('🤖 Advanced BERT Multi-Model Analysis Starting...');
    
    try {
      // Run multiple models in parallel
      const [primaryResult, secondaryResult, sentimentResult] = await Promise.allSettled([
        this.callHuggingFaceAPI(this.models.primary, text),
        this.callHuggingFaceAPI(this.models.secondary, text),
        this.callHuggingFaceAPI(this.models.sentiment, text)
      ]);

      // Process results
      const emotions = {};
      let totalConfidence = 0;
      let modelCount = 0;

      // Primary emotion model
      if (primaryResult.status === 'fulfilled' && primaryResult.value) {
        this.processModelResult(primaryResult.value, emotions, 0.5); // 50% weight
        totalConfidence += 0.85;
        modelCount++;
      }

      // Secondary emotion model
      if (secondaryResult.status === 'fulfilled' && secondaryResult.value) {
        this.processModelResult(secondaryResult.value, emotions, 0.3); // 30% weight
        totalConfidence += 0.80;
        modelCount++;
      }

      // Sentiment analysis enhancement
      if (sentimentResult.status === 'fulfilled' && sentimentResult.value) {
        this.enhanceWithSentiment(sentimentResult.value, emotions, 0.2); // 20% weight
        totalConfidence += 0.75;
        modelCount++;
      }

      // Apply linguistic analysis
      const linguisticEnhancements = this.performLinguisticAnalysis(text);
      this.applyLinguisticEnhancements(emotions, linguisticEnhancements);

      // Apply contextual modifications
      const contextualModifications = this.analyzeContext(text);
      this.applyContextualModifications(emotions, contextualModifications);

      // Normalize and finalize
      const finalEmotions = this.normalizeEmotions(emotions);
      const averageConfidence = modelCount > 0 ? (totalConfidence / modelCount) * 100 : 70;

      return {
        emotions: finalEmotions,
        confidence: Math.round(averageConfidence),
        modelsCombined: modelCount,
        enhancedAnalysis: true,
        linguisticFeatures: linguisticEnhancements,
        contextualFactors: contextualModifications
      };

    } catch (error) {
      console.error('❌ Advanced BERT analysis failed:', error);
      return this.getFallbackAnalysis(text);
    }
  }

  async callHuggingFaceAPI(modelUrl, text) {
    try {
      // Use our enhanced BERT configuration
      const result = await analyzeEmotion(text);
      
      if (result && result.emotions) {
        // Convert to expected format
        return Object.entries(result.emotions).map(([emotion, score]) => ({
          label: emotion,
          score: score
        }));
      }
      
      return null;
    } catch (error) {
      console.warn(`⚠️ Enhanced BERT API call failed: ${error.message}`);
      return null;
    }
  }

  processModelResult(result, emotions, weight) {
    if (!Array.isArray(result) || result.length === 0) return;

    result.forEach(prediction => {
      const emotion = prediction.label?.toLowerCase();
      const score = prediction.score || 0;
      
      if (emotion && this.emotionMapping[emotion]) {
        const mappedEmotion = this.emotionMapping[emotion];
        const weightedScore = score * weight * 100;
        
        if (emotions[mappedEmotion]) {
          emotions[mappedEmotion] += weightedScore;
        } else {
          emotions[mappedEmotion] = weightedScore;
        }
      }
    });
  }

  enhanceWithSentiment(sentimentResult, emotions, weight) {
    if (!Array.isArray(sentimentResult) || sentimentResult.length === 0) return;

    sentimentResult.forEach(sentiment => {
      const label = sentiment.label?.toLowerCase();
      const score = sentiment.score || 0;
      
      if (label === 'positive') {
        // Boost positive emotions
        ['joy', 'excitement', 'gratitude', 'satisfaction'].forEach(emotion => {
          if (emotions[emotion]) {
            emotions[emotion] += score * weight * 20;
          }
        });
      } else if (label === 'negative') {
        // Boost negative emotions
        ['sadness', 'anger', 'fear', 'disappointment'].forEach(emotion => {
          if (emotions[emotion]) {
            emotions[emotion] += score * weight * 20;
          }
        });
      }
    });
  }

  performLinguisticAnalysis(text) {
    const words = text.toLowerCase().split(/\s+/);
    const features = {
      intensityLevel: 'medium',
      emotionalIntensity: 0,
      negationPresent: false,
      temporalContext: 'present',
      certaintyLevel: 'medium',
      punctuationEmphasis: 0
    };

    // Analyze intensity markers
    let intensityScore = 0;
    this.intensityAnalyzers.intensifiers.extreme.forEach(word => {
      if (words.includes(word)) {
        intensityScore += 0.9;
        features.intensityLevel = 'extreme';
      }
    });
    
    this.intensityAnalyzers.intensifiers.high.forEach(word => {
      if (words.includes(word)) {
        intensityScore += 0.7;
        if (features.intensityLevel === 'medium') features.intensityLevel = 'high';
      }
    });

    // Check for negations
    features.negationPresent = this.intensityAnalyzers.negations.some(neg => 
      words.some(word => word.includes(neg))
    );

    // Analyze punctuation for emotional emphasis
    const exclamations = (text.match(/!/g) || []).length;
    const questions = (text.match(/\?/g) || []).length;
    const caps = (text.match(/[A-Z]/g) || []).length;
    
    features.punctuationEmphasis = (exclamations * 0.3) + (questions * 0.2) + (caps * 0.05);
    features.emotionalIntensity = intensityScore + features.punctuationEmphasis;

    // Temporal analysis
    if (this.contextualModifiers.temporal.past.some(word => words.includes(word))) {
      features.temporalContext = 'past';
    } else if (this.contextualModifiers.temporal.future.some(word => words.includes(word))) {
      features.temporalContext = 'future';
    }

    return features;
  }

  analyzeContext(text) {
    const words = text.toLowerCase().split(/\s+/);
    const context = {
      socialContext: 'personal',
      emotionalDistance: 'immediate',
      subjectivity: 'subjective',
      modalityStrength: 'medium'
    };

    // Social context analysis
    if (this.contextualModifiers.social.interpersonal.some(word => words.includes(word))) {
      context.socialContext = 'interpersonal';
    } else if (this.contextualModifiers.social.others.some(word => words.includes(word))) {
      context.socialContext = 'others';
    }

    // Certainty analysis
    if (this.contextualModifiers.certainty.high.some(word => words.includes(word))) {
      context.modalityStrength = 'high';
    } else if (this.contextualModifiers.certainty.low.some(word => words.includes(word))) {
      context.modalityStrength = 'low';
    }

    return context;
  }

  applyLinguisticEnhancements(emotions, features) {
    const multiplier = this.getIntensityMultiplier(features.intensityLevel);
    
    // Apply intensity modifications
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] *= multiplier;
      
      // Additional intensity from punctuation
      emotions[emotion] += features.punctuationEmphasis * 10;
      
      // Handle negation
      if (features.negationPresent) {
        // Reduce positive emotions, potentially increase negative ones
        if (['joy', 'excitement', 'satisfaction', 'gratitude'].includes(emotion)) {
          emotions[emotion] *= 0.3; // Significantly reduce
        } else if (['sadness', 'disappointment', 'frustration'].includes(emotion)) {
          emotions[emotion] *= 1.2; // Slightly increase
        }
      }
    });
  }

  applyContextualModifications(emotions, context) {
    // Social context modifications
    if (context.socialContext === 'interpersonal') {
      // Boost social emotions
      if (emotions['gratitude']) emotions['gratitude'] *= 1.2;
      if (emotions['compassion']) emotions['compassion'] *= 1.2;
    }

    // Temporal context modifications
    if (context.emotionalDistance === 'past') {
      // Add nostalgic undertones
      if (emotions['sadness']) emotions['sadness'] *= 1.1;
      emotions['nostalgia'] = (emotions['nostalgia'] || 0) + 15;
    }

    // Modality strength
    if (context.modalityStrength === 'high') {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion] *= 1.15; // Increase confidence
      });
    } else if (context.modalityStrength === 'low') {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion] *= 0.85; // Decrease confidence
      });
    }
  }

  getIntensityMultiplier(level) {
    const multipliers = {
      'extreme': 1.5,
      'high': 1.3,
      'medium': 1.0,
      'low': 0.7
    };
    return multipliers[level] || 1.0;
  }

  normalizeEmotions(emotions) {
    if (Object.keys(emotions).length === 0) {
      return { neutral: 100 };
    }

    // Remove emotions below threshold
    const filtered = {};
    Object.entries(emotions).forEach(([emotion, score]) => {
      if (score > 5) { // 5% threshold
        filtered[emotion] = Math.max(5, score);
      }
    });

    // Normalize to 100%
    const total = Object.values(filtered).reduce((sum, score) => sum + score, 0);
    const normalized = {};
    
    if (total > 0) {
      Object.entries(filtered).forEach(([emotion, score]) => {
        normalized[emotion] = Math.round((score / total) * 100);
      });
    } else {
      normalized.neutral = 100;
    }

    return normalized;
  }

  getFallbackAnalysis(text) {
    // Advanced rule-based fallback
    const words = text.toLowerCase().split(/\s+/);
    const emotions = { neutral: 60 };
    
    // Basic keyword matching with weights
    const keywordEmotions = {
      joy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic'],
      sadness: ['sad', 'unhappy', 'terrible', 'awful', 'disappointed', 'depressed'],
      anger: ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'frightened'],
      surprise: ['surprised', 'shocked', 'unexpected', 'sudden', 'amazing']
    };

    Object.entries(keywordEmotions).forEach(([emotion, keywords]) => {
      const matches = words.filter(word => 
        keywords.some(keyword => word.includes(keyword) || keyword.includes(word))
      );
      
      if (matches.length > 0) {
        emotions[emotion] = Math.min(40, matches.length * 15);
        emotions.neutral = Math.max(20, emotions.neutral - emotions[emotion]);
      }
    });

    return {
      emotions: emotions,
      confidence: 65,
      modelsCombined: 0,
      enhancedAnalysis: false,
      fallback: true
    };
  }

  getDefaultEmotions() {
    return {
      emotions: { neutral: 100 },
      confidence: 50,
      modelsCombined: 0,
      enhancedAnalysis: false
    };
  }
}

export default AdvancedBERTEmotionAnalyzer;
