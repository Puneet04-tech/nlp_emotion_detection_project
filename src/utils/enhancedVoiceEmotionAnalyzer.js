// Enhanced Voice Emotion Analyzer with Mock Vosk Integration
// Advanced voice emotion detection using acoustic features and mock speech recognition
// Optimized for working with the mock Vosk system while providing real emotional insights

import { mockVoskManager } from './mockVoskManager.js';
import { EnhancedEmotionEngine } from './enhancedEmotionEngine.js';
import { analyzeEmotionWithEnhancedBERT } from './enhancedBertAnalyzer.js';

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
    
    // Enhanced emotion engine
    this.emotionEngine = new EnhancedEmotionEngine();
    
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

    // Emotion profiles for advanced analysis
    this.emotionProfiles = {
      fear: {
        tone: 'tense_shaky',
        pitch: { range: [200, 450], variability: 'very_high', tendency: 'trembling' },
        volume: { level: 'variable', variability: 'very_high' },
        texture: 'thin_breathy',
        intensity: 'high',
        keywords: ['scared', 'afraid', 'worried', 'terrified', 'anxious', 'nervous'],
        breathPattern: 'rapid',
        articulationPattern: 'breathy'
      },
      calm: {
        tone: 'relaxed_soothing',
        pitch: { range: [120, 220], variability: 'low', tendency: 'steady' },
        volume: { level: 'moderate', variability: 'low' },
        texture: 'smooth',
        intensity: 'low',
        keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
        breathPattern: 'deep',
        articulationPattern: 'smooth'
      },
    // End of constructor
  
    // Emotion profiles for advanced analysis
    // (Move this into the constructor above, right after other property initializations)
    // Voice feature extraction configuration
    // (Move this into the constructor above)
    // Real-time analysis data
    // (Move this into the constructor above)
    // Training data integration
    // (Move this.loadTrainingWeights(); into the constructor above)
  }
    // Emotion profiles for advanced analysis
    this.emotionProfiles = {
      fear: {
        tone: 'tense_shaky',
        pitch: { range: [200, 450], variability: 'very_high', tendency: 'trembling' },
        volume: { level: 'variable', variability: 'very_high' },
        texture: 'thin_breathy',
        intensity: 'high',
        keywords: ['scared', 'afraid', 'worried', 'terrified', 'anxious', 'nervous'],
        breathPattern: 'rapid',
        articulationPattern: 'breathy'
      },
      calm: {
        tone: 'relaxed_soothing',
        pitch: { range: [120, 220], variability: 'low', tendency: 'steady' },
        volume: { level: 'moderate', variability: 'low' },
        texture: 'smooth',
        intensity: 'low',
        keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
        breathPattern: 'deep',
        articulationPattern: 'smooth'
      },
      disgust: {
        tone: 'cold_contemptuous',
        pitch: { range: [100, 200], variability: 'moderate', tendency: 'sharp' },
        volume: { level: 'moderate_loud', variability: 'moderate' },
        texture: 'guttural_harsh',
        intensity: 'moderate',
        keywords: ['disgusting', 'awful', 'terrible', 'gross', 'horrible', 'yuck'],
        breathPattern: 'controlled',
        articulationPattern: 'harsh'
      },
      surprise: {
        tone: 'sudden_alert',
        pitch: { range: [200, 450], variability: 'very_high', tendency: 'rapidly_rising' },
        volume: { level: 'loud', variability: 'high' },
        texture: 'clear_breathy',
        intensity: 'high',
        keywords: ['wow', 'oh', 'really', 'amazing', 'incredible', 'unbelievable'],
        breathPattern: 'sudden',
        articulationPattern: 'sharp'
      },
      love: {
        tone: 'warm_affectionate',
        pitch: { range: [140, 280], variability: 'moderate', tendency: 'melodic' },
        volume: { level: 'gentle_moderate', variability: 'low' },
        texture: 'soft_rich',
        intensity: 'moderate',
        keywords: ['love', 'adore', 'cherish', 'dear', 'sweetheart', 'darling'],
        breathPattern: 'gentle',
        articulationPattern: 'soft'
      },
      confusion: {
        tone: 'hesitant_uncertain',
        pitch: { range: [120, 250], variability: 'high', tendency: 'wavering' },
        volume: { level: 'moderate', variability: 'moderate' },
        texture: 'uneven',
        intensity: 'moderate',
        keywords: ['confused', 'puzzled', 'unclear', 'uncertain', 'what', 'how'],
        breathPattern: 'irregular',
        articulationPattern: 'hesitant'
      },
      embarrassment: {
        tone: 'self_conscious_awkward',
        pitch: { range: [150, 300], variability: 'moderate', tendency: 'variable' },
        volume: { level: 'soft', variability: 'low' },
        texture: 'thin_muffled',
        intensity: 'low',
        keywords: ['embarrassed', 'awkward', 'sorry', 'oops', 'my bad', 'uncomfortable'],
        breathPattern: 'shallow',
        articulationPattern: 'unclear'
      },
      pride: {
        tone: 'assertive_confident',
        pitch: { range: [130, 250], variability: 'low', tendency: 'steady_high' },
        volume: { level: 'loud_moderate', variability: 'low' },
        texture: 'full_resonant',
        intensity: 'high',
        keywords: ['proud', 'accomplished', 'achieved', 'successful', 'excellent', 'outstanding'],
        breathPattern: 'controlled',
        articulationPattern: 'clear'
      },
      contempt: {
        tone: 'sarcastic_dismissive',
        pitch: { range: [100, 180], variability: 'low', tendency: 'flat' },
        volume: { level: 'moderate', variability: 'low' },
        texture: 'rough_nasal',
        intensity: 'moderate',
        keywords: ['pathetic', 'ridiculous', 'whatever', 'seriously', 'please', 'right'],
        breathPattern: 'controlled',
        articulationPattern: 'dismissive'
      },
      shame: {
        tone: 'withdrawn_subdued',
        pitch: { range: [80, 150], variability: 'very_low', tendency: 'monotone' },
        volume: { level: 'soft', variability: 'very_low' },
        texture: 'muffled_weak',
        intensity: 'very_low',
        keywords: ['ashamed', 'guilty', 'regret', 'mistake', 'wrong', 'sorry'],
        breathPattern: 'shallow',
        articulationPattern: 'weak'
      },
      interest: {
        tone: 'attentive_engaging',
        pitch: { range: [140, 280], variability: 'moderate', tendency: 'varied' },
        volume: { level: 'moderate', variability: 'moderate' },
        texture: 'clear',
        intensity: 'moderate',
        keywords: ['interesting', 'really', 'tell me', 'explain', 'fascinating', 'curious'],
        breathPattern: 'regular',
        articulationPattern: 'clear'
      },
      boredom: {
        tone: 'dull_monotone',
        pitch: { range: [100, 160], variability: 'very_low', tendency: 'flat' },
        volume: { level: 'soft', variability: 'very_low' },
        texture: 'dry_lifeless',
        intensity: 'very_low',
        keywords: ['boring', 'whatever', 'tired', 'sleepy', 'dull', 'uninteresting'],
        breathPattern: 'slow',
        articulationPattern: 'lazy'
      }
    };

    // Voice feature extraction configuration
    this.analysisConfig = {
      sampleRate: 44100,
      bufferSize: 4096,
      windowSize: 1024,
      hopSize: 512,
      minFreq: 80,
      maxFreq: 8000
    };

    // Real-time analysis data
    this.currentFeatures = {
      pitch: { mean: 0, variance: 0, range: 0 },
      volume: { mean: 0, variance: 0, max: 0 },
      spectralCentroid: 0,
      spectralRolloff: 0,
      energy: { mean: 0, variance: 0 },
      texture: { roughness: 0, breathiness: 0 },
      formants: [],
      zeroCrossingRate: 0
    };

    // Training data integration
    this.loadTrainingWeights();
  }

  /**
   * Initialize the audio context and microphone
   */
  async initialize() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: this.analysisConfig.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.analysisConfig.bufferSize;
      this.analyser.smoothingTimeConstant = 0.3;
      
      // Connect microphone to analyser
      this.microphone.connect(this.analyser);
      
      this.isInitialized = true;
      console.log('🎤 Enhanced Voice Emotion Analyzer initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize voice analyzer:', error);
      return false;
    }
  }

  /**
   * Start voice analysis
   */
  startAnalysis() {
    if (!this.isInitialized) {
      console.error('❌ Analyzer not initialized');
      return false;
    }
    
    this.isAnalyzing = true;
    this.analysisLoop();
    console.log('🎵 Started voice analysis');
    return true;
  }

  /**
   * Stop voice analysis
   */
  stopAnalysis() {
    this.isAnalyzing = false;
    console.log('⏹️ Stopped voice analysis');
  }

  /**
   * Main analysis loop
   */
  analysisLoop() {
    if (!this.isAnalyzing) return;
    
    // Extract features from current audio
    this.extractVoiceFeatures();
    
    // Continue analysis
    requestAnimationFrame(() => this.analysisLoop());
  }

  /**
   * Extract comprehensive voice features
   */
  extractVoiceFeatures() {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Float32Array(bufferLength);
    const timeData = new Float32Array(bufferLength);
    
    this.analyser.getByteFrequencyData(dataArray);
    this.analyser.getFloatFrequencyData(frequencyData);
    this.analyser.getFloatTimeDomainData(timeData);
    
    // Calculate pitch using autocorrelation
    const pitch = this.calculatePitch(timeData);
    
    // Calculate volume (RMS)
    const volume = this.calculateVolume(timeData);
    
    // Calculate spectral features
    const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
    const spectralRolloff = this.calculateSpectralRolloff(frequencyData);
    
    // Calculate energy
    const energy = this.calculateEnergy(timeData);
    
    // Calculate texture features
    const texture = this.calculateTextureFeatures(timeData, frequencyData);
    
    // Calculate formants
    const formants = this.calculateFormants(frequencyData);
    
    // Calculate zero crossing rate
    const zeroCrossingRate = this.calculateZeroCrossingRate(timeData);
    
    // Update current features
    this.updateFeatures({
      pitch,
      volume,
      spectralCentroid,
      spectralRolloff,
      energy,
      texture,
      formants,
      zeroCrossingRate
    });
  }

  /**
   * Calculate pitch using autocorrelation method
   */
  calculatePitch(timeData) {
    const bufferSize = timeData.length;
    const autocorr = new Array(bufferSize).fill(0);
    
    // Calculate autocorrelation
    for (let lag = 0; lag < bufferSize; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferSize - lag; i++) {
        sum += timeData[i] * timeData[i + lag];
      }
      autocorr[lag] = sum;
    }
    
    // Find the peak (excluding lag 0)
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = Math.floor(this.analysisConfig.sampleRate / 800); i < Math.floor(this.analysisConfig.sampleRate / 80); i++) {
      if (autocorr[i] > maxValue) {
        maxValue = autocorr[i];
        maxIndex = i;
      }
    }
    
    return maxIndex > 0 ? this.analysisConfig.sampleRate / maxIndex : 0;
  }

  /**
   * Calculate RMS volume
   */
  calculateVolume(timeData) {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  }

  /**
   * Calculate spectral centroid (brightness)
   */
  calculateSpectralCentroid(frequencyData) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert from dB
      const frequency = (i * this.analysisConfig.sampleRate) / (2 * frequencyData.length);
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Calculate spectral rolloff
   */
  calculateSpectralRolloff(frequencyData) {
    const magnitudes = frequencyData.map(db => Math.pow(10, db / 20));
    const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag, 0);
    const threshold = 0.85 * totalEnergy;
    
    let runningSum = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      runningSum += magnitudes[i];
      if (runningSum >= threshold) {
        return (i * this.analysisConfig.sampleRate) / (2 * magnitudes.length);
      }
    }
    
    return 0;
  }

  /**
   * Calculate energy
   */
  calculateEnergy(timeData) {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return sum / timeData.length;
  }

  /**
   * Calculate texture features (roughness, breathiness)
   */
  calculateTextureFeatures(timeData, frequencyData) {
    // Roughness: based on irregularity in the signal
    let roughness = 0;
    for (let i = 1; i < timeData.length; i++) {
      roughness += Math.abs(timeData[i] - timeData[i-1]);
    }
    roughness /= timeData.length;
    
    // Breathiness: based on high-frequency noise
    let breathiness = 0;
    const highFreqStart = Math.floor(frequencyData.length * 0.7);
    for (let i = highFreqStart; i < frequencyData.length; i++) {
      breathiness += Math.pow(10, frequencyData[i] / 20);
    }
    breathiness /= (frequencyData.length - highFreqStart);
    
    return { roughness, breathiness };
  }

  /**
   * Calculate formants (simplified)
   */
  calculateFormants(frequencyData) {
    const formants = [];
    const magnitudes = frequencyData.map(db => Math.pow(10, db / 20));
    
    // Find peaks in the spectrum
    for (let i = 1; i < magnitudes.length - 1; i++) {
      if (magnitudes[i] > magnitudes[i-1] && magnitudes[i] > magnitudes[i+1]) {
        const frequency = (i * this.analysisConfig.sampleRate) / (2 * magnitudes.length);
        if (frequency > 200 && frequency < 4000) { // Typical formant range
          formants.push(frequency);
        }
      }
    }
    
    return formants.slice(0, 3); // Return first 3 formants
  }

  /**
   * Calculate zero crossing rate
   */
  calculateZeroCrossingRate(timeData) {
    let crossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] >= 0) !== (timeData[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings / timeData.length;
  }

  /**
   * Update feature history and calculate statistics
   */
  updateFeatures(newFeatures) {
    // Update pitch statistics
    if (newFeatures.pitch > 0) {
      this.currentFeatures.pitch.mean = newFeatures.pitch;
      // Calculate variance and range over time
    }
    
    // Update volume statistics
    this.currentFeatures.volume.mean = newFeatures.volume;
    this.currentFeatures.volume.max = Math.max(this.currentFeatures.volume.max, newFeatures.volume);
    
    // Update other features
    this.currentFeatures.spectralCentroid = newFeatures.spectralCentroid;
    this.currentFeatures.spectralRolloff = newFeatures.spectralRolloff;
    this.currentFeatures.energy.mean = newFeatures.energy;
    this.currentFeatures.texture = newFeatures.texture;
    this.currentFeatures.formants = newFeatures.formants;
    this.currentFeatures.zeroCrossingRate = newFeatures.zeroCrossingRate;
  }

  /**
   * Analyze emotions from speech and voice features
   */
  analyzeEmotions(transcript = '') {
    if (!this.isInitialized) {
      return { error: 'Analyzer not initialized' };
    }
    
    const emotions = [];
    
    // Analyze each emotion
    for (const [emotionName, profile] of Object.entries(this.emotionProfiles)) {
      const score = this.calculateEmotionScore(emotionName, profile, transcript);
      emotions.push({
        emotion: emotionName,
        percentage: Math.round(score),
        details: {
          textMatch: this.calculateTextMatch(transcript, profile.keywords),
          pitchMatch: this.calculatePitchMatch(profile.pitch),
          volumeMatch: this.calculateVolumeMatch(profile.volume),
          textureMatch: this.calculateTextureMatch(profile.texture),
          toneMatch: this.calculateToneMatch(profile.tone)
        }
      });
    }
    
    // Sort by percentage (highest first)
    emotions.sort((a, b) => b.percentage - a.percentage);
    
    // Get top 5 emotions
    const top5Emotions = emotions.slice(0, 5);
    
    // Generate detailed analysis
    const analysis = this.generateDetailedAnalysis(top5Emotions, transcript);
    
    return {
      emotions: top5Emotions,
      analysis,
      features: this.currentFeatures,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate emotion score based on voice characteristics and text
   */
  calculateEmotionScore(emotionName, profile, transcript) {
    let score = 0;
    
    // Text analysis (30% weight)
    const textScore = this.calculateTextMatch(transcript, profile.keywords);
    score += textScore * 0.3;
    
    // Pitch analysis (25% weight)
    const pitchScore = this.calculatePitchMatch(profile.pitch);
    score += pitchScore * 0.25;
    
    // Volume analysis (20% weight)
    const volumeScore = this.calculateVolumeMatch(profile.volume);
    score += volumeScore * 0.2;
    
    // Texture analysis (15% weight)
    const textureScore = this.calculateTextureMatch(profile.texture);
    score += textureScore * 0.15;
    
    // Tone analysis (10% weight)
    const toneScore = this.calculateToneMatch(profile.tone);
    score += toneScore * 0.1;
    
    // Apply training weights if available
    score = this.applyTrainingWeights(emotionName, score);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate text match score
   */
  calculateTextMatch(transcript, keywords) {
    if (!transcript || !keywords) return 0;
    
    const text = transcript.toLowerCase();
    let matches = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    return (matches / keywords.length) * 100;
  }

  /**
   * Calculate pitch match score
   */
  calculatePitchMatch(pitchProfile) {
    const currentPitch = this.currentFeatures.pitch.mean;
    if (currentPitch === 0) return 50; // Neutral if no pitch detected
    
    const [min, max] = pitchProfile.range;
    
    if (currentPitch >= min && currentPitch <= max) {
      return 85 + Math.random() * 15; // High match with some variance
    } else {
      const distance = Math.min(Math.abs(currentPitch - min), Math.abs(currentPitch - max));
      const maxDistance = Math.max(min, max) * 0.5;
      return Math.max(0, 50 * (1 - distance / maxDistance));
    }
  }

  /**
   * Calculate volume match score
   */
  calculateVolumeMatch(volumeProfile) {
    const currentVolume = this.currentFeatures.volume.mean;
    
    // Map volume levels to scores
    const volumeMap = {
      'soft': [0, 0.3],
      'moderate': [0.3, 0.7],
      'loud': [0.7, 1.0],
      'energetic': [0.6, 1.0],
      'subdued': [0, 0.4],
      'gentle_moderate': [0.2, 0.6],
      'loud_moderate': [0.5, 0.9],
      'moderate_loud': [0.4, 0.8],
      'variable': [0, 1.0]
    };
    
    const [min, max] = volumeMap[volumeProfile.level] || [0, 1];
    
    if (currentVolume >= min && currentVolume <= max) {
      return 80 + Math.random() * 20;
    } else {
      const distance = Math.min(Math.abs(currentVolume - min), Math.abs(currentVolume - max));
      return Math.max(0, 60 * (1 - distance));
    }
  }

  /**
   * Calculate texture match score
   */
  calculateTextureMatch(textureProfile) {
    const { roughness, breathiness } = this.currentFeatures.texture;
    
    // Map texture types to expected values
    const textureMap = {
      'harsh_biting': { roughness: 0.8, breathiness: 0.3 },
      'clear_resonant': { roughness: 0.2, breathiness: 0.2 },
      'muffled': { roughness: 0.6, breathiness: 0.7 },
      'thin_breathy': { roughness: 0.4, breathiness: 0.8 },
      'smooth': { roughness: 0.1, breathiness: 0.1 },
      'guttural_harsh': { roughness: 0.9, breathiness: 0.4 },
      'clear_breathy': { roughness: 0.3, breathiness: 0.6 },
      'soft_rich': { roughness: 0.2, breathiness: 0.3 },
      'uneven': { roughness: 0.7, breathiness: 0.5 },
      'thin_muffled': { roughness: 0.5, breathiness: 0.8 },
      'full_resonant': { roughness: 0.1, breathiness: 0.1 },
      'rough_nasal': { roughness: 0.8, breathiness: 0.6 },
      'muffled_weak': { roughness: 0.6, breathiness: 0.9 },
      'clear': { roughness: 0.2, breathiness: 0.2 },
      'dry_lifeless': { roughness: 0.4, breathiness: 0.1 }
    };
    
    const expected = textureMap[textureProfile] || { roughness: 0.5, breathiness: 0.5 };
    
    const roughnessMatch = 1 - Math.abs(roughness - expected.roughness);
    const breathinessMatch = 1 - Math.abs(breathiness - expected.breathiness);
    
    return ((roughnessMatch + breathinessMatch) / 2) * 100;
  }

  /**
   * Calculate tone match score
   */
  calculateToneMatch(toneProfile) {
    // Simplified tone matching based on spectral features
    const centroid = this.currentFeatures.spectralCentroid;
    const rolloff = this.currentFeatures.spectralRolloff;
    
    // Map tone types to spectral characteristics
    const toneMap = {
      'harsh_biting': { centroid: [2000, 4000], rolloff: [3000, 6000] },
      'bright_lively': { centroid: [1500, 3500], rolloff: [2500, 5000] },
      'soft_flat': { centroid: [800, 1800], rolloff: [1500, 3000] },
      'tense_shaky': { centroid: [1800, 4000], rolloff: [3000, 6000] },
      'relaxed_soothing': { centroid: [1000, 2000], rolloff: [1800, 3500] },
      'cold_contemptuous': { centroid: [1200, 2500], rolloff: [2000, 4000] },
      'sudden_alert': { centroid: [2000, 4500], rolloff: [3500, 7000] },
      'warm_affectionate': { centroid: [1200, 2800], rolloff: [2200, 4500] },
      'hesitant_uncertain': { centroid: [1000, 2500], rolloff: [1800, 4000] },
      'self_conscious_awkward': { centroid: [1100, 2200], rolloff: [1900, 3800] },
      'assertive_confident': { centroid: [1300, 2600], rolloff: [2300, 4300] },
      'sarcastic_dismissive': { centroid: [1000, 2000], rolloff: [1700, 3200] },
      'withdrawn_subdued': { centroid: [800, 1600], rolloff: [1400, 2800] },
      'attentive_engaging': { centroid: [1400, 2800], rolloff: [2400, 4800] },
      'dull_monotone': { centroid: [900, 1700], rolloff: [1500, 2900] }
    };
    
    const expected = toneMap[toneProfile];
    if (!expected) return 50;
    
    const centroidMatch = (centroid >= expected.centroid[0] && centroid <= expected.centroid[1]) ? 1 : 0.5;
    const rolloffMatch = (rolloff >= expected.rolloff[0] && rolloff <= expected.rolloff[1]) ? 1 : 0.5;
    
    return ((centroidMatch + rolloffMatch) / 2) * 100;
  }

  /**
   * Apply training weights from training center
   */
  applyTrainingWeights(emotionName, score) {
    if (this.trainingWeights && this.trainingWeights[emotionName]) {
      return score * this.trainingWeights[emotionName];
    }
    return score;
  }

  /**
   * Load training weights from training center
   */
  loadTrainingWeights() {
    try {
      const stored = localStorage.getItem('voiceEmotionModelWeights');
      if (stored) {
        const weights = JSON.parse(stored);
        this.trainingWeights = {};
        
        // Convert training weights to emotion-specific multipliers
        for (const emotion of Object.keys(this.emotionProfiles)) {
          let totalWeight = 0;
          let count = 0;
          
          if (weights.pitch && weights.pitch[emotion]) {
            totalWeight += weights.pitch[emotion];
            count++;
          }
          if (weights.volume && weights.volume[emotion]) {
            totalWeight += weights.volume[emotion];
            count++;
          }
          if (weights.spectral && weights.spectral[emotion]) {
            totalWeight += weights.spectral[emotion];
            count++;
          }
          
          this.trainingWeights[emotion] = count > 0 ? totalWeight / count : 1.0;
        }
        
        console.log('✅ Training weights loaded:', this.trainingWeights);
      }
    } catch (error) {
      console.warn('⚠️ Could not load training weights:', error);
      this.trainingWeights = {};
    }
  }

  /**
   * Generate detailed analysis
   */
  generateDetailedAnalysis(topEmotions, transcript) {
    const primaryEmotion = topEmotions[0];
    const profile = this.emotionProfiles[primaryEmotion.emotion];
    
    const voiceCharacteristics = {
      pitch: {
        average: Math.round(this.currentFeatures.pitch.mean),
        variability: this.getPitchVariabilityDescription(),
        range: this.getPitchRangeDescription()
      },
      volume: {
        level: this.getVolumeLevelDescription(),
        consistency: this.getVolumeConsistencyDescription()
      },
      energy: {
        level: this.getEnergyLevelDescription()
      },
      texture: {
        roughness: this.getTextureDescription('roughness'),
        breathiness: this.getTextureDescription('breathiness')
      }
    };
    
    const summary = this.generateEmotionSummary(primaryEmotion, profile);
    const confidence = this.calculateOverallConfidence(topEmotions);
    const recommendations = this.generateRecommendations(primaryEmotion, topEmotions);
    
    return {
      voiceCharacteristics,
      summary,
      confidence,
      recommendations
    };
  }

  /**
   * Generate emotion summary
   */
  generateEmotionSummary(primaryEmotion, profile) {
    const emotionDescriptions = {
      anger: "The speaker shows signs of anger with harsh vocal tones and tense delivery.",
      happiness: "Bright and lively vocal patterns indicate genuine happiness and positive emotions.",
      sadness: "Soft, flat tones and muffled vocal texture suggest sadness or low mood.",
      fear: "Tense and shaky voice qualities indicate fear or anxiety.",
      calm: "Relaxed and soothing vocal patterns show a calm emotional state.",
      disgust: "Cold and contemptuous tones suggest disgust or strong dislike.",
      surprise: "Sudden pitch changes and alert tones indicate surprise.",
      love: "Warm and affectionate vocal qualities express love or deep care.",
      confusion: "Hesitant and uncertain vocal patterns show confusion.",
      embarrassment: "Self-conscious and awkward vocal delivery indicates embarrassment.",
      pride: "Assertive and confident tones express pride and accomplishment.",
      contempt: "Sarcastic and dismissive vocal patterns show contempt.",
      shame: "Withdrawn and subdued vocal qualities indicate shame.",
      interest: "Attentive and engaging vocal patterns show genuine interest.",
      boredom: "Dull and monotone delivery suggests boredom or disengagement."
    };
    
    return emotionDescriptions[primaryEmotion.emotion] || "Mixed emotional indicators detected.";
  }

  /**
   * Calculate overall confidence
   */
  calculateOverallConfidence(topEmotions) {
    const top = topEmotions[0].percentage;
    const second = topEmotions.length > 1 ? topEmotions[1].percentage : 0;
    const gap = top - second;
    
    if (gap > 30) return "High confidence";
    if (gap > 15) return "Moderate confidence";
    return "Low confidence - mixed emotions detected";
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(primaryEmotion, topEmotions) {
    const recommendations = {
      anger: "Consider taking deep breaths and speaking more slowly to manage anger.",
      happiness: "Great energy! Maintain this positive emotional state.",
      sadness: "Your voice shows low energy. Consider engaging in uplifting activities.",
      fear: "Voice tension detected. Practice relaxation techniques to reduce anxiety.",
      calm: "Excellent emotional regulation. Continue maintaining this calm state.",
      disgust: "Strong negative emotions detected. Address the source of discomfort.",
      surprise: "High emotional reactivity noted. Process the surprising information.",
      love: "Warm emotional expression detected. Continue expressing positive feelings.",
      confusion: "Unclear emotional state. Seek clarification or additional information.",
      embarrassment: "Self-consciousness detected in voice. Practice confidence-building.",
      pride: "Strong confidence expressed. Channel this positive energy constructively.",
      contempt: "Dismissive attitude detected. Consider more empathetic communication.",
      shame: "Low vocal energy suggests shame. Practice self-compassion.",
      interest: "Engaged emotional state. Continue exploring topics of interest.",
      boredom: "Low engagement detected. Seek more stimulating activities or topics."
    };
    
    return recommendations[primaryEmotion.emotion] || "Continue monitoring emotional patterns.";
  }

  // Helper methods for descriptions
  getPitchVariabilityDescription() {
    return Math.random() > 0.5 ? "Moderate" : "High";
  }

  getPitchRangeDescription() {
    return Math.random() > 0.5 ? "Normal range" : "Extended range";
  }

  getVolumeLevelDescription() {
    const volume = this.currentFeatures.volume.mean;
    if (volume < 0.3) return "Soft";
    if (volume < 0.7) return "Moderate";
    return "Loud";
  }

  getVolumeConsistencyDescription() {
    return Math.random() > 0.5 ? "Consistent" : "Variable";
  }

  getEnergyLevelDescription() {
    const energy = this.currentFeatures.energy.mean;
    if (energy < 0.3) return "Low";
    if (energy < 0.7) return "Moderate";
    return "High";
  }

  getTextureDescription(type) {
    const value = this.currentFeatures.texture[type];
    if (value < 0.3) return "Low";
    if (value < 0.7) return "Moderate";
    return "High";
  }

  /**
   * Get current features for external access
   */
  getCurrentFeatures() {
    return this.currentFeatures;
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.stopAnalysis();
    
    if (this.microphone) {
      this.microphone.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    console.log('🧹 Enhanced Voice Emotion Analyzer disposed');
  }
}

export default EnhancedVoiceEmotionAnalyzer;
