// Enhanced Voice Emotion Analyzer with Mock Vosk Integration V2.0
// Advanced voice emotion detection using acoustic features and mock speech recognition
// Optimized for working with the mock Vosk system while providing real emotional insights

import { mockVoskManager } from './mockVoskManager.js';

/**
 * Enhanced Voice Emotion Analyzer
 * Combines real audio analysis with mock speech recognition for comprehensive emotion detection
 */
export class EnhancedVoiceEmotionAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.stream = null;
    this.isRecording = false;
    this.isAnalyzing = false;
    
    // Audio analysis settings
    this.audioConfig = {
      sampleRate: 44100,
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      minDecibels: -90,
      maxDecibels: -10
    };
    
    // Voice feature extraction
    this.voiceFeatures = {
      pitch: [],
      energy: [],
      spectralCentroid: [],
      zeroCrossingRate: [],
      mfcc: [],
      formants: [],
      jitter: [],
      shimmer: []
    };
    
    // Real-time analysis state
    this.analysisState = {
      currentFeatures: {},
      emotionHistory: [],
      confidenceHistory: [],
      realTimeResults: null,
      processingQueue: []
    };
    
    // Emotion-specific voice patterns (research-based)
    this.voiceEmotionPatterns = {
      joy: {
        pitch: { mean: [180, 350], variance: [200, 800], trend: 'rising' },
        energy: { mean: [0.4, 1.0], variance: [0.2, 0.6] },
        spectralCentroid: { mean: [1000, 4000], variance: [500, 1500] },
        speechRate: { multiplier: [1.1, 1.8] },
        voiceQuality: { brightness: [0.6, 1.0], richness: [0.5, 0.9] }
      },
      sadness: {
        pitch: { mean: [80, 200], variance: [20, 150], trend: 'falling' },
        energy: { mean: [0.05, 0.4], variance: [0.05, 0.3] },
        spectralCentroid: { mean: [500, 2000], variance: [200, 800] },
        speechRate: { multiplier: [0.4, 0.9] },
        voiceQuality: { breathiness: [0.3, 1.0], darkness: [0.4, 0.9] }
      },
      anger: {
        pitch: { mean: [150, 400], variance: [300, 1200], trend: 'irregular' },
        energy: { mean: [0.6, 1.0], variance: [0.3, 0.8] },
        spectralCentroid: { mean: [1500, 5000], variance: [800, 2000] },
        speechRate: { multiplier: [0.8, 1.4] },
        voiceQuality: { harshness: [0.4, 1.0], tension: [0.5, 1.0] }
      },
      fear: {
        pitch: { mean: [200, 450], variance: [400, 1000], trend: 'trembling' },
        energy: { mean: [0.2, 0.7], variance: [0.3, 0.8] },
        spectralCentroid: { mean: [1200, 4500], variance: [600, 1800] },
        speechRate: { multiplier: [1.2, 2.0] },
        voiceQuality: { tremor: [0.3, 1.0], breathShortness: [0.4, 1.0] }
      },
      frustration: {
        pitch: { mean: [120, 300], variance: [150, 600], trend: 'clipped' },
        energy: { mean: [0.3, 0.8], variance: [0.2, 0.7] },
        spectralCentroid: { mean: [800, 3500], variance: [400, 1200] },
        speechRate: { multiplier: [0.7, 1.3] },
        voiceQuality: { tenseness: [0.4, 1.0], effort: [0.3, 0.8] }
      },
      sarcasm: {
        pitch: { mean: [100, 250], variance: [50, 200], trend: 'exaggerated' },
        energy: { mean: [0.2, 0.6], variance: [0.1, 0.4] },
        spectralCentroid: { mean: [600, 2500], variance: [300, 1000] },
        speechRate: { multiplier: [0.6, 1.1] },
        voiceQuality: { flatness: [0.4, 1.0], deliberateness: [0.5, 0.9] }
      }
    };
    
    // Analysis callbacks
    this.callbacks = {
      onEmotionDetected: null,
      onVoiceFeaturesExtracted: null,
      onTranscriptReceived: null,
      onAnalysisComplete: null
    };
  }

  /**
   * Initialize the voice emotion analyzer
   */
  async initialize() {
    try {
      // Initialize audio context
      await this.initializeAudio();
      
      // Initialize mock Vosk manager
      await mockVoskManager.initialize();
      
      console.log('🎤 Enhanced Voice Emotion Analyzer V2.0 initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize voice emotion analyzer:', error);
      return false;
    }
  }

  /**
   * Initialize audio context and analyzer
   */
  async initializeAudio() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.audioConfig.sampleRate
      });
      
      // Create analyzer node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.audioConfig.fftSize;
      this.analyser.smoothingTimeConstant = this.audioConfig.smoothingTimeConstant;
      this.analyser.minDecibels = this.audioConfig.minDecibels;
      this.analyser.maxDecibels = this.audioConfig.maxDecibels;
      
      console.log('🔊 Audio analysis initialized');
      return true;
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start voice emotion analysis
   */
  async startAnalysis(options = {}) {
    if (this.isRecording) {
      console.warn('⚠️ Analysis already in progress');
      return false;
    }

    try {
      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.audioConfig.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Connect audio stream to analyzer
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      // Setup media recorder for mock Vosk processing
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await this.processRecordedAudio(audioBlob);
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      // Start real-time feature extraction
      this.startRealTimeAnalysis();

      console.log('🎤 Voice emotion analysis started');
      return true;

    } catch (error) {
      console.error('❌ Failed to start voice analysis:', error);
      return false;
    }
  }

  /**
   * Stop voice emotion analysis
   */
  stopAnalysis() {
    if (!this.isRecording) {
      console.warn('⚠️ No analysis in progress');
      return;
    }

    try {
      // Stop media recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      // Stop media stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Stop real-time analysis
      this.stopRealTimeAnalysis();

      this.isRecording = false;
      console.log('⏹️ Voice emotion analysis stopped');

    } catch (error) {
      console.error('❌ Error stopping voice analysis:', error);
    }
  }

  /**
   * Start real-time feature extraction
   */
  startRealTimeAnalysis() {
    const extractFeatures = () => {
      if (!this.isRecording) return;

      try {
        // Extract voice features
        const features = this.extractVoiceFeatures();
        
        // Update analysis state
        this.analysisState.currentFeatures = features;
        
        // Analyze emotions from voice features
        const voiceEmotion = this.analyzeVoiceEmotion(features);
        
        // Update emotion history
        this.updateEmotionHistory(voiceEmotion);
        
        // Trigger callback
        if (this.callbacks.onVoiceFeaturesExtracted) {
          this.callbacks.onVoiceFeaturesExtracted(features, voiceEmotion);
        }

      } catch (error) {
        console.warn('⚠️ Real-time analysis error:', error);
      }

      // Continue analysis
      if (this.isRecording) {
        this.analysisFrameId = requestAnimationFrame(extractFeatures);
      }
    };

    this.analysisFrameId = requestAnimationFrame(extractFeatures);
  }

  /**
   * Stop real-time analysis
   */
  stopRealTimeAnalysis() {
    if (this.analysisFrameId) {
      cancelAnimationFrame(this.analysisFrameId);
      this.analysisFrameId = null;
    }
  }

  /**
   * Extract voice features from audio stream
   */
  extractVoiceFeatures() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqDataArray = new Uint8Array(bufferLength);
    
    // Get time domain data
    this.analyser.getByteTimeDomainData(dataArray);
    
    // Get frequency domain data
    this.analyser.getByteFrequencyData(freqDataArray);
    
    // Extract features
    const features = {
      timestamp: Date.now(),
      
      // Energy features
      energy: this.calculateEnergy(dataArray),
      rmsEnergy: this.calculateRMSEnergy(dataArray),
      
      // Spectral features
      spectralCentroid: this.calculateSpectralCentroid(freqDataArray),
      spectralRolloff: this.calculateSpectralRolloff(freqDataArray),
      spectralFlux: this.calculateSpectralFlux(freqDataArray),
      
      // Pitch estimation (fundamental frequency)
      pitch: this.estimatePitch(dataArray),
      
      // Zero crossing rate
      zeroCrossingRate: this.calculateZeroCrossingRate(dataArray),
      
      // Voice quality indicators
      voiceActivity: this.detectVoiceActivity(dataArray, freqDataArray),
      noiseLevel: this.estimateNoiseLevel(freqDataArray),
      
      // Temporal features
      speechRate: this.estimateSpeechRate(),
      pauseDuration: this.detectPauses(dataArray)
    };
    
    // Store features for temporal analysis
    this.updateFeatureHistory(features);
    
    return features;
  }

  /**
   * Calculate energy of signal
   */
  calculateEnergy(dataArray) {
    let energy = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      energy += value * value;
    }
    return energy / dataArray.length;
  }

  /**
   * Calculate RMS energy
   */
  calculateRMSEnergy(dataArray) {
    const energy = this.calculateEnergy(dataArray);
    return Math.sqrt(energy);
  }

  /**
   * Calculate spectral centroid
   */
  calculateSpectralCentroid(freqDataArray) {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < freqDataArray.length; i++) {
      const magnitude = freqDataArray[i] / 255;
      const frequency = (i * this.audioConfig.sampleRate) / (2 * freqDataArray.length);
      
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate spectral rolloff
   */
  calculateSpectralRolloff(freqDataArray, rolloffPoint = 0.85) {
    const totalMagnitude = freqDataArray.reduce((sum, mag) => sum + mag, 0);
    const threshold = totalMagnitude * rolloffPoint;
    
    let accumulatedMagnitude = 0;
    for (let i = 0; i < freqDataArray.length; i++) {
      accumulatedMagnitude += freqDataArray[i];
      if (accumulatedMagnitude >= threshold) {
        return (i * this.audioConfig.sampleRate) / (2 * freqDataArray.length);
      }
    }
    
    return (freqDataArray.length * this.audioConfig.sampleRate) / (2 * freqDataArray.length);
  }

  /**
   * Calculate spectral flux
   */
  calculateSpectralFlux(freqDataArray) {
    if (!this.previousSpectrum) {
      this.previousSpectrum = [...freqDataArray];
      return 0;
    }
    
    let flux = 0;
    for (let i = 0; i < freqDataArray.length; i++) {
      const diff = freqDataArray[i] - this.previousSpectrum[i];
      flux += Math.max(0, diff);
    }
    
    this.previousSpectrum = [...freqDataArray];
    return flux;
  }

  /**
   * Estimate pitch using autocorrelation
   */
  estimatePitch(dataArray) {
    const correlations = this.autocorrelate(dataArray);
    
    // Find the peak in the autocorrelation
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    // Search in typical pitch range (80-500 Hz)
    const minPeriod = Math.floor(this.audioConfig.sampleRate / 500);
    const maxPeriod = Math.floor(this.audioConfig.sampleRate / 80);
    
    for (let period = minPeriod; period < maxPeriod; period++) {
      if (correlations[period] > maxCorrelation) {
        maxCorrelation = correlations[period];
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? this.audioConfig.sampleRate / bestPeriod : 0;
  }

  /**
   * Autocorrelation for pitch detection
   */
  autocorrelate(dataArray) {
    const correlations = new Array(dataArray.length).fill(0);
    
    for (let lag = 0; lag < dataArray.length; lag++) {
      let correlation = 0;
      for (let i = 0; i < dataArray.length - lag; i++) {
        const value1 = (dataArray[i] - 128) / 128;
        const value2 = (dataArray[i + lag] - 128) / 128;
        correlation += value1 * value2;
      }
      correlations[lag] = correlation / (dataArray.length - lag);
    }
    
    return correlations;
  }

  /**
   * Calculate zero crossing rate
   */
  calculateZeroCrossingRate(dataArray) {
    let crossings = 0;
    const centerValue = 128;
    
    for (let i = 1; i < dataArray.length; i++) {
      if ((dataArray[i - 1] >= centerValue) !== (dataArray[i] >= centerValue)) {
        crossings++;
      }
    }
    
    return crossings / dataArray.length;
  }

  /**
   * Detect voice activity
   */
  detectVoiceActivity(dataArray, freqDataArray) {
    const energy = this.calculateEnergy(dataArray);
    const spectralCentroid = this.calculateSpectralCentroid(freqDataArray);
    const zcr = this.calculateZeroCrossingRate(dataArray);
    
    // Simple voice activity detection based on energy and spectral characteristics
    const energyThreshold = 0.01;
    const spectralThreshold = 500;
    const zcrThreshold = 0.1;
    
    return energy > energyThreshold && 
           spectralCentroid > spectralThreshold && 
           zcr < zcrThreshold;
  }

  /**
   * Estimate noise level
   */
  estimateNoiseLevel(freqDataArray) {
    // Estimate noise from low-frequency components
    const noiseRegion = freqDataArray.slice(0, Math.floor(freqDataArray.length * 0.1));
    return noiseRegion.reduce((sum, mag) => sum + mag, 0) / noiseRegion.length;
  }

  /**
   * Estimate speech rate
   */
  estimateSpeechRate() {
    // Simplified speech rate estimation based on voice activity patterns
    if (this.voiceFeatures.energy.length < 10) return 1.0;
    
    const recentEnergy = this.voiceFeatures.energy.slice(-10);
    const energyVariance = this.calculateVariance(recentEnergy);
    
    // Higher variance typically indicates faster speech
    return Math.max(0.5, Math.min(2.0, 1.0 + (energyVariance - 0.1) * 2));
  }

  /**
   * Detect pauses in speech
   */
  detectPauses(dataArray) {
    const energy = this.calculateEnergy(dataArray);
    const silenceThreshold = 0.005;
    
    if (energy < silenceThreshold) {
      this.currentPauseDuration = (this.currentPauseDuration || 0) + 1;
    } else {
      this.currentPauseDuration = 0;
    }
    
    return this.currentPauseDuration;
  }

  /**
   * Update feature history for temporal analysis
   */
  updateFeatureHistory(features) {
    const maxHistoryLength = 100; // Keep last 100 frames
    
    Object.keys(features).forEach(featureName => {
      if (!this.voiceFeatures[featureName]) {
        this.voiceFeatures[featureName] = [];
      }
      
      this.voiceFeatures[featureName].push(features[featureName]);
      
      if (this.voiceFeatures[featureName].length > maxHistoryLength) {
        this.voiceFeatures[featureName].shift();
      }
    });
  }

  /**
   * Analyze voice emotion from extracted features
   */
  analyzeVoiceEmotion(features) {
    const emotionScores = {};
    
    // Analyze each emotion pattern
    Object.entries(this.voiceEmotionPatterns).forEach(([emotion, patterns]) => {
      let score = 0;
      let validFeatures = 0;
      
      // Pitch analysis
      if (patterns.pitch && features.pitch > 0) {
        const pitchScore = this.scoreFeatureMatch(features.pitch, patterns.pitch.mean);
        score += pitchScore * 0.3;
        validFeatures++;
      }
      
      // Energy analysis
      if (patterns.energy) {
        const energyScore = this.scoreFeatureMatch(features.energy, patterns.energy.mean);
        score += energyScore * 0.25;
        validFeatures++;
      }
      
      // Spectral centroid analysis
      if (patterns.spectralCentroid) {
        const spectralScore = this.scoreFeatureMatch(features.spectralCentroid, patterns.spectralCentroid.mean);
        score += spectralScore * 0.2;
        validFeatures++;
      }
      
      // Speech rate analysis (requires temporal context)
      if (patterns.speechRate && this.voiceFeatures.speechRate && this.voiceFeatures.speechRate.length > 5) {
        const avgSpeechRate = this.voiceFeatures.speechRate.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const rateScore = this.scoreFeatureMatch(avgSpeechRate, patterns.speechRate.multiplier);
        score += rateScore * 0.15;
        validFeatures++;
      }
      
      // Voice quality indicators (simplified)
      score += this.analyzeVoiceQuality(features, patterns.voiceQuality || {}) * 0.1;
      validFeatures++;
      
      emotionScores[emotion] = validFeatures > 0 ? score / validFeatures : 0;
    });
    
    // Normalize scores
    const total = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(emotionScores).forEach(emotion => {
        emotionScores[emotion] = emotionScores[emotion] / total;
      });
    }
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores).reduce((a, b) => 
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b
    )[0];
    
    return {
      detected: dominantEmotion || 'neutral',
      confidence: emotionScores[dominantEmotion] || 0.1,
      breakdown: emotionScores,
      features: features
    };
  }

  /**
   * Score how well a feature matches an expected range
   */
  scoreFeatureMatch(value, range) {
    if (!Array.isArray(range) || range.length !== 2) return 0;
    
    const [min, max] = range;
    if (value >= min && value <= max) {
      // Perfect match - calculate how close to optimal
      const center = (min + max) / 2;
      const distance = Math.abs(value - center);
      const maxDistance = (max - min) / 2;
      return 1.0 - (distance / maxDistance) * 0.5; // Score between 0.5 and 1.0
    } else {
      // Outside range - calculate penalty
      const penalty = value < min ? (min - value) / min : (value - max) / max;
      return Math.max(0, 1.0 - penalty);
    }
  }

  /**
   * Analyze voice quality indicators
   */
  analyzeVoiceQuality(features, qualityPatterns) {
    let qualityScore = 0;
    let qualityCount = 0;
    
    // Breathiness (high energy in high frequencies relative to low)
    if (qualityPatterns.breathiness) {
      const breathiness = features.spectralCentroid / (features.energy + 0.001);
      qualityScore += this.scoreFeatureMatch(breathiness, [0.3, 1.0]);
      qualityCount++;
    }
    
    // Harshness (irregular spectral flux)
    if (qualityPatterns.harshness && features.spectralFlux) {
      const harshness = features.spectralFlux / 100; // Normalize
      qualityScore += this.scoreFeatureMatch(harshness, [0.4, 1.0]);
      qualityCount++;
    }
    
    // Tremor (pitch instability - requires history)
    if (qualityPatterns.tremor && this.voiceFeatures.pitch.length > 10) {
      const pitchVariance = this.calculateVariance(this.voiceFeatures.pitch.slice(-10));
      const tremor = Math.min(1.0, pitchVariance / 1000);
      qualityScore += this.scoreFeatureMatch(tremor, [0.3, 1.0]);
      qualityCount++;
    }
    
    return qualityCount > 0 ? qualityScore / qualityCount : 0.5;
  }

  /**
   * Calculate variance of an array
   */
  calculateVariance(arr) {
    if (arr.length < 2) return 0;
    
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Update emotion history
   */
  updateEmotionHistory(emotionResult) {
    this.analysisState.emotionHistory.push({
      ...emotionResult,
      timestamp: Date.now()
    });
    
    // Keep only recent history
    const maxHistory = 100;
    if (this.analysisState.emotionHistory.length > maxHistory) {
      this.analysisState.emotionHistory = this.analysisState.emotionHistory.slice(-maxHistory);
    }
    
    // Update confidence history
    this.analysisState.confidenceHistory.push({
      confidence: emotionResult.confidence,
      timestamp: Date.now()
    });
    
    if (this.analysisState.confidenceHistory.length > maxHistory) {
      this.analysisState.confidenceHistory = this.analysisState.confidenceHistory.slice(-maxHistory);
    }
    
    // Trigger callback
    if (this.callbacks.onEmotionDetected) {
      this.callbacks.onEmotionDetected(emotionResult);
    }
  }

  /**
   * Process recorded audio with mock Vosk
   */
  async processRecordedAudio(audioBlob) {
    try {
      // Use mock Vosk for transcription
      const recognizer = await mockVoskManager.createRecognizer();
      const transcript = await this.transcribeWithMockVosk(audioBlob, recognizer);
      
      // Combine voice analysis with text analysis
      const combinedAnalysis = await this.combineVoiceAndTextAnalysis(transcript);
      
      // Trigger callbacks
      if (this.callbacks.onTranscriptReceived) {
        this.callbacks.onTranscriptReceived(transcript);
      }
      
      if (this.callbacks.onAnalysisComplete) {
        this.callbacks.onAnalysisComplete(combinedAnalysis);
      }
      
      return combinedAnalysis;
      
    } catch (error) {
      console.error('❌ Audio processing failed:', error);
      return null;
    }
  }

  /**
   * Transcribe audio using mock Vosk system
   */
  async transcribeWithMockVosk(audioBlob, recognizer) {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Mock transcription based on audio characteristics
      const audioLength = arrayBuffer.byteLength;
      const estimatedWords = Math.max(1, Math.floor(audioLength / 10000)); // Rough estimate
      
      // Generate mock transcript based on detected emotions
      const recentEmotions = this.analysisState.emotionHistory.slice(-5);
      const dominantEmotion = this.findDominantEmotion(recentEmotions);
      
      const mockTranscript = this.generateMockTranscript(dominantEmotion, estimatedWords);
      
      console.log(`🎤 Mock transcription (${dominantEmotion}): ${mockTranscript}`);
      return mockTranscript;
      
    } catch (error) {
      console.error('❌ Mock transcription failed:', error);
      return 'Mock transcription: Audio analysis in progress.';
    }
  }

  /**
   * Generate mock transcript based on detected emotion
   */
  generateMockTranscript(emotion, wordCount) {
    const transcriptTemplates = {
      joy: [
        'I am so excited about this amazing breakthrough we have achieved',
        'This is absolutely wonderful and I cannot believe how well everything is working',
        'The results are fantastic and exceed all our expectations by far',
        'I love how this project is turning out to be such a huge success'
      ],
      sadness: [
        'I feel quite disappointed with the current situation and outcomes',
        'Unfortunately things did not work out as we had hoped they would',
        'The results are not what we expected and I feel rather down about it',
        'This is quite discouraging and makes me feel somewhat sad'
      ],
      anger: [
        'This is absolutely ridiculous and I cannot stand how things are going',
        'I am completely fed up with these ongoing problems and issues',
        'This situation is totally unacceptable and needs to be fixed immediately',
        'Why does everything have to be so difficult and frustrating all the time'
      ],
      fear: [
        'I am quite worried about what might happen if this continues',
        'This situation makes me feel very anxious and concerned about the future',
        'I am afraid that things might not work out as we need them to',
        'The uncertainty is quite frightening and makes me nervous'
      ],
      frustration: [
        'This is quite annoying and I am getting tired of these repeated issues',
        'I am struggling with these ongoing problems that keep coming up',
        'These difficulties are becoming quite bothersome and need attention',
        'I find this situation rather troublesome and hope it improves soon'
      ],
      sarcasm: [
        'Oh wonderful another fantastic problem to deal with how convenient',
        'Sure this is exactly what we needed right now how perfect',
        'Great job everyone this is working out brilliantly as expected',
        'Oh lovely another wonderful surprise how absolutely delightful'
      ],
      neutral: [
        'The analysis is proceeding normally with standard voice processing',
        'We are currently evaluating the situation and gathering more information',
        'The system is functioning properly and producing expected results',
        'Voice emotion detection is active and monitoring speech patterns'
      ]
    };
    
    const templates = transcriptTemplates[emotion] || transcriptTemplates.neutral;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Adjust length based on wordCount
    const words = template.split(' ');
    if (words.length > wordCount) {
      return words.slice(0, wordCount).join(' ') + '.';
    } else if (words.length < wordCount) {
      // Repeat or extend
      const repeated = template + ' ' + template;
      return repeated.split(' ').slice(0, wordCount).join(' ') + '.';
    }
    
    return template;
  }

  /**
   * Find dominant emotion from history
   */
  findDominantEmotion(emotionHistory) {
    if (!emotionHistory || emotionHistory.length === 0) return 'neutral';
    
    const emotionCounts = {};
    emotionHistory.forEach(result => {
      const emotion = result.detected || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b
    )[0];
  }

  /**
   * Combine voice analysis with text analysis (simplified version)
   */
  async combineVoiceAndTextAnalysis(transcript) {
    try {
      // Get recent voice emotion analysis
      const recentVoiceAnalysis = this.analysisState.emotionHistory.slice(-5);
      const avgVoiceEmotion = this.averageEmotionResults(recentVoiceAnalysis);
      
      // Simple text analysis (without BERT to avoid dependency issues)
      const textAnalysis = this.simpleTextAnalysis(transcript);
      
      // Combine results using weighted fusion
      const combinedResult = this.fuseVoiceAndTextEmotions(avgVoiceEmotion, textAnalysis);
      
      return {
        transcript: transcript,
        voiceAnalysis: avgVoiceEmotion,
        textAnalysis: textAnalysis,
        combinedResult: combinedResult,
        metadata: {
          analysisType: 'voice_text_fusion',
          timestamp: Date.now(),
          voiceFeatures: this.analysisState.currentFeatures,
          confidenceLevel: this.getOverallConfidenceLevel(combinedResult)
        }
      };
      
    } catch (error) {
      console.error('❌ Voice-text combination failed:', error);
      return {
        transcript: transcript,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Simple text analysis without external dependencies
   */
  simpleTextAnalysis(text) {
    const emotionKeywords = {
      joy: ['happy', 'excited', 'wonderful', 'amazing', 'fantastic', 'great', 'awesome', 'love', 'breakthrough', 'success'],
      sadness: ['sad', 'disappointed', 'down', 'unfortunate', 'discouraging', 'hoped', 'expected'],
      anger: ['ridiculous', 'fed up', 'unacceptable', 'difficult', 'frustrating', 'problems', 'issues'],
      fear: ['worried', 'anxious', 'concerned', 'afraid', 'frightening', 'nervous', 'uncertainty'],
      frustration: ['annoying', 'tired', 'struggling', 'bothersome', 'troublesome', 'repeated', 'ongoing'],
      sarcasm: ['wonderful', 'fantastic', 'perfect', 'convenient', 'brilliant', 'delightful', 'exactly'],
      neutral: ['analysis', 'proceeding', 'evaluating', 'information', 'functioning', 'monitoring']
    };

    const scores = {};
    const lowerText = text.toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const matches = lowerText.split(keyword).length - 1;
        score += matches * 0.2;
      });
      scores[emotion] = Math.min(1.0, score);
    });

    // Normalize scores
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(scores).forEach(emotion => {
        scores[emotion] = scores[emotion] / total;
      });
    }

    const dominantEmotion = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0] || 'neutral';

    return {
      detected: dominantEmotion,
      confidence: scores[dominantEmotion] || 0.1,
      breakdown: scores
    };
  }

  /**
   * Average emotion results from multiple analyses
   */
  averageEmotionResults(results) {
    if (!results || results.length === 0) {
      return { detected: 'neutral', confidence: 0.1, breakdown: {} };
    }
    
    const avgBreakdown = {};
    const emotions = new Set();
    
    // Collect all emotions
    results.forEach(result => {
      if (result.breakdown) {
        Object.keys(result.breakdown).forEach(emotion => emotions.add(emotion));
      }
    });
    
    // Average scores
    emotions.forEach(emotion => {
      const scores = results
        .map(result => result.breakdown[emotion] || 0)
        .filter(score => score > 0);
      
      if (scores.length > 0) {
        avgBreakdown[emotion] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(avgBreakdown).reduce((a, b) => 
      avgBreakdown[a[0]] > avgBreakdown[b[0]] ? a : b
    )[0] || 'neutral';
    
    return {
      detected: dominantEmotion,
      confidence: avgBreakdown[dominantEmotion] || 0.1,
      breakdown: avgBreakdown
    };
  }

  /**
   * Fuse voice and text emotion analyses
   */
  fuseVoiceAndTextEmotions(voiceResult, textResult) {
    const fusionWeights = {
      voice: 0.4,  // Voice analysis weight
      text: 0.6    // Text analysis weight (typically more reliable)
    };
    
    const fusedBreakdown = {};
    const allEmotions = new Set([
      ...Object.keys(voiceResult.breakdown || {}),
      ...Object.keys(textResult.breakdown || {})
    ]);
    
    allEmotions.forEach(emotion => {
      const voiceScore = voiceResult.breakdown[emotion] || 0;
      const textScore = textResult.breakdown[emotion] || 0;
      
      fusedBreakdown[emotion] = (
        voiceScore * fusionWeights.voice +
        textScore * fusionWeights.text
      );
    });
    
    // Normalize
    const total = Object.values(fusedBreakdown).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(fusedBreakdown).forEach(emotion => {
        fusedBreakdown[emotion] = fusedBreakdown[emotion] / total;
      });
    }
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(fusedBreakdown).reduce((a, b) => 
      fusedBreakdown[a[0]] > fusedBreakdown[b[0]] ? a : b
    )[0] || 'neutral';
    
    return {
      detected: dominantEmotion,
      confidence: fusedBreakdown[dominantEmotion] || 0.1,
      breakdown: fusedBreakdown,
      fusionWeights: fusionWeights
    };
  }

  /**
   * Get overall confidence level
   */
  getOverallConfidenceLevel(result) {
    const confidence = result.confidence || 0;
    
    if (confidence > 0.8) return 'very_high';
    if (confidence > 0.6) return 'high';
    if (confidence > 0.4) return 'medium';
    if (confidence > 0.2) return 'low';
    return 'very_low';
  }

  /**
   * Set analysis callbacks
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current analysis state
   */
  getAnalysisState() {
    return {
      isRecording: this.isRecording,
      isAnalyzing: this.isAnalyzing,
      currentFeatures: this.analysisState.currentFeatures,
      emotionHistory: this.analysisState.emotionHistory.slice(-10), // Last 10 results
      averageConfidence: this.getAverageConfidence(),
      totalAnalyses: this.analysisState.emotionHistory.length
    };
  }

  /**
   * Get average confidence from recent analyses
   */
  getAverageConfidence() {
    const confidences = this.analysisState.confidenceHistory.slice(-10);
    if (confidences.length === 0) return 0;
    
    const sum = confidences.reduce((total, item) => total + item.confidence, 0);
    return Math.round((sum / confidences.length) * 100) / 100;
  }

  /**
   * Reset analysis state
   */
  reset() {
    this.stopAnalysis();
    this.analysisState = {
      currentFeatures: {},
      emotionHistory: [],
      confidenceHistory: [],
      realTimeResults: null,
      processingQueue: []
    };
    this.voiceFeatures = {
      pitch: [],
      energy: [],
      spectralCentroid: [],
      zeroCrossingRate: [],
      mfcc: [],
      formants: [],
      jitter: [],
      shimmer: []
    };
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.stopAnalysis();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.stream = null;
  }
}

// Export the enhanced voice emotion analyzer
export default EnhancedVoiceEmotionAnalyzer;
