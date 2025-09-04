// BERT Emotion API integration utility
// This module provides a function to call a BERT-based emotion analysis API
// You can replace the endpoint with your own BERT server or use HuggingFace Inference API

/*
  analyzeEmotionWithBERT
  - Tries to call a configured HuggingFace-compatible inference endpoint (if API key/endpoint provided
    via environment or localStorage) to get multi-label emotion scores.
  - On failure or when not configured, falls back to a lightweight lexical scorer (regex-based)
  - Normalizes and maps labels to the app's canonical emotion set: { joy, sadness, anger, fear, surprise, neutral, frustration, sarcasm }
  - Returns an array of { label, score } sorted by score desc and also a map by label for quick lookup.

  Note: Replace HF_ENDPOINT and HF_API_KEY with your private settings or set localStorage keys:
    localStorage.setItem('hf_endpoint', '<url>')
    localStorage.setItem('hf_api_key', '<key>')
*/

const DEFAULT_CANDIDATES = ['anger','joy','sadness','fear','surprise','neutral','frustration','sarcasm','excitement','boredom'];

const LABEL_MAP = {
  anger: 'anger',
  angry: 'anger',
  joy: 'joy',
  happy: 'joy',
  excitement: 'joy',
  sadness: 'sadness',
  sad: 'sadness',
  fear: 'fear',
  scared: 'fear',
  surprise: 'surprise',
  neutral: 'neutral',
  frustration: 'frustration',
  frustrated: 'frustration',
  sarcasm: 'sarcasm',
  boredom: 'neutral'
};

function normalizeScoresToMap(rawArray) {
  const map = {};
  if (!Array.isArray(rawArray)) return { map, array: [] };
  // rawArray expected [{label,score}, ...] or HF format
  rawArray.forEach(item => {
    const label = (item.label || '').toLowerCase();
    const score = Number(item.score ?? item.value ?? 0) || 0;
    const mapped = LABEL_MAP[label] || null;
    if (mapped) {
      map[mapped] = Math.max(map[mapped] || 0, score);
    }
  });
  // normalize to 0..1 (divide by sum if sum>0)
  const sum = Object.values(map).reduce((s,v)=>s+v,0);
  if (sum > 0) {
    Object.keys(map).forEach(k => map[k] = Math.min(1, map[k] / sum));
  }
  const array = Object.entries(map).map(([label, score]) => ({ label, score }));
  array.sort((a,b) => b.score - a.score);
  return { map, array };
}

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

export async function analyzeEmotionWithBERT(text, options = {}) {
  // quick sanitize
  if (!text || !text.trim()) return { array: [{ label: 'neutral', score: 0.6 }], map: { neutral: 0.6 } };

  // Only use localStorage and options for endpoint/apiKey (process.env is not available in browser)
  const endpoint = options.endpoint || localStorage.getItem('hf_endpoint') || null;
  const apiKey = options.apiKey || localStorage.getItem('hf_api_key') || null;
  const candidates = options.candidates || DEFAULT_CANDIDATES;

  // Try calling remote HF-like endpoint if configured
  if (endpoint && apiKey) {
    try {
      const payload = { inputs: text, parameters: { candidate_labels: candidates, multi_label: true } };
      const resp = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (resp.ok) {
        const json = await resp.json();
        // Accept several HF response shapes
        if (Array.isArray(json) && json.length && json[0].label && json[0].score !== undefined) {
          // e.g., [{label,score},...]
          return normalizeScoresToMap(json);
        }
        if (json.labels && json.scores) {
          const arr = json.labels.map((l,i) => ({ label: l, score: json.scores[i] || 0 }));
          return normalizeScoresToMap(arr);
        }
        // Some inference endpoints return array of objects of label/score
        if (Array.isArray(json)) return normalizeScoresToMap(json);
        // otherwise fall through to lexical fallback
      }
    } catch (err) {
      console.warn('BERT API call failed, falling back to lexical analyzer', err);
    }
  }

  // Fallback: lexical analyzer
  return lexicalFallback(text);
}
