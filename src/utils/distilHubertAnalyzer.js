// Lightweight Distil-Hubert analyzer wrapper (frontend-friendly fallback)
// Mirrors the interface of HubertAnalyzer but uses smaller heuristics and lower weight by default.
export default class DistilHubertAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.ready = false;
    this.name = 'DistilHubertAnalyzer';
  }

  async init() {
    try {
      if (typeof window !== 'undefined' && window.__DISTIL_HUBERT_MODEL__) {
        this.model = window.__DISTIL_HUBERT_MODEL__;
        this.ready = true;
        console.debug('🔧 DistilHubertModel bound from window.__DISTIL_HUBERT_MODEL__');
      } else {
        this.ready = true;
      }
    } catch (e) {
      console.warn('DistilHubertAnalyzer init failed, using fallback heuristics', e);
      this.ready = true;
    }
  }

  async analyzeAudio(fileOrObj) {
    if (this.model && typeof this.model.analyze === 'function') {
      try {
        const r = await this.model.analyze(fileOrObj);
        return { emotions: r.emotions || {}, confidence: r.confidence || 45 };
      } catch (e) {
        console.warn('DistilHubert model analyze failed, falling back to heuristic', e);
      }
    }

    const transcript = (fileOrObj && (fileOrObj.transcript || fileOrObj.text || '')) || '';
    const text = String(transcript).toLowerCase();
    const base = { joy: 0, sadness: 0, anger: 0, excitement: 0, fear: 0, surprise: 0, neutral: 60 };

    const keywordMap = {
      joy: ['happy','pleased','joy','delight','smile'],
      sadness: ['sad','down','sorry','unhappy','tear'],
      anger: ['angry','mad','annoyed','hate','furious'],
      excitement: ['excite','thrill','woo','wow','amaze'],
      fear: ['scared','afraid','afraid','panic','worried'],
      surprise: ['surprise','wow','unexpected','shock']
    };

    Object.keys(keywordMap).forEach(em => {
      keywordMap[em].forEach(kw => {
        if (kw && text.includes(kw)) {
          base[em] = Math.min(100, base[em] + 16);
          base.neutral = Math.max(0, base.neutral - 8);
        }
      });
    });

    const emotions = {};
    const keys = Object.keys(base);
    const sum = keys.reduce((s,k)=>s+base[k],0) || 1;
    keys.forEach(k => { emotions[k] = Math.round((base[k]/sum)*100*10)/10; });

    const confidence = Math.min(90, Math.max(30, Math.min(70, (text.split(/\s+/).length || 0) * 4)));
    return { emotions, confidence };
  }
}
