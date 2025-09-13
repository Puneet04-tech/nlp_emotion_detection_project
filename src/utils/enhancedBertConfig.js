// Enhanced BERT API Configuration
// Provides fallback mechanisms and multiple model endpoints

const BERT_CONFIG = {
  // Primary Hugging Face models (you'll need to add your API token)
  huggingFace: {
    apiToken: process.env.REACT_APP_HUGGINGFACE_TOKEN || '', // Add your token here
    models: {
      emotion: 'j-hartmann/emotion-english-distilroberta-base',
      sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      multiEmotion: 'SamLowe/roberta-base-go_emotions'
    },
    baseUrl: 'https://api-inference.huggingface.co/models/'
  },
  
  // Fallback to free APIs
  fallbackApis: [
    {
      name: 'TextRazor',
      url: 'https://api.textrazor.com/v1/entities/',
      key: process.env.REACT_APP_TEXTRAZOR_KEY || ''
    },
    {
      name: 'ParallelDots',
      url: 'https://apis.paralleldots.com/v4/emotion',
      key: process.env.REACT_APP_PARALLELDOTS_KEY || ''
    }
  ],
  
  // Local processing fallback
  localPatterns: {
    joy: ['happy', 'joyful', 'delighted', 'cheerful', 'elated', 'ecstatic', 'pleased', 'content'],
    sadness: ['sad', 'unhappy', 'depressed', 'miserable', 'downcast', 'melancholy', 'sorrowful'],
    anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'enraged', 'livid', 'outraged'],
    fear: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'frightened', 'panicked'],
    surprise: ['surprised', 'shocked', 'astonished', 'amazed', 'stunned', 'bewildered'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated'],
    trust: ['trust', 'confident', 'secure', 'assured', 'certain', 'believing'],
    anticipation: ['excited', 'eager', 'hopeful', 'expecting', 'looking forward']
  }
};

// Enhanced analyze function with multiple fallbacks
export async function analyzeEmotion(text) {
  if (!text || text.trim().length < 2) {
    return {
      emotions: { neutral: 1.0 },
      confidence: 0.5,
      method: 'default'
    };
  }

  console.log('🤖 Enhanced BERT Analysis Starting...');

  // Try Hugging Face API first
  try {
    const result = await tryHuggingFaceAPI(text);
    if (result) {
      console.log('✅ Hugging Face API successful');
      return result;
    }
  } catch (error) {
    console.warn('⚠️ Hugging Face API failed:', error.message);
  }

  // Try fallback APIs
  for (const api of BERT_CONFIG.fallbackApis) {
    try {
      const result = await tryFallbackAPI(text, api);
      if (result) {
        console.log(`✅ ${api.name} API successful`);
        return result;
      }
    } catch (error) {
      console.warn(`⚠️ ${api.name} API failed:`, error.message);
    }
  }

  // Use local pattern matching as final fallback
  console.log('📝 Using local pattern matching fallback');
  return performLocalAnalysis(text);
}

async function tryHuggingFaceAPI(text) {
  if (!BERT_CONFIG.huggingFace.apiToken) {
    throw new Error('No Hugging Face API token provided');
  }

  const response = await fetch(
    `${BERT_CONFIG.huggingFace.baseUrl}${BERT_CONFIG.huggingFace.models.emotion}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BERT_CONFIG.huggingFace.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const results = await response.json();
  
  if (Array.isArray(results) && results.length > 0) {
    const emotions = {};
    let totalScore = 0;

    results.forEach(result => {
      if (result.label && result.score) {
        const emotion = mapEmotionLabel(result.label.toLowerCase());
        emotions[emotion] = result.score;
        totalScore += result.score;
      }
    });

    // Normalize scores
    if (totalScore > 0) {
      Object.keys(emotions).forEach(emotion => {
        emotions[emotion] = emotions[emotion] / totalScore;
      });
    }

    return {
      emotions: emotions,
      confidence: Math.min(0.95, 0.7 + (totalScore * 0.25)),
      method: 'huggingface',
      model: BERT_CONFIG.huggingFace.models.emotion
    };
  }

  throw new Error('Invalid response format from Hugging Face API');
}

async function tryFallbackAPI(text, apiConfig) {
  // Implement specific fallback API calls here
  // This is a placeholder - you would implement actual API calls
  throw new Error(`${apiConfig.name} API not implemented yet`);
}

function performLocalAnalysis(text) {
  const words = text.toLowerCase().split(/\s+/);
  const emotions = {};
  let totalMatches = 0;

  // Count keyword matches for each emotion
  Object.entries(BERT_CONFIG.localPatterns).forEach(([emotion, keywords]) => {
    let matches = 0;
    
    words.forEach(word => {
      if (keywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
        matches++;
      }
    });

    if (matches > 0) {
      emotions[emotion] = matches;
      totalMatches += matches;
    }
  });

  // Add neutral if no strong emotions detected
  if (totalMatches === 0) {
    emotions.neutral = 1;
    totalMatches = 1;
  }

  // Normalize to probabilities
  Object.keys(emotions).forEach(emotion => {
    emotions[emotion] = emotions[emotion] / totalMatches;
  });

  // Apply text length and quality adjustments
  const lengthBonus = Math.min(0.2, text.length / 200);
  const confidence = Math.min(0.85, 0.5 + lengthBonus + (totalMatches * 0.1));

  return {
    emotions: emotions,
    confidence: confidence,
    method: 'local-pattern-matching',
    keywordMatches: totalMatches
  };
}

function mapEmotionLabel(label) {
  // Map various emotion labels to our standard set
  const mapping = {
    'joy': 'joy',
    'happiness': 'joy',
    'sadness': 'sadness',
    'anger': 'anger',
    'fear': 'fear',
    'surprise': 'surprise',
    'disgust': 'contempt',
    'trust': 'trust',
    'anticipation': 'anticipation',
    'positive': 'joy',
    'negative': 'sadness',
    'neutral': 'neutral',
    'admiration': 'gratitude',
    'amusement': 'amusement',
    'annoyance': 'frustration',
    'approval': 'satisfaction',
    'caring': 'compassion',
    'confusion': 'uncertainty',
    'curiosity': 'curiosity',
    'desire': 'longing',
    'disappointment': 'disappointment',
    'disapproval': 'disapproval',
    'embarrassment': 'embarrassment',
    'excitement': 'excitement',
    'gratitude': 'gratitude',
    'grief': 'grief',
    'love': 'affection',
    'nervousness': 'anxiety',
    'optimism': 'optimism',
    'pride': 'pride',
    'realization': 'realization',
    'relief': 'relief',
    'remorse': 'regret'
  };

  return mapping[label] || label;
}

export default BERT_CONFIG;
