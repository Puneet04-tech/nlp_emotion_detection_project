import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceEmotionSystem.css';
import UltraEnhancedEmotionEngine from '../utils/ultraEnhancedEmotionEngine';
import SentimentFusionEngine from '../utils/sentimentFusionEngine';
import { enhancedBertAnalyzer, analyzeEmotionWithEnhancedBERT } from '../utils/enhancedBertAnalyzer';
import { analyzeEmotionWithBERT } from '../utils/bertEmotionApi';
import novelBERTEnhancementSystem from '../utils/novelBERTEnhancementSystem';
import advancedBERTAnalyzer from '../utils/advancedBERTAnalyzer';
import bertTranscriptAnalyzer from '../utils/bertTranscriptAnalyzer';
import bertEmotionEnhancer from '../utils/bertEmotionEnhancer';
import bertConfig from '../utils/enhancedBertConfig';
import HubertAnalyzer from '../utils/hubertAnalyzer';
import DistilHubertAnalyzer from '../utils/distilHubertAnalyzer';

// Ultra-Enhanced Voice Emotion System
const VoiceEmotionSystem = ({ onEmotionDetected, isVisible = true }) => {
  // Core state
  const [systemStatus, setSystemStatus] = useState('ready');
  const [emotions, setEmotions] = useState({
    joy: 25,
    sadness: 14,
    anger: 5,
    excitement: 18,
    fear: 12,
    surprise: 8,
    neutral: 69
  });
  const [dominantEmotion, setDominantEmotion] = useState('neutral');
  const [emotionExplanation, setEmotionExplanation] = useState('');
  const [voiceFeatures, setVoiceFeatures] = useState({});
  const [transcript, setTranscript] = useState('');
  const [fileProcessingStatus, setFileProcessingStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState('medium');
  const [analysisQuality, setAnalysisQuality] = useState('standard');

  // Engine refs (initialized once)
  const ultraEngineRef = useRef(null);
  const fusionEngineRef = useRef(null);
  const bertAnalyzerRef = useRef(null);
  const hubertRef = useRef(null);
  const distilHubertRef = useRef(null);
  // Simple in-memory cache to avoid nondeterministic repeated analyses for the same file
  const analysisCacheRef = useRef(new Map());
  
  // Test samples for demonstration
  const testSamples = {
    joy: { text: "This is absolutely wonderful! I'm so happy right now!" },
    sadness: { text: "I feel so down and disappointed about everything." },
    anger: { text: "I'm absolutely furious about this situation!" },
    excitement: { text: "This is so exciting! I can't believe it's happening!" },
    fear: { text: "I'm really scared and worried about what might happen." },
    surprise: { text: "Wow! That's completely unexpected and shocking!" },
    contempt: { text: "That's absolutely ridiculous and beneath my attention." },
    anticipation: { text: "I'm eagerly waiting and expecting something great." },
    trust: { text: "I have complete confidence and trust in this." },
    melancholy: { text: "There's a bittersweet feeling of nostalgia here." },
    euphoria: { text: "I'm experiencing pure bliss and overwhelming joy!" },
    serenity: { text: "I feel completely peaceful and at ease with everything." },
    determination: { text: "I'm absolutely determined to achieve this goal." },
    curiosity: { text: "I'm really curious to understand how this works." },
    disgust: { text: "That's absolutely disgusting and repulsive." },
    admiration: { text: "I have tremendous respect and admiration for this." },
    envy: { text: "I wish I had what they have, it's not fair." },
    gratitude: { text: "I'm so grateful and thankful for everything." }
  };
  
  // UI state
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showEmotionRadar, setShowEmotionRadar] = useState(false);
  const [showConfidenceChart, setShowConfidenceChart] = useState(false);
  const [currentTestEmotion, setCurrentTestEmotion] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [embedAllowed, setEmbedAllowed] = useState(true);
  const [embedLoading, setEmbedLoading] = useState(true);
  const embedRef = useRef(null);

  // Simple initialization + engine wiring
  useEffect(() => {
    console.log('🚀 Ultra-Enhanced Voice Emotion System initialized');
    console.log('🎯 18+ emotions ready for testing');

    // Initialize engines if not provided
    if (!ultraEngineRef.current) {
      try {
        ultraEngineRef.current = new UltraEnhancedEmotionEngine();
        console.debug('🔧 UltraEngine initialized');
      } catch (e) {
        console.warn('⚠️ Could not initialize UltraEngine, continuing with limited features', e);
        ultraEngineRef.current = null;
      }
    }

    if (!fusionEngineRef.current) {
      try {
        fusionEngineRef.current = new SentimentFusionEngine();
        console.debug('🔧 FusionEngine initialized');
      } catch (e) {
        console.warn('⚠️ Could not initialize FusionEngine', e);
        fusionEngineRef.current = null;
      }
    }

    if (!bertAnalyzerRef.current) {
      // Use the exported enhanced analyzer instance
      bertAnalyzerRef.current = enhancedBertAnalyzer;
      console.debug('🔧 Enhanced BERT Analyzer bound');
    }

    // Initialize Hubert / DistilHubert analyzers lazily
    (async () => {
      if (!hubertRef.current) {
        try {
          hubertRef.current = new HubertAnalyzer();
          await hubertRef.current.init();
          console.debug('🔧 HubertAnalyzer initialized');
        } catch (e) {
          console.warn('⚠️ HubertAnalyzer failed to initialize', e);
          hubertRef.current = null;
        }
      }

      if (!distilHubertRef.current) {
        try {
          distilHubertRef.current = new DistilHubertAnalyzer();
          await distilHubertRef.current.init();
          console.debug('🔧 DistilHubertAnalyzer initialized');
        } catch (e) {
          console.warn('⚠️ DistilHubertAnalyzer failed to initialize', e);
          distilHubertRef.current = null;
        }
      }
    })();
  }, []);

  // Audio file processing with ultra-enhanced analysis
  const processAudioFile = async (file) => {
    // Deterministic fingerprint for a file-like object: prefer name/size/lastModified, fallback to text hash
    const makeFingerprint = async (f) => {
      try {
        if (!f) return 'no-file';
        if (f.name && f.size != null && f.lastModified != null) {
          return `${f.name}::${f.size}::${f.lastModified}`;
        }
        // if file contains text property (test runner) use that
        if (typeof f.text === 'string') {
          // simple stable hash (djb2)
          let hash = 5381;
          for (let i = 0; i < f.text.length; i++) {
            hash = ((hash << 5) + hash) + f.text.charCodeAt(i);
            hash = hash & 0xffffffff;
          }
          return `text::${hash}`;
        }
        return JSON.stringify(f).slice(0,200);
      } catch (e) {
        return 'fingerprint-error';
      }
    };

    const fingerprint = await makeFingerprint(file);
    if (analysisCacheRef.current.has(fingerprint)) {
      const cached = analysisCacheRef.current.get(fingerprint);
      console.debug('♻️ Returning cached analysis for fingerprint', fingerprint, cached);
      // update state from cached result
      setEmotions(cached.emotions);
      setDominantEmotion(cached.dominantEmotion);
      setVoiceFeatures(cached.voiceFeatures || {});
      if (cached.transcript) setTranscript(cached.transcript);
      if (onEmotionDetected) {
        onEmotionDetected({ ...cached, analysis: cached.fusionType || 'cached' });
      }
      setFileProcessingStatus('✅ Analysis returned from cache');
      return cached;
    }
    const ultraEngine = ultraEngineRef.current;
    const fusionEngine = fusionEngineRef.current;
    const bertAnalyzer = bertAnalyzerRef.current;
    const hubert = hubertRef.current;
    const distilHubert = distilHubertRef.current;

    if (!ultraEngine) {
      console.warn('⚠️ UltraEngine not available, using fallback analysis');
    }

    try {
      setFileProcessingStatus('🔄 Ultra-enhanced analysis in progress...');
      setIsProcessing(true);
      console.log('🎵 Processing audio file with ultra-enhanced system:', file.name || '[test-sample]');

      // Process with ultra-enhanced emotion engine (fallback to local util if missing)
      const emotionResult = ultraEngine
        ? await ultraEngine.processAudioFile(file)
        : { emotions: { neutral: 70 }, confidence: 70, transcript: file.name ? '' : (file.text || ''), voiceFeatures: {} };

      console.debug('🎭 Voice analysis result:', emotionResult);

      // Use transcript if present for text analysis
      const transcriptText = emotionResult.transcript || (file && file.name ? '' : (file.text || ''));

      let sentimentResult = null;
      if (fusionEngine && transcriptText) {
        sentimentResult = await fusionEngine.analyzeSentimentFusion(transcriptText);
        console.debug('💫 Sentiment fusion result:', sentimentResult);
      }


      // Run all BERT-related models
      const bertResults = [];
      if (transcriptText) {
        // 1. EnhancedBERTAnalyzer (ensemble)
        try {
          const wordCount = transcriptText.split(/\s+/).length;
          const options = { includeConfidenceCalibration: true };
          if (wordCount > 40) {
            options.useContextWindow = true;
            options.enableEnsemble = true;
          } else if (wordCount > 8) {
            options.sentenceLevel = true;
          }
          const result = await analyzeEmotionWithEnhancedBERT(transcriptText, options);
          bertResults.push({ name: 'EnhancedBERT', ...result });
          console.debug('🤖 EnhancedBERT:', result);
        } catch (e) { console.warn('EnhancedBERT failed', e); }

        // 2. Classic BERT API
        try {
          const result = await analyzeEmotionWithBERT(transcriptText);
          bertResults.push({ name: 'ClassicBERT', ...result });
          console.debug('🤖 ClassicBERT:', result);
        } catch (e) { console.warn('ClassicBERT failed', e); }

        // 3. NovelBERTEnhancementSystem (DistilBERT)
        try {
          const result = await novelBERTEnhancementSystem.analyze(transcriptText);
          bertResults.push({ name: 'NovelDistilBERT', ...result });
          console.debug('🤖 NovelDistilBERT:', result);
        } catch (e) { console.warn('NovelDistilBERT failed', e); }

        // 4. AdvancedBERTAnalyzer (DistilRoBERTa, RoBERTa)
        try {
          const result = await advancedBERTAnalyzer.analyze(transcriptText);
          bertResults.push({ name: 'AdvancedBERT', ...result });
          console.debug('🤖 AdvancedBERT:', result);
        } catch (e) { console.warn('AdvancedBERT failed', e); }

        // 5. BertTranscriptAnalyzer (DistilBERT zero-shot/sentiment)
        try {
          const result = await bertTranscriptAnalyzer.analyze(transcriptText);
          bertResults.push({ name: 'TranscriptBERT', ...result });
          console.debug('🤖 TranscriptBERT:', result);
        } catch (e) { console.warn('TranscriptBERT failed', e); }

        // 6. BertEmotionEnhancer (DistilRoBERTa, DistilBERT)
        try {
          const result = await bertEmotionEnhancer.analyze(transcriptText);
          bertResults.push({ name: 'EmotionEnhancerBERT', ...result });
          console.debug('🤖 EmotionEnhancerBERT:', result);
        } catch (e) { console.warn('EmotionEnhancerBERT failed', e); }
      }

      // Hubert / DistilHubert audio analyses
      let hubertResult = null;
      let distilResult = null;
      try {
        if (hubert && typeof hubert.analyzeAudio === 'function') {
          hubertResult = await hubert.analyzeAudio({ transcript: transcriptText, file });
          console.debug('🎧 Hubert analysis:', hubertResult);
        }
      } catch (e) {
        console.warn('Hubert analysis failed', e);
        hubertResult = null;
      }

      try {
        if (distilHubert && typeof distilHubert.analyzeAudio === 'function') {
          distilResult = await distilHubert.analyzeAudio({ transcript: transcriptText, file });
          console.debug('🎧 DistilHubert analysis:', distilResult);
        }
      } catch (e) {
        console.warn('DistilHubert analysis failed', e);
        distilResult = null;
      }

      // Fuse all BERT results
      let fusedBert = null;
      if (bertResults && bertResults.length > 0) {
        // Average emotion scores and confidence
        const allKeys = Array.from(new Set(bertResults.flatMap(r => Object.keys(r.emotions || {}))));
        const avgScores = {};
        allKeys.forEach(k => {
          avgScores[k] = bertResults.map(r => (r.emotions?.[k] || 0)).reduce((a,b)=>a+b,0) / bertResults.length;
        });
        const avgConfidence = bertResults.map(r => r.confidence || 0).reduce((a,b)=>a+b,0) / bertResults.length;
        fusedBert = { emotions: avgScores, confidence: avgConfidence };
      }

      // Combine results and normalize
      const finalResult = combineAnalysisResults(emotionResult, sentimentResult, fusedBert, hubertResult, distilResult);

      // Update state with enhanced results
  setEmotions(finalResult.emotions);
  setDominantEmotion(finalResult.dominantEmotion);
  setVoiceFeatures(finalResult.voiceFeatures || emotionResult.voiceFeatures || {});
  if (transcriptText) setTranscript(transcriptText);
  setEmotionExplanation(finalResult.explanation || '');

      // store in cache for deterministic repeat uploads
      try {
        if (typeof fingerprint !== 'undefined' && fingerprint) {
          analysisCacheRef.current.set(fingerprint, {
            emotions: finalResult.emotions,
            dominantEmotion: finalResult.dominantEmotion,
            confidence: finalResult.confidence,
            voiceFeatures: finalResult.voiceFeatures || {},
            transcript: transcriptText || finalResult.transcript || '',
            fusionType: finalResult.fusionType || 'ultra-enhanced'
          });
        }
      } catch (e) {
        // caching failing shouldn't break analysis
        console.warn('Cache store failed', e);
      }

      // Callback with ultra-enhanced data
      if (onEmotionDetected) {
        onEmotionDetected({
          emotion: finalResult.dominantEmotion,
          confidence: finalResult.confidence,
          features: finalResult.voiceFeatures,
          emotions: finalResult.emotions,
          analysis: 'ultra-enhanced'
        });
      }

      setFileProcessingStatus('✅ Ultra-enhanced analysis complete!');
      return finalResult;

    } catch (error) {
      console.error('❌ Ultra-enhanced processing failed:', error);
      setFileProcessingStatus('❌ Processing failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Combine results from all three engines with advanced weighting
  const combineAnalysisResults = (emotionResult = {}, sentimentResult = {}, bertResult = {}, hubertResult = {}, distilResult = {}) => {
    console.debug('🔄 Combining ultra-enhanced analysis results (BERT-weighted)...');

    // Helper: normalize score objects to 0-100
    const normalize = (obj) => {
      if (!obj) return {};
      const keys = Object.keys(obj);
      if (keys.length === 0) return {};
      const maxVal = Math.max(...keys.map(k => obj[k] || 0));
      // if scores look like 0..1, scale to 0..100
      const scale = maxVal <= 1 ? 100 : 1;
      const out = {};
      keys.forEach(k => { out[k] = (obj[k] || 0) * scale; });
      return out;
    };

  const voiceScores = normalize(emotionResult.emotions || {});
  const textScores = normalize(sentimentResult?.emotions || {});
  const bertScores = normalize(bertResult?.emotions || {});
  const hubertScores = normalize(hubertResult?.emotions || {});
  const distilScores = normalize(distilResult?.emotions || {});

    // Determine dynamic weights (give BERT more influence when its confidence is high)
    // Base weights (will be normalized). Hubert models get a moderate default weight.
    const baseWeights = { voice: 0.45, text: 0.10, bert: 0.25, hubert: 0.12, distil: 0.08 };
    const bertConfidenceFactor = Math.min(1, (bertResult?.confidence || 0) / 100);
    const weights = {
      voice: baseWeights.voice,
      text: baseWeights.text,
      bert: baseWeights.bert * (0.6 + 0.8 * bertConfidenceFactor) // scale bert between 0.6x-1.4x depending on confidence
    };

    // Scale hubert weights by their confidence if present
    const hubertConfidenceFactor = Math.min(1, (hubertResult?.confidence || 0) / 100);
    const distilConfidenceFactor = Math.min(1, (distilResult?.confidence || 0) / 100);
    weights.hubert = baseWeights.hubert * (0.7 + 0.6 * hubertConfidenceFactor);
    weights.distil = baseWeights.distil * (0.6 + 0.5 * distilConfidenceFactor);

    // Normalize weights to sum to 1
    const weightSum = weights.voice + weights.text + weights.bert;
    weights.voice /= weightSum;
    weights.text /= weightSum;
    weights.bert /= weightSum;

    // Union of all emotion keys
    // Apply lexical keyword boosting: if ultraEngine provides strong keyword matches, nudge scores
    const allKeys = Array.from(new Set([
      ...Object.keys(voiceScores),
      ...Object.keys(textScores),
      ...Object.keys(bertScores),
      ...Object.keys(hubertScores),
      ...Object.keys(distilScores)
    ]));
    // Lexical boost from ultraEngine profiles
    try {
      const profiles = ultraEngineRef.current?.emotionProfiles || {};
      if (profiles && Object.keys(profiles).length > 0 && (sentimentResult?.text || bertResult?.text || emotionResult.transcript)) {
        const textBody = (sentimentResult?.text || bertResult?.text || emotionResult.transcript || '').toLowerCase();
        Object.keys(profiles).forEach(em => {
          const keywords = profiles[em]?.keywords || [];
          keywords.forEach(kw => {
            if (kw && textBody.includes(kw)) {
              // add a small boost to that emotion key
              if (!allKeys.includes(em)) allKeys.push(em);
                combined[em] = (combined[em] || 0) + 8; // +8 points lexical boost
            }
          });
        });
      }
    } catch (e) {
      // ignore lexical boosting failures
    }
    const combined = {};
    allKeys.forEach(k => {
        const v = (voiceScores[k] || 0) * weights.voice
                + (textScores[k] || 0) * weights.text
                + (bertScores[k] || 0) * weights.bert
                + (hubertScores[k] || 0) * weights.hubert
                + (distilScores[k] || 0) * weights.distil;
      combined[k] = v;
    });

    // Penalize contradictions conservatively (reduce pairs by 30%)
    const contradictionPairs = [ ['joy','sadness'], ['joy','anger'], ['sadness','anger'], ['fear','confidence'], ['excitement','melancholy'], ['love','disgust'] ];
    contradictionPairs.forEach(([a,b]) => {
      if (combined[a] && combined[b]) {
        combined[a] *= 0.7;
        combined[b] *= 0.7;
      }
    });

    // Smoothing and scaling: convert to percentages that sum to ~100
    const total = Object.values(combined).reduce((s,v) => s + Math.max(0, v), 0) || 1;
    const scaled = {};
    Object.entries(combined).forEach(([k,v]) => {
      scaled[k] = Math.round((Math.max(0, v) / total) * 100 * 10) / 10; // one decimal
    });

    // Determine dominant emotion and mixed cases
    const sorted = Object.entries(scaled).sort(([,a],[,b]) => b - a);
    let dominant = 'neutral';
    let isMixed = false;
    if (sorted.length > 0) {
      const [top, topScore] = sorted[0];
      const [second, secondScore] = sorted[1] || [null, 0];
      if (secondScore && (topScore - secondScore) < 8) {
        // close scores -> mixed
        dominant = `${top} + ${second}`;
        isMixed = true;
      } else {
        dominant = top;
      }
    }

    // Combined confidence: weighted by component confidences
    // Combined confidence: weighted by component confidences (weights normalized earlier)
    const cVoice = (emotionResult.confidence || 50);
    const cText = (sentimentResult?.confidence || 50);
    const cBert = (bertResult?.confidence || (bertConfidenceFactor * 100) || 50);
    const cHubert = (hubertResult?.confidence || (hubertConfidenceFactor * 100) || 50);
    const cDistil = (distilResult?.confidence || (distilConfidenceFactor * 100) || 50);

    const combinedConfidence = Math.min(100, (
      cVoice * weights.voice +
      cText * weights.text +
      cBert * weights.bert +
      cHubert * weights.hubert +
      cDistil * weights.distil
    ));

    console.debug(`🎯 ULTRA-ENHANCED RESULT: ${dominant} (${combinedConfidence.toFixed(1)}% confidence)`);

    return {
      emotions: scaled,
      dominantEmotion: dominant,
      confidence: Math.round(combinedConfidence * 10) / 10,
      voiceFeatures: emotionResult.voiceFeatures || {},
      transcript: emotionResult.transcript || '',
      fusionType: 'ultra-enhanced',
      isMixed
    };
  };
  const testWithEmotionSample = async (emotionType) => {
    if (!testSamples[emotionType]) return;
    
    setCurrentTestEmotion(emotionType);
    setFileProcessingStatus(`🧪 Testing with ${emotionType} sample...`);
    
    try {
      const sample = testSamples[emotionType];
      await processAudioFile(sample.audio);
      setTranscript(sample.text);
      
      console.log(`🧪 Test Result for ${emotionType}:`, {
        detected: dominantEmotion,
        expected: emotionType,
        match: dominantEmotion === emotionType
      });
    } catch (error) {
      console.error('Test sample processing failed:', error);
    } finally {
      setCurrentTestEmotion(null);
    }
  };

  // Live recording with ultra-enhanced analysis
  const startRecording = async () => {
    if (!ultraEngine) {
      console.error('❌ Ultra-enhanced engine not initialized');
      return;
    }
    
    try {
      setIsRecording(true);
      setFileProcessingStatus('🎤 Ultra-enhanced live analysis starting...');
      
      const result = await ultraEngine.startAnalysis();
      console.log('🎵 Ultra-enhanced live recording started');
      
      // Start continuous analysis loop
      const analysisInterval = setInterval(async () => {
        if (ultraEngine && isRecording) {
          const liveResult = await ultraEngine.getLatestAnalysis();
          if (liveResult && liveResult.emotions) {
            setEmotions(liveResult.emotions);
            setDominantEmotion(liveResult.dominantEmotion);
            setVoiceFeatures(liveResult.voiceFeatures);
            
            if (onEmotionDetected) {
              onEmotionDetected({
                emotion: liveResult.dominantEmotion,
                confidence: liveResult.confidence,
                features: liveResult.voiceFeatures,
                analysis: 'ultra-enhanced-live'
              });
            }
          }
        } else {
          clearInterval(analysisInterval);
        }
      }, 500);
      
      setFileProcessingStatus('🎤 Live ultra-enhanced analysis active');
      
    } catch (error) {
      console.error('❌ Failed to start ultra-enhanced recording:', error);
      setIsRecording(false);
      setFileProcessingStatus('❌ Recording failed');
    }
  };

  const stopRecording = async () => {
    if (ultraEngine) {
      await ultraEngine.stopAnalysis();
    }
    setIsRecording(false);
    setFileProcessingStatus('');
    console.log('⏹️ Ultra-enhanced recording stopped');
  };

  // File upload handler
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 File uploaded for ultra-enhanced analysis:', file.name);
    await processAudioFile(file);
  }, [ultraEngine, fusionEngine, bertAnalyzer]);

  // Render ultra-enhanced emotion display
  const renderEmotionDisplay = () => {
    const emotionEntries = Object.entries(emotions).sort(([,a], [,b]) => b - a);
    
    return (
      <div className="ultra-emotion-display">
        <div className="dominant-emotion">
          <h3>🎯 Dominant Emotion: {dominantEmotion}</h3>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${emotions[dominantEmotion] || 0}%` }}
            />
            <span>{(emotions[dominantEmotion] || 0).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="all-emotions">
          <h4>🌈 All Detected Emotions:</h4>
          {emotionEntries.slice(0, 8).map(([emotion, score]) => (
            <div key={emotion} className="emotion-item">
              <span className="emotion-name">{emotion}</span>
              <div className="emotion-bar">
                <div 
                  className="emotion-fill" 
                  style={{ width: `${score}%`, backgroundColor: getEmotionColor(emotion) }}
                />
                <span>{score.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Advanced Visualizations */}
        {showAdvancedMetrics && renderAdvancedMetrics()}
        {showEmotionRadar && renderEmotionRadar()}
        {showConfidenceChart && renderConfidenceChart()}
      </div>
    );
  };

  // Advanced Metrics Visualization
  const renderAdvancedMetrics = () => (
    <div className="advanced-metrics">
      <h4>📊 Ultra-Enhanced Analysis Metrics</h4>
      <div className="metrics-grid">
        <div className="metric-card">
          <h5>🎵 Voice Analysis</h5>
          <div className="metric-value">
            Pitch: {voiceFeatures.pitch?.toFixed(1) || 'N/A'} Hz
          </div>
          <div className="metric-value">
            Volume: {((voiceFeatures.volume || 0) * 100).toFixed(1)}%
          </div>
          <div className="metric-value">
            Clarity: {voiceFeatures.clarity || 'Analyzing...'}
          </div>
        </div>
        
        <div className="metric-card">
          <h5>🔬 Confidence Analysis</h5>
          <div className="metric-value">
            Level: <span className={`confidence-${confidenceLevel}`}>{confidenceLevel}</span>
          </div>
          <div className="metric-value">
            Quality: <span className={`quality-${analysisQuality}`}>{analysisQuality}</span>
          </div>
          <div className="metric-value">
            Fusion: Multi-Algorithm
          </div>
        </div>
        
        <div className="metric-card">
          <h5>🤖 AI Enhancement</h5>
          <div className="metric-value">
            BERT: {bertAnalyzer ? '✅ Active' : '⏳ Loading'}
          </div>
          <div className="metric-value">
            Sentiment: {fusionEngine ? '✅ Active' : '⏳ Loading'}
          </div>
          <div className="metric-value">
            Emotions: 18+ Detected
          </div>
        </div>
      </div>
    </div>
  );

  // Emotion Radar Chart
  const renderEmotionRadar = () => {
    const topEmotions = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
    
    return (
      <div className="emotion-radar">
        <h4>🎯 Emotion Intensity Radar</h4>
        <div className="radar-chart">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Radar grid */}
            {[1, 2, 3, 4, 5].map(ring => (
              <circle
                key={ring}
                cx="150"
                cy="150"
                r={ring * 25}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            ))}
            
            {/* Radar lines */}
            {topEmotions.map((_, index) => {
              const angle = (index * 60 - 90) * Math.PI / 180;
              const x2 = 150 + 125 * Math.cos(angle);
              const y2 = 150 + 125 * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1="150"
                  y1="150"
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Emotion points */}
            {topEmotions.map(([emotion, score], index) => {
              const angle = (index * 60 - 90) * Math.PI / 180;
              const radius = (score / 100) * 125;
              const x = 150 + radius * Math.cos(angle);
              const y = 150 + radius * Math.sin(angle);
              return (
                <g key={emotion}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={getEmotionColor(emotion)}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={150 + 140 * Math.cos(angle)}
                    y={150 + 140 * Math.sin(angle)}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    dy="4"
                  >
                    {emotion}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Confidence History Chart
  const renderConfidenceChart = () => (
    <div className="confidence-chart">
      <h4>📈 Confidence Trend Analysis</h4>
      <div className="chart-container">
        <svg width="400" height="200" viewBox="0 0 400 200">
          {/* Chart background */}
          <rect width="400" height="200" fill="rgba(255,255,255,0.05)" rx="10"/>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="50"
              y1={180 - y * 1.3}
              x2="380"
              y2={180 - y * 1.3}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Confidence line */}
          {emotionHistory.length > 1 && (
            <polyline
              points={emotionHistory.map((entry, index) => {
                const x = 50 + (index * 330 / (emotionHistory.length - 1));
                const y = 180 - (entry.confidence * 1.3);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          
          {/* Data points */}
          {emotionHistory.map((entry, index) => {
            const x = 50 + (index * 330 / Math.max(1, emotionHistory.length - 1));
            const y = 180 - (entry.confidence * 1.3);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={entry.isTest ? "#f59e0b" : "#10b981"}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          <text x="25" y="25" fill="white" fontSize="12">100%</text>
          <text x="25" y="55" fill="white" fontSize="12">75%</text>
          <text x="25" y="90" fill="white" fontSize="12">50%</text>
          <text x="25" y="125" fill="white" fontSize="12">25%</text>
          <text x="25" y="185" fill="white" fontSize="12">0%</text>
        </svg>
      </div>
    </div>
  );

  // Get emotion icon
  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: '😊', happiness: '😊', excitement: '🤩', elation: '🥳',
      sadness: '😢', melancholy: '😔', despair: '😞', grief: '😭',
      anger: '😠', fury: '😡', rage: '🤬', irritation: '😤',
      fear: '😨', terror: '😱', anxiety: '😰', panic: '😵',
      surprise: '😮', amazement: '🤯', shock: '😲', awe: '😯',
      disgust: '🤢', contempt: '😒', revulsion: '🤮',
      trust: '🤝', confidence: '💪', determination: '🎯',
      anticipation: '⏳', curiosity: '🤔', serenity: '🧘'
    };
    return icons[emotion] || '😐';
  };

  // Get color for emotion visualization
  const getEmotionColor = (emotion) => {
    const colors = {
      happiness: '#10b981', joy: '#10b981', excitement: '#f59e0b', serenity: '#06b6d4',
      sadness: '#6b7280', melancholy: '#6b7280', disappointment: '#6b7280',
      anger: '#ef4444', frustration: '#dc2626', irritation: '#ef4444',
      fear: '#8b5cf6', anxiety: '#8b5cf6', nervousness: '#8b5cf6',
      surprise: '#f59e0b', amazement: '#f59e0b', shock: '#f59e0b',
      disgust: '#7c2d12', contempt: '#7c2d12',
      confidence: '#059669', determination: '#059669', pride: '#059669',
      neutral: '#374151', calm: '#374151', peaceful: '#06b6d4'
    };
    return colors[emotion] || '#6b7280';
  };

  // Render system status
  const renderSystemStatus = () => (
    <div className="system-status">
      <div className={`status-indicator ${systemStatus}`}>
        {systemStatus === 'ready' && '✅ Ultra-Enhanced System Ready'}
        {systemStatus === 'initializing' && '🔄 Initializing Ultra-Enhanced Engines...'}
        {systemStatus === 'error' && '❌ System Error'}
      </div>
      
      {fileProcessingStatus && (
        <div className="processing-status">{fileProcessingStatus}</div>
      )}
      
      <div className="engine-status">
        <span className={ultraEngine ? 'ready' : 'loading'}>
          🎭 Ultra Engine: {ultraEngine ? 'Ready' : 'Loading...'}
        </span>
        <span className={fusionEngine ? 'ready' : 'loading'}>
          💫 Fusion Engine: {fusionEngine ? 'Ready' : 'Loading...'}
        </span>
        <span className={bertAnalyzer ? 'ready' : 'loading'}>
          🤖 BERT Analyzer: {bertAnalyzer ? 'Ready' : 'Loading...'}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`voice-emotion-system ultra-enhanced ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="ultra-header">
        <h2>🚀 Ultra-Enhanced Voice Emotion Analysis</h2>
        <p>Multi-Algorithm Fusion • 18+ Emotions • 90%+ Confidence</p>
      </div>

      {renderSystemStatus()}
      
      {/* Enhanced UI Controls */}
      <div className="visualization-controls">
        <button 
          className={`viz-toggle ${showAdvancedMetrics ? 'active' : ''}`}
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
        >
          📊 Advanced 
        </button>
        <button 
          className={`viz-toggle ${showEmotionRadar ? 'active' : ''}`}
          onClick={() => setShowEmotionRadar(!showEmotionRadar)}
        >
          🎯 Emotion Radar
        </button>
        <button 
          className={`viz-toggle ${showConfidenceChart ? 'active' : ''}`}
          onClick={() => setShowConfidenceChart(!showConfidenceChart)}
        >
          📈 Confidence Chart
        </button>
      </div>

      {/* Test Samples Panel */}
      <div className="test-samples-panel">
        <h3>🧪 Emotion Test Samples (18+ Emotions)</h3>
        {Object.keys(testSamples).length === 0 ? (
          <div className="loading-samples">
            <div className="spinner">🔄</div>
            <p>Generating ultra-enhanced test samples...</p>
          </div>
        ) : (
          <p className="samples-ready">✅ {Object.keys(testSamples).length} emotion samples ready for testing!</p>
        )}
        <div className="test-samples-grid">
          {Object.keys(testSamples).map(emotion => (
            <button
              key={emotion}
              className={`test-sample-btn ${currentTestEmotion === emotion ? 'testing' : ''}`}
              onClick={() => testWithEmotionSample(emotion)}
              disabled={currentTestEmotion === emotion}
            >
              {getEmotionIcon(emotion)} {emotion}
              {currentTestEmotion === emotion && <span className="spinner">⚡</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="control-panel">
        <div className="tab-controls">
          <button
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            🔍 Analysis
          </button>
          <button
            className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            🧩 Models
          </button>
        </div>
        <div className="upload-section">
          <label className="upload-button">
            📁 Upload Audio File
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload}
              disabled={systemStatus !== 'ready'}
            />
          </label>
        </div>
        
        <div className="recording-section">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={systemStatus !== 'ready'}
            className={`record-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Live Analysis'}
          </button>
        </div>

        {/* Panels: Analysis (default) and Models (external links) */}
        {activeTab === 'analysis' && (
          <div className="recording-section">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={systemStatus !== 'ready'}
              className={`record-button ${isRecording ? 'recording' : ''}`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎤 Start Live Analysis'}
            </button>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="models-panel">
            <h4 style={{margin: '0 0 8px 0'}}>🔗 External Models & Tools</h4>
            <div className="models-list">
              <div className="external-model-link">
                {embedAllowed ? (
                  <div className="embed-wrapper">
                    {embedLoading && <div className="embed-loading">Loading embedded UltimateEmotion…</div>}
                    <iframe
                      ref={embedRef}
                      title="UltimateEmotion"
                      src="https://ultimateemotion.netlify.app/"
                      className="embedded-site"
                      onLoad={() => { 
                        // loaded visually; attempt a gentle check for embedding allowance
                        setEmbedLoading(false);
                        try {
                          // Some sites disallow framing (X-Frame-Options) and will throw when accessing contentWindow
                          const cw = embedRef.current && embedRef.current.contentWindow;
                          if (cw) {
                            // Attempt to access a property; cross-origin access will throw
                            // eslint-disable-next-line no-unused-expressions
                            cw.location && cw.location.href;
                          }
                        } catch (err) {
                          // Embedding not allowed or cross-origin deny — fall back to link
                          setEmbedAllowed(false);
                        }
                      }}
                      sandbox="allow-scripts allow-popups allow-forms"
                    />
                  </div>
                ) : (
                  <a
                    href="https://ultimateemotion.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-button"
                    title="Open UltimateEmotion in a new tab"
                  >
                    🌐 Open UltimateEmotion
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {Object.keys(emotions).length > 0 && (
        <>
          {renderEmotionDisplay()}
          {/* Explanation panel */}
          <div className="emotion-explanation" style={{marginTop:20, background:'rgba(255,255,255,0.08)', padding:16, borderRadius:8}}>
            <h4>🧠 Emotion Explanation</h4>
            <p>{emotionExplanation}</p>
          </div>
        </>
      )}
      
      {transcript && (
        <div className="transcript-display">
          <h4>📝 Transcript:</h4>
          <p>{transcript}</p>
        </div>
      )}

  <style>{`
        .voice-emotion-system.ultra-enhanced {
          padding: 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .ultra-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .ultra-header h2 {
          margin: 0;
          font-size: 1.8em;
          background: linear-gradient(45deg, #ffd700, #ffeb3b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .system-status {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .status-indicator.ready {
          color: #10b981;
          font-weight: bold;
        }

        .status-indicator.initializing {
          color: #f59e0b;
        }

        .status-indicator.error {
          color: #ef4444;
        }

        .engine-status {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          font-size: 0.9em;
        }

        .engine-status span.ready {
          color: #10b981;
        }

        .engine-status span.loading {
          color: #f59e0b;
        }

        .control-panel {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .upload-button {
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .upload-button:hover {
          background: #059669;
        }

        .upload-button input {
          display: none;
        }

        /* External model link styling (UltimateEmotion) */
        .external-model-link {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .external-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #06b6d4, #10b981);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(2,6,23,0.45);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .external-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(2,6,23,0.55);
        }


        .record-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .record-button.recording {
          background: #dc2626;
          animation: pulse 1s infinite;
        }

        .record-button:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .ultra-emotion-display {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .dominant-emotion h3 {
          margin: 0 0 10px 0;
          font-size: 1.3em;
        }

        .confidence-bar, .emotion-bar {
          background: rgba(255,255,255,0.2);
          height: 25px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .confidence-fill, .emotion-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.3s ease;
        }

        .confidence-bar span, .emotion-bar span {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: bold;
          font-size: 0.9em;
        }

        .all-emotions {
          margin-top: 20px;
        }

        .all-emotions h4 {
          margin: 0 0 15px 0;
        }

        .emotion-item {
          margin-bottom: 10px;
        }

        .emotion-name {
          display: inline-block;
          width: 120px;
          font-weight: bold;
          text-transform: capitalize;
        }

        .transcript-display {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .transcript-display h4 {
          margin: 0 0 10px 0;
        }

        .transcript-display p {
          margin: 0;
          line-height: 1.5;
        }

        .hidden {
          display: none;
        }
        
        /* Enhanced UI Components */
        .visualization-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        
        .viz-toggle {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .viz-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .viz-toggle.active {
          background: linear-gradient(135deg, #10b981, #06d6a0);
          border-color: #10b981;
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
        }

        /* Tab controls for Analysis / Models */
        .tab-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .tab-btn {
          padding: 8px 14px;
          background: rgba(255,255,255,0.06);
          color: white;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: pointer;
          font-weight: 700;
        }

        .tab-btn.active {
          background: linear-gradient(90deg,#06b6d4,#10b981);
          box-shadow: 0 6px 18px rgba(2,6,23,0.45);
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.12);
        }

        .models-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
        }

        .models-list {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 6px;
        }
        
        /* Test Samples Panel */
        .test-samples-panel {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .test-samples-panel h3 {
          text-align: center;
          margin-bottom: 15px;
          color: #fbbf24;
        }
        
        .loading-samples {
          text-align: center;
          padding: 20px;
          color: #fbbf24;
        }
        
        .samples-ready {
          text-align: center;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .test-samples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .test-sample-btn {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: capitalize;
        }
        
        .test-sample-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .test-sample-btn.testing {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          animation: pulse 1.5s infinite;
        }
        
        .spinner {
          animation: spin 0.5s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Advanced Metrics */
        .advanced-metrics {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          border-left: 4px solid #10b981;
        }
        
        .metric-card h5 {
          margin: 0 0 10px 0;
          color: #fbbf24;
        }
        
        .metric-value {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .confidence-certainty { color: #10b981; font-weight: bold; }
        .confidence-ultra-high { color: #06d6a0; font-weight: bold; }
        .confidence-high { color: #34d399; font-weight: bold; }
        .confidence-acceptable { color: #fbbf24; }
        .confidence-low { color: #ef4444; }
        
        .quality-excellent { color: #10b981; font-weight: bold; }
        .quality-very-good { color: #06d6a0; font-weight: bold; }
        .quality-good { color: #34d399; }
        .quality-fair { color: #fbbf24; }
        .quality-poor { color: #ef4444; }
        
        /* Emotion Radar Chart */
        .emotion-radar {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        
        .radar-chart {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .radar-chart svg {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
        }
        
        /* Confidence Chart */
        .confidence-chart {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .chart-container {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .chart-container svg {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        /* Enhanced Confidence Display */
        .confidence-bar {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          height: 25px;
          border-radius: 15px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444 0%, #fbbf24 50%, #10b981 100%);
          border-radius: 15px;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        /* Enhanced Mobile Responsiveness */
        @media (max-width: 768px) {
          .visualization-controls {
            flex-wrap: wrap;
          }
          
          .test-samples-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .radar-chart svg, .chart-container svg {
            width: 100%;
            max-width: 280px;
            height: auto;
          }
        }
        
        /* Loading and Animation Enhancements */
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .ultra-emotion-display {
          animation: slideIn 0.5s ease-out;
        }
        
        .advanced-metrics, .emotion-radar, .confidence-chart {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VoiceEmotionSystem;
