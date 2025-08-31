import React, { useState, useRef, useEffect } from 'react';
import { loadModelLocal } from '../utils/tfVoiceClassifier';
import { processAudioFile } from '../utils/fileProcessors';

// Enhanced Voice Emotion Analyzer with proper BERT integration and pitch analysis
const EnhancedVoiceEmotionAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceAnalysis, setVoiceAnalysis] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bertIntegration, setBertIntegration] = useState(true);
  const [pitchCalibration, setPitchCalibration] = useState({
    userBaseline: null,
    calibrated: false
  });
  const [trainingMode, setTrainingMode] = useState(false);
  const [targetEmotion, setTargetEmotion] = useState('anger');
  const [trainingResults, setTrainingResults] = useState([]);
  const [mlModel, setMlModel] = useState(null);
  const [mlLabelsMap, setMlLabelsMap] = useState(null);
  const [mlNorm, setMlNorm] = useState(null);
  const [useMlDetection, setUseMlDetection] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const pitchDataRef = useRef([]);
  // Exponential moving average state for smoothing features
  const featureEmaRef = useRef({ pitch: null, rmsEnergy: null, zeroCrossingRate: null, speechRate: null });
  // Recent predictions buffer for temporal smoothing
  const predictionHistoryRef = useRef([]); // { label, confidence, ts }

  // Enhanced BERT-integrated emotion patterns with pitch context
  const enhancedEmotionPatterns = {
    joy: {
      textPatterns: [
        /\b(happy|excited|wonderful|amazing|fantastic|great|awesome|love|enjoy|delighted|thrilled|cheerful|joyful|pleased|glad|elated|brilliant|excellent|perfect)\b/gi,
        /\b(yay|hooray|wow|yes|definitely|absolutely|certainly|incredible|terrific|outstanding|superb|magnificent|marvelous)\b/gi,
        /\b(celebrate|celebration|party|fun|laughter|smile|laughing|smiling|cheering|upbeat|positive|optimistic)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 160, max: 380, optimal: 240 },
        energyLevel: { min: 0.5, max: 1.0 },
        speechRate: { min: 1.0, max: 2.0 },
        tonalVariation: { min: 0.6, max: 1.0 }
      },
      bertWeight: 0.35,
      voiceWeight: 0.65
    },
    sadness: {
      textPatterns: [
        /\b(sad|depressed|upset|disappointed|hurt|miserable|unhappy|sorrowful|gloomy|dejected|melancholy|blue|down|low)\b/gi,
        /\b(terrible|awful|horrible|devastating|heartbreaking|tragic|unfortunate|hopeless|despair|lonely|empty|broken)\b/gi,
        /\b(crying|tears|weeping|sobbing|grieving|mourning|sorrow|regret|loss|grief|anguish|pain|suffering)\b/gi,
        /\b(failed|failure|lost|losing|gone|dead|died|death|goodbye|farewell|end|over|finished)\b/gi,
        /\b(nobody cares|no one understands|feel alone|all alone|can't go on|give up|what's the point|worthless|useless)\b/gi,
        /\b(miss you|missing|longing|wish|if only|should have|could have|regret|mistake|fault|blame)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 80, max: 240, optimal: 140 },
        energyLevel: { min: 0.05, max: 0.45 },
        speechRate: { min: 0.4, max: 1.1 },
        tonalVariation: { min: 0.1, max: 0.5 }
      },
      bertWeight: 0.35,
      voiceWeight: 0.65
    },
    anger: {
      textPatterns: [
        // Core anger words with expanded patterns
        /\b(angry|mad|furious|irritated|annoyed|frustrated|outraged|livid|enraged|irate|hostile|pissed|rage|raging|riled|steamed|boiling)\b/gi,
        /\b(hate|disgusted|appalled|infuriated|incensed|aggravated|fed up|sick of|can't stand|fed up with|had enough|done with)\b/gi,
        /\b(damn|hell|stupid|ridiculous|unacceptable|outrageous|bullshit|crap|nonsense|idiotic|moronic|insane|crazy|pathetic)\b/gi,
        /\b(fight|violence|kill|destroy|smash|break|punch|hit|attack|warfare|battle|crush|demolish|annihilate)\b/gi,
        
        // Angry expressions and exclamations
        /\b(what the hell|what the fuck|are you kidding me|you've got to be kidding|this is bullshit|enough is enough)\b/gi,
        /\b(shut up|get lost|go away|leave me alone|I don't care|whatever|screw this|screw you|forget it)\b/gi,
        /\b(why me|why now|not again|seriously|come on|give me a break|this sucks|this is terrible)\b/gi,
        
        // Aggressive confrontational language
        /\b(listen here|how dare you|who do you think|you better|I swear|mark my words|I'll show you)\b/gi,
        /\b(threatening|warning|demanding|insisting|ordering|commanding|forcing|making me)\b/gi,
        
        // Frustration and impatience
        /\b(hurry up|move it|get on with it|speed up|faster|now|immediately|right now|this instant)\b/gi,
        /\b(waited long enough|wasting my time|taking forever|slow as hell|what's taking so long)\b/gi,
        
        // Blame and accusation patterns
        /\b(your fault|you did this|you caused|you're responsible|you screwed up|you messed up|you ruined)\b/gi,
        /\b(always doing|never listen|don't understand|don't get it|typical|figures|of course)\b/gi,
        
        // Intensity amplifiers with angry context
        /\b(absolutely furious|completely mad|totally pissed|extremely angry|really mad|so angry|very upset)\b/gi,
        /\b(can't believe|unbelievable|impossible|ridiculous|outrageous|insane|crazy|nuts)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 200, max: 500, optimal: 350 }, // Higher pitch range for anger
        energyLevel: { min: 0.75, max: 1.0 }, // Very high energy for anger
        speechRate: { min: 1.2, max: 3.0 }, // Fast, aggressive speech
        tonalVariation: { min: 0.8, max: 1.0 }, // High variation, harsh tones
        volumeSpikes: { threshold: 0.8, frequency: 3 }, // Volume spikes indicator
        harshConsonants: { threshold: 0.6 } // Harsh consonant emphasis
      },
      bertWeight: 0.3, // Slightly more weight on voice for anger
      voiceWeight: 0.7
    },
    fear: {
      textPatterns: [
        /\b(afraid|scared|terrified|frightened|anxious|worried|nervous|panicked|alarmed|concerned|fearful|petrified|horrified)\b/gi,
        /\b(dangerous|risky|threatening|unsafe|insecure|vulnerable|terror|horror|nightmare|phobia|creepy|spooky|eerie)\b/gi,
        /\b(what if|might happen|could go wrong|disaster|catastrophe|emergency|crisis|panic|stress|anxiety|dread|doom)\b/gi,
        /\b(help me|save me|someone help|call for help|need help|rescue|escape|run away|hide|get away)\b/gi,
        /\b(can't breathe|heart racing|shaking|trembling|sweating|freezing|paralyzed|stuck|trapped|cornered)\b/gi,
        /\b(monster|ghost|demon|evil|dark|darkness|shadow|unknown|stranger|stalker|killer|death|dying)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 180, max: 480, optimal: 340 },
        energyLevel: { min: 0.2, max: 0.9 },
        speechRate: { min: 1.1, max: 2.8 },
        tonalVariation: { min: 0.4, max: 1.0 }
      },
      bertWeight: 0.25,
      voiceWeight: 0.75
    },
    surprise: {
      textPatterns: [
        /\b(surprised|shocked|amazed|astonished|stunned|bewildered|confused|unexpected|sudden|startled|flabbergasted)\b/gi,
        /\b(suddenly|all of a sudden|out of nowhere|didn't expect|never thought|can't believe|who would have thought)\b/gi,
        /\b(wow|oh my|really|seriously|no way|unbelievable|incredible|extraordinary|mind-blowing|jaw-dropping)\b/gi,
        /\b(what|how|when|where|why|huh|eh|wait|hold on|hang on|stop|pause|excuse me)\b/gi,
        /\b(never seen|first time|brand new|just discovered|just found out|just learned|just realized|just noticed)\b/gi,
        /\b(plot twist|curveball|bombshell|revelation|discovery|breakthrough|game changer|turning point)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 200, max: 550, optimal: 400 },
        energyLevel: { min: 0.3, max: 1.0 },
        speechRate: { min: 0.6, max: 2.2 },
        tonalVariation: { min: 0.5, max: 1.0 }
      },
      bertWeight: 0.2,
      voiceWeight: 0.8
    },
    neutral: {
      textPatterns: [
        /\b(okay|fine|normal|regular|standard|typical|usual|ordinary|average|alright)\b/gi,
        /\b(just|simply|basically|essentially|generally|probably|maybe|perhaps|suppose)\b/gi,
        /\b(think|believe|consider|assume|imagine|understand|know|see|hear)\b/gi
      ],
      voiceFeatures: {
        pitchRange: { min: 140, max: 280, optimal: 200 },
        energyLevel: { min: 0.2, max: 0.7 },
        speechRate: { min: 0.8, max: 1.4 },
        tonalVariation: { min: 0.2, max: 0.6 }
      },
      bertWeight: 0.5,
      voiceWeight: 0.5
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    // Load analysis history
    const savedHistory = localStorage.getItem('voiceEmotionHistory');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading analysis history:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Enhanced pitch analysis with auto-calibration and user calibration
  const analyzePitchWithCalibration = (audioBuffer) => {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const frameSize = 2048;
    const hopSize = 512;
    const pitchData = [];

    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
      const pitch = estimatePitch(frame, sampleRate);
      if (pitch > 50 && pitch < 800) { // Valid pitch range
        pitchData.push(pitch);
      }
    }

    pitchDataRef.current = pitchData;

    // Calculate pitch statistics
    if (pitchData.length === 0) return null;

    const avgPitch = pitchData.reduce((sum, p) => sum + p, 0) / pitchData.length;
    const minPitch = Math.min(...pitchData);
    const maxPitch = Math.max(...pitchData);
    const pitchVariation = (maxPitch - minPitch) / avgPitch;

    // Auto-calibration: If no user baseline is set, use first recording as baseline
    let calibratedPitch = avgPitch;
    let isAutoCalibrated = false;
    
    if (!pitchCalibration.userBaseline && !pitchCalibration.calibrated) {
      // Auto-set baseline from first recording
      setPitchCalibration({
        userBaseline: avgPitch,
        calibrated: true,
        autoCalibrated: true
      });
      localStorage.setItem('pitchCalibration', JSON.stringify({
        userBaseline: avgPitch,
        calibrated: true,
        autoCalibrated: true
      }));
      calibratedPitch = avgPitch;
      isAutoCalibrated = true;
    } else if (pitchCalibration.userBaseline && pitchCalibration.calibrated) {
      // Use existing calibration
      const baselineRatio = avgPitch / pitchCalibration.userBaseline;
      calibratedPitch = avgPitch * (1 / baselineRatio); // Normalize to baseline
    }

    return {
      average: avgPitch,
      calibrated: calibratedPitch,
      min: minPitch,
      max: maxPitch,
      variation: pitchVariation,
      data: pitchData,
      autoCalibrated: isAutoCalibrated
    };
  };

  // Helper: update EMA
  const emaUpdate = (key, value, alpha = 0.35) => {
    const state = featureEmaRef.current;
    if (state[key] == null || Number.isNaN(state[key])) state[key] = value;
    else state[key] = alpha * value + (1 - alpha) * state[key];
    return state[key];
  };

  // Helper: compute smoothed decision from recent prediction history
  const computeSmoothedDecision = (history, windowMs = 2500) => {
    const cutoff = Date.now() - windowMs;
    const recent = history.filter(h => h.ts >= cutoff);
    if (recent.length === 0) return null;
    // aggregate by label: average confidence and count
    const agg = {};
    recent.forEach(r => {
      if (!agg[r.label]) agg[r.label] = { sum: 0, count: 0 };
      agg[r.label].sum += r.confidence || 0;
      agg[r.label].count += 1;
    });
    const entries = Object.entries(agg).map(([label, v]) => ({ label, avg: v.sum / v.count, count: v.count }));
    entries.sort((a,b) => (b.avg * b.count) - (a.avg * a.count));
    const best = entries[0];
    // require at least 2 votes or a strong average
    if (best.count >= 2 || best.avg > 0.75) return { label: best.label, confidence: Math.min(0.99, best.avg) };
    return null;
  };

  // Simple pitch estimation using autocorrelation
  const estimatePitch = (audioData, sampleRate) => {
    const minPeriod = Math.floor(sampleRate / 800); // 800 Hz max
    const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min
    
    let bestCorrelation = 0;
    let bestPeriod = 0;
    
    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  };

  // Use the shared BERT API util for text scoring and map results into our detection pipeline
  // Returns an object { emotion, confidence, scores, source }
  const analyzeEmotionWithBERT = async (text, voiceFeatures) => {
    // call the shared util which will try a remote HF endpoint then fallback to lexical matching
    try {
      const res = await import('../utils/bertEmotionApi').then(m => m.analyzeEmotionWithBERT(text));
      // res: { map: {label:score}, array: [{label,score}] }
      const map = res.map || {};
      // integrate voice features by boosting mapped labels when voice strongly indicates same emotion
      const combined = {};
      Object.keys(enhancedEmotionPatterns).forEach(label => {
        const textScore = map[label] || 0;
        combined[label] = { textScore, voiceScore: 0, combinedScore: 0 };
      });

      // compute voiceScore similarly to previous logic but normalized to 0..1
      if (voiceFeatures) {
        Object.entries(enhancedEmotionPatterns).forEach(([emotion, pattern]) => {
          let voiceScore = 0;
          const features = pattern.voiceFeatures;
          const pitchToAnalyze = voiceFeatures.pitch && (voiceFeatures.pitch.calibrated || voiceFeatures.pitch.average) ? (voiceFeatures.pitch.calibrated || voiceFeatures.pitch.average) : (voiceFeatures.pitch || 0);
          if (pitchToAnalyze >= features.pitchRange.min && pitchToAnalyze <= features.pitchRange.max) {
            const pitchOptimalDistance = Math.abs(pitchToAnalyze - features.pitchRange.optimal);
            const maxDistance = Math.max(
              features.pitchRange.optimal - features.pitchRange.min,
              features.pitchRange.max - features.pitchRange.optimal
            );
            const pitchScore = Math.max(0, 1 - (pitchOptimalDistance / Math.max(1, maxDistance)));
            voiceScore += pitchScore * 0.6;
          }
          if (voiceFeatures.energy != null && features.energyLevel) {
            const energyOptimal = (features.energyLevel.min + features.energyLevel.max) / 2;
            const energyDistance = Math.abs((voiceFeatures.energy || 0) - energyOptimal);
            const energyRange = Math.max(0.01, features.energyLevel.max - features.energyLevel.min);
            const energyScore = Math.max(0, 1 - (energyDistance / energyRange));
            voiceScore += energyScore * 0.5;
          }
          if (voiceFeatures.pitch && voiceFeatures.pitch.variation != null) {
            if (voiceFeatures.pitch.variation >= features.tonalVariation.min && voiceFeatures.pitch.variation <= features.tonalVariation.max) voiceScore += 0.25;
          }
          // clamp voiceScore to 0..1
          voiceScore = Math.max(0, Math.min(1, voiceScore));
          combined[emotion].voiceScore = voiceScore;
        });
      }

      // Combine text and voice scores using pattern weights, then normalize
      const rawCombined = {};
      Object.entries(enhancedEmotionPatterns).forEach(([emotion, pattern]) => {
        const t = combined[emotion].textScore || 0;
        const v = combined[emotion].voiceScore || 0;
        const wText = pattern.bertWeight || 0.4;
        const wVoice = pattern.voiceWeight || 0.6;
        rawCombined[emotion] = (t * wText) + (v * wVoice);
      });

      // Normalize across all emotions to 0..1
      const sum = Object.values(rawCombined).reduce((s, v) => s + (v || 0), 0) || 1;
      const normalized = {};
      Object.keys(rawCombined).forEach(k => normalized[k] = Math.min(1, (rawCombined[k] || 0) / sum));

      // Sarcasm adjustment: if lexical indicates sarcasm, reduce positive labels
      const sarcasmHints = /\b(yeah right|sure|great job|fantastic|as if|nice going)\b/gi;
      const sarcasmDetected = (text && sarcasmHints.test(text)) && (voiceFeatures && (voiceFeatures.rmsEnergy || voiceFeatures.energy) < 0.25);
      if (sarcasmDetected) {
        ['joy','surprise'].forEach(pos => normalized[pos] = (normalized[pos] || 0) * 0.5);
      }

      // Confidence: aggregate top scores with voice availability and transcript length
      const entries = Object.entries(normalized).map(([label, score]) => ({ label, score }));
      entries.sort((a,b) => b.score - a.score);
      const top = entries[0] || { label: 'neutral', score: 0 };
      let confidence = Math.min(0.98, Math.max(0.4, top.score + 0.15));
      if (voiceFeatures) confidence = Math.min(0.99, confidence + 0.06);
      if (text && text.length > 50) confidence = Math.min(0.99, confidence + 0.03);

      const result = { emotion: top.label, confidence, scores: normalized, source: voiceFeatures ? 'bert-voice-integrated' : 'bert-text-only' };
      return result;
    } catch (err) {
      console.warn('BERT analysis wrapper failed, falling back to lexical scoring', err);
      // fallback quick mapping
      const fallback = { emotion: 'neutral', confidence: 0.6, scores: { neutral: 0.6 }, source: 'fallback' };
      return fallback;
    }
  };

  // Start recording with enhanced audio analysis
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Setup audio context for real-time analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Record in 100ms chunks
      setIsRecording(true);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please ensure microphone permissions are granted.');
    }
  };

  // Stop recording and analyze
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  // Handle user selecting an audio file to analyze
  const handleFileUpload = async (e) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('audio')) {
      alert('Please select a valid audio file (wav, mp3, m4a, etc.)');
      e.target.value = '';
      return;
    }
    try {
      // Ensure AudioContext exists for decoding
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Attempt to transcribe the uploaded file using fileProcessors helper
      let extracted = null;
      try {
        extracted = await processAudioFile(file, (p) => {
          // show lightweight progress in console (could be wired to UI)
          console.debug('[fileProcessors]', p);
        }, 'en-US');
      } catch (procErr) {
        console.warn('File transcription failed, proceeding without transcript', procErr);
        extracted = null;
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: file.type });
      setIsAnalyzing(true);
      // If processAudioFile returned a string result (transcript), pass it
      const providedTranscript = typeof extracted === 'string' ? extracted : null;
      await processAudio(audioBlob, providedTranscript);
    } catch (err) {
      console.error('Failed to analyze uploaded audio file', err);
      alert('Failed to analyze audio file: ' + (err && err.message ? err.message : String(err)));
    } finally {
      // allow the same file to be selected again
      if (e && e.target) e.target.value = '';
      setIsAnalyzing(false);
    }
  };

  // Process audio and analyze emotions with enhanced voice feature extraction
  // accepts optional providedTranscript so file uploads can supply a transcript
  const processAudio = async (audioBlob, providedTranscript = null) => {
    setIsAnalyzing(true);
    if (providedTranscript) {
      // update UI transcript immediately
      try { setTranscript(providedTranscript); } catch (e) { /* ignore */ }
    }

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Analyze pitch with calibration
      const pitchAnalysis = analyzePitchWithCalibration(audioBuffer);
      
      // Enhanced voice features calculation
      const channelData = audioBuffer.getChannelData(0);
      
      // Calculate energy (volume) with more precision
      const energy = channelData.reduce((sum, sample) => sum + Math.abs(sample), 0) / channelData.length;
      
      // Calculate RMS energy for better loudness detection
      const rmsEnergy = Math.sqrt(channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length);
      
      // Detect volume spikes (anger indicator)
      const frameSize = 1024;
      const volumeSpikes = [];
      for (let i = 0; i < channelData.length - frameSize; i += frameSize) {
        const frame = channelData.slice(i, i + frameSize);
        const frameEnergy = frame.reduce((sum, sample) => sum + Math.abs(sample), 0) / frameSize;
        if (frameEnergy > energy * 1.5) { // Spike detection
          volumeSpikes.push(frameEnergy);
        }
      }
      
      // Calculate zero crossing rate (rough approximation of harshness)
      let zeroCrossings = 0;
      for (let i = 1; i < channelData.length; i++) {
        if ((channelData[i-1] >= 0) !== (channelData[i] >= 0)) {
          zeroCrossings++;
        }
      }
      const zeroCrossingRate = zeroCrossings / channelData.length;
      
      // Estimate speech rate (rough approximation)
  // Use provided transcript when available (uploaded file), otherwise live transcript
  const activeTranscript = providedTranscript !== null ? providedTranscript : transcript;
  const speechRate = activeTranscript ? activeTranscript.split(/\s+/).length / audioBuffer.duration : 1.0;
      
      const voiceFeatures = {
        pitch: pitchAnalysis,
        energy: energy,
        rmsEnergy: rmsEnergy,
        duration: audioBuffer.duration,
        volumeSpikes: {
          count: volumeSpikes.length,
          avgIntensity: volumeSpikes.length > 0 ? volumeSpikes.reduce((a, b) => a + b, 0) / volumeSpikes.length : 0
        },
        zeroCrossingRate: zeroCrossingRate,
        speech: {
          rate: speechRate,
          wordsPerSecond: activeTranscript ? activeTranscript.split(/\s+/).length / audioBuffer.duration : 0
        }
      };

      // If ML model is loaded and enabled, attempt prediction
      let mlPrediction = null;
      try {
        if (useMlDetection && mlModel && mlLabelsMap) {
          // Build feature vector compatible with training: pitch (average), volume, spectralCentroid approx, mfcc zeros
          const pitchVal = pitchAnalysis.average || 0;
          const volumeVal = rmsEnergy || energy || 0;
          const spectralApprox = zeroCrossingRate * 2000; // heuristic mapping
          const mfccMeans = new Array((mlNorm && mlNorm.stds ? Math.max(0, mlNorm.stds.length - 3) : 13)).fill(0);
          const row = [pitchVal, volumeVal, spectralApprox, ...mfccMeans];
          // normalize using mlNorm if available
          let normRow = row;
          if (mlNorm && mlNorm.means && mlNorm.stds) {
            normRow = row.map((v, j) => ((v || 0) - (mlNorm.means[j] || 0)) / (mlNorm.stds[j] || 1));
          }
          // create tensor and predict
          const tf = await import('@tensorflow/tfjs');
          const t = tf.tensor2d([normRow]);
          const out = mlModel.predict(t);
          const probs = out.arraySync ? out.arraySync()[0] : await out.data();
          // map probs to labels using labelsMap ordering
          const labels = Object.keys(mlLabelsMap).sort((a,b)=> mlLabelsMap[a]-mlLabelsMap[b]);
          const idx = probs.indexOf(Math.max(...probs));
          mlPrediction = { label: labels[idx] || null, probabilities: probs, confidence: Math.max(...probs) };
        }
      } catch (mlErr) {
        console.warn('ML prediction failed in live analyzer', mlErr);
        mlPrediction = null;
      }

  // Perform BERT-integrated emotion analysis (await wrapper)
  let emotionAnalysis = await analyzeEmotionWithBERT(activeTranscript, voiceFeatures);

      // Smooth raw features via EMA to reduce spurious spikes
      const smPitch = emaUpdate('pitch', voiceFeatures.pitch && voiceFeatures.pitch.average ? voiceFeatures.pitch.average : voiceFeatures.pitch || 0);
      const smRms = emaUpdate('rmsEnergy', voiceFeatures.rmsEnergy || voiceFeatures.energy || 0);
      const smZcr = emaUpdate('zeroCrossingRate', voiceFeatures.zeroCrossingRate || 0);
      const smSpeechRate = emaUpdate('speechRate', voiceFeatures.speech ? voiceFeatures.speech.rate : 0);
      // apply smoothed values back
      voiceFeatures.smoothed = { pitch: smPitch, rmsEnergy: smRms, zeroCrossingRate: smZcr, speechRate: smSpeechRate };

      // Sarcasm heuristic: strong positive words with negative tone -> mark as sarcastic and lower text score
      const sarcasmHints = /\b(yeah right|sure|great job|fantastic|as if|nice going)\b/gi;
      const sarcasmDetected = (transcript && sarcasmHints.test(transcript)) && (voiceFeatures.smoothed.rmsEnergy < 0.2);
      if (sarcasmDetected) {
        if (emotionAnalysis && emotionAnalysis.scores) {
          // reduce positive scores
          Object.keys(emotionAnalysis.scores).forEach(k => { emotionAnalysis.scores[k] = (emotionAnalysis.scores[k] || 0) * 0.6; });
        }
        if (emotionAnalysis && emotionAnalysis.emotion === 'joy') {
          // lower confidence to avoid false joy
          emotionAnalysis.confidence = Math.min(0.5, emotionAnalysis.confidence || 0.5);
        }
      }

      // If ML gave a confident prediction, queue it into history and use temporal smoothing before override
      if (mlPrediction && mlPrediction.label) {
        // stricter threshold for immediate override
        if (mlPrediction.confidence > 0.8) {
          // add to temporary history
          predictionHistoryRef.current.push({ label: mlPrediction.label, confidence: mlPrediction.confidence, ts: Date.now() });
        }
        // keep history window reasonable
        predictionHistoryRef.current = predictionHistoryRef.current.slice(-12);
        const smoothed = computeSmoothedDecision(predictionHistoryRef.current, 3000);
        if (smoothed) {
          emotionAnalysis = {
            emotion: smoothed.label,
            confidence: smoothed.confidence,
            scores: {},
            source: 'ml-voice-smoothed'
          };
        }
      }
      
      const analysis = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        transcript: activeTranscript,
        voiceFeatures: voiceFeatures,
  emotion: emotionAnalysis,
  mlPrediction: mlPrediction,
        audioData: audioBlob,
        bertIntegrated: bertIntegration,
        calibrated: pitchCalibration.calibrated
      };

      setCurrentAnalysis(analysis);
      setVoiceAnalysis(analysis);
      
      // Training mode evaluation
      if (trainingMode) {
        const isCorrect = analysis.emotion.emotion === targetEmotion;
        const trainingResult = {
          target: targetEmotion,
          detected: analysis.emotion.emotion,
          confidence: analysis.emotion.confidence,
          correct: isCorrect,
          timestamp: new Date().toISOString()
        };
        setTrainingResults(prev => [trainingResult, ...prev].slice(0, 10));
      }
      
      // Save to history
      const newHistory = [analysis, ...analysisHistory].slice(0, 50); // Keep last 50
      setAnalysisHistory(newHistory);
      localStorage.setItem('voiceEmotionHistory', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error('Error processing audio:', error);
    }
    
    setIsAnalyzing(false);
  };

  // Calibrate user's baseline pitch
  const calibrateBaseline = () => {
    if (currentAnalysis && currentAnalysis.voiceFeatures.pitch) {
      const baseline = currentAnalysis.voiceFeatures.pitch.average;
      setPitchCalibration({
        userBaseline: baseline,
        calibrated: true
      });
      localStorage.setItem('pitchCalibration', JSON.stringify({
        userBaseline: baseline,
        calibrated: true
      }));
    }
  };

  // Load calibration on mount
  useEffect(() => {
    const savedCalibration = localStorage.getItem('pitchCalibration');
    if (savedCalibration) {
      try {
        setPitchCalibration(JSON.parse(savedCalibration));
      } catch (error) {
        console.error('Error loading pitch calibration:', error);
      }
    }
  }, []);

  // Get emotion color
  const getEmotionColor = (emotion) => {
    const colors = {
      joy: '#22c55e',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#f59e0b',
      surprise: '#8b5cf6',
      neutral: '#6b7280'
    };
    return colors[emotion] || colors.neutral;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '24px',
      color: '#fff',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '2em',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎤 Enhanced Voice Emotion Analyzer
        </h2>
        <p style={{
          fontSize: '1.1em',
          opacity: 0.9,
          margin: 0
        }}>
          Advanced BERT-integrated emotion detection with pitch calibration
        </p>
      </div>

      {/* Calibration Status */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2em' }}>
          🎯 Pitch Calibration Status
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            background: pitchCalibration.calibrated ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${pitchCalibration.calibrated ? '#22c55e' : '#fbbf24'}`
          }}>
            {pitchCalibration.calibrated ? 
              (pitchCalibration.autoCalibrated ? '✅ Auto-Calibrated' : '✅ User Calibrated') : 
              '⚠️ Will Auto-Calibrate'}
          </div>
          {pitchCalibration.userBaseline && (
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
              Baseline: {pitchCalibration.userBaseline.toFixed(1)} Hz
              {pitchCalibration.autoCalibrated && ' (Auto)'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={async () => {
                // load model metadata
                const meta = localStorage.getItem('local-voice-model_meta');
                if (meta) {
                  try {
                    const parsed = JSON.parse(meta);
                    setMlLabelsMap(parsed.labelsMap || null);
                    setMlNorm(parsed.norm || null);
                  } catch (e) { console.warn('Failed to parse ML meta', e); }
                }
                try {
                  const m = await loadModelLocal('local-voice-model');
                  if (m) {
                    setMlModel(m);
                    setTrainingResults(prev => [{ target: 'model', detected: 'loaded', correct: true, confidence: 1, timestamp: new Date().toISOString() }, ...prev].slice(0,10));
                    alert('ML model loaded');
                  } else {
                    alert('No ML model found in local storage');
                  }
                } catch (e) { console.warn('Failed to load model', e); alert('Failed to load model'); }
              }}
              style={{ background: 'rgba(59,130,246,0.8)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px' }}
            >
              🧠 Load ML Model
            </button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={useMlDetection} onChange={(e) => setUseMlDetection(e.target.checked)} /> Use ML Detection
            </label>
          </div>
          {currentAnalysis && (
            <button
              onClick={calibrateBaseline}
              style={{
                background: 'rgba(34, 197, 94, 0.7)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              📊 Update Baseline
            </button>
          )}
          {pitchCalibration.calibrated && (
            <button
              onClick={() => {
                setPitchCalibration({ userBaseline: null, calibrated: false });
                localStorage.removeItem('pitchCalibration');
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.7)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              🔄 Reset
            </button>
          )}
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '0.85em',
          opacity: 0.7,
          fontStyle: 'italic'
        }}>
          {!pitchCalibration.calibrated 
            ? 'Your first recording will automatically set your baseline pitch for improved accuracy.'
            : 'Calibration improves emotion detection accuracy by adapting to your unique voice characteristics.'
          }
        </div>
      </div>

      {/* Training Mode */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>🎯 Emotion Training Mode</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={trainingMode}
              onChange={(e) => setTrainingMode(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>Enable Training Mode</span>
          </div>
          
          {trainingMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Target Emotion:</span>
              <select
                value={targetEmotion}
                onChange={(e) => setTargetEmotion(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px'
                }}
              >
                <option value="anger">😠 Anger</option>
                <option value="sadness">😢 Sadness</option>
                <option value="joy">😊 Joy</option>
                <option value="fear">😨 Fear</option>
                <option value="surprise">😲 Surprise</option>
                <option value="neutral">😐 Neutral</option>
              </select>
            </div>
          )}
        </div>
        
        {trainingMode && (
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px 0' }}>
              🎭 Practice: {targetEmotion.charAt(0).toUpperCase() + targetEmotion.slice(1)}
            </h4>
            <p style={{ margin: '0', fontSize: '0.9em', opacity: 0.8 }}>
              Try to express <strong>{targetEmotion}</strong> in your voice. 
              {targetEmotion === 'anger' && ' Speak loudly, use high pitch, and sound frustrated or mad.'}
              {targetEmotion === 'sadness' && ' Speak softly, use low pitch, and sound disappointed or hurt.'}
              {targetEmotion === 'joy' && ' Speak with energy, use varied pitch, and sound happy or excited.'}
              {targetEmotion === 'fear' && ' Speak with shaky voice, high pitch, and sound scared or worried.'}
              {targetEmotion === 'surprise' && ' Use sudden high pitch, bursts of energy, and sound amazed.'}
              {targetEmotion === 'neutral' && ' Speak in your normal, calm, everyday voice.'}
            </p>
          </div>
        )}
        
        {trainingResults.length > 0 && trainingMode && (
          <div>
            <h4 style={{ margin: '0 0 12px 0' }}>📊 Training Results</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {trainingResults.map((result, index) => (
                <div key={index} style={{
                  background: result.correct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${result.correct ? '#22c55e' : '#ef4444'}`,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ textTransform: 'capitalize' }}>
                      Target: {result.target} → Detected: {result.detected}
                    </span>
                    <span style={{ marginLeft: '8px', fontSize: '0.9em', opacity: 0.8 }}>
                      ({(result.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2em' }}>
                    {result.correct ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '0.9em', 
              opacity: 0.8,
              textAlign: 'center'
            }}>
              Accuracy: {((trainingResults.filter(r => r.correct).length / trainingResults.length) * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Emotion Training Guide */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>🎭 Emotion Training Guide</h3>
        <p style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '16px' }}>
          For best results, try these voice patterns when testing emotions:
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>😠 Anger</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak loudly and with high energy<br/>
              • Use higher pitch than normal<br/>
              • Speak fast with sharp emphasis<br/>
              • Use words like "angry", "frustrated", "mad"<br/>
              • Add exclamation marks in speech<br/>
              • Example: "I'm so angry! This is ridiculous!"
            </div>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>😢 Sadness</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak softly with low energy<br/>
              • Use lower pitch than normal<br/>
              • Speak slowly and monotone<br/>
              • Use words like "sad", "disappointed", "hurt"<br/>
              • Sound tired or defeated<br/>
              • Example: "I feel so sad and disappointed..."
            </div>
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>😊 Joy</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak with bright, upbeat energy<br/>
              • Use moderate-high pitch<br/>
              • Vary your tone (up and down)<br/>
              • Use words like "happy", "excited", "wonderful"<br/>
              • Sound enthusiastic and lively<br/>
              • Example: "I'm so happy and excited about this!"
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>😨 Fear</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak with shaky, unstable voice<br/>
              • Use high pitch with tremor<br/>
              • Speak fast or hesitantly<br/>
              • Use words like "scared", "afraid", "worried"<br/>
              • Sound nervous or panicked<br/>
              • Example: "I'm really scared and worried about this!"
            </div>
          </div>

          <div style={{
            background: 'rgba(139, 92, 246, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>😲 Surprise</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak with sudden high pitch<br/>
              • Use burst of energy<br/>
              • Vary speech rate (pause then rush)<br/>
              • Use words like "wow", "really?", "unexpected"<br/>
              • Sound startled or amazed<br/>
              • Example: "Wow! That's really surprising!"
            </div>
          </div>

          <div style={{
            background: 'rgba(107, 114, 128, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>😐 Neutral</h4>
            <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
              • Speak in your normal voice<br/>
              • Use regular pitch and energy<br/>
              • Maintain steady pace<br/>
              • Use neutral words like "okay", "fine"<br/>
              • Sound calm and balanced<br/>
              • Example: "This is a normal statement."
            </div>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            style={{
              background: isRecording ? '#ef4444' : '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '1.2em',
              fontWeight: 'bold',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              opacity: isAnalyzing ? 0.7 : 1
            }}
          >
            <span style={{ fontSize: '1.4em' }}>
              {isRecording ? '⏹️' : '🎤'}
            </span>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '8px'
          }}>
            <input
              type="checkbox"
              checked={bertIntegration}
              onChange={(e) => setBertIntegration(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>🧠 BERT Integration</span>
          </div>

          {/* File upload for offline audio analysis */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff'
            }}>📁 Upload Audio</div>
          </label>
        </div>

        {isRecording && (
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '1.1em',
            fontWeight: 600,
            opacity: 0.9
          }}>
            🔴 Recording... 
            {!pitchCalibration.calibrated ? 
              ' This will auto-calibrate your baseline!' : 
              ' Speak naturally for best results'}
          </div>
        )}

        {isAnalyzing && (
          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '1.1em',
            fontWeight: 600,
            opacity: 0.9
          }}>
            ⚡ Analyzing voice patterns and emotions...
          </div>
        )}
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>📝 Live Transcript</h3>
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '1.1em',
            lineHeight: '1.6',
            minHeight: '60px'
          }}>
            {transcript || 'Start speaking to see transcript...'}
          </div>
        </div>
      )}

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>🎯 Analysis Results</h3>
          
          {/* Emotion Result */}
          <div style={{
            background: getEmotionColor(currentAnalysis.emotion.emotion) + '30',
            border: `2px solid ${getEmotionColor(currentAnalysis.emotion.emotion)}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontSize: '3em',
                background: getEmotionColor(currentAnalysis.emotion.emotion),
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentAnalysis.emotion.emotion === 'joy' ? '😊' :
                 currentAnalysis.emotion.emotion === 'sadness' ? '😢' :
                 currentAnalysis.emotion.emotion === 'anger' ? '😠' :
                 currentAnalysis.emotion.emotion === 'fear' ? '😨' :
                 currentAnalysis.emotion.emotion === 'surprise' ? '😲' : '😐'}
              </div>
              <div>
                <div style={{ fontSize: '2em', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {currentAnalysis.emotion.emotion}
                </div>
                <div style={{ fontSize: '1.2em', opacity: 0.9 }}>
                  Confidence: {(currentAnalysis.emotion.confidence * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
                  Source: {currentAnalysis.emotion.source}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Features */}
          {currentAnalysis.voiceFeatures && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {currentAnalysis.voiceFeatures.pitch && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🎵 Pitch Analysis</div>
                  <div style={{ fontSize: '0.9em' }}>
                    Average: {currentAnalysis.voiceFeatures.pitch.average.toFixed(1)} Hz<br/>
                    {pitchCalibration.calibrated && (
                      <>
                        Calibrated: {currentAnalysis.voiceFeatures.pitch.calibrated.toFixed(1)} Hz
                        {currentAnalysis.voiceFeatures.pitch.autoCalibrated && ' (Auto)'}<br/>
                      </>
                    )}
                    Range: {currentAnalysis.voiceFeatures.pitch.min.toFixed(1)} - {currentAnalysis.voiceFeatures.pitch.max.toFixed(1)} Hz<br/>
                    Variation: {(currentAnalysis.voiceFeatures.pitch.variation * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚡ Energy Analysis</div>
                <div style={{ fontSize: '0.9em' }}>
                  Volume: {(currentAnalysis.voiceFeatures.energy * 100).toFixed(1)}%<br/>
                  RMS Energy: {(currentAnalysis.voiceFeatures.rmsEnergy * 100).toFixed(1)}%<br/>
                  <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                    {currentAnalysis.voiceFeatures.energy > 0.85 ? 'Very High (Yelling)' :
                     currentAnalysis.voiceFeatures.energy > 0.75 ? 'High Energy (Shouting)' :
                     currentAnalysis.voiceFeatures.energy > 0.6 ? 'Elevated Energy' :
                     currentAnalysis.voiceFeatures.energy > 0.4 ? 'Moderate Energy' : 
                     currentAnalysis.voiceFeatures.energy > 0.25 ? 'Low Energy' : 'Very Low Energy'}
                    {currentAnalysis.emotion.emotion === 'anger' && currentAnalysis.voiceFeatures.energy > 0.75 && ' (Anger Indicator)'}
                    {currentAnalysis.emotion.emotion === 'sadness' && currentAnalysis.voiceFeatures.energy < 0.4 && ' (Sadness Indicator)'}
                  </span>
                </div>
              </div>

              {currentAnalysis.voiceFeatures.volumeSpikes && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📊 Volume Spikes</div>
                  <div style={{ fontSize: '0.9em' }}>
                    Count: {currentAnalysis.voiceFeatures.volumeSpikes.count}<br/>
                    {currentAnalysis.voiceFeatures.volumeSpikes.count > 0 && (
                      <>
                        Avg Intensity: {(currentAnalysis.voiceFeatures.volumeSpikes.avgIntensity * 100).toFixed(1)}%<br/>
                      </>
                    )}
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                      {currentAnalysis.voiceFeatures.volumeSpikes.count > 3 ? 'Multiple Outbursts' :
                       currentAnalysis.voiceFeatures.volumeSpikes.count > 0 ? 'Some Outbursts' : 'Stable Volume'}
                      {currentAnalysis.emotion.emotion === 'anger' && currentAnalysis.voiceFeatures.volumeSpikes.count > 0 && ' (Anger Pattern)'}
                    </span>
                  </div>
                </div>
              )}

              {currentAnalysis.voiceFeatures.speech && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🗣️ Speech Rate</div>
                  <div style={{ fontSize: '0.9em' }}>
                    Rate: {currentAnalysis.voiceFeatures.speech.rate.toFixed(2)}x normal<br/>
                    Words/sec: {currentAnalysis.voiceFeatures.speech.wordsPerSecond.toFixed(1)}<br/>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                      {currentAnalysis.voiceFeatures.speech.rate > 2.0 ? 'Very Fast (Agitated)' :
                       currentAnalysis.voiceFeatures.speech.rate > 1.5 ? 'Fast Speech' :
                       currentAnalysis.voiceFeatures.speech.rate > 1.2 ? 'Slightly Fast' :
                       currentAnalysis.voiceFeatures.speech.rate > 0.8 ? 'Normal Speed' :
                       currentAnalysis.voiceFeatures.speech.rate > 0.6 ? 'Slow Speech' : 'Very Slow'}
                      {currentAnalysis.emotion.emotion === 'anger' && currentAnalysis.voiceFeatures.speech.rate > 1.5 && ' (Anger/Frustration)'}
                    </span>
                  </div>
                </div>
              )}
              
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⏱️ Duration</div>
                <div style={{ fontSize: '0.9em' }}>
                  {currentAnalysis.voiceFeatures.duration.toFixed(2)}s
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🎯 Analysis Quality</div>
                <div style={{ fontSize: '0.9em' }}>
                  {currentAnalysis.calibrated ? 'Enhanced (Calibrated)' : 'Standard'}
                  <br/>
                  <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                    {currentAnalysis.emotion.source}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Emotion Scores Breakdown */}
          {currentAnalysis.emotion.scores && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>📊 Emotion Scores Breakdown</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px'
              }}>
                {Object.entries(currentAnalysis.emotion.scores).map(([emotion, score]) => (
                  <div key={emotion} style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{emotion}</span>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: getEmotionColor(emotion)
                    }}>
                      {score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Anger Analysis */}
          {currentAnalysis.emotion.emotion === 'anger' && currentAnalysis.voiceFeatures && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>😠 Anger Indicators Detected</h4>
              <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }}>
                {currentAnalysis.voiceFeatures.energy > 0.75 && (
                  <div>• High energy voice ({(currentAnalysis.voiceFeatures.energy * 100).toFixed(1)}% - shouting/yelling detected)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && 
                 (pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average) > 280 && (
                  <div>• Elevated pitch (stress/anger response) ({(pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average).toFixed(1)} Hz)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && currentAnalysis.voiceFeatures.pitch.variation > 0.7 && (
                  <div>• High voice variation (aggressive/harsh speech) ({(currentAnalysis.voiceFeatures.pitch.variation * 100).toFixed(1)}%)</div>
                )}
                {currentAnalysis.voiceFeatures.volumeSpikes && currentAnalysis.voiceFeatures.volumeSpikes.count > 0 && (
                  <div>• Volume spikes detected ({currentAnalysis.voiceFeatures.volumeSpikes.count} spikes - outbursts)</div>
                )}
                {currentAnalysis.voiceFeatures.speech && currentAnalysis.voiceFeatures.speech.rate > 1.5 && (
                  <div>• Fast speech rate (anger/frustration) ({currentAnalysis.voiceFeatures.speech.rate.toFixed(1)}x normal speed)</div>
                )}
                {currentAnalysis.voiceFeatures.zeroCrossingRate > 0.1 && (
                  <div>• Harsh consonants detected (aggressive speech pattern)</div>
                )}
                {currentAnalysis.transcript && /!/.test(currentAnalysis.transcript) && (
                  <div>• Exclamation marks in speech ({(currentAnalysis.transcript.match(/!/g) || []).length} exclamations)</div>
                )}
                {currentAnalysis.transcript && /\b[A-Z]{2,}\b/.test(currentAnalysis.transcript) && (
                  <div>• Shouting detected (caps words: {(currentAnalysis.transcript.match(/\b[A-Z]{2,}\b/g) || []).join(', ')})</div>
                )}
                {currentAnalysis.transcript && /\b(damn|hell|shit|fuck|crap|bullshit)\b/gi.test(currentAnalysis.transcript) && (
                  <div>• Strong language/profanity usage (emotional intensity)</div>
                )}
                {currentAnalysis.emotion.scores.anger > 1.5 && (
                  <div>• Strong textual anger indicators (score: {currentAnalysis.emotion.scores.anger.toFixed(2)})</div>
                )}
                <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.8 }}>
                  Enhanced anger detection with {currentAnalysis.calibrated ? 'calibrated' : 'standard'} voice analysis + BERT integration
                </div>
              </div>
            </div>
          )}

          {/* Special Sadness Analysis */}
          {currentAnalysis.emotion.emotion === 'sadness' && currentAnalysis.voiceFeatures && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>😢 Sadness Indicators Detected</h4>
              <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }}>
                {currentAnalysis.voiceFeatures.energy < 0.4 && (
                  <div>• Low energy voice pattern ({(currentAnalysis.voiceFeatures.energy * 100).toFixed(1)}%)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && 
                 (pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average) < 200 && (
                  <div>• Lower than average pitch ({(pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average).toFixed(1)} Hz)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && currentAnalysis.voiceFeatures.pitch.variation < 0.3 && (
                  <div>• Monotone speech pattern ({(currentAnalysis.voiceFeatures.pitch.variation * 100).toFixed(1)}% variation)</div>
                )}
                {currentAnalysis.emotion.scores.sadness > 1.0 && (
                  <div>• Strong textual sadness indicators (score: {currentAnalysis.emotion.scores.sadness.toFixed(2)})</div>
                )}
                <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.8 }}>
                  Enhanced sadness detection with {currentAnalysis.calibrated ? 'calibrated' : 'standard'} voice analysis
                </div>
              </div>
            </div>
          )}

          {/* Special Fear Analysis */}
          {currentAnalysis.emotion.emotion === 'fear' && currentAnalysis.voiceFeatures && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>😨 Fear Indicators Detected</h4>
              <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }}>
                {currentAnalysis.voiceFeatures.pitch && 
                 (pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average) > 300 && (
                  <div>• Elevated pitch (stress response) ({(pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average).toFixed(1)} Hz)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && currentAnalysis.voiceFeatures.pitch.variation > 0.6 && (
                  <div>• Voice tremor/instability ({(currentAnalysis.voiceFeatures.pitch.variation * 100).toFixed(1)}% variation)</div>
                )}
                {currentAnalysis.voiceFeatures.energy > 0.2 && currentAnalysis.voiceFeatures.energy < 0.8 && (
                  <div>• Variable energy levels (anxiety pattern) ({(currentAnalysis.voiceFeatures.energy * 100).toFixed(1)}%)</div>
                )}
                {currentAnalysis.voiceFeatures.speech && currentAnalysis.voiceFeatures.speech.rate > 1.5 && (
                  <div>• Rapid speech (nervous response) ({currentAnalysis.voiceFeatures.speech.rate.toFixed(1)}x normal)</div>
                )}
                {currentAnalysis.emotion.scores.fear > 1.2 && (
                  <div>• Strong textual fear indicators (score: {currentAnalysis.emotion.scores.fear.toFixed(2)})</div>
                )}
                <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.8 }}>
                  Enhanced fear detection with {currentAnalysis.calibrated ? 'calibrated' : 'standard'} voice analysis
                </div>
              </div>
            </div>
          )}

          {/* Special Surprise Analysis */}
          {currentAnalysis.emotion.emotion === 'surprise' && currentAnalysis.voiceFeatures && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>😲 Surprise Indicators Detected</h4>
              <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.9)' }}>
                {currentAnalysis.voiceFeatures.pitch && 
                 (pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average) > 350 && (
                  <div>• Very high pitch (exclamation) ({(pitchCalibration.calibrated ? currentAnalysis.voiceFeatures.pitch.calibrated : currentAnalysis.voiceFeatures.pitch.average).toFixed(1)} Hz)</div>
                )}
                {currentAnalysis.voiceFeatures.pitch && currentAnalysis.voiceFeatures.pitch.variation > 0.7 && (
                  <div>• High pitch variation (surprise inflection) ({(currentAnalysis.voiceFeatures.pitch.variation * 100).toFixed(1)}% variation)</div>
                )}
                {currentAnalysis.voiceFeatures.energy > 0.5 && (
                  <div>• High energy burst (sudden reaction) ({(currentAnalysis.voiceFeatures.energy * 100).toFixed(1)}%)</div>
                )}
                {currentAnalysis.voiceFeatures.speech && 
                 (currentAnalysis.voiceFeatures.speech.rate < 0.8 || currentAnalysis.voiceFeatures.speech.rate > 1.8) && (
                  <div>• Speech rate changes (pause/rush pattern) ({currentAnalysis.voiceFeatures.speech.rate.toFixed(1)}x normal)</div>
                )}
                {currentAnalysis.emotion.scores.surprise > 1.1 && (
                  <div>• Strong textual surprise indicators (score: {currentAnalysis.emotion.scores.surprise.toFixed(2)})</div>
                )}
                <div style={{ marginTop: '8px', fontStyle: 'italic', opacity: 0.8 }}>
                  Enhanced surprise detection with {currentAnalysis.calibrated ? 'calibrated' : 'standard'} voice analysis
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>📚 Analysis History</h3>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {analysisHistory.slice(0, 10).map((analysis) => (
              <div key={analysis.id} style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${getEmotionColor(analysis.emotion.emotion)}50`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '1.5em' }}>
                      {analysis.emotion.emotion === 'joy' ? '😊' :
                       analysis.emotion.emotion === 'sadness' ? '😢' :
                       analysis.emotion.emotion === 'anger' ? '😠' :
                       analysis.emotion.emotion === 'fear' ? '😨' :
                       analysis.emotion.emotion === 'surprise' ? '😲' : '😐'}
                    </span>
                    <span style={{ 
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      color: getEmotionColor(analysis.emotion.emotion)
                    }}>
                      {analysis.emotion.emotion}
                    </span>
                    <span style={{ fontSize: '0.9em', opacity: 0.7 }}>
                      ({(analysis.emotion.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8em', opacity: 0.6 }}>
                    {new Date(analysis.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.9em',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  "{analysis.transcript.length > 100 ? 
                    analysis.transcript.substring(0, 100) + '...' : 
                    analysis.transcript}"
                </div>
              </div>
            ))}
          </div>
          
          {analysisHistory.length > 10 && (
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '0.9em',
              opacity: 0.7
            }}>
              ... and {analysisHistory.length - 10} more analyses in history
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceEmotionAnalyzer;
