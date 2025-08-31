// Improved Voice Emotion Engine - Shared across all components
// Enhanced algorithms for better emotion detection accuracy

class ImprovedVoiceEmotionEngine {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.microphone = null;
    this.isAnalyzing = false;
    this.voiceData = [];
    this.analysisData = {
      pitch: 0,
      volume: 0,
      spectralCentroid: 0,
      formants: [],
      timestamp: Date.now()
    };
  }

  async initialize() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0.3;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.microphone.connect(this.analyser);
      console.log('🎤 Improved Voice Emotion Engine initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize improved voice analysis:', error);
      return false;
    }
  }

  startAnalysis(callback) {
    if (!this.analyser || this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.voiceData = [];
    
    const analyze = () => {
      if (!this.isAnalyzing) return;
      
      const bufferLength = this.analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);
      
      this.analyser.getByteFrequencyData(frequencyData);
      this.analyser.getByteTimeDomainData(timeData);
      
      const analysis = {
        pitch: this.calculatePitch(frequencyData, timeData),
        volume: this.calculateVolume(timeData),
        spectralCentroid: this.calculateSpectralCentroid(frequencyData),
        formants: this.calculateFormants(frequencyData),
        timestamp: Date.now()
      };
      
      this.voiceData.push(analysis);
      
      if (callback) {
        callback(analysis);
      }
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }

  stopAnalysis() {
    this.isAnalyzing = false;
  }

  calculatePitch(frequencyData, timeData) {
    // Enhanced autocorrelation-based pitch detection with noise filtering
    const sampleRate = this.audioContext.sampleRate;
    const minPeriod = Math.floor(sampleRate / 800); // 800 Hz max
    const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min
    
    // Filter out noise - only analyze if there's sufficient signal
    const rms = Math.sqrt(timeData.reduce((sum, val) => sum + Math.pow((val - 128) / 128, 2), 0) / timeData.length);
    if (rms < 0.01) return 0; // Too quiet to analyze
    
    let bestCorrelation = 0;
    let bestPeriod = 0;
    
    // Normalize time data for better correlation
    const normalizedData = timeData.map(val => (val - 128) / 128);
    
    for (let period = minPeriod; period < maxPeriod; period++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = 0; i < normalizedData.length - period; i++) {
        correlation += normalizedData[i] * normalizedData[i + period];
        count++;
      }
      
      if (count > 0) {
        correlation = correlation / count; // Normalize by count
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }
    
    // Only return pitch if correlation is strong enough
    if (bestCorrelation > 0.3 && bestPeriod > 0) {
      return sampleRate / bestPeriod;
    }
    
    return 0; // No reliable pitch detected
  }

  calculateVolume(timeData) {
    // Enhanced volume calculation with dynamic range compression
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < timeData.length; i++) {
      const sample = (timeData[i] - 128) / 128;
      sum += sample * sample;
      count++;
    }
    
    if (count === 0) return 0;
    
    const rms = Math.sqrt(sum / count);
    
    // Apply dynamic range compression and normalize to 0-1 range
    const compressed = Math.pow(rms, 0.7); // Compression factor
    const normalized = Math.min(1.0, compressed * 3.0); // Boost and clamp
    
    return normalized;
  }

  calculateSpectralCentroid(frequencyData) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      numerator += frequencyData[i] * i;
      denominator += frequencyData[i];
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  calculateFormants(frequencyData) {
    // Simple formant detection - find peaks in frequency spectrum
    const formants = [];
    const threshold = 50;
    
    for (let i = 1; i < frequencyData.length - 1; i++) {
      if (frequencyData[i] > threshold && 
          frequencyData[i] > frequencyData[i-1] && 
          frequencyData[i] > frequencyData[i+1]) {
        const frequency = (i / frequencyData.length) * (this.audioContext.sampleRate / 2);
        if (frequency > 300 && frequency < 3000) { // Typical formant range
          formants.push(frequency);
        }
      }
    }
    
    return formants.slice(0, 3); // Return first 3 formants
  }

  analyzeVoiceEmotion() {
    if (this.voiceData.length === 0) return null;
    
    // Calculate average voice features
    const avgPitch = this.voiceData.reduce((sum, d) => sum + d.pitch, 0) / this.voiceData.length;
    const avgVolume = this.voiceData.reduce((sum, d) => sum + d.volume, 0) / this.voiceData.length;
    const avgSpectral = this.voiceData.reduce((sum, d) => sum + d.spectralCentroid, 0) / this.voiceData.length;
    
    // Enhanced voice emotion classification
    const allEmotions = {
      happy: this.calculateEmotionScore('happy', avgPitch, avgVolume, avgSpectral),
      sad: this.calculateEmotionScore('sad', avgPitch, avgVolume, avgSpectral),
      angry: this.calculateEmotionScore('angry', avgPitch, avgVolume, avgSpectral),
      calm: this.calculateEmotionScore('calm', avgPitch, avgVolume, avgSpectral),
      excited: this.calculateEmotionScore('excited', avgPitch, avgVolume, avgSpectral),
      nervous: this.calculateEmotionScore('nervous', avgPitch, avgVolume, avgSpectral),
      confident: this.calculateEmotionScore('confident', avgPitch, avgVolume, avgSpectral),
      energetic: this.calculateEmotionScore('energetic', avgPitch, avgVolume, avgSpectral)
    };
    
    // Get top 3 emotions only
    const sortedEmotions = Object.entries(allEmotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    // Create final emotions object with only top 3
    const emotions = {};
    let totalScore = 0;
    
    sortedEmotions.forEach(([emotion, score]) => {
      emotions[emotion] = Math.max(score, 10); // Minimum 10% for display
      totalScore += emotions[emotion];
    });
    
    // Normalize to 100% (top 3 emotions only)
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] = Math.round((emotions[emotion] / totalScore) * 100);
    });
    
    // Ensure total is exactly 100%
    const finalTotal = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (finalTotal !== 100) {
      const mainEmotion = Object.keys(emotions)[0];
      emotions[mainEmotion] += (100 - finalTotal);
    }
    
    return {
      avgPitch: Math.round(avgPitch),
      avgVolume: Math.round(avgVolume * 100) / 100,
      avgSpectral: Math.round(avgSpectral),
      emotions,
      voiceProfile: this.generateVoiceProfile(avgPitch, avgVolume, avgSpectral),
      accuracy: this.calculateAccuracy(allEmotions, avgPitch, avgVolume, avgSpectral),
      debugInfo: { // For debugging
        originalScores: allEmotions,
        features: { pitch: avgPitch, volume: avgVolume, spectral: avgSpectral }
      }
    };
  }

  calculateEmotionScore(emotion, pitch, volume, spectral) {
    // Enhanced emotion profiles with more realistic ranges based on research
    const profiles = {
      happy: { pitchRange: [170, 300], volumeRange: [0.35, 0.75], spectralRange: [1100, 2600] },
      sad: { pitchRange: [90, 150], volumeRange: [0.1, 0.35], spectralRange: [450, 1300] },
      angry: { pitchRange: [170, 380], volumeRange: [0.55, 0.95], spectralRange: [1400, 3200] },
      calm: { pitchRange: [110, 190], volumeRange: [0.25, 0.55], spectralRange: [750, 1700] },
      excited: { pitchRange: [190, 420], volumeRange: [0.45, 0.85], spectralRange: [1300, 2800] },
      nervous: { pitchRange: [130, 280], volumeRange: [0.15, 0.45], spectralRange: [850, 2100] },
      confident: { pitchRange: [120, 210], volumeRange: [0.35, 0.65], spectralRange: [950, 2100] },
      energetic: { pitchRange: [160, 340], volumeRange: [0.45, 0.8], spectralRange: [1200, 2700] }
    };
    
    const profile = profiles[emotion];
    if (!profile) return 0;
    
    let score = 0;
    
    // Enhanced pitch scoring (0-45 points)
    const pitchMid = (profile.pitchRange[0] + profile.pitchRange[1]) / 2;
    const pitchTolerance = (profile.pitchRange[1] - profile.pitchRange[0]) * 0.6;
    const pitchDistance = Math.abs(pitch - pitchMid);
    
    if (pitch === 0) {
      // No pitch detected, neutral scoring
      score += 15;
    } else if (pitchDistance <= pitchTolerance * 0.3) {
      score += 45; // Excellent match
    } else if (pitchDistance <= pitchTolerance * 0.5) {
      score += 38; // Very good match
    } else if (pitchDistance <= pitchTolerance) {
      score += 28; // Good match
    } else {
      score += Math.max(5, 20 - (pitchDistance - pitchTolerance) / 8);
    }
    
    // Enhanced volume scoring (0-35 points)
    const volumeMid = (profile.volumeRange[0] + profile.volumeRange[1]) / 2;
    const volumeTolerance = (profile.volumeRange[1] - profile.volumeRange[0]) * 0.8;
    const volumeDistance = Math.abs(volume - volumeMid);
    
    if (volumeDistance <= volumeTolerance * 0.3) {
      score += 35; // Excellent match
    } else if (volumeDistance <= volumeTolerance * 0.5) {
      score += 28; // Very good match
    } else if (volumeDistance <= volumeTolerance) {
      score += 20; // Good match
    } else {
      score += Math.max(3, 12 - (volumeDistance - volumeTolerance) * 15);
    }
    
    // Enhanced spectral scoring (0-20 points)
    const spectralMid = (profile.spectralRange[0] + profile.spectralRange[1]) / 2;
    const spectralTolerance = (profile.spectralRange[1] - profile.spectralRange[0]) * 0.7;
    const spectralDistance = Math.abs(spectral - spectralMid);
    
    if (spectralDistance <= spectralTolerance * 0.4) {
      score += 20; // Excellent match
    } else if (spectralDistance <= spectralTolerance * 0.6) {
      score += 15; // Very good match
    } else if (spectralDistance <= spectralTolerance) {
      score += 10; // Good match
    } else {
      score += Math.max(2, 8 - (spectralDistance - spectralTolerance) / 100);
    }
    
    // Apply combination bonuses for typical patterns
    if ((emotion === 'excited' || emotion === 'energetic') && volume > 0.5 && pitch > 180) {
      score *= 1.25; // 25% boost for high-energy patterns
    } else if ((emotion === 'happy') && volume > 0.4 && pitch > 160 && pitch < 300) {
      score *= 1.2; // 20% boost for happy voice patterns
    } else if ((emotion === 'calm' || emotion === 'confident') && volume > 0.3 && volume < 0.7 && pitch > 120 && pitch < 200) {
      score *= 1.15; // 15% boost for calm/confident patterns
    } else if ((emotion === 'sad') && volume < 0.4 && pitch < 160) {
      score *= 1.1; // 10% boost for sad patterns
    }
    
    // Penalize emotions that don't match voice activity
    if ((emotion === 'sad' || emotion === 'calm') && (volume > 0.7 || pitch > 280)) {
      score *= 0.7; // Reduce score for mismatched high energy
    } else if ((emotion === 'excited' || emotion === 'energetic') && (volume < 0.3 || pitch < 140)) {
      score *= 0.7; // Reduce score for mismatched low energy
    }
    
    return Math.min(100, Math.max(0, score));
  }

  calculateAccuracy(allEmotions, pitch, volume, spectral) {
    // Calculate overall accuracy based on voice feature quality and emotion confidence
    let accuracy = 0;
    
    // Base accuracy from voice feature quality
    if (pitch > 0) accuracy += 30; // Pitch detected
    if (volume > 0.1) accuracy += 25; // Reasonable volume
    if (spectral > 100) accuracy += 20; // Spectral data available
    
    // Additional accuracy from emotion confidence
    const maxEmotionScore = Math.max(...Object.values(allEmotions));
    const avgEmotionScore = Object.values(allEmotions).reduce((sum, score) => sum + score, 0) / Object.keys(allEmotions).length;
    
    // Higher accuracy if one emotion clearly dominates
    if (maxEmotionScore > 70) accuracy += 15;
    else if (maxEmotionScore > 50) accuracy += 10;
    else if (maxEmotionScore > 30) accuracy += 5;
    
    // Lower accuracy if emotions are too evenly distributed
    if (avgEmotionScore > 40) accuracy -= 10;
    
    // Bonus for realistic voice features
    if (pitch >= 80 && pitch <= 500 && volume >= 0.1 && volume <= 0.9) {
      accuracy += 10;
    }
    
    return Math.min(95, Math.max(60, accuracy)); // Clamp between 60-95%
  }

  generateVoiceProfile(pitch, volume, spectral) {
    let profile = "";
    
    // Pitch analysis
    if (pitch > 250) {
      profile += "High-energy speech with elevated pitch, ";
    } else if (pitch > 180) {
      profile += "Animated speech with raised pitch, ";
    } else if (pitch > 140) {
      profile += "Balanced pitch with moderate energy, ";
    } else if (pitch > 100) {
      profile += "Lower pitch suggesting calmness, ";
    } else if (pitch > 0) {
      profile += "Very low pitch indicating subdued tone, ";
    } else {
      profile += "Pitch detection challenging, ";
    }
    
    // Volume analysis
    if (volume > 0.7) {
      profile += "strong vocal presence, ";
    } else if (volume > 0.5) {
      profile += "confident volume level, ";
    } else if (volume > 0.3) {
      profile += "moderate speaking level, ";
    } else if (volume > 0.1) {
      profile += "quiet speaking style, ";
    } else {
      profile += "very soft speech, ";
    }
    
    // Spectral analysis
    if (spectral > 2200) {
      profile += "bright and clear vocal quality with high energy resonance";
    } else if (spectral > 1500) {
      profile += "clear vocal quality with good projection";
    } else if (spectral > 1000) {
      profile += "balanced vocal timbre";
    } else if (spectral > 600) {
      profile += "warm vocal tone";
    } else {
      profile += "muffled or distant vocal quality";
    }
    
    // Add energy assessment
    if (volume > 0.5 && pitch > 180) {
      profile += " - High energy detected";
    } else if (volume > 0.4 && pitch > 150) {
      profile += " - Moderate energy level";
    } else {
      profile += " - Low energy level";
    }
    
    return profile;
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

export default ImprovedVoiceEmotionEngine;
