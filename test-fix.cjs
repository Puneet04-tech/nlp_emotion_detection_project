// Direct test of lexical fallback function
const fs = require('fs');
const path = require('path');

// Directly implement the fixed lexical fallback for testing
function lexicalFallback(text) {
  const t = (text || '').toLowerCase();
  const scores = {};
  const inc = (k, v=1) => scores[k] = Math.min(1, (scores[k]||0) + v);

  // Enhanced emotion patterns with more comprehensive detection
  const patterns = {
    joy: /(happy|joy|excited|amazing|wonderful|love|great|awesome|yay|hooray|fantastic|brilliant|excellent|perfect|thrilled|delighted|cheerful|pleased|glad|elated|celebrate|celebration)/g,
    sadness: /(sad|depressed|unhappy|miserable|sobbing|tears|down|heartbroken|lonely|devastated|disappointed|hurt|crying|gloomy|hopeless|broken|grief|sorrow)/g,
    anger: /(angry|mad|furious|hate|stupid|idiot|damn|fuck|shit|pissed|rage|irritated|annoyed|frustrated|outrageous|unacceptable|terrible|awful|furious|livid)/g,
    fear: /(scared|afraid|terrified|panic|anxious|worried|creepy|nervous|frightened|alarmed|dread|intimidated|fearful|petrified)/g,
    surprise: /(surprised|shocked|wow|oh my|unbelievable|whoa|amazed|astonished|stunned|incredible|unexpected|startling)/g,
    stress: /(stress|stressed|overwhelm|overwhelmed|pressure|deadline|urgent|crisis|panic|anxiety|burden|exhausted|tense|overworked)/g,
    concern: /(concerned|worried|trouble|problem|issue|confused|uncertain|doubt|help|support|bothered|uneasy)/g,
    disgust: /(disgusted|revolted|sick|gross|awful|horrible|terrible|nauseated|repulsed|vile|disgusting)/g,
    // Reduce neutral pattern to avoid false positives
    neutral: /(^okay$|^fine$|^normal$|^alright$|^hello$|^yes$|^no$)/g,
    confidence: /(confident|sure|certain|strong|capable|determined|bold|ready|powerful|successful|assured|positive)/g
  };

  let totalMatches = 0;
  let hasSpecificEmotion = false;
  
  Object.entries(patterns).forEach(([k, rx]) => {
    const m = t.match(rx) || [];
    if (m.length) {
      // Enhanced scoring with higher base values
      const baseScore = Math.min(0.90, 0.4 + (0.2 * m.length));
      inc(k, baseScore);
      totalMatches += m.length;
      
      // Track if we found specific emotions (not neutral)
      if (k !== 'neutral') {
        hasSpecificEmotion = true;
      }
    }
  });

  // Only add neutral if NO specific emotions were detected
  if (!hasSpecificEmotion && totalMatches === 0 && text.trim().length > 0) {
    scores.neutral = 0.70; // Lower confidence for true neutral
  }

  // Remove neutral if specific emotions were found
  if (hasSpecificEmotion && scores.neutral) {
    delete scores.neutral;
  }

  // Intensifiers with stronger effect (only boost non-neutral emotions)
  const intens = t.match(/(very|extremely|really|so|completely|absolutely|totally|fucking|damn|quite|pretty|super|ultra)/g) || [];
  if (intens.length) {
    Object.keys(scores).forEach(k => {
      if (k !== 'neutral') {
        scores[k] = Math.min(0.99, scores[k] + 0.15 * intens.length);
      }
    });
  }

  // Text length bonus for more detailed expressions
  if (text.length > 50) {
    Object.keys(scores).forEach(k => {
      if (k !== 'neutral') {
        scores[k] = Math.min(0.99, scores[k] + 0.08);
      }
    });
  }

  // Multiple emotion detection bonus
  if (Object.keys(scores).length > 1) {
    Object.keys(scores).forEach(k => {
      if (k !== 'neutral') {
        scores[k] = Math.min(0.99, scores[k] + 0.05);
      }
    });
  }

  // Enhanced normalization that preserves specific emotions over neutral
  const sum = Object.values(scores).reduce((s,v)=>s+v,0);
  if (sum > 0 && hasSpecificEmotion) {
    // For specific emotions, use minimal normalization to preserve high confidence
    const maxScore = Math.max(...Object.values(scores));
    Object.keys(scores).forEach(k => {
      // Boost non-neutral emotions
      if (k !== 'neutral') {
        scores[k] = Math.min(0.95, scores[k] * 1.2);
      }
      // Reduce neutral if it somehow got through
      if (k === 'neutral') {
        scores[k] = Math.max(0.1, scores[k] * 0.3);
      }
    });
  } else if (sum > 0) {
    // Only normalize if we have neutral-only content
    Object.keys(scores).forEach(k => scores[k] = Math.min(0.80, scores[k] / sum));
  }

  const arr = Object.entries(scores).map(([label, score]) => ({ label, score }));
  arr.sort((a,b) => b.score - a.score);
  
  console.log('🎯 Enhanced lexical analysis result:', { 
    text: text.substring(0, 50) + '...', 
    hasSpecificEmotion, 
    totalMatches, 
    scores, 
    topEmotion: arr[0] 
  });
  return { map: scores, array: arr };
}

console.log('🧪 Testing Fixed Emotion Detection\n');

const tests = [
  "I am so happy and excited!",
  "This makes me really angry and frustrated", 
  "I feel very sad and heartbroken",
  "I'm scared and worried about this",
  "Wow that's amazing and surprising!",
  "Hello there",
  "Yes, I understand"
];

tests.forEach(text => {
  console.log(`📝 Testing: "${text}"`);
  const result = lexicalFallback(text);
  const top = result.array[0];
  console.log(`✅ Result: ${top?.label} (${(top?.score * 100).toFixed(1)}%)`);
  console.log('---');
});
