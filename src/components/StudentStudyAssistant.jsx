import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaMicrophone, FaStop, FaDownload, FaClipboard } from 'react-icons/fa';
import './StudentStudyAssistant.css';

// Student Study Assistant: record teacher voice, transcribe, then generate study materials
export default function StudentStudyAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState(null);
  const [metrics, setMetrics] = useState({ durationSec: 0, words: 0, wpm: 0, avgEnergy: 0 });
  const [manualMode, setManualMode] = useState(false); // allow typing/pasting text
  const [selectedLang, setSelectedLang] = useState('en-US');
  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'hi-IN', label: 'Hindi (India)' },
    { code: 'es-ES', label: 'Spanish (Spain)' },
  ];

  // Speech recognition
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const startTimeRef = useRef(null);
  const shouldContinueRef = useRef(false);
  const restartCountRef = useRef(0);
  const MAX_RESTARTS = 5;

  // Audio analysis
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const energySamplesRef = useRef([]);
  const mediaStreamRef = useRef(null);

  const stopAudioAnalysis = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    audioCtxRef.current = null;
  };

  const analyzeEnergyLoop = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // Use average magnitude as a proxy for energy
    const avg = data.reduce((s, v) => s + v, 0) / data.length;
    energySamplesRef.current.push(avg);
    rafRef.current = requestAnimationFrame(analyzeEnergyLoop);
  };

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      energySamplesRef.current = [];
      analyzeEnergyLoop();
    } catch (e) {
      console.error('Audio init failed', e);
    }
  };

  const initRecognition = useCallback((lang = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = lang;
    recog.onstart = () => {
      setIsListening(true);
      setError('');
      startTimeRef.current = Date.now();
    };
    recog.onresult = (event) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        let t = res[0].transcript;
        // light cleanup
        t = t.replace(/[\s\n]+/g, ' ');
        if (res.isFinal) {
          const trimmed = t.trim();
          // avoid duplicate tail appends (mobile/Web Speech quirk)
          if (!final.trim().endsWith(trimmed)) {
            final += trimmed + ' ';
          }
        } else {
          interim += t;
        }
      }
      finalTranscriptRef.current = final;
      const full = (final + interim).trim();
      setTranscript(full);
    };
    recog.onerror = (e) => {
      console.error('Recognition error', e);
      const err = e?.error || 'Speech recognition error';
      setError(err);
      // Auto-retry for transient errors while recording is desired
      if (shouldContinueRef.current && restartCountRef.current < MAX_RESTARTS) {
        restartCountRef.current += 1;
        try { recog.stop(); } catch {}
        setTimeout(() => {
          try { recognitionRef.current && recognitionRef.current.start(); } catch {}
        }, 500);
      } else {
        setIsListening(false);
      }
    };
    recog.onend = () => {
      if (shouldContinueRef.current && restartCountRef.current < MAX_RESTARTS) {
        // try to keep session alive for short pauses
        restartCountRef.current += 1;
        try { recognitionRef.current && recognitionRef.current.start(); } catch {}
        return;
      }
      setIsListening(false);
      // finalize metrics on end
      finalizeMetrics();
    };
    return recog;
  }, []);

  const startRecording = async () => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setMaterials(null);
    setMetrics({ durationSec: 0, words: 0, wpm: 0, avgEnergy: 0 });
    setManualMode(false); // recording takes precedence over manual mode
    const recog = initRecognition(selectedLang);
    if (!recog) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    recognitionRef.current = recog;
    try {
      shouldContinueRef.current = true;
      restartCountRef.current = 0;
      await startAudioAnalysis();
      recog.start();
    } catch (e) {
      console.error(e);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    shouldContinueRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    stopAudioAnalysis();
  };

  const clearAll = () => {
    stopRecording();
    finalTranscriptRef.current = '';
    energySamplesRef.current = [];
    setTranscript('');
    setMaterials(null);
    setMetrics({ durationSec: 0, words: 0, wpm: 0, avgEnergy: 0 });
    setError('');
  };

  const finalizeMetrics = () => {
    const end = Date.now();
    const durationSec = startTimeRef.current ? Math.max(1, Math.round((end - startTimeRef.current) / 1000)) : 0;
    const words = transcript.split(/\s+/).filter(Boolean).length;
    const wpm = durationSec > 0 ? Math.round((words / durationSec) * 60) : 0;
    const energySamples = energySamplesRef.current || [];
    const avgEnergy = energySamples.length ? Math.round(energySamples.reduce((s, v) => s + v, 0) / energySamples.length) : 0;
    setMetrics({ durationSec, words, wpm, avgEnergy });
  };

  const inferToneProfile = () => {
    const { wpm, avgEnergy } = metrics;
    let tone = 'neutral';
    if (wpm > 150 || avgEnergy > 120) tone = 'energetic';
    if (wpm < 100 && avgEnergy < 90) tone = 'calm';
    return { tone, wpm, avgEnergy };
  };

  const generateStudyMaterials = () => {
    if (!transcript.trim()) {
      setError('Please record or paste some text first.');
      return;
    }
    // Compute metrics for typed text if in manual mode
    if (manualMode) {
      const words = transcript.split(/\s+/).filter(Boolean).length;
      setMetrics({ durationSec: 0, words, wpm: 0, avgEnergy: 0 });
    }
    const tone = inferToneProfile();
    const pack = buildStudyPack(transcript, tone);
    setMaterials(pack);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const downloadAll = () => {
    if (!materials) return;
    const md = renderMaterialsAsMarkdown(materials, metrics);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-pack.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => () => stopAudioAnalysis(), []);

  return (
    <div className="student-study-assistant">
      <h2 className="section-title">🎓 Student Study Pack (Record Teacher ➜ Transcript ➜ Materials)</h2>
      {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="controls" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={isListening ? stopRecording : startRecording} disabled={manualMode} title={manualMode ? 'Disable Type/Paste mode to use microphone' : ''}>
          {isListening ? <FaStop className="mic-icon" /> : <FaMicrophone className="mic-icon" />} {isListening ? 'Stop' : 'Record'}
        </button>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isListening}
          style={{ background: '#0f1320', color: '#fff', border: '1px solid #243', borderRadius: 6, padding: '8px 10px' }}
          title="Speech recognition language"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <button className="control-button" onClick={() => setManualMode(m => !m)}>
          {manualMode ? '🎤 Use Microphone' : '✍️ Type/Paste Text'}
        </button>
        <button className="control-button" disabled={!transcript.trim()} onClick={generateStudyMaterials}>Generate Study Pack</button>
        <button className="control-button" disabled={!materials} onClick={downloadAll}><FaDownload style={{ marginRight: 6 }} />Download All</button>
        <button className="control-button" onClick={clearAll}>Clear</button>
      </div>

  <div className="metrics-chips">
        <span>⏱️ Duration: {metrics.durationSec}s</span>
        <span>📝 Words: {metrics.words}</span>
        <span>🚀 WPM: {metrics.wpm}</span>
        <span>🎚️ Energy: {metrics.avgEnergy}</span>
      </div>

  <div className="transcript-card card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{manualMode ? 'Type or Paste Text' : 'Transcript'}</h3>
          <button className="control-button" onClick={() => copyToClipboard(transcript)} disabled={!transcript}><FaClipboard style={{ marginRight: 6 }} />Copy</button>
        </div>
        {manualMode ? (
          <textarea
            style={{ width: '100%', marginTop: 8, minHeight: 160, resize: 'vertical' }}
            placeholder="Paste or type your lecture notes here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        ) : (
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{transcript || 'Record the teacher to generate a transcript...'}</p>
        )}
      </div>

      {materials && (
  <div className="materials">
          <h3 className="section-title">📚 Generated Study Materials</h3>
          <MaterialList materials={materials} onCopy={copyToClipboard} />
        </div>
      )}
    </div>
  );
}

function MaterialList({ materials, onCopy }) {
  const entries = Object.entries(materials);
  return (
    <div className="material-grid">
      {entries.map(([key, value]) => (
        <div key={key} className="material-card">
          <div className="material-card__header">
            <h4 className="material-title">{prettyTitle(key)}</h4>
            <button className="control-button" onClick={() => onCopy(renderSectionMarkdown(key, value))}><FaClipboard /></button>
          </div>
          <div className="material-content">
            {Array.isArray(value) ? (
              <ul>
                {value.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : typeof value === 'string' ? (
              <p>{value}</p>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function prettyTitle(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function buildStudyPack(text, tone) {
  const clean = text.trim();
  const sentences = clean.split(/[.!?]+\s+/).filter(Boolean);
  const words = clean.split(/\s+/).filter(Boolean);

  // Heuristic keyword extraction
  const keywords = extractKeywords(clean, 12);

  // Tailor difficulty/voice-based tweaks
  const toneNotes = tone.tone === 'energetic' ? 'Emphasize active recall and challenges.' : tone.tone === 'calm' ? 'Emphasize clarity and examples with slower pacing.' : 'Balanced coverage across formats.';

  const summary = summarizeText(clean, 5);
  const detailed = summarizeText(clean, 12);

  // Generate sections (>= 12)
  return {
    learning_objectives: makeObjectives(keywords, sentences),
    brief_summary: summary,
    detailed_summary: detailed,
    bullet_notes: makeBullets(sentences, 12),
    glossary: makeGlossaryFromKeywords(keywords),
    key_takeaways: makeTakeaways(sentences, 8),
    comprehension_questions: makeQuestions(sentences, 10),
    mcqs: makeMCQs(keywords, 8),
    true_false: makeTrueFalse(sentences, 10),
    flashcards: makeFlashcards(keywords, sentences, 12),
    examples: makeExamples(sentences, 6),
    misconceptions: makeMisconceptions(keywords, 5),
    assignments: makeAssignments(keywords, 3),
    practice_problems: makePracticeProblems(keywords, 6),
    cheat_sheet: makeCheatSheet(keywords),
    study_plan_7_days: makeStudyPlan(keywords, 7, toneNotes),
    exam_tips: makeExamTips(keywords),
    mnemonics: makeMnemonics(keywords),
    further_reading: makeFurtherReading(keywords, 8),
  };
}

function renderSectionMarkdown(title, value) {
  let md = `\n\n## ${prettyTitle(title)}\n`;
  if (Array.isArray(value)) {
    md += value.map(v => `- ${v}`).join('\n');
  } else if (typeof value === 'string') {
    md += `\n${value}`;
  } else {
    md += `\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
  }
  return md;
}

function renderMaterialsAsMarkdown(materials, metrics) {
  let md = `# Study Pack\n\nGenerated from teacher lecture.\n\n- Duration: ${metrics.durationSec}s\n- Words: ${metrics.words}\n- WPM: ${metrics.wpm}\n- Energy: ${metrics.avgEnergy}\n`;
  for (const [k, v] of Object.entries(materials)) {
    md += renderSectionMarkdown(k, v);
  }
  return md;
}

// Utility generators
function extractKeywords(text, limit = 10) {
  // Unicode-aware tokenization to support non-Latin scripts
  const tokens = text.toLowerCase().match(/[\p{L}][\p{L}-]+/gu) || [];
  const stop = new Set(['the','and','for','that','with','this','from','into','your','you','are','was','were','has','have','had','not','but','can','could','should','would','about','over','under','between','within','to','in','on','of','a','an','it','is','as','by','or','be']);
  const freq = new Map();
  tokens.forEach(t => { if (!stop.has(t)) freq.set(t, (freq.get(t) || 0) + 1); });
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0, limit).map(([w])=>w);
}

function summarizeText(text, sentenceCount = 5) {
  const sents = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sents.length <= sentenceCount) return text;
  // Scoring by keyword density
  const keys = extractKeywords(text, 20);
  const score = sents.map(s => ({ s, score: keys.reduce((sum,k)=> sum + (s.toLowerCase().includes(k) ? 1 : 0), 0) }));
  return score.sort((a,b)=>b.score-a.score).slice(0, sentenceCount).map(o=>o.s).join(' ');
}

function makeObjectives(keys, sentences) {
  const base = [
    'Define the key terms and concepts.',
    'Explain the main ideas in your own words.',
    'Apply the concepts to real-world examples.',
    'Analyze relationships between ideas and themes.',
    'Evaluate the implications and trade-offs.',
  ];
  return base.concat(keys.slice(0,5).map(k=>`Describe the role of "${k}" in the topic.`));
}

function makeBullets(sentences, n=10) {
  const out = [];
  for (let i=0; i<Math.min(n, sentences.length); i++) out.push(sentences[i]);
  while (out.length < n) out.push('Additional point based on lecture context.');
  return out;
}

function makeGlossaryFromKeywords(keys) {
  return keys.map(k=>`${capitalize(k)}: Definition and relevance in this lecture.`);
}

function makeTakeaways(sentences, n=8) {
  const out = [];
  const step = Math.max(1, Math.floor(sentences.length / n));
  for (let i=0; i<sentences.length && out.length<n; i+=step) out.push(sentences[i]);
  while (out.length < n) out.push('Reinforce core concept with a concise statement.');
  return out;
}

function makeQuestions(sentences, n=10) {
  const qs = [];
  const starters = ['What is','How does','Why is','Explain','Describe','Compare','When does','Where can','Which factors','Outline'];
  const topics = sentences.slice(0, n).map(s => s.split(' ').slice(0,6).join(' '));
  for (let i=0; i<n; i++) {
    qs.push(`${starters[i % starters.length]} ${topics[i % topics.length] || 'the concept'}?`);
  }
  return qs;
}

function makeMCQs(keys, n=8) {
  const out = [];
  for (let i=0; i<n; i++) {
    const topic = keys[i % Math.max(1, keys.length)] || 'the concept';
    out.push(`Which of the following best describes ${topic}? (A) Irrelevant detail (B) Partially related (C) Accurate definition (D) Contradictory statement`);
  }
  return out;
}

function makeTrueFalse(sentences, n=10) {
  const out = [];
  for (let i=0; i<n; i++) {
    const s = sentences[i % Math.max(1, sentences.length)] || 'Core claim from the lecture.';
    out.push(`True/False: ${s}`);
  }
  return out;
}

function makeFlashcards(keys, sentences, n=12) {
  const out = [];
  for (let i=0; i<n; i++) {
    const term = keys[i % Math.max(1, keys.length)] || `Concept ${i+1}`;
    out.push(`${capitalize(term)} — Explain this concept in one sentence.`);
  }
  return out;
}

function makeExamples(sentences, n=6) {
  const out = [];
  for (let i=0; i<n; i++) {
    const topic = sentences[i % Math.max(1, sentences.length)] || 'a key idea';
    out.push(`Example: Apply the idea from "${topic.slice(0,70)}" to a real-world scenario.`);
  }
  return out;
}

function makeMisconceptions(keys, n=5) {
  const out = [];
  for (let i=0; i<n; i++) {
    const k = keys[i % Math.max(1, keys.length)] || 'topic';
    out.push(`Misconception: "${capitalize(k)}" means X. Correction: Actually, it means Y.`);
  }
  return out;
}

function makeAssignments(keys, n=3) {
  const out = [];
  for (let i=0; i<n; i++) {
    const k = keys[i % Math.max(1, keys.length)] || 'topic';
    out.push(`Assignment ${i+1}: Write a short report explaining ${k} with references and examples.`);
  }
  return out;
}

function makePracticeProblems(keys, n=6) {
  const out = [];
  for (let i=0; i<n; i++) {
    const k = keys[i % Math.max(1, keys.length)] || 'topic';
    out.push(`Problem ${i+1}: Solve a scenario involving ${k}. Show steps and reasoning.`);
  }
  return out;
}

function makeCheatSheet(keys) {
  return keys.slice(0, 12).map(k => `${capitalize(k)} — key formula/fact/definition.`);
}

function makeStudyPlan(keys, days = 7, toneNote = '') {
  const out = [];
  for (let d=1; d<=days; d++) {
    out.push(`Day ${d}: Review ${keys[(d-1) % Math.max(1, keys.length)] || 'core topic'}, practice 2 problems, and recall 5 flashcards. ${toneNote}`);
  }
  return out;
}

function makeExamTips(keys) {
  const base = [
    'Focus on high-frequency concepts first.',
    'Practice retrieval with flashcards daily.',
    'Teach a concept aloud to check understanding.',
    'Simulate exam conditions for timed practice.',
    'Review mistakes and create correction notes.',
  ];
  return base.concat(keys.slice(0,5).map(k=>`Know definitions and applications of ${k}.`));
}

function makeMnemonics(keys) {
  return keys.slice(0,6).map((k, i) => `Mnemonic ${i+1}: Create a memorable phrase linking ${k} to a known concept.`);
}

function makeFurtherReading(keys, n=8) {
  const out = [];
  for (let i=0; i<n; i++) {
    const k = keys[i % Math.max(1, keys.length)] || 'topic';
    out.push(`Further reading on ${k}: textbook chapter, reputable article, or tutorial video.`);
  }
  return out;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
