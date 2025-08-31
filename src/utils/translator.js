// Language Translation Utility
// This module provides translation capabilities for transcripts

// Simple language detection based on character patterns and common words
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  
  const cleanText = text.toLowerCase().trim();
  
  // Language detection patterns
  const languagePatterns = {
    'es': {
      words: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'está', 'como', 'pero', 'muy', 'todo', 'más', 'hacer', 'tiempo', 'año', 'también'],
      chars: /[ñáéíóúü]/g,
      score: 0
    },
    'fr': {
      words: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'avoir'],
      chars: /[àâäéèêëïîôöùûüÿç]/g,
      score: 0
    },
    'de': {
      words: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach'],
      chars: /[äöüß]/g,
      score: 0
    },
    'it': {
      words: ['il', 'di', 'che', 'e', 'la', 'un', 'a', 'in', 'per', 'una', 'è', 'da', 'sono', 'con', 'non', 'si', 'le', 'i', 'su', 'come', 'del', 'alla', 'nel', 'anche', 'più', 'della', 'molto', 'tutto', 'essere', 'fare'],
      chars: /[àèéìíîòóù]/g,
      score: 0
    },
    'pt': {
      words: ['o', 'de', 'e', 'do', 'a', 'em', 'para', 'é', 'com', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser'],
      chars: /[àáâãéêíóôõú]/g,
      score: 0
    },
    'hi': {
      words: ['और', 'की', 'के', 'में', 'है', 'को', 'से', 'पर', 'एक', 'इस', 'का', 'यह', 'होता', 'करने', 'लिए', 'साथ', 'होने', 'तक', 'बात', 'समय'],
      chars: /[\u0900-\u097F]/g,
      score: 0
    },
    'zh': {
      words: ['的', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '个', '又', '上', '也', '很', '到', '说', '要', '去'],
      chars: /[\u4e00-\u9fff]/g,
      score: 0
    },
    'ja': {
      words: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として'],
      chars: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g,
      score: 0
    },
    'ar': {
      words: ['في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'لقد', 'قد', 'عند', 'غير', 'بعد', 'قبل', 'حول', 'خلال', 'بين', 'عبر', 'ضد'],
      chars: /[\u0600-\u06ff]/g,
      score: 0
    }
  };

  // Calculate scores for each language
  const words = cleanText.split(/\s+/);
  const totalWords = words.length;

  Object.keys(languagePatterns).forEach(lang => {
    const pattern = languagePatterns[lang];
    
    // Check for characteristic words
    let wordMatches = 0;
    words.forEach(word => {
      if (pattern.words.includes(word)) {
        wordMatches++;
      }
    });
    
    // Check for characteristic characters
    const charMatches = (cleanText.match(pattern.chars) || []).length;
    
    // Calculate score (word matches weighted more heavily)
    pattern.score = (wordMatches / totalWords) * 0.7 + (charMatches / cleanText.length) * 0.3;
  });

  // Find the language with highest score
  let detectedLang = 'en';
  let maxScore = 0.1; // Minimum threshold
  
  Object.keys(languagePatterns).forEach(lang => {
    if (languagePatterns[lang].score > maxScore) {
      maxScore = languagePatterns[lang].score;
      detectedLang = lang;
    }
  });

  return detectedLang;
};

// Translate text to English using a simple API-free approach
export const translateToEnglish = async (text, sourceLang = 'auto') => {
  if (!text || typeof text !== 'string') {
    return { translatedText: text, detectedLanguage: 'en', confidence: 0 };
  }

  // If already English, return as-is
  if (sourceLang === 'en') {
    return { translatedText: text, detectedLanguage: 'en', confidence: 1.0 };
  }

  // Detect source language if not provided
  if (sourceLang === 'auto') {
    sourceLang = detectLanguage(text);
  }

  // If detected as English, return as-is
  if (sourceLang === 'en') {
    return { translatedText: text, detectedLanguage: 'en', confidence: 1.0 };
  }

  try {
    // Use Google Translate API (free tier) - in production, you'd want to use a proper API key
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    const data = await response.json();
    
    if (data && data[0] && Array.isArray(data[0])) {
      const translatedText = data[0].map(item => item[0]).join('');
      const confidence = data[6] || 0.8; // Confidence score if available
      
      return {
        translatedText: translatedText.trim(),
        detectedLanguage: sourceLang,
        confidence: Math.min(confidence, 1.0),
        originalText: text
      };
    }
    
    throw new Error('Invalid translation response');
    
  } catch (error) {
    console.warn('Translation failed, using fallback:', error.message);
    
    // Fallback: Simple dictionary-based translation for common phrases
    const fallbackTranslation = fallbackTranslate(text, sourceLang);
    
    return {
      translatedText: fallbackTranslation,
      detectedLanguage: sourceLang,
      confidence: 0.3,
      originalText: text,
      fallback: true
    };
  }
};

// Fallback translation using basic dictionary
const fallbackTranslate = (text, sourceLang) => {
  const dictionaries = {
    'es': {
      'hola': 'hello',
      'gracias': 'thank you',
      'por favor': 'please',
      'sí': 'yes',
      'no': 'no',
      'buenos días': 'good morning',
      'buenas tardes': 'good afternoon',
      'buenas noches': 'good night',
      'adiós': 'goodbye',
      'lo siento': 'sorry',
      'disculpe': 'excuse me',
      'tiempo': 'time',
      'trabajo': 'work',
      'casa': 'house',
      'familia': 'family',
      'amigo': 'friend'
    },
    'fr': {
      'bonjour': 'hello',
      'merci': 'thank you',
      's\'il vous plaît': 'please',
      'oui': 'yes',
      'non': 'no',
      'au revoir': 'goodbye',
      'excusez-moi': 'excuse me',
      'temps': 'time',
      'travail': 'work',
      'maison': 'house',
      'famille': 'family',
      'ami': 'friend'
    },
    'de': {
      'hallo': 'hello',
      'danke': 'thank you',
      'bitte': 'please',
      'ja': 'yes',
      'nein': 'no',
      'auf wiedersehen': 'goodbye',
      'entschuldigung': 'excuse me',
      'zeit': 'time',
      'arbeit': 'work',
      'haus': 'house',
      'familie': 'family',
      'freund': 'friend'
    },
    'it': {
      'ciao': 'hello',
      'grazie': 'thank you',
      'per favore': 'please',
      'sì': 'yes',
      'no': 'no',
      'arrivederci': 'goodbye',
      'scusi': 'excuse me',
      'tempo': 'time',
      'lavoro': 'work',
      'casa': 'house',
      'famiglia': 'family',
      'amico': 'friend'
    }
  };

  const dictionary = dictionaries[sourceLang] || {};
  let translatedText = text.toLowerCase();

  // Replace known phrases
  Object.keys(dictionary).forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    translatedText = translatedText.replace(regex, dictionary[phrase]);
  });

  return translatedText;
};

// Get language name from code
export const getLanguageName = (code) => {
  const languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'hi': 'Hindi',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ar': 'Arabic',
    'ko': 'Korean',
    'ru': 'Russian',
    'auto': 'Auto-detect'
  };
  
  return languageNames[code] || code.toUpperCase();
};

// Validate if translation is needed
export const needsTranslation = (text, threshold = 0.15) => {
  const detectedLang = detectLanguage(text);
  return detectedLang !== 'en';
};
