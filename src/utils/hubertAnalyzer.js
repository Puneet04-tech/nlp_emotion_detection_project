// Lightweight Hubert analyzer wrapper (frontend-friendly fallback)
// This file provides a small interface compatible with other analyzers used in the project.
// It intentionally avoids bundling large ML models and instead provides a safe, consistent
// interface that uses heuristics or available browser globals. If you want a true Hubert
// model, replace the internals of `init`/`analyzeAudio` to load/execute your model.

export default class HubertAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.ready = false;
    this.name = 'HubertAnalyzer';
  }

  async init() {
    // Placeholder init: if a real model is attached to window.__HUBERT_MODEL__ you could
    // bind to it here. For now we mark ready so the system uses the analyzer API but
    // gracefully falls back to heuristics when no heavy model is present.
    try {
      if (typeof window !== 'undefined' && window.__HUBERT_MODEL__) {
        this.model = window.__HUBERT_MODEL__;
        this.ready = true;
        console.debug('🔧 HubertModel bound from window.__HUBERT_MODEL__');
      } else {
        this.ready = true; // still mark ready - this module will run a heuristic fallback
      }
    } catch (e) {
      console.warn('HubertAnalyzer init failed, using fallback heuristics', e);
      this.ready = true;
    }
  }

  // analyzeAudio accepts a File-like object or an object with `text`/`transcript` and
  // returns { emotions: {...}, confidence: number }
  async analyzeAudio(fileOrObj) {
    // If a real model is present, call into it (not implemented here).
    if (this.model && typeof this.model.analyze === 'function') {
      try {
        const r = await this.model.analyze(fileOrObj);
        return { emotions: r.emotions || {}, confidence: r.confidence || 50 };
      } catch (e) {
        console.warn('Hubert model analyze failed, falling back to heuristic', e);
      }
    }

    // Heuristic fallback: derive scores from transcript text keywords or file name
    const transcript = (fileOrObj && (fileOrObj.transcript || fileOrObj.text || '')) || '';
    const text = String(transcript).toLowerCase();
    const base = {
      joy: 0, sadness: 0, anger: 0, excitement: 0, fear: 0, surprise: 0, neutral: 50
    };

    const keywordMap = {
      joy: ['happy','wonderful','pleased','great','joy','bliss','euphoria','delighted'],
      sadness: ['sad','down','depressed','unhappy','sorrow','grief','melancholy'],
      anger: ['angry','furious','irritat','annoyed','rage','outrage','furious'],
      excitement: ['excite','thrill','pump','eager','cant wait','stoked','amazing'],
      fear: ['scared','afraid','fear','worried','anxious','panic'],
      surprise: ['surprise','wow','unexpected','shocking','amazed','astonish'],
      neutral: ['okay','fine','neutral','alright']
    };

    Object.keys(keywordMap).forEach(em => {
      keywordMap[em].forEach(kw => {
        if (kw && text.includes(kw)) {
          base[em] = Math.min(100, base[em] + 24);
          base.neutral = Math.max(0, base.neutral - 12);
        }
      });
    });

    // Slightly spread leftover probability across other emotions
    const emotions = {};
    const keys = Object.keys(base);
    const sum = keys.reduce((s,k)=>s+base[k],0) || 1;
    keys.forEach(k => { emotions[k] = Math.round((base[k]/sum)*100*10)/10; });

    // Confidence heuristic: more text -> higher confidence
    const confidence = Math.min(95, Math.max(35, Math.min(80, (text.split(/\s+/).length || 0) * 6)));

    return { emotions, confidence };
  }
}
