// Grammar Correction Utility
// Fixes common grammatical mistakes in transcripts

/**
 * Grammar correction patterns for common speech-to-text errors
 */
const grammarRules = {
  // Common article corrections
  articles: [
    { pattern: /\b(a)\s+(aeiou)/gi, replacement: 'an $2' },
    { pattern: /\b(an)\s+([bcdfghjklmnpqrstvwxyz])/gi, replacement: 'a $2' },
  ],
  
  // Subject-verb agreement
  subjectVerb: [
    { pattern: /\b(he|she|it)\s+(are)\b/gi, replacement: '$1 is' },
    { pattern: /\b(I)\s+(are)\b/gi, replacement: '$1 am' },
    { pattern: /\b(you|we|they)\s+(is)\b/gi, replacement: '$1 are' },
    { pattern: /\b(he|she|it)\s+(have)\b/gi, replacement: '$1 has' },
    { pattern: /\b(I|you|we|they)\s+(has)\b/gi, replacement: '$1 have' },
  ],
  
  // Common word corrections
  commonErrors: [
    { pattern: /\bthere\s+is\s+(multiple|many|several)/gi, replacement: 'there are $1' },
    { pattern: /\bit\s+don't\b/gi, replacement: 'it doesn\'t' },
    { pattern: /\bhe\s+don't\b/gi, replacement: 'he doesn\'t' },
    { pattern: /\bshe\s+don't\b/gi, replacement: 'she doesn\'t' },
    { pattern: /\bwould\s+of\b/gi, replacement: 'would have' },
    { pattern: /\bcould\s+of\b/gi, replacement: 'could have' },
    { pattern: /\bshould\s+of\b/gi, replacement: 'should have' },
  ],
  
  // Capitalization fixes
  capitalization: [
    { pattern: /^([a-z])/gm, replacement: (match, p1) => p1.toUpperCase() },
    { pattern: /\.\s+([a-z])/g, replacement: (match, p1) => '. ' + p1.toUpperCase() },
    { pattern: /\?\s+([a-z])/g, replacement: (match, p1) => '? ' + p1.toUpperCase() },
    { pattern: /\!\s+([a-z])/g, replacement: (match, p1) => '! ' + p1.toUpperCase() },
  ],
  
  // Punctuation fixes
  punctuation: [
    { pattern: /\s+([,.!?;:])/g, replacement: '$1' },
    { pattern: /([.!?])\s*([.!?])+/g, replacement: '$1' },
    { pattern: /\s+$/gm, replacement: '' }, // Remove trailing spaces
    { pattern: /^\s+/gm, replacement: '' }, // Remove leading spaces
    { pattern: /\n\s*\n/g, replacement: '\n' }, // Remove empty lines
  ],
  
  // Medical/Healthcare specific corrections (since your project seems health-focused)
  medical: [
    { pattern: /\bdoctor\s+are\b/gi, replacement: 'doctor is' },
    { pattern: /\bpatient\s+are\b/gi, replacement: 'patient is' },
    { pattern: /\bmedicine\s+are\b/gi, replacement: 'medicine is' },
    { pattern: /\btreatment\s+are\b/gi, replacement: 'treatment is' },
    { pattern: /\bdiagnosis\s+are\b/gi, replacement: 'diagnosis is' },
  ]
};

/**
 * Advanced grammar correction using multiple strategies
 */
export class GrammarCorrector {
  constructor() {
    this.corrections = [];
    this.confidenceThreshold = 0.7;
  }

  /**
   * Main grammar correction function
   */
  correctGrammar(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { correctedText: text, corrections: [], confidence: 0 };
    }

    const {
      includeCapitalization = true,
      includePunctuation = true,
      includeMedicalTerms = true,
      preserveOriginalSpacing = false
    } = options;

    let correctedText = text;
    const corrections = [];
    let totalCorrections = 0;

    try {
      // Step 1: Basic article corrections
      const articleResult = this.applyRules(correctedText, grammarRules.articles, 'Article');
      correctedText = articleResult.text;
      corrections.push(...articleResult.corrections);
      totalCorrections += articleResult.corrections.length;

      // Step 2: Subject-verb agreement
      const subjectVerbResult = this.applyRules(correctedText, grammarRules.subjectVerb, 'Subject-Verb Agreement');
      correctedText = subjectVerbResult.text;
      corrections.push(...subjectVerbResult.corrections);
      totalCorrections += subjectVerbResult.corrections.length;

      // Step 3: Common word errors
      const commonErrorsResult = this.applyRules(correctedText, grammarRules.commonErrors, 'Common Errors');
      correctedText = commonErrorsResult.text;
      corrections.push(...commonErrorsResult.corrections);
      totalCorrections += commonErrorsResult.corrections.length;

      // Step 4: Medical terminology (if enabled)
      if (includeMedicalTerms) {
        const medicalResult = this.applyRules(correctedText, grammarRules.medical, 'Medical Terms');
        correctedText = medicalResult.text;
        corrections.push(...medicalResult.corrections);
        totalCorrections += medicalResult.corrections.length;
      }

      // Step 5: Capitalization (if enabled)
      if (includeCapitalization) {
        const capitalizationResult = this.applyRules(correctedText, grammarRules.capitalization, 'Capitalization');
        correctedText = capitalizationResult.text;
        corrections.push(...capitalizationResult.corrections);
        totalCorrections += capitalizationResult.corrections.length;
      }

      // Step 6: Punctuation cleanup (if enabled)
      if (includePunctuation) {
        const punctuationResult = this.applyRules(correctedText, grammarRules.punctuation, 'Punctuation');
        correctedText = punctuationResult.text;
        corrections.push(...punctuationResult.corrections);
        totalCorrections += punctuationResult.corrections.length;
      }

      // Calculate confidence based on text length and corrections made
      const confidence = this.calculateConfidence(text, correctedText, totalCorrections);

      return {
        correctedText: correctedText.trim(),
        originalText: text,
        corrections,
        totalCorrections,
        confidence,
        summary: this.generateCorrectionSummary(corrections)
      };

    } catch (error) {
      console.error('Grammar correction error:', error);
      return {
        correctedText: text,
        originalText: text,
        corrections: [],
        totalCorrections: 0,
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Apply a set of grammar rules to text
   */
  applyRules(text, rules, category) {
    let correctedText = text;
    const corrections = [];

    rules.forEach((rule, index) => {
      const originalText = correctedText;
      
      if (typeof rule.replacement === 'function') {
        correctedText = correctedText.replace(rule.pattern, rule.replacement);
      } else {
        correctedText = correctedText.replace(rule.pattern, rule.replacement);
      }

      // Track what was corrected
      if (originalText !== correctedText) {
        corrections.push({
          category,
          ruleIndex: index,
          original: originalText,
          corrected: correctedText,
          pattern: rule.pattern.toString(),
          replacement: rule.replacement.toString()
        });
      }
    });

    return { text: correctedText, corrections };
  }

  /**
   * Calculate confidence score for grammar corrections
   */
  calculateConfidence(originalText, correctedText, totalCorrections) {
    if (!originalText || originalText === correctedText) {
      return 1.0; // Perfect confidence if no changes needed
    }

    const textLength = originalText.length;
    const correctionRatio = totalCorrections / Math.max(textLength / 100, 1); // Corrections per 100 characters
    
    // Lower correction ratio = higher confidence
    const confidence = Math.max(0.1, Math.min(1.0, 1.0 - (correctionRatio * 0.1)));
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate a summary of corrections made
   */
  generateCorrectionSummary(corrections) {
    const categories = {};
    
    corrections.forEach(correction => {
      if (!categories[correction.category]) {
        categories[correction.category] = 0;
      }
      categories[correction.category]++;
    });

    return {
      totalCorrections: corrections.length,
      categories,
      details: corrections.slice(0, 10) // Limit to first 10 for display
    };
  }

  /**
   * Quick grammar check - just returns if text needs correction
   */
  needsCorrection(text) {
    if (!text || typeof text !== 'string') return false;
    
    // Quick checks for obvious errors
    const hasCommonErrors = [
      /\b(he|she|it)\s+(are)\b/i,
      /\b(I)\s+(are)\b/i,
      /\bwould\s+of\b/i,
      /\bit\s+don't\b/i,
      /^[a-z]/, // Starts with lowercase
      /\s+[.!?]/ // Space before punctuation
    ].some(pattern => pattern.test(text));

    return hasCommonErrors;
  }
}

// Export functions for easy use
export const correctGrammar = (text, options = {}) => {
  const corrector = new GrammarCorrector();
  return corrector.correctGrammar(text, options);
};

export const needsGrammarCorrection = (text) => {
  const corrector = new GrammarCorrector();
  return corrector.needsCorrection(text);
};

// Export default instance
export default new GrammarCorrector();
