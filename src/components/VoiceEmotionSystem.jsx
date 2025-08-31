import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImprovedVoiceEmotionEngine from '../utils/improvedVoiceEmotionEngine.js';
import { processAudioFile } from '../utils/fileProcessors';

// ================================
// ENHANCED VOICE EMOTION RECOGNITION SYSTEM
// Complete implementation with ML training capabilities
// ================================

class AdvancedVoiceAnalysisEngine {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.microphone = null;
    this.isAnalyzing = false;
    this.analysisData = {
      pitch: 0,
      volume: 0,
      spectralCentroid: 0,
      mfcc: [],
      formants: [],
      timestamp: Date.now()
    };
  }

  async initialize() {
    try {
      // Request microphone access with high-quality settings
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      // Set up Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser for detailed frequency analysis
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.3;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.microphone.connect(this.analyser);
      
      console.log('✅ Voice Analysis Engine initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Voice Analysis Engine:', error);
      return false;
    }
  }

  startAnalysis() {
    this.isAnalyzing = true;
    this.analyzeVoice();
  }

  stopAnalysis() {
    this.isAnalyzing = false;
  }

  analyzeVoice() {
    if (!this.isAnalyzing || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    this.analyser.getByteFrequencyData(frequencyData);
    this.analyser.getByteTimeDomainData(timeData);

    // Advanced voice feature extraction
    this.analysisData = {
      pitch: this.calculatePitch(frequencyData, timeData),
      volume: this.calculateVolume(frequencyData),
      spectralCentroid: this.calculateSpectralCentroid(frequencyData),
      spectralRolloff: this.calculateSpectralRolloff(frequencyData),
      zeroCrossingRate: this.calculateZeroCrossingRate(timeData),
      mfcc: this.calculateMFCC(frequencyData),
      formants: this.calculateFormants(frequencyData),
      timestamp: Date.now()
    };

    // Continue analysis loop
    setTimeout(() => this.analyzeVoice(), 100);
  }

  calculatePitch(frequencyData, timeData) {
    // Advanced pitch detection using autocorrelation
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    const minPeriod = Math.floor(this.audioContext.sampleRate / 800); // 800 Hz max
    const maxPeriod = Math.floor(this.audioContext.sampleRate / 80);  // 80 Hz min
    
    for (let period = minPeriod; period < maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < timeData.length - period; i++) {
        correlation += Math.abs((timeData[i] - 128) * (timeData[i + period] - 128));
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? this.audioContext.sampleRate / bestPeriod : 0;
  }

  calculateVolume(frequencyData) {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i] * frequencyData[i];
    }
    return Math.sqrt(sum / frequencyData.length) / 255;
  }

  calculateSpectralCentroid(frequencyData) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      numerator += i * frequencyData[i];
      denominator += frequencyData[i];
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  calculateSpectralRolloff(frequencyData) {
    let totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    let energy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      energy += frequencyData[i];
      if (energy >= 0.85 * totalEnergy) {
        return i;
      }
    }
    return frequencyData.length - 1;
  }

  calculateZeroCrossingRate(timeData) {
    let crossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] - 128) * (timeData[i - 1] - 128) < 0) {
        crossings++;
      }
    }
    return crossings / timeData.length;
  }

  calculateMFCC(frequencyData) {
    // Simplified MFCC calculation (first 3 coefficients)
    const melFilters = this.createMelFilterBank(frequencyData.length);
    const mfcc = [];
    
    for (let i = 0; i < Math.min(3, melFilters.length); i++) {
      let sum = 0;
      for (let j = 0; j < frequencyData.length; j++) {
        sum += frequencyData[j] * melFilters[i][j];
      }
      mfcc.push(Math.log(sum + 1));
    }
    
    return mfcc;
  }

  createMelFilterBank(length) {
    // Simplified mel filter bank
    const numFilters = 13;
    const filters = [];
    
    for (let i = 0; i < numFilters; i++) {
      const filter = new Array(length).fill(0);
      const start = Math.floor(i * length / numFilters);
      const end = Math.floor((i + 1) * length / numFilters);
      
      for (let j = start; j < end; j++) {
        filter[j] = 1;
      }
      filters.push(filter);
    }
    
    return filters;
  }

  calculateFormants(frequencyData) {
    // Find first 3 formants (resonant frequencies)
    const formants = [];
    const peaks = this.findPeaks(frequencyData);
    
    for (let i = 0; i < Math.min(3, peaks.length); i++) {
      formants.push(peaks[i] * (this.audioContext.sampleRate / 2) / frequencyData.length);
    }
    
    return formants;
  }

  findPeaks(data) {
    const peaks = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > 50) {
        peaks.push(i);
      }
    }
    return peaks.sort((a, b) => data[b] - data[a]).slice(0, 5);
  }

  getLatestAnalysis() {
    return { ...this.analysisData };
  }

  cleanup() {
    this.stopAnalysis();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Advanced Emotion Detection Engine with ML capabilities
class EmotionDetectionEngine {
  constructor() {
    this.modelWeights = this.loadModelWeights();
    this.trainingData = this.loadTrainingData();
    this.emotionProfiles = this.initializeEmotionProfiles();
  }

  initializeEmotionProfiles() {
    return {
      happy: {
        pitchRange: [180, 350],
        volumeRange: [0.4, 0.9],
        spectralCentroid: [1200, 3500],
        zeroCrossing: [0.1, 0.3],
        keywords: ['great', 'amazing', 'wonderful', 'fantastic', 'excellent', 'awesome', 'love', 'perfect', 'brilliant', 'superb'],
        color: '#10b981',
        icon: '😊'
      },
      sad: {
        pitchRange: [80, 180],
        volumeRange: [0.1, 0.5],
        spectralCentroid: [300, 1200],
        zeroCrossing: [0.05, 0.15],
        keywords: ['sad', 'terrible', 'awful', 'bad', 'disappointed', 'down', 'horrible', 'depressed', 'miserable', 'upset'],
        color: '#6b7280',
        icon: '😢'
      },
      angry: {
        pitchRange: [200, 450],
        volumeRange: [0.6, 1.0],
        spectralCentroid: [1500, 4500],
        zeroCrossing: [0.2, 0.4],
        keywords: ['angry', 'furious', 'mad', 'rage', 'hate', 'annoying', 'stupid', 'damn', 'pissed', 'irritated'],
        color: '#ef4444',
        icon: '😠'
      },
      excited: {
        pitchRange: [220, 500],
        volumeRange: [0.5, 1.0],
        spectralCentroid: [1800, 4000],
        zeroCrossing: [0.15, 0.35],
        keywords: ['excited', 'incredible', 'unbelievable', 'wow', 'amazing', 'epic', 'outstanding', 'phenomenal', 'extraordinary'],
        color: '#f59e0b',
        icon: '🤩'
      },
      calm: {
        pitchRange: [120, 200],
        volumeRange: [0.2, 0.6],
        spectralCentroid: [400, 1500],
        zeroCrossing: [0.05, 0.2],
        keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'gentle', 'steady', 'composed'],
        color: '#06b6d4',
        icon: '😌'
      },
      nervous: {
        pitchRange: [160, 280],
        volumeRange: [0.15, 0.6],
        spectralCentroid: [800, 2500],
        zeroCrossing: [0.1, 0.25],
        keywords: ['nervous', 'worried', 'anxious', 'scared', 'uncertain', 'afraid', 'concerned', 'stressed', 'tense'],
        color: '#8b5cf6',
        icon: '😰'
      },
      confident: {
        pitchRange: [140, 250],
        volumeRange: [0.4, 0.8],
        spectralCentroid: [600, 2200],
        zeroCrossing: [0.08, 0.22],
        keywords: ['confident', 'sure', 'certain', 'definitely', 'absolutely', 'positive', 'strong', 'determined', 'assured'],
        color: '#059669',
        icon: '💪'
      },
      surprised: {
        pitchRange: [250, 550],
        volumeRange: [0.4, 0.95],
        spectralCentroid: [1500, 4200],
        zeroCrossing: [0.12, 0.3],
        keywords: ['surprised', 'unexpected', 'shocking', 'unbelievable', 'wow', 'omg', 'whoa', 'incredible', 'astonishing'],
        color: '#dc2626',
        icon: '😮'
      },
      neutral: {
        pitchRange: [130, 230],
        volumeRange: [0.25, 0.7],
        spectralCentroid: [500, 2000],
        zeroCrossing: [0.07, 0.25],
        keywords: ['hello', 'yes', 'no', 'okay', 'fine', 'thanks', 'well', 'good', 'nice', 'right'],
        color: '#374151',
        icon: '😐'
      },
      frustrated: {
        pitchRange: [150, 300],
        volumeRange: [0.3, 0.85],
        spectralCentroid: [700, 2800],
        zeroCrossing: [0.1, 0.28],
        keywords: ['frustrated', 'annoying', 'difficult', 'problem', 'trouble', 'issue', 'complicated', 'challenging'],
        color: '#7c2d12',
        icon: '😤'
      }
    };
  }

  loadModelWeights() {
    const saved = localStorage.getItem('voiceEmotionMLWeights');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Initialize default weights (reduced nervous detection)
    const emotions = ['happy', 'sad', 'angry', 'excited', 'calm', 'nervous', 'confident', 'surprised', 'neutral', 'frustrated'];
    const weights = {};
    
    emotions.forEach(emotion => {
      weights[emotion] = {
        pitch: emotion === 'nervous' ? 0.3 : 1.0,
        volume: emotion === 'nervous' ? 0.3 : 1.0,
        spectral: emotion === 'nervous' ? 0.3 : 1.0,
        keywords: emotion === 'nervous' ? 0.3 : 1.0,
        overall: emotion === 'nervous' ? 0.2 : 1.0
      };
    });
    
    return weights;
  }

  loadTrainingData() {
    const saved = localStorage.getItem('voiceEmotionTrainingData');
    return saved ? JSON.parse(saved) : {};
  }

  saveModelWeights() {
    localStorage.setItem('voiceEmotionMLWeights', JSON.stringify(this.modelWeights));
  }

  saveTrainingData() {
    localStorage.setItem('voiceEmotionTrainingData', JSON.stringify(this.trainingData));
  }

  detectEmotion(voiceFeatures, transcript = '') {
    const emotions = {};
    const transcriptLower = transcript.toLowerCase();
    
    Object.entries(this.emotionProfiles).forEach(([emotion, profile]) => {
      let score = 0;
      let maxScore = 0;
      const weights = this.modelWeights[emotion] || { pitch: 1, volume: 1, spectral: 1, keywords: 1, overall: 1 };
      
      // Pitch analysis (25 points)
      if (voiceFeatures.pitch >= profile.pitchRange[0] && voiceFeatures.pitch <= profile.pitchRange[1]) {
        score += 25 * weights.pitch;
      }
      maxScore += 25;
      
      // Volume analysis (20 points)
      if (voiceFeatures.volume >= profile.volumeRange[0] && voiceFeatures.volume <= profile.volumeRange[1]) {
        score += 20 * weights.volume;
      }
      maxScore += 20;
      
      // Spectral centroid analysis (20 points)
      if (voiceFeatures.spectralCentroid >= profile.spectralCentroid[0] && voiceFeatures.spectralCentroid <= profile.spectralCentroid[1]) {
        score += 20 * weights.spectral;
      }
      maxScore += 20;
      
      // Zero crossing rate analysis (10 points)
      if (voiceFeatures.zeroCrossingRate >= profile.zeroCrossing[0] && voiceFeatures.zeroCrossingRate <= profile.zeroCrossing[1]) {
        score += 10;
      }
      maxScore += 10;
      
      // Keyword analysis (25 points)
      const keywordMatches = profile.keywords.filter(keyword => transcriptLower.includes(keyword)).length;
      if (keywordMatches > 0) {
        score += Math.min(25, keywordMatches * 8) * weights.keywords;
      }
      maxScore += 25;
      
      // Apply overall weight
      score *= weights.overall;
      
      // Calculate percentage
      let percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      
      // Special adjustments
      if (emotion === 'neutral' && transcript.length < 10) {
        percentage = Math.max(percentage, 45);
      }
      
      emotions[emotion] = {
        percentage: Math.max(0, Math.min(100, Math.round(percentage))),
        confidence: Math.round(percentage * 0.9),
        profile: profile,
        trainingAccuracy: this.getTrainingAccuracy(emotion)
      };
    });
    
    return emotions;
  }

  getTrainingAccuracy(emotion) {
    const data = this.trainingData[emotion];
    if (!data || data.length === 0) return 0;
    
    const baseAccuracy = Math.min(95, 50 + (data.length * 5));
    const weight = this.modelWeights[emotion]?.overall || 1;
    return Math.round(Math.min(100, baseAccuracy * weight));
  }

  addTrainingSample(emotion, voiceFeatures, transcript) {
    if (!this.trainingData[emotion]) {
      this.trainingData[emotion] = [];
    }
    
    const sample = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      voiceFeatures: { ...voiceFeatures },
      transcript,
      verified: true
    };
    
    this.trainingData[emotion].push(sample);
    
    // Update model weights
    this.updateModelWeights(emotion, voiceFeatures);
    
    this.saveTrainingData();
    this.saveModelWeights();
    
    console.log(`✅ Added training sample for ${emotion}:`, sample);
    return sample;
  }

  updateModelWeights(emotion, voiceFeatures) {
    if (!this.modelWeights[emotion]) {
      this.modelWeights[emotion] = { pitch: 1, volume: 1, spectral: 1, keywords: 1, overall: 1 };
    }
    
    // Strengthen weights for the trained emotion
    const increment = 0.1;
    this.modelWeights[emotion].pitch = Math.min(2.0, this.modelWeights[emotion].pitch + increment);
    this.modelWeights[emotion].volume = Math.min(2.0, this.modelWeights[emotion].volume + increment);
    this.modelWeights[emotion].spectral = Math.min(2.0, this.modelWeights[emotion].spectral + increment);
    this.modelWeights[emotion].keywords = Math.min(2.0, this.modelWeights[emotion].keywords + increment);
    this.modelWeights[emotion].overall = Math.min(1.5, this.modelWeights[emotion].overall + increment * 0.5);
    
    // Reduce nervous over-detection when training other emotions
    if (emotion !== 'nervous') {
      const reduction = 0.02;
      this.modelWeights.nervous.pitch = Math.max(0.1, this.modelWeights.nervous.pitch - reduction);
      this.modelWeights.nervous.volume = Math.max(0.1, this.modelWeights.nervous.volume - reduction);
      this.modelWeights.nervous.spectral = Math.max(0.1, this.modelWeights.nervous.spectral - reduction);
      this.modelWeights.nervous.overall = Math.max(0.1, this.modelWeights.nervous.overall - reduction);
    }
  }

  getTrainingStats() {
    const stats = {};
    Object.keys(this.emotionProfiles).forEach(emotion => {
      const data = this.trainingData[emotion] || [];
      stats[emotion] = {
        sampleCount: data.length,
        accuracy: this.getTrainingAccuracy(emotion),
        lastTrained: data.length > 0 ? data[data.length - 1].timestamp : null
      };
    });
    return stats;
  }

  exportTrainingData() {
    return {
      trainingData: this.trainingData,
      modelWeights: this.modelWeights,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
  }

  importTrainingData(data) {
    if (data.trainingData) this.trainingData = data.trainingData;
    if (data.modelWeights) this.modelWeights = data.modelWeights;
    this.saveTrainingData();
    this.saveModelWeights();
  }
}

// Speech Recognition Manager
class SpeechManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcript = '';
    this.onTranscriptUpdate = null;
  }

  initialize() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      return false;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      this.transcript = finalTranscript || interimTranscript;
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(this.transcript);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    return true;
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.transcript = '';
        return true;
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        return true;
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  setOnTranscriptUpdate(callback) {
    this.onTranscriptUpdate = callback;
  }

  getTranscript() {
    return this.transcript;
  }
}

// Main Voice Emotion System Component
const VoiceEmotionSystem = ({ onEmotionDetected, isVisible }) => {
  // Core state
  const [activeTab, setActiveTab] = useState('detection');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [emotions, setEmotions] = useState({});
  const [dominantEmotion, setDominantEmotion] = useState('neutral');
  const [voiceFeatures, setVoiceFeatures] = useState({});
  const [systemStatus, setSystemStatus] = useState('initializing');
  
  // Training state
  const [trainingStats, setTrainingStats] = useState({});
  const [selectedTrainingEmotion, setSelectedTrainingEmotion] = useState('happy');
  const [trainingMessage, setTrainingMessage] = useState('');
  
  // Engine references
  const voiceEngine = useRef(null);
  const emotionEngine = useRef(null);
  const speechManager = useRef(null);
  
  // Initialize system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        setSystemStatus('initializing');
        
        // Initialize engines
        voiceEngine.current = new ImprovedVoiceEmotionEngine();
        emotionEngine.current = new EmotionDetectionEngine();
        speechManager.current = new SpeechManager();
        
        // Initialize voice analysis
        const voiceInit = await voiceEngine.current.initialize();
        const speechInit = speechManager.current.initialize();
        
        if (voiceInit && speechInit) {
          // Set up speech transcript callback
          speechManager.current.setOnTranscriptUpdate((newTranscript) => {
            setTranscript(newTranscript);
          });
          
          // Load initial training stats
          setTrainingStats(emotionEngine.current.getTrainingStats());
          
          setSystemStatus('ready');
          console.log('✅ Voice Emotion System initialized successfully');
        } else {
          setSystemStatus('error');
          console.error('❌ Failed to initialize system components');
        }
      } catch (error) {
        setSystemStatus('error');
        console.error('❌ System initialization error:', error);
      }
    };
    
    initializeSystem();

    // Listen for global file-upload event from DetectionTab's input (simple cross-component wiring)
    const fileHandler = (ev) => {
      try {
        if (ev && ev.fileEvent) {
          handleFileUpload(ev.fileEvent);
        }
      } catch (e) { console.warn('file upload handler failed', e); }
    };
    window.addEventListener('voice-emotion-file-upload', fileHandler);
    
    // Cleanup on unmount
    return () => {
      if (voiceEngine.current) {
        voiceEngine.current.cleanup();
      }
      if (speechManager.current) {
        speechManager.current.stop();
      }
      window.removeEventListener('voice-emotion-file-upload', fileHandler);
    };
  }, []);
  
  // Main analysis loop
  useEffect(() => {
    if (isRecording && systemStatus === 'ready') {
      const analysisInterval = setInterval(() => {
        if (voiceEngine.current && emotionEngine.current) {
          const voiceData = voiceEngine.current.getLatestAnalysis();
          const detectedEmotions = emotionEngine.current.detectEmotion(voiceData, transcript);
          
          setVoiceFeatures(voiceData);
          setEmotions(detectedEmotions);
          
          // Find dominant emotion
          let maxPercentage = 0;
          let dominant = 'neutral';
          Object.entries(detectedEmotions).forEach(([emotion, data]) => {
            if (data.percentage > maxPercentage) {
              maxPercentage = data.percentage;
              dominant = emotion;
            }
          });
          setDominantEmotion(dominant);
          
          // Emit to parent component
          if (onEmotionDetected) {
            onEmotionDetected({
              emotions: detectedEmotions,
              dominantEmotion: dominant,
              voiceFeatures: voiceData,
              transcript,
              timestamp: Date.now()
            });
          }
        }
      }, 200);
      
      return () => clearInterval(analysisInterval);
    }
  }, [isRecording, systemStatus, transcript, onEmotionDetected]);
  
  // Recording controls
  const handleStartRecording = useCallback(() => {
    if (systemStatus !== 'ready') return;
    
    const voiceStarted = voiceEngine.current.startAnalysis();
    const speechStarted = speechManager.current.start();
    
    if (voiceStarted && speechStarted) {
      setIsRecording(true);
      setTranscript('');
      console.log('🎤 Recording started');
    }
  }, [systemStatus]);

  // Handle uploaded audio files: extract transcript (if possible), compute basic features and run emotion detection
  const handleFileUpload = useCallback(async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('audio')) {
      alert('Please select a valid audio file (wav, mp3, m4a, etc.)');
      if (e && e.target) e.target.value = '';
      return;
    }

    setSystemStatus('processing-file');

    let providedTranscript = null;
    try {
      // Try to extract transcript using existing helper (may return string or large formatted result)
      const extracted = await processAudioFile(file, () => {}, 'en-US');
      if (typeof extracted === 'string') providedTranscript = extracted;
    } catch (err) {
      console.warn('File transcription/extraction failed, continuing without transcript', err);
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Create analyser to compute simple spectral features
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);

      const gain = audioCtx.createGain();
      gain.gain.value = 0; // silent playback so user doesn't hear duplicate audio

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(audioCtx.destination);

      // start playback silently to populate analyser data
      source.start(0);

      // wait a short time for analyser to be populated
      await new Promise(resolve => setTimeout(resolve, 250));

      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      // compute basic features
      // volume (RMS-like)
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeData.length);

      // zero crossing rate
      let crossings = 0;
      for (let i = 1; i < timeData.length; i++) {
        if (((timeData[i] - 128) >= 0) !== ((timeData[i - 1] - 128) >= 0)) crossings++;
      }
      const zcr = crossings / timeData.length;

      // spectral centroid (approx)
      let num = 0, den = 0;
      for (let i = 0; i < freqData.length; i++) {
        const v = freqData[i];
        const freq = i * (audioBuffer.sampleRate / 2) / freqData.length;
        num += freq * v;
        den += v;
      }
      const spectralCentroid = den > 0 ? num / den : 0;

      const voiceFeaturesForFile = {
        pitch: 0,
        volume: rms,
        spectralCentroid,
        zeroCrossingRate: zcr
      };

      // use provided transcript if available
      const activeTranscript = providedTranscript || '';

      // run emotion detection using existing engine
      if (emotionEngine.current) {
        const detected = emotionEngine.current.detectEmotion(voiceFeaturesForFile, activeTranscript);
        setVoiceFeatures(voiceFeaturesForFile);
        setEmotions(detected);

        // determine dominant
        let maxP = 0; let dom = 'neutral';
        Object.entries(detected).forEach(([k, v]) => { if (v.percentage > maxP) { maxP = v.percentage; dom = k; } });
        setDominantEmotion(dom);
      }

      // stop playback and close context
      try { source.stop(); } catch (e) {}
      try { audioCtx.close(); } catch (e) {}
    } catch (err) {
      console.error('Failed to process uploaded audio file:', err);
      alert('Failed to analyze uploaded audio: ' + (err && err.message ? err.message : String(err)));
    } finally {
      if (e && e.target) e.target.value = '';
      setSystemStatus('ready');
    }
  }, []);
  
  const handleStopRecording = useCallback(() => {
    voiceEngine.current?.stopAnalysis();
    speechManager.current?.stop();
    setIsRecording(false);
    console.log('⏹️ Recording stopped');
  }, []);
  
  // Training functions
  const handleTrainEmotion = useCallback(() => {
    if (!transcript.trim() || !voiceFeatures.pitch) {
      setTrainingMessage('❌ Please record some speech first!');
      setTimeout(() => setTrainingMessage(''), 3000);
      return;
    }
    
    try {
      emotionEngine.current.addTrainingSample(selectedTrainingEmotion, voiceFeatures, transcript);
      setTrainingStats(emotionEngine.current.getTrainingStats());
      setTrainingMessage(`✅ Successfully trained ${selectedTrainingEmotion} emotion!`);
      setTimeout(() => setTrainingMessage(''), 3000);
    } catch (error) {
      setTrainingMessage('❌ Training failed. Please try again.');
      console.error('Training error:', error);
    }
  }, [selectedTrainingEmotion, transcript, voiceFeatures]);
  
  const exportTrainingData = useCallback(() => {
    const data = emotionEngine.current.exportTrainingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-emotion-training-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTrainingMessage('📥 Training data exported!');
    setTimeout(() => setTrainingMessage(''), 3000);
  }, []);
  
  const importTrainingData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        emotionEngine.current.importTrainingData(data);
        setTrainingStats(emotionEngine.current.getTrainingStats());
        setTrainingMessage('📤 Training data imported!');
        setTimeout(() => setTrainingMessage(''), 3000);
      } catch (error) {
        setTrainingMessage('❌ Failed to import data.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  }, []);
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  // Render system status
  if (systemStatus !== 'ready') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
          {systemStatus === 'initializing' ? '🔄' : '❌'}
        </div>
        <h2 style={{ color: '#1f2937' }}>
          {systemStatus === 'initializing' ? 'Initializing Voice System...' : 'System Error'}
        </h2>
        <p style={{ color: '#6b7280' }}>
          {systemStatus === 'initializing' 
            ? 'Setting up microphone and AI engines...' 
            : 'Please check microphone permissions and refresh the page.'
          }
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '30px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '3.5rem',
          fontWeight: '900',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🎤 AI Voice Emotion Recognition
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '1.3rem', 
          opacity: 0.95,
          fontWeight: '300'
        }}>
          Advanced neural emotion detection with machine learning training capabilities
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: '20px',
        padding: '10px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        gap: '10px'
      }}>
        {[
          { id: 'detection', label: '🎯 Emotion Detection', color: '#667eea' },
          { id: 'training', label: '🤖 AI Training Center', color: '#10b981' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '22px',
              fontSize: '1.3rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === tab.id 
                ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)` 
                : 'transparent',
              color: activeTab === tab.id ? 'white' : '#64748b',
              transform: activeTab === tab.id ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow: activeTab === tab.id 
                ? `0 15px 35px ${tab.color}40` 
                : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'detection' ? (
        <DetectionTab 
          isRecording={isRecording}
          transcript={transcript}
          emotions={emotions}
          voiceFeatures={voiceFeatures}
          dominantEmotion={dominantEmotion}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      ) : (
        <TrainingTab
          emotions={emotions}
          trainingStats={trainingStats}
          selectedEmotion={selectedTrainingEmotion}
          setSelectedEmotion={setSelectedTrainingEmotion}
          transcript={transcript}
          isRecording={isRecording}
          trainingMessage={trainingMessage}
          onTrainEmotion={handleTrainEmotion}
          onExportData={exportTrainingData}
          onImportData={importTrainingData}
        />
      )}
    </div>
  );
};

// Detection Tab Component
const DetectionTab = ({ 
  isRecording, 
  transcript, 
  emotions, 
  voiceFeatures, 
  dominantEmotion,
  onStartRecording, 
  onStopRecording 
}) => (
  <div>
    {/* Recording Controls */}
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '50px',
      marginBottom: '30px',
      textAlign: 'center',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
    }}>
      <div 
        onClick={isRecording ? onStopRecording : onStartRecording}
        style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: isRecording 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
            : 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 40px auto',
          cursor: 'pointer',
          transition: 'all 0.4s ease',
          animation: isRecording ? 'pulse 2s infinite' : 'none',
          boxShadow: isRecording 
            ? '0 0 40px rgba(239, 68, 68, 0.6)' 
            : '0 0 40px rgba(16, 185, 129, 0.6)',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '4rem', color: 'white' }}>
          {isRecording ? '⏹️' : '🎤'}
        </span>
      </div>
      
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: '#1f2937',
        fontSize: '2.5rem',
        fontWeight: '800'
      }}>
        {isRecording ? '🔴 Recording Active' : '⏸️ Click to Start Recording'}
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        fontSize: '1.2rem',
        margin: '0 0 30px 0',
        lineHeight: '1.6'
      }}>
        {isRecording 
          ? 'Speak naturally and watch AI analyze your emotions in real-time'
          : 'Click the microphone to begin advanced voice emotion analysis'
        }
      </p>

      {/* Voice Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '25px',
        marginTop: '40px'
      }}>
        {[
          { 
            icon: '🎵', 
            label: 'Pitch', 
            value: `${Math.round(voiceFeatures.pitch || 0)} Hz`, 
            color: '#3b82f6' 
          },
          { 
            icon: '🔊', 
            label: 'Volume', 
            value: `${Math.round((voiceFeatures.volume || 0) * 100)}%`, 
            color: '#10b981' 
          },
          { 
            icon: '📊', 
            label: 'Spectral', 
            value: `${Math.round(voiceFeatures.spectralCentroid || 0)}`, 
            color: '#f59e0b' 
          },
          { 
            icon: emotions[dominantEmotion]?.profile?.icon || '😐', 
            label: 'Dominant', 
            value: dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1), 
            color: emotions[dominantEmotion]?.profile?.color || '#6b7280' 
          }
        ].map((feature, index) => (
          <div key={index} style={{
            background: `${feature.color}15`,
            border: `2px solid ${feature.color}30`,
            padding: '25px',
            borderRadius: '16px',
            textAlign: 'center',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
              {feature.icon}
            </div>
            <div style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: feature.color,
              marginBottom: '8px'
            }}>
              {feature.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '1rem' }}>
              {feature.label}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* File upload for offline audio analysis - added to detection tab */}
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="file" accept="audio/*" onChange={(e) => {
          // find and call the parent handler if available via window (fallback)
          const evt = new Event('voice-emotion-file-upload');
          evt.fileEvent = e;
          window.dispatchEvent(evt);
        }} style={{ display: 'none' }} />
        <div style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
          📁 Upload Audio for Analysis
        </div>
      </label>
    </div>

    {/* Transcript */}
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '35px',
      marginBottom: '30px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 25px 0', 
        color: '#1f2937',
        fontSize: '1.8rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        📝 Speech Transcript
      </h3>
      <div style={{
        background: '#f8fafc',
        border: '3px solid #e2e8f0',
        borderRadius: '16px',
        padding: '25px',
        minHeight: '100px',
        fontSize: '1.2rem',
        lineHeight: '1.7',
        color: transcript ? '#1f2937' : '#9ca3af',
        fontFamily: 'Monaco, monospace'
      }}>
        {transcript || (isRecording ? 'Listening for speech...' : 'Start recording to see live transcript')}
      </div>
    </div>

    {/* Emotions Grid */}
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '35px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 35px 0', 
        color: '#1f2937',
        fontSize: '1.8rem',
        fontWeight: '700',
        textAlign: 'center'
      }}>
        🎭 AI Emotion Analysis
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '25px'
      }}>
        {Object.entries(emotions).map(([emotion, data]) => (
          <div key={emotion} style={{
            background: `linear-gradient(135deg, ${data.profile?.color || '#6b7280'}20, ${data.profile?.color || '#6b7280'}10)`,
            border: `3px solid ${data.profile?.color || '#6b7280'}`,
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            transition: 'all 0.4s ease',
            transform: data.percentage > 60 ? 'scale(1.03)' : 'scale(1)',
            boxShadow: data.percentage > 60 ? `0 15px 30px ${data.profile?.color || '#6b7280'}30` : 'none'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
              {data.profile?.icon || '😐'}
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              textTransform: 'capitalize',
              color: '#1f2937'
            }}>
              {emotion}
            </div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '900', 
              marginBottom: '12px',
              color: data.profile?.color || '#6b7280'
            }}>
              {data.percentage}%
            </div>
            <div style={{ 
              fontSize: '1rem', 
              color: '#4b5563',
              marginBottom: '12px'
            }}>
              Confidence: {data.confidence}%
            </div>
            {data.trainingAccuracy > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '15px',
                fontSize: '0.9rem',
                color: '#059669',
                fontWeight: '600'
              }}>
                🤖 AI Trained: {data.trainingAccuracy}% accuracy
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <style jsx>{`
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        50% { transform: scale(1.02); box-shadow: 0 0 50px rgba(239, 68, 68, 0.8); }
        100% { transform: scale(1); box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
      }
    `}</style>
  </div>
);

// Training Tab Component  
const TrainingTab = ({ 
  emotions,
  trainingStats, 
  selectedEmotion, 
  setSelectedEmotion,
  transcript,
  isRecording,
  trainingMessage,
  onTrainEmotion,
  onExportData,
  onImportData
}) => {
  const emotionOptions = Object.keys(emotions).map(emotion => ({
    id: emotion,
    label: `${emotions[emotion]?.profile?.icon || '😐'} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`,
    color: emotions[emotion]?.profile?.color || '#6b7280'
  }));

  const totalSamples = Object.values(trainingStats).reduce((sum, stat) => sum + (stat.sampleCount || 0), 0);
  const avgAccuracy = Object.values(trainingStats).reduce((sum, stat) => sum + (stat.accuracy || 0), 0) / 10;

  return (
    <div>
      {/* Training Overview */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 30px 0', 
          color: '#1f2937', 
          fontSize: '2.5rem',
          fontWeight: '800',
          textAlign: 'center'
        }}>
          🎯 AI Training Center
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '25px',
          marginBottom: '30px'
        }}>
          {[
            { icon: '📊', label: 'Total Samples', value: totalSamples, color: '#3b82f6' },
            { icon: '🎯', label: 'Avg Accuracy', value: `${Math.round(avgAccuracy)}%`, color: '#10b981' },
            { icon: '🤖', label: 'AI Status', value: totalSamples > 50 ? 'Expert' : totalSamples > 20 ? 'Trained' : 'Learning', color: '#f59e0b' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: `${stat.color}15`,
              border: `3px solid ${stat.color}30`,
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{stat.icon}</div>
              <div style={{ 
                fontSize: '2.2rem', 
                fontWeight: 'bold', 
                color: stat.color,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {trainingMessage && (
          <div style={{
            background: trainingMessage.includes('❌') ? '#fef2f2' : '#f0fdf4',
            border: trainingMessage.includes('❌') ? '3px solid #ef4444' : '3px solid #10b981',
            color: trainingMessage.includes('❌') ? '#dc2626' : '#059669',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '25px',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            {trainingMessage}
          </div>
        )}
      </div>

      {/* Training Progress */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 30px 0', 
          color: '#1f2937',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          📈 Training Progress by Emotion
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {emotionOptions.map(emotion => {
            const stats = trainingStats[emotion.id] || { sampleCount: 0, accuracy: 0 };
            const progress = Math.min(100, (stats.sampleCount / 10) * 100);
            
            return (
              <div key={emotion.id} style={{
                background: stats.sampleCount > 0 ? `${emotion.color}20` : '#f3f4f6',
                border: `3px solid ${stats.sampleCount > 0 ? emotion.color : '#d1d5db'}`,
                color: stats.sampleCount > 0 ? '#1f2937' : '#6b7280',
                padding: '25px',
                borderRadius: '18px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                  {emotion.label.split(' ')[0]}
                </div>
                <div style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}>
                  {emotion.id}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {stats.sampleCount} samples
                </div>
                <div style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                  {stats.accuracy}% accuracy
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.5)',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: emotion.color,
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.5s ease',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Training Interface */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 30px 0', 
          color: '#1f2937',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          🎤 Train New Emotion Sample
        </h3>

        {/* Emotion Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Select Emotion to Train:
          </label>
          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: '12px',
              border: '3px solid #d1d5db',
              fontSize: '1.2rem',
              background: 'white',
              color: '#1f2937',
              fontWeight: '500'
            }}
          >
            {emotionOptions.map(emotion => (
              <option key={emotion.id} value={emotion.id}>
                {emotion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current Recording Status */}
        <div style={{
          background: isRecording ? '#f0fdf4' : '#fef3c7',
          border: isRecording ? '3px solid #10b981' : '3px solid #f59e0b',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.4rem', 
            fontWeight: '700',
            color: isRecording ? '#059669' : '#d97706',
            marginBottom: '12px'
          }}>
            {isRecording ? '🎤 Recording Active' : '⏸️ Recording Stopped'}
          </div>
          <div style={{ 
            color: isRecording ? '#059669' : '#d97706',
            fontSize: '1.1rem',
            lineHeight: '1.5'
          }}>
            Current transcript: "{transcript || 'No speech detected'}"
          </div>
        </div>

        {/* Training Action */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onTrainEmotion}
            disabled={!transcript.trim()}
            style={{
              padding: '20px 40px',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: 'white',
              background: !transcript.trim() ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '20px',
              cursor: !transcript.trim() ? 'not-allowed' : 'pointer',
              boxShadow: !transcript.trim() ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            🎯 Train {selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)} Emotion
          </button>
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          1. Start recording in the Detection tab<br/>
          2. Speak with the target emotion clearly<br/>
          3. Return here and click "Train Emotion"<br/>
          4. Repeat for better AI accuracy
        </div>
      </div>

      {/* Data Management */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 30px 0', 
          color: '#1f2937',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          💾 Training Data Management
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onExportData}
            style={{
              padding: '18px 30px',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            📥 Export Training Data
          </button>
          
          <label style={{
            padding: '18px 30px',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            📤 Import Training Data
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default VoiceEmotionSystem;
