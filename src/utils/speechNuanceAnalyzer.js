// Speech Nuance Detection System - Audio Analysis Engine
// Extracts emotional and tonal features from live speech

/**
 * Advanced Audio Analysis for Speech Nuance Detection
 * Analyzes pitch, tone quality, timing, and volume patterns to detect:
 * - Sarcasm vs Genuine emotion
 * - Hidden frustration or discomfort
 * - Emotional authenticity
 * - Intent gaps between words and feelings
 */

export class SpeechNuanceAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.isAnalyzing = false;
    
    // Audio analysis configuration
    this.config = {
      fftSize: 2048,
      sampleRate: 44100,
      hopLength: 512,
      windowSize: 1024,
      analysisInterval: 100, // ms between analysis frames
      smoothingTimeConstant: 0.8
    };
    
    // Baseline patterns for comparison
    this.baselinePatterns = {
      pitch: { min: 80, max: 400, average: 150 },
      volume: { min: 0, max: 100, average: 50 },
      pace: { wordsPerMinute: 150, syllablesPerSecond: 3.5 }
    };
    
    // Current analysis state
    this.currentAnalysis = {
      pitchData: [],
      volumeData: [],
      tonalQuality: [],
      temporalPatterns: [],
      emotionalMarkers: []
    };
    
    this.analysisHistory = [];
    this.isInitialized = false;
  }

  /**
   * Initialize audio context and analysis components
   */
  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Important for preserving natural volume variations
          sampleRate: this.config.sampleRate
        } 
      });
      
      // Create audio analysis chain
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      
      // Connect audio nodes
      this.microphone.connect(this.analyser);
      
      // Initialize data arrays
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyData = new Float32Array(this.analyser.fftSize);
      
      this.isInitialized = true;
      console.log('🎤 Speech Nuance Analyzer initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize audio analysis:', error);
      return false;
    }
  }

  /**
   * Start real-time audio analysis
   */
  startAnalysis() {
    if (!this.isInitialized) {
      console.error('❌ Analyzer not initialized. Call initialize() first.');
      return false;
    }
    
    this.isAnalyzing = true;
    this.analysisLoop();
    console.log('🎯 Started real-time speech nuance analysis');
    return true;
  }

  /**
   * Stop audio analysis
   */
  stopAnalysis() {
    this.isAnalyzing = false;
    console.log('⏹️ Stopped speech nuance analysis');
  }

  /**
   * Main analysis loop - runs continuously during speech
   */
  analysisLoop() {
    if (!this.isAnalyzing) return;
    
    // Get current audio data
    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getFloatTimeDomainData(this.frequencyData);
    
    // Perform real-time analysis
    const currentFrame = {
      timestamp: Date.now(),
      pitch: this.extractPitchFeatures(),
      volume: this.extractVolumeFeatures(),
      tonalQuality: this.extractTonalFeatures(),
      temporal: this.extractTemporalFeatures()
    };
    
    // Store current frame
    this.currentAnalysis.pitchData.push(currentFrame.pitch);
    this.currentAnalysis.volumeData.push(currentFrame.volume);
    this.currentAnalysis.tonalQuality.push(currentFrame.tonalQuality);
    this.currentAnalysis.temporalPatterns.push(currentFrame.temporal);
    
    // Limit history size for performance
    this.trimAnalysisHistory();
    
    // Continue analysis loop
    setTimeout(() => this.analysisLoop(), this.config.analysisInterval);
  }

  /**
   * Extract pitch-related features from current audio frame
   */
  extractPitchFeatures() {
    // Fundamental frequency detection using autocorrelation
    const fundamental = this.calculateFundamentalFrequency();
    const pitchVariance = this.calculatePitchVariance();
    const pitchContour = this.analyzePitchContour();
    
    return {
      fundamental,
      variance: pitchVariance,
      contour: pitchContour,
      range: this.calculatePitchRange(),
      stability: this.calculatePitchStability(),
      timestamp: Date.now()
    };
  }

  /**
   * Extract volume and amplitude features
   */
  extractVolumeFeatures() {
    // Calculate RMS (Root Mean Square) for perceived loudness
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i] * this.frequencyData[i];
    }
    const rms = Math.sqrt(sum / this.frequencyData.length);
    
    // Calculate peak amplitude
    const peak = Math.max(...this.frequencyData.map(Math.abs));
    
    // Calculate dynamic range
    const dynamicRange = this.calculateDynamicRange();
    
    return {
      rms: rms * 100, // Convert to percentage
      peak: peak * 100,
      dynamicRange,
      volumeVariance: this.calculateVolumeVariance(),
      breathPattern: this.detectBreathPattern(),
      timestamp: Date.now()
    };
  }

  /**
   * Extract tonal quality and spectral features
   */
  extractTonalFeatures() {
    // Spectral centroid (brightness measure)
    const spectralCentroid = this.calculateSpectralCentroid();
    
    // Harmonic richness
    const harmonicRichness = this.calculateHarmonicContent();
    
    // Voice quality indicators
    const voiceQuality = this.analyzeVoiceQuality();
    
    return {
      brightness: spectralCentroid,
      harmonicRichness,
      voiceQuality,
      tensionMarkers: this.detectVocalTension(),
      resonance: this.calculateResonanceQuality(),
      timestamp: Date.now()
    };
  }

  /**
   * Extract temporal and rhythm features
   */
  extractTemporalFeatures() {
    return {
      energyLevel: this.calculateEnergyLevel(),
      rhythmPattern: this.analyzeRhythmPattern(),
      pauseDetection: this.detectPauses(),
      speechRate: this.estimateSpeechRate(),
      articulationClarity: this.analyzeArticulation(),
      timestamp: Date.now()
    };
  }

  /**
   * Calculate fundamental frequency (pitch) using autocorrelation
   */
  calculateFundamentalFrequency() {
    const bufferLength = this.frequencyData.length;
    const correlations = new Array(bufferLength);
    
    // Autocorrelation for pitch detection
    for (let lag = 0; lag < bufferLength; lag++) {
      let correlation = 0;
      for (let i = 0; i < bufferLength - lag; i++) {
        correlation += this.frequencyData[i] * this.frequencyData[i + lag];
      }
      correlations[lag] = correlation;
    }
    
    // Find the first peak (fundamental frequency)
    let maxCorrelation = 0;
    let bestLag = 0;
    
    for (let lag = 20; lag < bufferLength / 2; lag++) {
      if (correlations[lag] > maxCorrelation) {
        maxCorrelation = correlations[lag];
        bestLag = lag;
      }
    }
    
    // Convert lag to frequency
    const fundamental = bestLag > 0 ? this.config.sampleRate / bestLag : 0;
    return Math.min(Math.max(fundamental, 50), 500); // Clamp to human voice range
  }

  /**
   * Calculate pitch variance over recent frames
   */
  calculatePitchVariance() {
    const recentPitches = this.currentAnalysis.pitchData.slice(-10).map(p => p.fundamental);
    if (recentPitches.length < 2) return 0;
    
    const mean = recentPitches.reduce((a, b) => a + b, 0) / recentPitches.length;
    const variance = recentPitches.reduce((sum, pitch) => sum + Math.pow(pitch - mean, 2), 0) / recentPitches.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Analyze pitch contour patterns
   */
  analyzePitchContour() {
    const recentPitches = this.currentAnalysis.pitchData.slice(-10).map(p => p.fundamental);
    if (recentPitches.length < 3) return 'flat';
    
    // Analyze pitch direction and pattern
    let rising = 0, falling = 0, flat = 0;
    
    for (let i = 1; i < recentPitches.length; i++) {
      const diff = recentPitches[i] - recentPitches[i-1];
      if (Math.abs(diff) < 5) flat++;
      else if (diff > 0) rising++;
      else falling++;
    }
    
    // Determine dominant pattern
    if (flat > rising && flat > falling) return 'flat';
    if (rising > falling) return 'rising';
    if (falling > rising) return 'falling';
    return 'varied';
  }

  /**
   * Calculate spectral centroid (brightness)
   */
  calculateSpectralCentroid() {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      const frequency = (i * this.config.sampleRate) / (2 * this.dataArray.length);
      const magnitude = this.dataArray[i];
      
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Detect breath patterns and vocal tension
   */
  detectBreathPattern() {
    // Analyze low-frequency energy for breath detection
    const lowFreqEnergy = this.dataArray.slice(0, 10).reduce((a, b) => a + b, 0);
    const midFreqEnergy = this.dataArray.slice(10, 50).reduce((a, b) => a + b, 0);
    
    const breathRatio = lowFreqEnergy / Math.max(midFreqEnergy, 1);
    
    return {
      breathiness: breathRatio,
      support: this.calculateBreathSupport(),
      tension: this.detectVocalTension()
    };
  }

  /**
   * Utility functions for various calculations
   */
  calculatePitchRange() {
    const pitches = this.currentAnalysis.pitchData.slice(-20).map(p => p.fundamental);
    if (pitches.length === 0) return 0;
    return Math.max(...pitches) - Math.min(...pitches);
  }

  calculatePitchStability() {
    const variance = this.calculatePitchVariance();
    return Math.max(0, 100 - (variance * 2)); // Higher stability = lower variance
  }

  calculateDynamicRange() {
    const volumes = this.currentAnalysis.volumeData.slice(-20).map(v => v.rms);
    if (volumes.length === 0) return 0;
    return Math.max(...volumes) - Math.min(...volumes);
  }

  calculateVolumeVariance() {
    const volumes = this.currentAnalysis.volumeData.slice(-10).map(v => v.rms);
    if (volumes.length < 2) return 0;
    
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    return volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length;
  }

  calculateHarmonicContent() {
    // Analyze harmonic richness in the frequency spectrum
    let harmonicStrength = 0;
    const fundamental = this.calculateFundamentalFrequency();
    
    if (fundamental > 0) {
      // Check for harmonics at 2f, 3f, 4f, etc.
      for (let harmonic = 2; harmonic <= 6; harmonic++) {
        const harmonicFreq = fundamental * harmonic;
        const binIndex = Math.round((harmonicFreq * this.dataArray.length * 2) / this.config.sampleRate);
        
        if (binIndex < this.dataArray.length) {
          harmonicStrength += this.dataArray[binIndex];
        }
      }
    }
    
    return harmonicStrength / 5; // Average harmonic strength
  }

  analyzeVoiceQuality() {
    const brightness = this.calculateSpectralCentroid();
    const harmonics = this.calculateHarmonicContent();
    const breathiness = this.detectBreathPattern().breathiness;
    
    return {
      clarity: Math.max(0, 100 - (breathiness * 10)),
      richness: Math.min(100, harmonics * 2),
      brightness: Math.min(100, brightness / 50),
      overall: (harmonics + (100 - breathiness * 10)) / 2
    };
  }

  detectVocalTension() {
    // High-frequency energy often indicates vocal tension
    const highFreqEnergy = this.dataArray.slice(100, 200).reduce((a, b) => a + b, 0);
    const totalEnergy = this.dataArray.reduce((a, b) => a + b, 0);
    
    const tensionRatio = totalEnergy > 0 ? (highFreqEnergy / totalEnergy) * 100 : 0;
    
    return {
      level: Math.min(100, tensionRatio * 5),
      indicators: tensionRatio > 20 ? ['high_freq_energy'] : []
    };
  }

  calculateEnergyLevel() {
    const energy = this.dataArray.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(energy / this.dataArray.length);
  }

  analyzeRhythmPattern() {
    // Simplified rhythm analysis based on energy fluctuations
    const energyLevels = this.currentAnalysis.temporalPatterns.slice(-10).map(t => t.energyLevel);
    
    if (energyLevels.length < 3) return 'insufficient_data';
    
    // Calculate rhythm regularity
    const intervals = [];
    for (let i = 1; i < energyLevels.length; i++) {
      intervals.push(energyLevels[i] - energyLevels[i-1]);
    }
    
    const intervalVariance = this.calculateVariance(intervals);
    
    if (intervalVariance < 10) return 'regular';
    if (intervalVariance < 25) return 'moderate';
    return 'irregular';
  }

  detectPauses() {
    const currentEnergy = this.calculateEnergyLevel();
    const silenceThreshold = 5; // Adjust based on testing
    
    return {
      isPausing: currentEnergy < silenceThreshold,
      energyLevel: currentEnergy,
      threshold: silenceThreshold
    };
  }

  estimateSpeechRate() {
    // Estimate based on energy fluctuations (simplified)
    const energyChanges = this.currentAnalysis.temporalPatterns.slice(-20);
    if (energyChanges.length < 2) return 0;
    
    // Count significant energy changes (potential syllables)
    let syllableCount = 0;
    for (let i = 1; i < energyChanges.length; i++) {
      const energyDiff = Math.abs(energyChanges[i].energyLevel - energyChanges[i-1].energyLevel);
      if (energyDiff > 10) syllableCount++;
    }
    
    // Convert to syllables per second (rough estimate)
    const timeSpan = (energyChanges.length * this.config.analysisInterval) / 1000;
    return timeSpan > 0 ? syllableCount / timeSpan : 0;
  }

  analyzeArticulation() {
    // High-frequency content often indicates clear articulation
    const highFreqContent = this.dataArray.slice(150, 300).reduce((a, b) => a + b, 0);
    const totalContent = this.dataArray.reduce((a, b) => a + b, 0);
    
    const articulationScore = totalContent > 0 ? (highFreqContent / totalContent) * 100 : 0;
    
    return {
      clarity: Math.min(100, articulationScore * 3),
      precision: articulationScore > 15 ? 'high' : articulationScore > 8 ? 'medium' : 'low'
    };
  }

  calculateBreathSupport() {
    // Analyze consistency of volume/energy (good breath support = stable energy)
    const energyLevels = this.currentAnalysis.temporalPatterns.slice(-10).map(t => t.energyLevel);
    if (energyLevels.length < 3) return 50;
    
    const variance = this.calculateVariance(energyLevels);
    return Math.max(0, 100 - (variance * 2)); // Lower variance = better support
  }

  calculateResonanceQuality() {
    // Analyze formant structure and harmonic clarity
    const harmonicContent = this.calculateHarmonicContent();
    const brightness = this.calculateSpectralCentroid();
    
    return {
      clarity: Math.min(100, harmonicContent * 1.5),
      fullness: Math.min(100, (200 - brightness / 10)),
      overall: (harmonicContent + Math.min(100, 200 - brightness / 10)) / 2
    };
  }

  // Utility function for variance calculation
  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Trim analysis history to prevent memory issues
   */
  trimAnalysisHistory() {
    const maxHistoryLength = 100; // Keep last 100 frames
    
    if (this.currentAnalysis.pitchData.length > maxHistoryLength) {
      this.currentAnalysis.pitchData = this.currentAnalysis.pitchData.slice(-maxHistoryLength);
    }
    if (this.currentAnalysis.volumeData.length > maxHistoryLength) {
      this.currentAnalysis.volumeData = this.currentAnalysis.volumeData.slice(-maxHistoryLength);
    }
    if (this.currentAnalysis.tonalQuality.length > maxHistoryLength) {
      this.currentAnalysis.tonalQuality = this.currentAnalysis.tonalQuality.slice(-maxHistoryLength);
    }
    if (this.currentAnalysis.temporalPatterns.length > maxHistoryLength) {
      this.currentAnalysis.temporalPatterns = this.currentAnalysis.temporalPatterns.slice(-maxHistoryLength);
    }
  }

  /**
   * Get current analysis summary
   */
  getCurrentAnalysisSummary() {
    if (!this.isAnalyzing) {
      return { status: 'not_analyzing' };
    }
    
    const latest = {
      pitch: this.currentAnalysis.pitchData.slice(-1)[0] || {},
      volume: this.currentAnalysis.volumeData.slice(-1)[0] || {},
      tonal: this.currentAnalysis.tonalQuality.slice(-1)[0] || {},
      temporal: this.currentAnalysis.temporalPatterns.slice(-1)[0] || {}
    };
    
    return {
      status: 'analyzing',
      timestamp: Date.now(),
      current: latest,
      summary: {
        pitchStability: this.calculatePitchStability(),
        volumeConsistency: 100 - this.calculateVolumeVariance(),
        voiceQuality: latest.tonal.voiceQuality || {},
        speechRate: latest.temporal.speechRate || 0,
        emotionalMarkers: this.detectBasicEmotionalMarkers()
      }
    };
  }

  /**
   * Basic emotional marker detection (foundation for nuance detection)
   */
  detectBasicEmotionalMarkers() {
    const pitchVariance = this.calculatePitchVariance();
    const volumeVariance = this.calculateVolumeVariance();
    const pitchRange = this.calculatePitchRange();
    const latest = this.currentAnalysis.tonalQuality.slice(-1)[0];
    
    const markers = {
      excitement: pitchVariance > 30 && pitchRange > 50,
      monotone: pitchVariance < 10 && pitchRange < 20,
      tension: (latest?.tensionMarkers?.level || 0) > 40,
      breathiness: (latest?.voiceQuality?.clarity || 100) < 60,
      energy: (this.currentAnalysis.temporalPatterns.slice(-1)[0]?.energyLevel || 0) > 50
    };
    
    return markers;
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose() {
    this.stopAnalysis();
    
    if (this.microphone) {
      this.microphone.disconnect();
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    console.log('🧹 Speech Nuance Analyzer disposed');
  }
}

// Export for easy integration
export default SpeechNuanceAnalyzer;
