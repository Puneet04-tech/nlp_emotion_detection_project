import React, { useState, useEffect, useRef } from 'react';
import Meyda from 'meyda';
import { estimatePitchFromAudioBuffer } from '../utils/pitchEstimator';
import { createModel, buildDataset, trainModel, saveModelLocal, loadModelLocal, predict, featuresToTensorRow } from '../utils/tfVoiceClassifier';
import { fuseEmotionScores } from '../utils/emotionFusion';
import { analyzeEmotionWithBERT } from '../utils/bertEmotionApi';
import NetlifyModelDeployer from '../utils/netlifyModelDeployer.js';

// Enhanced Voice Sample Storage with IndexedDB
class VoiceSampleStorage {
  constructor() {
    this.dbName = 'VoiceEmotionTraining';
    this.dbVersion = 1;
    this.db = null;
    this.initPromise = this.initDatabase();
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Voice samples store
        if (!db.objectStoreNames.contains('voiceSamples')) {
          const voiceSamplesStore = db.createObjectStore('voiceSamples', { keyPath: 'id' });
          voiceSamplesStore.createIndex('emotion', 'emotion', { unique: false });
          voiceSamplesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Training metadata store
        if (!db.objectStoreNames.contains('trainingMeta')) {
          const metaStore = db.createObjectStore('trainingMeta', { keyPath: 'id' });
        }
      };
    });
  }

  async saveVoiceSample(emotion, audioBlob, voiceFeatures, transcript) {
    await this.initPromise;
    
    const sample = {
      id: `${emotion}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emotion,
      timestamp: new Date().toISOString(),
      audioBlob,
  voiceFeatures,
      transcript,
      verified: true,
  accuracy: null,
  uploadStatus: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['voiceSamples'], 'readwrite');
      const store = transaction.objectStore('voiceSamples');
      const request = store.add(sample);
      
      request.onsuccess = () => resolve(sample);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUploadStatus(id, status) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['voiceSamples'], 'readwrite');
      const store = tx.objectStore('voiceSamples');
      const req = store.get(id);
      req.onsuccess = () => {
        const rec = req.result;
        if (!rec) return resolve(false);
        rec.uploadStatus = status;
        const upd = store.put(rec);
        upd.onsuccess = () => resolve(true);
        upd.onerror = () => reject(upd.error);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getSamplesByUploadStatus(status) {
    await this.initPromise;
    const all = await this.getVoiceSamples();
    return all.filter(s => (s.uploadStatus || 'pending') === status);
  }

  async migrateExistingSamples() {
    await this.initPromise;
    const all = await this.getVoiceSamples();
    const needsMigration = all.filter(s => !s.uploadStatus);
    
    if (needsMigration.length > 0) {
      console.log(`Migrating ${needsMigration.length} samples to add uploadStatus`);
      const transaction = this.db.transaction(['voiceSamples'], 'readwrite');
      const store = transaction.objectStore('voiceSamples');
      
      for (const sample of needsMigration) {
        sample.uploadStatus = 'pending'; // Default to pending for existing samples
        store.put(sample);
      }
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(needsMigration.length);
        transaction.onerror = () => reject(transaction.error);
      });
    }
    
    return 0;
  }

  async getVoiceSamples(emotion = null) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['voiceSamples'], 'readonly');
      const store = transaction.objectStore('voiceSamples');
      
      let request;
      if (emotion) {
        const index = store.index('emotion');
        request = index.getAll(emotion);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVoiceSample(id) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['voiceSamples'], 'readwrite');
      const store = transaction.objectStore('voiceSamples');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllSamples(emotion = null) {
    await this.initPromise;
    
    if (emotion) {
      const samples = await this.getVoiceSamples(emotion);
      const deletePromises = samples.map(sample => this.deleteVoiceSample(sample.id));
      return Promise.all(deletePromises);
    } else {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['voiceSamples'], 'readwrite');
        const store = transaction.objectStore('voiceSamples');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Enhanced Training Data Manager with persistent storage
class VoiceTrainingManager {
  constructor() {
    this.voiceStorage = new VoiceSampleStorage();
    this.trainingData = this.loadTrainingData();
    this.modelWeights = this.loadModelWeights();
    this.userCalibration = this.loadUserCalibration();
    this.sessionStats = this.loadSessionStats();
  }

  loadTrainingData() {
    const saved = localStorage.getItem('voiceEmotionTrainingData_v2');
    return saved ? JSON.parse(saved) : {
      happy: [],
      sad: [],
      angry: [],
      excited: [],
      calm: [],
      nervous: [],
      confident: [],
      surprised: [],
      neutral: [],
      frustrated: [],
      fear: [],
      joy: []
    };
  }

  loadModelWeights() {
    const saved = localStorage.getItem('voiceEmotionModelWeights_v2');
    return saved ? JSON.parse(saved) : {
      pitch: { 
        happy: 1.2, sad: 1.1, angry: 1.3, excited: 1.4, calm: 1.0, nervous: 0.8, 
        confident: 1.1, surprised: 1.3, neutral: 1.0, frustrated: 1.1, 
        joyful: 1.3, melancholy: 0.9, enthusiastic: 1.5, worried: 0.9, 
        peaceful: 0.8, determined: 1.1, anxious: 1.0, energetic: 1.4
      },
      volume: { 
        happy: 1.1, sad: 1.2, angry: 1.4, excited: 1.3, calm: 1.0, nervous: 0.7, 
        confident: 1.2, surprised: 1.2, neutral: 1.0, frustrated: 1.1,
        joyful: 1.2, melancholy: 0.8, enthusiastic: 1.4, worried: 0.9,
        peaceful: 0.8, determined: 1.1, anxious: 0.9, energetic: 1.3
      },
      spectral: { 
        happy: 1.1, sad: 1.0, angry: 1.3, excited: 1.2, calm: 1.0, nervous: 0.8, 
        confident: 1.1, surprised: 1.2, neutral: 1.0, frustrated: 1.0,
        joyful: 1.2, melancholy: 0.9, enthusiastic: 1.3, worried: 0.9,
        peaceful: 0.8, determined: 1.0, anxious: 1.0, energetic: 1.2
      },
      keyword: { 
        happy: 1.0, sad: 1.0, angry: 1.2, excited: 1.1, calm: 1.0, nervous: 0.9, 
        confident: 1.1, surprised: 1.0, neutral: 1.0, frustrated: 1.0,
        joyful: 1.1, melancholy: 1.0, enthusiastic: 1.2, worried: 0.9,
        peaceful: 0.9, determined: 1.1, anxious: 0.9, energetic: 1.1
      }
    };
  }

  loadUserCalibration() {
    const saved = localStorage.getItem('voiceEmotionUserCalibration');
    return saved ? JSON.parse(saved) : {
      baselinePitch: 150,
      baselineVolume: 0.3,
      pitchRange: { min: 80, max: 400 },
      volumeRange: { min: 0.1, max: 0.9 },
      lastCalibrated: null,
      samplesCount: 0
    };
  }

  loadSessionStats() {
    const saved = localStorage.getItem('voiceEmotionSessionStats');
    return saved ? JSON.parse(saved) : {
      totalSamples: 0,
      sessionsCount: 0,
      accuracyHistory: [],
      lastSession: null,
      averageAccuracy: 0
    };
  }

  saveTrainingData() {
    localStorage.setItem('voiceEmotionTrainingData_v2', JSON.stringify(this.trainingData));
  }

  saveModelWeights() {
    localStorage.setItem('voiceEmotionModelWeights_v2', JSON.stringify(this.modelWeights));
  }

  saveUserCalibration() {
    localStorage.setItem('voiceEmotionUserCalibration', JSON.stringify(this.userCalibration));
  }

  saveSessionStats() {
    localStorage.setItem('voiceEmotionSessionStats', JSON.stringify(this.sessionStats));
  }

  async addTrainingSample(emotion, voiceFeatures, transcript, audioBlob = null) {
    const sample = {
      id: Date.now().toString(),
      emotion,
      timestamp: new Date().toISOString(),
      voiceFeatures,
      transcript,
      verified: true,
      sessionId: this.sessionStats.sessionsCount
    };
    
    // Store in memory for quick access
    if (!Array.isArray(this.trainingData[emotion])) {
      this.trainingData[emotion] = [];
    }
    this.trainingData[emotion].push(sample);
    this.saveTrainingData();
    
    // Store voice sample in IndexedDB if audio blob is provided
    if (audioBlob) {
      try {
        await this.voiceStorage.saveVoiceSample(emotion, audioBlob, voiceFeatures, transcript);
      } catch (error) {
        console.warn('Failed to save voice sample to IndexedDB:', error);
      }
    }
    
    // Update model weights and user calibration
    this.updateModelWeights(emotion, voiceFeatures);
    this.updateUserCalibration(voiceFeatures);
    this.updateSessionStats(emotion);
    
    console.log(`✅ Added training sample for ${emotion}:`, sample);
    // Optionally send the sample to a remote training service if configured
    try {
      const remoteUrl = localStorage.getItem('remoteVoiceTrainingUrl');
      if (remoteUrl) {
        try {
          const form = new FormData();
          form.append('emotion', emotion);
          form.append('transcript', transcript || '');
          form.append('voiceFeatures', JSON.stringify(voiceFeatures || {}));
          if (audioBlob) {
            // Choose extension based on blob type to avoid confusing server
            const mime = audioBlob.type || '';
            let ext = '.wav';
            if (mime.includes('webm') || mime.includes('opus')) ext = '.webm';
            else if (mime.includes('mpeg') || mime.includes('mp3')) ext = '.mp3';
            else if (mime.includes('ogg')) ext = '.ogg';
            else if (mime.includes('wav')) ext = '.wav';
            form.append('audio', audioBlob, `${sample.id}${ext}`);
          }

          console.debug('Uploading training sample to', remoteUrl, { emotion, sampleId: sample.id, features: voiceFeatures, hasAudio: !!audioBlob });
          fetch(remoteUrl, { method: 'POST', body: form }).then(async (res) => {
            if (!res.ok) {
              let text = '';
              try { text = await res.text(); } catch(e) {}
              console.warn('Remote upload failed', res.status, res.statusText, text);
            } else {
              console.debug('Remote upload successful', res.status);
            }
          }).catch(err => console.warn('Remote upload error', err));
        } catch (innerErr) {
          console.warn('Failed building upload form or sending it', innerErr);
        }
      }
    } catch (e) {
      console.warn('Failed to send remote training sample', e);
    }
    return sample;
  }

  updateUserCalibration(features) {
    const { pitch, volume } = features;
    
    // Update baseline calculations
    if (this.userCalibration.samplesCount === 0) {
      this.userCalibration.baselinePitch = pitch;
      this.userCalibration.baselineVolume = volume;
    } else {
      // Moving average for baseline
      const alpha = 0.1; // Learning rate
      this.userCalibration.baselinePitch = 
        this.userCalibration.baselinePitch * (1 - alpha) + pitch * alpha;
      this.userCalibration.baselineVolume = 
        this.userCalibration.baselineVolume * (1 - alpha) + volume * alpha;
    }
    
    // Update ranges
    this.userCalibration.pitchRange.min = Math.min(this.userCalibration.pitchRange.min, pitch);
    this.userCalibration.pitchRange.max = Math.max(this.userCalibration.pitchRange.max, pitch);
    this.userCalibration.volumeRange.min = Math.min(this.userCalibration.volumeRange.min, volume);
    this.userCalibration.volumeRange.max = Math.max(this.userCalibration.volumeRange.max, volume);
    
    this.userCalibration.samplesCount++;
    this.userCalibration.lastCalibrated = new Date().toISOString();
    
    this.saveUserCalibration();
  }

  updateSessionStats(emotion) {
    this.sessionStats.totalSamples++;
    this.sessionStats.lastSession = new Date().toISOString();
    
    // Calculate current session accuracy
    const currentAccuracy = this.calculateAccuracy(emotion);
    this.sessionStats.accuracyHistory.push({
      emotion,
      accuracy: currentAccuracy,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 accuracy records
    if (this.sessionStats.accuracyHistory.length > 100) {
      this.sessionStats.accuracyHistory = this.sessionStats.accuracyHistory.slice(-100);
    }
    
    // Update average accuracy
    this.sessionStats.averageAccuracy = Math.round(
      this.sessionStats.accuracyHistory.reduce((sum, record) => sum + record.accuracy, 0) / 
      this.sessionStats.accuracyHistory.length
    );
    
    this.saveSessionStats();
  }

  updateModelWeights(emotion, features) {
    // Analyze the new sample and adjust weights
    const { pitch, volume, spectralCentroid } = features;
    
    // Strengthen the weight for features that match this emotion
    if (emotion === 'happy' && pitch > 160 && volume > 40) {
      this.modelWeights.pitch.happy = Math.min(2.0, this.modelWeights.pitch.happy + 0.1);
      this.modelWeights.volume.happy = Math.min(2.0, this.modelWeights.volume.happy + 0.1);
    }
    
    if (emotion === 'sad' && pitch < 150 && volume < 40) {
      this.modelWeights.pitch.sad = Math.min(2.0, this.modelWeights.pitch.sad + 0.1);
      this.modelWeights.volume.sad = Math.min(2.0, this.modelWeights.volume.sad + 0.1);
    }
    
    // Reduce nervous over-detection
    if (emotion !== 'nervous') {
      this.modelWeights.pitch.nervous = Math.max(0.1, this.modelWeights.pitch.nervous - 0.05);
      this.modelWeights.volume.nervous = Math.max(0.1, this.modelWeights.volume.nervous - 0.05);
    }
    
    this.saveModelWeights();
  }

  getTrainingStats() {
    const stats = {};
    Object.keys(this.trainingData).forEach(emotion => {
      stats[emotion] = {
        count: this.trainingData[emotion].length,
        lastTrained: this.trainingData[emotion].length > 0 ? 
          this.trainingData[emotion][this.trainingData[emotion].length - 1].timestamp : null,
        accuracy: this.calculateAccuracy(emotion)
      };
    });
    return stats;
  }

  calculateAccuracy(emotion) {
    const samples = this.trainingData[emotion];
    if (samples.length === 0) return 0;
    
    // Simple accuracy calculation based on sample count and model weights
    const baseAccuracy = Math.min(95, 30 + (samples.length * 10));
    const weightBonus = (this.modelWeights.pitch[emotion] + this.modelWeights.volume[emotion]) * 10;
    return Math.round(Math.min(100, baseAccuracy + weightBonus));
  }

  getModelWeights() {
    return this.modelWeights;
  }

  clearTrainingData(emotion = null) {
    if (emotion) {
      this.trainingData[emotion] = [];
    } else {
      Object.keys(this.trainingData).forEach(e => {
        this.trainingData[e] = [];
      });
    }
    this.saveTrainingData();
  }

  exportTrainingData() {
    return {
      trainingData: this.trainingData,
      modelWeights: this.modelWeights,
      exportDate: new Date().toISOString()
    };
  }

  importTrainingData(data) {
    if (data.trainingData) this.trainingData = data.trainingData;
    if (data.modelWeights) this.modelWeights = data.modelWeights;
    this.saveTrainingData();
    this.saveModelWeights();
  }
}

// Enhanced Voice Analyzer with Training Integration and Audio Recording
class EnhancedVoiceAnalyzer {
  constructor() {
    this.audioContext = null;
    this.microphone = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isAnalyzing = false;
    this.isRecording = false;
    this.mediaStream = null;
    this.trainingManager = new VoiceTrainingManager();
    
    // Speech Recognition setup
    this.speechRecognition = null;
    this.isListening = false;
    
    this.currentAnalysis = {
      pitch: 0,
      volume: 0,
      spectralCentroid: 0,
      emotions: {},
      dominantEmotion: 'neutral',
      confidence: 0,
      transcript: '',
      audioBlob: null
    };
  this.mlModel = null;
  this.mlLabelsMap = null;
  this.mlNorm = null; // {means, stds}
  this.useMlDetection = false;
  }

  async initialize() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone.connect(this.analyser);

      // Prepare Meyda analyzer for real-time feature extraction when available
      try {
        if (Meyda && Meyda.createMeydaAnalyzer) {
          this.lastMeydaFeatures = null;
          this.meydaAnalyzer = Meyda.createMeydaAnalyzer({
            audioContext: this.audioContext,
            source: this.microphone,
            bufferSize: 2048,
            featureExtractors: ['rms', 'spectralCentroid', 'mfcc'],
            callback: (features) => {
              this.lastMeydaFeatures = features;
            }
          });
        }
      } catch (err) {
        console.warn('Meyda initialization failed:', err);
        this.meydaAnalyzer = null;
      }
      
      // Initialize MediaRecorder for audio capture
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        this.currentAnalysis.audioBlob = audioBlob;
        this.audioChunks = [];
      };
      
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRecognition();
        
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = 'en-US';
        
        this.speechRecognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript + ' ';
            }
          }

          // Append final transcripts to preserve full sentence across multiple result events
          if (finalTranscript) {
            const prev = this.currentAnalysis.transcript || '';
            this.currentAnalysis.transcript = (prev + ' ' + finalTranscript).trim();
          }

          // Always update interim so UI shows streaming text
          if (interimTranscript) {
            // show interim only if there is no final replacement in this cycle
            if (!finalTranscript) {
              this.currentAnalysis.transcript = (this.currentAnalysis.transcript || '') || interimTranscript.trim();
            }
          }
        };
        
        this.speechRecognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            this.currentAnalysis.transcript = 'No speech detected';
          }
        };
        
        this.speechRecognition.onend = () => {
          this.isListening = false;
          if (this.isAnalyzing) {
            // Restart recognition if still analyzing
            this.startSpeechRecognition();
          }
        };
      } else {
        console.warn('Speech Recognition not supported in this browser');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing voice analyzer:', error);
      return false;
    }
  }

  // Load ML model and metadata into analyzer
  async loadMlModelAndMeta(name = 'local-voice-model') {
    try {
      const model = await loadModelLocal(name);
      if (!model) return false;
      this.mlModel = model;
      // try to read labels/norm from localStorage
      const meta = localStorage.getItem(name + '_meta');
      if (meta) {
        const parsed = JSON.parse(meta);
        this.mlLabelsMap = parsed.labelsMap || null;
        this.mlNorm = parsed.norm || null;
      }
      return true;
    } catch (e) {
      console.warn('Failed to load ML model into analyzer', e);
      return false;
    }
  }

  // Predict using loaded ML model (returns {label, probabilities})
  predictWithMl(features) {
    try {
      if (!this.mlModel || !this.mlLabelsMap) return null;
      // build normalized tensor row
      const mfccLen = (features.mfccMeans || []).length || 13;
      const row = [];
      row.push(features.pitch || 0);
      row.push(features.volume || 0);
      row.push(features.spectralCentroid || 0);
      const means = features.mfccMeans || [];
      for (let i = 0; i < mfccLen; i++) row.push(means[i] || 0);
      // normalize
      const norm = this.mlNorm;
      let normRow = row;
      if (norm && norm.means && norm.stds) {
        normRow = row.map((v, j) => ((v || 0) - (norm.means[j] || 0)) / (norm.stds[j] || 1));
      }
      const tensor = tf.tensor2d([normRow]);
      const out = this.mlModel.predict(tensor);
      const probs = out.arraySync()[0];
      // find label by index
      const labels = Object.keys(this.mlLabelsMap).sort((a,b)=> this.mlLabelsMap[a]-this.mlLabelsMap[b]);
      const idx = probs.indexOf(Math.max(...probs));
      return { label: labels[idx] || null, probabilities: probs };
    } catch (e) {
      console.warn('ML prediction failed', e);
      return null;
    }
  }

  startAnalysis() {
    this.isAnalyzing = true;
    this.startRecording();
    this.startSpeechRecognition();
  // Start Meyda analyzer if available
  try { if (this.meydaAnalyzer && this.meydaAnalyzer.start) this.meydaAnalyzer.start(); } catch(e) {}
  this.analyzeAudio();
  }
  
  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.audioChunks = [];
      this.isRecording = true;
      this.mediaRecorder.start(100); // Collect data every 100ms
    }
  }
  
  startSpeechRecognition() {
    if (this.speechRecognition && !this.isListening) {
      try {
        this.currentAnalysis.transcript = ''; // Reset transcript
        this.isListening = true;
        this.speechRecognition.start();
      } catch (error) {
        console.warn('Failed to start speech recognition:', error);
        this.isListening = false;
      }
    }
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isRecording = false;
      this.mediaRecorder.stop();
    }
  }
  
  stopSpeechRecognition() {
    if (this.speechRecognition && this.isListening) {
      this.isListening = false;
      this.speechRecognition.stop();
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    this.stopRecording();
    this.stopSpeechRecognition();
  try { if (this.meydaAnalyzer && this.meydaAnalyzer.stop) this.meydaAnalyzer.stop(); } catch(e) {}
  }

  setTranscript(transcript) {
    this.currentAnalysis.transcript = transcript;
  }

  analyzeAudio() {
    if (!this.isAnalyzing) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate voice features
    // Prefer Meyda real-time features if available
    let pitch = 0;
    let volume = 0;
    let spectralCentroid = 0;
    try {
      if (this.lastMeydaFeatures) {
        volume = this.lastMeydaFeatures.rms || this.calculateVolume(dataArray);
        spectralCentroid = this.lastMeydaFeatures.spectralCentroid || this.calculateSpectralCentroid(dataArray);
        // Estimate pitch from time-domain data for real-time frame
        const timeDomain = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData && this.analyser.getFloatTimeDomainData(timeDomain);
        if (timeDomain && timeDomain.length) {
          pitch = this.calculatePitchFromFrame(timeDomain, this.audioContext.sampleRate);
        } else {
          pitch = this.calculatePitch(dataArray);
        }
      } else {
        pitch = this.calculatePitch(dataArray);
        volume = this.calculateVolume(dataArray);
        spectralCentroid = this.calculateSpectralCentroid(dataArray);
      }
    } catch (err) {
      // fallback
      pitch = this.calculatePitch(dataArray);
      volume = this.calculateVolume(dataArray);
      spectralCentroid = this.calculateSpectralCentroid(dataArray);
    }

    // Use ML model if available and enabled; otherwise use trained heuristics
    let emotions = {};
    if (this.useMlDetection && this.mlModel && this.mlLabelsMap) {
      try {
        const mfcc = this.lastMeydaFeatures?.mfcc || [];
        const mlRes = this.predictWithMl({ pitch, volume, spectralCentroid, mfccMeans: mfcc });
        if (mlRes && mlRes.probabilities) {
          // build emotions map from probabilities using labels map ordering
          const labels = Object.keys(this.mlLabelsMap).sort((a, b) => this.mlLabelsMap[a] - this.mlLabelsMap[b]);
          mlRes.probabilities.forEach((p, idx) => {
            const label = labels[idx] || `label_${idx}`;
            emotions[label] = {
              percentage: Math.round(p * 100),
              confidence: Math.round(p * 100 * 0.9),
              description: this.getEmotionDescription(label, { pitch, volume, spectralCentroid }),
              trainedAccuracy: this.trainingManager.calculateAccuracy(label)
            };
          });
        } else {
          emotions = this.detectEmotionsWithTraining({ pitch, volume, spectralCentroid, transcript });
        }
      } catch (e) {
        console.warn('ML detection failed, falling back', e);
        emotions = this.detectEmotionsWithTraining({ pitch, volume, spectralCentroid, transcript });
      }
    } else {
      emotions = this.detectEmotionsWithTraining({ pitch, volume, spectralCentroid, transcript });
    }

    this.currentAnalysis = {
      pitch: Math.round(pitch),
      volume: Math.round(volume * 100),
      spectralCentroid: Math.round(spectralCentroid),
  mfcc: this.lastMeydaFeatures?.mfcc || [],
      emotions,
      dominantEmotion: this.getDominantEmotion(emotions),
      confidence: this.getOverallConfidence(emotions),
      transcript: this.currentAnalysis.transcript,
      timestamp: Date.now()
    };

    // Perform multimodal fusion asynchronously (BERT calls are debounced inside)
    try {
      this.performFusion && this.performFusion();
    } catch (e) {}

    setTimeout(() => this.analyzeAudio(), 200);
  }

  calculatePitch(dataArray) {
    let sum = 0;
    let weightedSum = 0;
    
    for (let i = 20; i < 300; i++) {
      sum += dataArray[i];
      weightedSum += i * dataArray[i];
    }
    
    const avgFreq = sum > 0 ? weightedSum / sum : 0;
    return Math.max(80, Math.min(500, avgFreq * 2.2 + 90));
  }

  // Estimate pitch from a Float32Array frame using autocorrelation
  calculatePitchFromFrame(frame, sampleRate) {
    try {
      const N = frame.length;
      const ac = new Float32Array(N);
      for (let lag = 0; lag < N; lag++) {
        let sum = 0;
        for (let i = 0; i < N - lag; i++) sum += frame[i] * frame[i + lag];
        ac[lag] = sum;
      }

      const minFreq = 80;
      const maxFreq = 1000;
      const minLag = Math.floor(sampleRate / maxFreq);
      const maxLag = Math.floor(sampleRate / minFreq);
      let bestLag = -1;
      let bestVal = -Infinity;
      for (let lag = minLag; lag <= Math.min(maxLag, N - 1); lag++) {
        if (ac[lag] > bestVal) {
          bestVal = ac[lag];
          bestLag = lag;
        }
      }
      if (bestLag <= 0) return 0;
      const y0 = ac[bestLag - 1] || 0;
      const y1 = ac[bestLag] || 0;
      const y2 = ac[bestLag + 1] || 0;
      const denom = (y0 - 2 * y1 + y2);
      let shift = 0;
      if (denom !== 0) shift = 0.5 * (y0 - y2) / denom;
      const trueLag = bestLag + shift;
      const freq = sampleRate / trueLag;
      if (!isFinite(freq)) return 0;
      return Math.max(80, Math.min(1000, Math.round(freq)));
    } catch (e) {
      return 0;
    }
  }

  calculateVolume(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length) / 255;
  }

  calculateSpectralCentroid(dataArray) {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      weightedSum += i * dataArray[i];
      magnitudeSum += dataArray[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  detectEmotionsWithTraining(features) {
    const { pitch, volume, spectralCentroid, transcript, mfcc } = features;
    const weights = this.trainingManager.getModelWeights();
    
    const emotionPatterns = {
      happy: {
        voice: { pitch: [160, 300], volume: [0.4, 0.9], spectral: [800, 3000] },
        keywords: ['good', 'great', 'awesome', 'wonderful', 'excellent', 'fantastic', 'amazing', 'love', 'perfect', 'best']
      },
      sad: {
        voice: { pitch: [80, 160], volume: [0.1, 0.5], spectral: [200, 1000] },
        keywords: ['sad', 'terrible', 'awful', 'bad', 'disappointed', 'down', 'horrible', 'worst', 'hate', 'depressed']
      },
      angry: {
        voice: { pitch: [180, 400], volume: [0.6, 1.0], spectral: [1200, 4000] },
        keywords: ['angry', 'furious', 'mad', 'hate', 'annoying', 'stupid', 'rage', 'pissed', 'damn', 'idiot']
      },
      excited: {
        voice: { pitch: [200, 450], volume: [0.5, 1.0], spectral: [1000, 3500] },
        keywords: ['excited', 'amazing', 'incredible', 'wow', 'fantastic', 'awesome', 'unbelievable', 'epic', 'brilliant']
      },
      calm: {
        voice: { pitch: [110, 180], volume: [0.2, 0.6], spectral: [300, 1200] },
        keywords: ['calm', 'peaceful', 'relaxed', 'quiet', 'serene', 'tranquil', 'gentle', 'soft', 'steady']
      },
      nervous: {
        voice: { pitch: [170, 300], volume: [0.15, 0.6], spectral: [600, 2500] },
        keywords: ['nervous', 'worried', 'anxious', 'scared', 'uncertain', 'afraid', 'concerned', 'stressed']
      },
      confident: {
        voice: { pitch: [120, 220], volume: [0.4, 0.8], spectral: [500, 2000] },
        keywords: ['confident', 'sure', 'certain', 'definitely', 'absolutely', 'positive', 'strong', 'determined']
      },
      surprised: {
        voice: { pitch: [220, 500], volume: [0.4, 0.95], spectral: [800, 3500] },
        keywords: ['surprised', 'wow', 'really', 'unexpected', 'shocking', 'unbelievable', 'omg', 'whoa']
      },
      neutral: {
        voice: { pitch: [120, 220], volume: [0.25, 0.7], spectral: [400, 1800] },
        keywords: ['hello', 'yes', 'no', 'okay', 'fine', 'hi', 'thanks', 'well', 'the', 'and']
      },
      frustrated: {
        voice: { pitch: [140, 280], volume: [0.25, 0.85], spectral: [500, 2200] },
        keywords: ['frustrated', 'annoying', 'difficult', 'problem', 'issue', 'trouble', 'ugh', 'damn']
      }
    };

    const detectedEmotions = {};

    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      let score = 0;
      let maxScore = 0;

      // Voice feature analysis with trained weights
      const voiceFeatures = pattern.voice;
      
      if (pitch >= voiceFeatures.pitch[0] && pitch <= voiceFeatures.pitch[1]) {
        score += 30 * weights.pitch[emotion];
      }
      if (volume >= voiceFeatures.volume[0] && volume <= voiceFeatures.volume[1]) {
        score += 25 * weights.volume[emotion];
      }
      if (spectralCentroid >= voiceFeatures.spectral[0] && spectralCentroid <= voiceFeatures.spectral[1]) {
        score += 20 * weights.spectral[emotion];
      }
      maxScore += 75;

      // Keyword analysis with trained weights
      const transcriptLower = transcript.toLowerCase();
      const keywordMatches = pattern.keywords.filter(keyword => 
        transcriptLower.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        score += Math.min(25, keywordMatches * 8) * weights.keyword[emotion];
      }
      maxScore += 25;

      // Calculate percentage
      let percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

      // Small MFCC heuristic: detect spectral energy patterns that correlate with anger/joy
      try {
        const mf = mfcc || [];
        if (mf.length >= 1) {
          const mf0 = Math.abs(mf[0]);
          if (emotion === 'angry' && mf0 > 100) percentage = Math.min(100, percentage + 8);
          if (emotion === 'happy' && mf0 < 30) percentage = Math.max(percentage - 6, 0);
        }
      } catch (mfErr) {}

      // Apply training-based adjustments
      if (emotion === 'neutral' && transcript.length < 10) {
        percentage = Math.max(percentage, 40);
      }

      // Enhanced nervous reduction based on training
      if (emotion === 'nervous') {
        if (volume > 0.6 || pitch < 150 || keywordMatches === 0) {
          percentage *= weights.pitch.nervous * weights.volume.nervous;
        }
      }

      detectedEmotions[emotion] = {
        percentage: Math.max(0, Math.min(100, Math.round(percentage))),
        confidence: Math.round(percentage * 0.85),
        description: this.getEmotionDescription(emotion, features),
        trainedAccuracy: this.trainingManager.calculateAccuracy(emotion)
      };
    });

    return detectedEmotions;
  }

  getEmotionDescription(emotion, features) {
    const descriptions = {
      happy: `Elevated pitch (${features.pitch}Hz), energetic tone - Trained accuracy`,
      sad: `Lower pitch (${features.pitch}Hz), quieter volume - Trained accuracy`,
      angry: `Sharp pitch changes (${features.pitch}Hz), intense volume - Trained accuracy`,
      excited: `Very high pitch (${features.pitch}Hz), rapid speech - Trained accuracy`,
      calm: `Steady pitch (${features.pitch}Hz), controlled delivery - Trained accuracy`,
      nervous: `Variable pitch (${features.pitch}Hz), hesitant patterns - Trained accuracy`,
      confident: `Strong volume, steady pace - Trained accuracy`,
      surprised: `Sudden pitch spikes (${features.pitch}Hz) - Trained accuracy`,
      neutral: `Balanced speech patterns - Trained accuracy`,
      frustrated: `Irregular patterns, variable intensity - Trained accuracy`
    };
    return descriptions[emotion] || 'Voice pattern analysis';
  }

  getDominantEmotion(emotions) {
    let maxPercentage = 0;
    let dominantEmotion = 'neutral';
    
    Object.entries(emotions).forEach(([emotion, data]) => {
      if (data.percentage > maxPercentage) {
        maxPercentage = data.percentage;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  }

  getOverallConfidence(emotions) {
    const confidences = Object.values(emotions).map(e => e.confidence);
    return confidences.length > 0 ? 
      Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0;
  }

  getCurrentAnalysis() {
    return this.currentAnalysis;
  }

  // Debounced BERT + fusion function
  async performFusion() {
    try {
      const transcript = this.currentAnalysis.transcript || '';
      const voiceScores = {}; // map emotions to 0..1 from detectEmotionsWithTraining
      const spectralScores = {};
      const textScores = {};

      // Normalize detectEmotionsWithTraining output into 0..1 voiceScores
      const det = this.detectEmotionsWithTraining({
        pitch: this.currentAnalysis.pitch,
        volume: this.currentAnalysis.volume / 100,
        spectralCentroid: this.currentAnalysis.spectralCentroid,
        transcript
      });
      Object.keys(det).forEach(k => voiceScores[k] = (det[k].percentage || 0) / 100);

      // spectralScores: use spectralCentroid heuristics (normalized)
      Object.keys(voiceScores).forEach(k => {
        spectralScores[k] = Math.min(1, (this.currentAnalysis.spectralCentroid || 0) / 4000);
      });

      // Text scores: try BERT if transcript is long enough
      let bertResult = null;
      if (transcript && transcript.length > 3) {
        try {
          // simple debounce: only call if last call was >1000ms ago
          const now = Date.now();
          if (!this._lastBertCallAt || (now - this._lastBertCallAt) > 1000) {
            this._lastBertCallAt = now;
            bertResult = await analyzeEmotionWithBERT(transcript);
          }
        } catch (bErr) {
          console.warn('BERT call failed', bErr);
        }
      }

      if (bertResult && Array.isArray(bertResult)) {
        // expected: [{label: 'joy', score: 0.8}, ...] or HF multi-label format
        bertResult.forEach(item => {
          const label = (item.label || '').toLowerCase();
          const s = item.score || item.value || 0;
          textScores[label] = Math.max(textScores[label] || 0, s);
        });
      }

      // Fuse
      const fused = fuseEmotionScores({ bertScores: textScores, voiceScores, spectralScores, textScores });
      this.currentAnalysis.fused = fused;
    } catch (err) {
      console.warn('performFusion error', err);
    }
  }

  addTrainingSample(emotion, transcript) {
    return this.trainingManager.addTrainingSample(emotion, {
      pitch: this.currentAnalysis.pitch,
      volume: this.currentAnalysis.volume / 100,
      spectralCentroid: this.currentAnalysis.spectralCentroid,
      mfcc: this.currentAnalysis.mfcc || []
    }, transcript, this.currentAnalysis.audioBlob);
  }

  getTrainingStats() {
    return this.trainingManager.getTrainingStats();
  }

  async getStoredVoiceSamples(emotion = null) {
    return await this.trainingManager.voiceStorage.getVoiceSamples(emotion);
  }

  getUserCalibration() {
    return this.trainingManager.userCalibration;
  }

  getSessionStats() {
    return this.trainingManager.sessionStats;
  }

  async clearStoredSamples(emotion = null) {
    return await this.trainingManager.voiceStorage.clearAllSamples(emotion);
  }

  exportTrainingData() {
    return this.trainingManager.exportTrainingData();
  }

  importTrainingData(data) {
    return this.trainingManager.importTrainingData(data);
  }

  cleanup() {
    this.stopAnalysis();
    this.stopSpeechRecognition();
    if (this.microphone) this.microphone.disconnect();
    if (this.audioContext) this.audioContext.close();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }
}

// Training Center Component
const TrainingCenter = ({ analyzer = null, currentTranscript = '', isRecording = false, externalTrainingSamples = [] }) => {
  const [selectedEmotion, setSelectedEmotion] = useState('happy');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStats, setTrainingStats] = useState({});
  const [storageStats, setStorageStats] = useState({});
  const [userCalibration, setUserCalibration] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [trainingMessage, setTrainingMessage] = useState('');
  const [mlModel, setMlModel] = useState(null);
  const [isTrainingModel, setIsTrainingModel] = useState(false);
  const [trainerWorker, setTrainerWorker] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [localAnalyzer, setLocalAnalyzer] = useState(null);
  const [localTranscript, setLocalTranscript] = useState('');
  const [isLocalRecording, setIsLocalRecording] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState(localStorage.getItem('remoteVoiceTrainingUrl') || 'http://localhost:4000/api/upload');
  const [remoteUploadEnabled, setRemoteUploadEnabled] = useState(true); // Enable by default since we have ultra-reliable server
  const [remoteUploadStatus, setRemoteUploadStatus] = useState('');
  const [netlifyDeployer] = useState(() => new NetlifyModelDeployer());
  const [netlifyUrl, setNetlifyUrl] = useState(localStorage.getItem('netlifyDeploymentUrl') || '');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [audioBufferForPreview, setAudioBufferForPreview] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isPlayingTrim, setIsPlayingTrim] = useState(false);
  const audioPreviewRef = useRef(null);
  const canvasRef = useRef(null);

  // Bulk Upload State
  const [bulkUploadFiles, setBulkUploadFiles] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const bulkInputRef = useRef(null);

  const emotions = [
    { id: 'happy', label: 'Happy 😊', color: '#10b981', instruction: 'Say something joyful like "I feel amazing today!"' },
    { id: 'sad', label: 'Sad 😢', color: '#6b7280', instruction: 'Say something like "I feel really down today"' },
    { id: 'angry', label: 'Angry 😠', color: '#ef4444', instruction: 'Say something with intensity like "This is so annoying!"' },
    { id: 'excited', label: 'Excited 🤩', color: '#f59e0b', instruction: 'Say something energetic like "This is incredible!"' },
    { id: 'calm', label: 'Calm 😌', color: '#06b6d4', instruction: 'Say something peaceful like "I feel very relaxed"' },
    { id: 'nervous', label: 'Nervous 😰', color: '#8b5cf6', instruction: 'Say something hesitant like "I\'m not sure about this"' },
    { id: 'confident', label: 'Confident 💪', color: '#059669', instruction: 'Say something assertive like "I know I can do this!"' },
    { id: 'surprised', label: 'Surprised 😮', color: '#dc2626', instruction: 'Say something like "Wow, I didn\'t expect that!"' },
    { id: 'neutral', label: 'Neutral 😐', color: '#374151', instruction: 'Say something normal like "Hello, how are you?"' },
    { id: 'frustrated', label: 'Frustrated 😤', color: '#7c2d12', instruction: 'Say something like "This is so difficult!"' },
    
    // New enhanced emotions with sub-emotions
    { id: 'joyful', label: 'Joyful 🌟', color: '#fbbf24', instruction: 'Express pure joy: "I\'m absolutely delighted!"' },
    { id: 'melancholy', label: 'Melancholy 🌧️', color: '#4b5563', instruction: 'Express deep sadness: "I feel a profound sadness"' },
    { id: 'enthusiastic', label: 'Enthusiastic 🔥', color: '#f97316', instruction: 'Show high energy: "I\'m pumped up and ready!"' },
    { id: 'worried', label: 'Worried 😟', color: '#6366f1', instruction: 'Express concern: "I\'m really worried about this"' },
    { id: 'peaceful', label: 'Peaceful ☮️', color: '#22d3ee', instruction: 'Sound tranquil: "I feel completely at peace"' },
    { id: 'determined', label: 'Determined 🎯', color: '#16a34a', instruction: 'Show resolve: "I will definitely achieve this"' },
    { id: 'anxious', label: 'Anxious 😬', color: '#a855f7', instruction: 'Express anxiety: "I feel really anxious about this"' },
    { id: 'energetic', label: 'Energetic ⚡', color: '#eab308', instruction: 'Show high energy: "I have so much energy today!"' }
  ];

  // Initialize local analyzer if not provided
  useEffect(() => {
    if (!analyzer && !localAnalyzer) {
      const newAnalyzer = new EnhancedVoiceAnalyzer();
      setLocalAnalyzer(newAnalyzer);
    }
  }, [analyzer, localAnalyzer]);

  // Fix localStorage URL if it contains old endpoint and initialize server connection
  useEffect(() => {
    const currentUrl = localStorage.getItem('remoteVoiceTrainingUrl');
    if (currentUrl && currentUrl.includes('/upload') && !currentUrl.includes('/api/upload')) {
      const fixedUrl = currentUrl.replace('/upload', '/api/upload');
      localStorage.setItem('remoteVoiceTrainingUrl', fixedUrl);
      setRemoteUrl(fixedUrl);
      console.log('Fixed localStorage URL from', currentUrl, 'to', fixedUrl);
    } else if (!currentUrl) {
      // Set default server URL and enable remote upload for ultra-reliable server
      const defaultUrl = 'http://localhost:4000/api/upload';
      localStorage.setItem('remoteVoiceTrainingUrl', defaultUrl);
      setRemoteUrl(defaultUrl);
      console.log('🚀 Initialized ultra-reliable server URL:', defaultUrl);
    }
  }, []);

  // Use provided analyzer or local one
  const activeAnalyzer = analyzer || localAnalyzer;
  const activeTranscript = currentTranscript || localTranscript;
  const activeRecording = isRecording || isLocalRecording;
  // Alias for training manager / storage (may be null until analyzer initialized)
  const voiceManager = activeAnalyzer ? activeAnalyzer.trainingManager : null;

  // Accept external training samples pushed from other components (eg. VoiceEmotionSystem)
  useEffect(() => {
    if (!externalTrainingSamples || !externalTrainingSamples.length) return;
    (async () => {
      try {
        for (const sample of externalTrainingSamples) {
          try {
            // Avoid re-importing if already present in storage by checking id
            const existing = await (voiceManager ? voiceManager.getVoiceSamples(sample.emotion).then(list => list.find(s => s.id === sample.id)) : Promise.resolve(null));
            // Fallback: add to in-memory training dataset if no persistent manager
            if (!existing) {
              if (voiceManager && voiceManager.saveVoiceSample) {
                // If sample contains audioBlob and features use them, otherwise pass minimal
                const blob = sample.audioBlob || null;
                const features = sample.features || sample.voiceFeatures || {};
                // Save into indexedDB store for persistent examples (non-blocking)
                try { await voiceManager.saveVoiceSample(sample.emotion || sample.label || 'unknown', blob, features, sample.transcript || ''); } catch(e) { /* ignore individual save failures */ }
              }
              // Also update in-memory training manager list if available
              if (activeAnalyzer && activeAnalyzer.trainingManager && activeAnalyzer.trainingManager.trainingData) {
                const emo = sample.emotion || sample.label || 'unknown';
                if (!Array.isArray(activeAnalyzer.trainingManager.trainingData[emo])) activeAnalyzer.trainingManager.trainingData[emo] = [];
                // add a compact record
                activeAnalyzer.trainingManager.trainingData[emo].push({ id: sample.id || `ext_${Date.now()}`, emotion: emo, timestamp: new Date().toISOString(), voiceFeatures: sample.features || sample.voiceFeatures || {}, transcript: sample.transcript || '' });
                activeAnalyzer.trainingManager.saveTrainingData();
              }
            }
          } catch (innerErr) {
            console.warn('Failed to import external training sample', innerErr);
          }
        }
        // Refresh UI stats after import
        if (activeAnalyzer) {
          setTrainingStats(activeAnalyzer.getTrainingStats());
          updateStorageStats();
        }
      } catch (e) { console.warn('External training import failed', e); }
    })();
  }, [externalTrainingSamples, activeAnalyzer]);

  useEffect(() => {
    if (activeAnalyzer) {
      setTrainingStats(activeAnalyzer.getTrainingStats());
      setUserCalibration(activeAnalyzer.getUserCalibration());
      setSessionStats(activeAnalyzer.getSessionStats());
      updateStorageStats();
    }
    // create trainer worker
    try {
      if (!trainerWorker && typeof Worker !== 'undefined') {
        // Create a runtime blob worker that loads TF.js from CDN to avoid bundling TF in main chunk
        const workerCode = `
          self.onmessage = async (e) => {
            const msg = e.data;
            try {
              if (msg && msg.type === 'train') {
                // load tf from CDN
                importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.12.0/dist/tf.min.js');
                const tf = self.tf;
                const { samples, labelsMap, mfccLen = 13, epochs = 30, batchSize = 16 } = msg.payload || {};
                // build dataset
                const xs = [];
                const ys = [];
                samples.forEach(s => {
                  const f = s.voiceFeatures || s;
                  const row = [];
                  row.push(f.pitch || 0);
                  row.push(f.volume || 0);
                  row.push(f.spectralCentroid || 0);
                  const means = f.mfccMeans || [];
                  for (let i = 0; i < mfccLen; i++) row.push(means[i] || 0);
                  xs.push(row);
                  const label = s.emotion || f.emotion || 'neutral';
                  const labelIndex = labelsMap[label] || 0;
                  const oneHot = new Array(Object.keys(labelsMap).length).fill(0);
                  oneHot[labelIndex] = 1;
                  ys.push(oneHot);
                });
                // normalization
                const cols = xs[0] ? xs[0].length : 0;
                const means = new Array(cols).fill(0);
                const stds = new Array(cols).fill(0);
                const N = xs.length || 1;
                for (let j = 0; j < cols; j++) {
                  let ssum = 0;
                  for (let i = 0; i < N; i++) ssum += xs[i][j] || 0;
                  means[j] = ssum / N;
                }
                for (let j = 0; j < cols; j++) {
                  let ssum = 0;
                  for (let i = 0; i < N; i++) { const d = (xs[i][j] || 0) - means[j]; ssum += d*d; }
                  stds[j] = Math.sqrt(ssum / Math.max(1, N)); if (stds[j] === 0) stds[j] = 1;
                }
                const xsNorm = xs.map(row => row.map((v,j)=>((v||0)-means[j])/stds[j]));

                // build model
                const inputDim = xsNorm[0] ? xsNorm[0].length : 0;
                const numClasses = Object.keys(labelsMap).length;
                const model = tf.sequential();
                model.add(tf.layers.dense({ inputShape: [inputDim], units: 64, activation: 'relu' }));
                model.add(tf.layers.dropout({ rate: 0.3 }));
                model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
                model.add(tf.layers.dropout({ rate: 0.2 }));
                model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
                model.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

                const xsT = tf.tensor2d(xsNorm);
                const ysT = tf.tensor2d(ys);

                await model.fit(xsT, ysT, { epochs, batchSize, shuffle: true, callbacks: { onEpochEnd: (epoch, logs) => { self.postMessage({ type: 'progress', epoch, logs }); } } });

                // serialize weights
                const weights = model.getWeights();
                const serialized = [];
                for (let i = 0; i < weights.length; i++) {
                  const w = weights[i];
                  const vals = await w.data();
                  serialized.push({ buffer: vals.buffer, shape: w.shape, dtype: w.dtype });
                }
                const transfer = serialized.map(s => s.buffer);
                self.postMessage({ type: 'trained', payload: { inputDim, numClasses, weights: serialized, norm: { means, stds }, labelsMap } }, transfer);
              }
            } catch (err) { self.postMessage({ type: 'error', error: String(err) }); }
          };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const w = new Worker(url);
        w.onmessage = (ev) => {
          const msg = ev.data || {};
          if (msg.type === 'progress') {
            setTrainingProgress({ epoch: msg.epoch, logs: msg.logs });
          } else if (msg.type === 'trained') {
            (async () => {
              try {
                const payload = msg.payload;
                const tf = await import('@tensorflow/tfjs');
                const model = tf.sequential();
                model.add(tf.layers.dense({ inputShape: [payload.inputDim], units: 64, activation: 'relu' }));
                model.add(tf.layers.dropout({ rate: 0.3 }));
                model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
                model.add(tf.layers.dropout({ rate: 0.2 }));
                model.add(tf.layers.dense({ units: payload.numClasses, activation: 'softmax' }));
                model.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
                const tensors = payload.weights.map(wi => tf.tensor(new Float32Array(wi.buffer), wi.shape));
                model.setWeights(tensors);
                await model.save('localstorage://local-voice-model');
                localStorage.setItem('local-voice-model_meta', JSON.stringify({ labelsMap: payload.labelsMap, norm: payload.norm }));
                setMlModel(model);
                setTrainingMessage('✅ Model trained (worker) and saved locally');
                setTimeout(() => setTrainingMessage(''), 3000);
              } catch (e) { console.warn('Failed to reconstruct model from worker', e); setTrainingMessage('❌ Failed to reconstruct model from worker'); }
            })();
          } else if (msg.type === 'error') {
            setTrainingMessage(`❌ Training error: ${msg.error}`);
          }
        };
        setTrainerWorker(w);
      }
    } catch (e) { console.warn('Worker not available', e); }
  }, [activeAnalyzer]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAnalyzer) {
        setTrainingStats(activeAnalyzer.getTrainingStats());
        setUserCalibration(activeAnalyzer.getUserCalibration());
        setSessionStats(activeAnalyzer.getSessionStats());
        updateStorageStats();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeAnalyzer]);

  // Enhanced function to test server connectivity
  const testServerConnection = async () => {
    try {
      console.log('🔧 Testing server connection...');
      const healthResponse = await fetch('http://localhost:4000/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Server is healthy:', healthData);
        return true;
      } else {
        console.error('❌ Server health check failed:', healthResponse.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      return false;
    }
  };

  // Deploy trained model to Netlify
  const deployToNetlify = async () => {
    if (!activeAnalyzer) {
      setTrainingMessage('❌ No trained model to deploy');
      setTimeout(() => setTrainingMessage(''), 2000);
      return;
    }

    if (!netlifyUrl) {
      setTrainingMessage('❌ Please set Netlify URL first');
      setTimeout(() => setTrainingMessage(''), 2000);
      return;
    }

    setTrainingMessage('🚀 Deploying model to Netlify...');

    try {
      netlifyDeployer.setNetlifyUrl(netlifyUrl);
      
      const trainingData = activeAnalyzer.exportTrainingData();
      const modelWeights = activeAnalyzer.trainingManager.getModelWeights();
      const userCalib = activeAnalyzer.getUserCalibration();
      const sessStats = activeAnalyzer.getSessionStats();

      const result = await netlifyDeployer.deployModel(
        trainingData.trainingData,
        modelWeights,
        userCalib,
        sessStats
      );

      if (result.success) {
        setTrainingMessage(`✅ Model deployed! ID: ${result.deploymentId.slice(-8)}`);
        console.log('🎉 Netlify deployment successful:', result);
      } else {
        setTrainingMessage(`❌ Deployment failed: ${result.error}`);
      }
      
      setTimeout(() => setTrainingMessage(''), 5000);

    } catch (error) {
      console.error('Netlify deployment error:', error);
      setTrainingMessage('❌ Deployment failed: ' + error.message);
      setTimeout(() => setTrainingMessage(''), 3000);
    }
  };

  // Download model from Netlify
  const downloadFromNetlify = async () => {
    if (!netlifyUrl) {
      setTrainingMessage('❌ Please set Netlify URL first');
      setTimeout(() => setTrainingMessage(''), 2000);
      return;
    }

    setTrainingMessage('📥 Downloading model from Netlify...');

    try {
      netlifyDeployer.setNetlifyUrl(netlifyUrl);
      const result = await netlifyDeployer.downloadModel();

      if (result.success && activeAnalyzer) {
        // Import the downloaded model
        const modelData = result.model;
        if (modelData.modelWeights) {
          activeAnalyzer.trainingManager.modelWeights = modelData.modelWeights;
          activeAnalyzer.trainingManager.saveModelWeights();
        }
        
        setTrainingMessage(`✅ Model downloaded! Accuracy: ${modelData.metadata?.accuracy}%`);
        console.log('📥 Model downloaded from Netlify:', result);
        
        // Refresh statistics
        setTrainingStats(activeAnalyzer.getTrainingStats());
        
      } else {
        setTrainingMessage(`❌ Download failed: ${result.error}`);
      }
      
      setTimeout(() => setTrainingMessage(''), 5000);

    } catch (error) {
      console.error('Netlify download error:', error);
      setTrainingMessage('❌ Download failed: ' + error.message);
      setTimeout(() => setTrainingMessage(''), 3000);
    }
  };

  // Save Netlify URL
  const saveNetlifySettings = () => {
    if (netlifyUrl) {
      localStorage.setItem('netlifyDeploymentUrl', netlifyUrl);
      setTrainingMessage('✅ Netlify URL saved');
    } else {
      localStorage.removeItem('netlifyDeploymentUrl');
      setTrainingMessage('❌ Netlify URL removed');
    }
    setTimeout(() => setTrainingMessage(''), 2000);
  };

  // Enhanced function to fetch server data
  const fetchServerData = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/data/all');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Server Data:', data);
        
        // Calculate statistics from server data
        const emotionCounts = {};
        data.metadata.forEach(item => {
          if (item.emotion) {
            emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
          }
        });
        
        setStorageStats({
          totalSamples: data.metadata.length,
          emotionCounts: emotionCounts,
          lastUpdated: new Date().toISOString()
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
    return null;
  };

  const updateStorageStats = async () => {
    if (!activeAnalyzer) return;
    
    try {
      // First, migrate any existing samples that don't have uploadStatus
      const migratedCount = await activeAnalyzer.trainingManager.voiceStorage.migrateExistingSamples();
      if (migratedCount > 0) {
        console.log(`Migrated ${migratedCount} voice samples to add upload status`);
      }
      
      const stats = {};
      for (const emotion of emotions) {
        const samples = await activeAnalyzer.getStoredVoiceSamples(emotion.id);
        const uploadedSamples = samples.filter(s => (s.uploadStatus || 'pending') === 'uploaded');
        const pendingSamples = samples.filter(s => (s.uploadStatus || 'pending') === 'pending');
        const failedSamples = samples.filter(s => (s.uploadStatus || 'pending') === 'failed');
        
        stats[emotion.id] = {
          voiceSamples: samples.length,
          uploadedCount: uploadedSamples.length,
          pendingCount: pendingSamples.length,
          failedCount: failedSamples.length,
          totalSize: samples.reduce((sum, sample) => sum + (sample.audioBlob?.size || 0), 0),
          lastSample: samples.length > 0 ? samples[samples.length - 1].timestamp : null,
          lastUploaded: uploadedSamples.length > 0 ? uploadedSamples[uploadedSamples.length - 1].timestamp : null
        };
      }
      setStorageStats(stats);
    } catch (error) {
      console.warn('Failed to load storage stats:', error);
    }
  };

  const updateTrainingStats = async () => {
    if (!activeAnalyzer) return;
    
    try {
      const stats = {};
      for (const emotion of emotions) {
        const samples = await activeAnalyzer.getStoredVoiceSamples(emotion.id);
        const trainingMeta = await activeAnalyzer.trainingManager.voiceStorage.getTrainingStats();
        
        stats[emotion.id] = {
          totalSamples: samples.length,
          trainingAccuracy: trainingMeta.averageAccuracy || 0,
          lastTraining: trainingMeta.lastTraining || null,
          modelVersion: trainingMeta.modelVersion || 1,
          confidenceScore: trainingMeta.confidenceScore || 0
        };
      }
      setTrainingStats(stats);
    } catch (error) {
      console.warn('Failed to load training stats:', error);
    }
  };

  const startLocalRecording = async () => {
    if (!activeAnalyzer) {
      setTrainingMessage('❌ Voice analyzer not initialized');
      return;
    }

    const initialized = await activeAnalyzer.initialize();
    if (!initialized) {
      setTrainingMessage('❌ Could not access microphone');
      return;
    }

    setIsLocalRecording(true);
    activeAnalyzer.startAnalysis();
    setTrainingMessage('🎤 Recording started - speak now!');
  };

  const stopLocalRecording = () => {
    if (activeAnalyzer) {
      activeAnalyzer.stopAnalysis();
      setIsLocalRecording(false);
      // Wait briefly for speech recognition final results to arrive
      setTimeout(() => {
        const currentAnalysis = activeAnalyzer.getCurrentAnalysis();
        setLocalTranscript(currentAnalysis.transcript || 'Voice sample recorded');
        setTrainingMessage('✅ Recording stopped - ready for training!');
        if (currentAnalysis.audioBlob) {
          try { if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl); } catch (e) {}
          const url = URL.createObjectURL(currentAnalysis.audioBlob);
          setAudioPreviewUrl(url);
        }
      }, 400);
    }
  };

  // Handle importing an audio file (wav/mp3/webm)
  const handleAudioFileImport = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file || !activeAnalyzer) {
      setTrainingMessage('❌ No file selected or analyzer not ready');
      return;
    }

    try {
      // Ensure analyzer is initialized so audioContext exists
      const initialized = await activeAnalyzer.initialize();
      if (!initialized) {
        setTrainingMessage('❌ Could not initialize audio context for file');
        return;
      }

      // Store file blob into analyzer's currentAnalysis for later training
  activeAnalyzer.currentAnalysis.audioBlob = file;
  try { if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl); } catch (e) {}
  const _url = URL.createObjectURL(file);
  setAudioPreviewUrl(_url);
      // Set a transcript placeholder to filename (useful if speech recognition isn't available)
      const displayName = file.name || 'Imported audio';
      setLocalTranscript(displayName);
      setTrainingMessage(`📥 Loaded audio file: ${displayName}`);

      // Try to decode audio and set features (pitch, volume, spectral centroid) for display and training
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await activeAnalyzer.audioContext.decodeAudioData(arrayBuffer);
        // Extract richer features: try Meyda if available, otherwise fallback
        let rms = 0;
        let centroid = 0;
        let estFreq = 0;
        try {
          const channelData = audioBuffer.getChannelData(0);
          // Meyda requires an audio context and buffer source; we can compute via Meyda.extract on a frame
          if (Meyda && Meyda.extract) {
            // Use a frame in the center
            const frameSize = Math.min(2048, channelData.length);
            const start = Math.max(0, Math.floor((channelData.length - frameSize) / 2));
            const frame = channelData.slice(start, start + frameSize);
            const features = Meyda.extract(['rms', 'spectralCentroid', 'mfcc'], frame);
            if (features) {
              rms = features.rms || 0;
              centroid = features.spectralCentroid || 0;
            }
          }

          // Always compute robust pitch using autocorrelation estimator
          try {
            estFreq = estimatePitchFromAudioBuffer(audioBuffer) || 0;
          } catch (pf) {
            estFreq = 0;
          }

          // Fallback manual RMS/centroid if Meyda not available or feature missing
          if (!rms) {
            let sum = 0, weightedSum = 0;
            const window = Math.min(channelData.length, 8192);
            const step = Math.max(1, Math.floor(channelData.length / window));
            let rmsAcc = 0;
            let sumAbs = 0;
            for (let i = 0; i < channelData.length; i += step) {
              const v = channelData[i];
              const absV = Math.abs(v);
              rmsAcc += v * v;
              weightedSum += i * absV;
              sumAbs += absV;
            }
            rms = Math.sqrt(rmsAcc / Math.max(1, Math.floor(channelData.length / step)));
            centroid = sumAbs > 0 ? weightedSum / sumAbs : 0;
          }

          // Set analyzer currentAnalysis features so training will use them
          activeAnalyzer.currentAnalysis.pitch = estFreq;
          activeAnalyzer.currentAnalysis.volume = Math.round(rms * 100);
          activeAnalyzer.currentAnalysis.spectralCentroid = Math.round(centroid);
        } catch (featErr) {
          console.warn('Feature extraction failed, using defaults', featErr);
        }

  // Set audio buffer for preview and trim controls
  setAudioBufferForPreview(audioBuffer);
  setTrimStart(0);
  setTrimEnd(audioBuffer.duration || 0);
  // draw waveform
  setTimeout(() => drawWaveform(audioBuffer), 50);

        // Run detection preview using training-based detector
        try {
          const preview = activeAnalyzer.detectEmotionsWithTraining({
            pitch: activeAnalyzer.currentAnalysis.pitch,
            volume: activeAnalyzer.currentAnalysis.volume / 100,
            spectralCentroid: activeAnalyzer.currentAnalysis.spectralCentroid,
            transcript: ''
          });
          activeAnalyzer.currentAnalysis.emotions = preview;
          activeAnalyzer.currentAnalysis.dominantEmotion = activeAnalyzer.getDominantEmotion(preview);
        } catch (err) {
          console.warn('Preview detection failed:', err);
        }
      } catch (err) {
        // Non-fatal
        console.warn('Could not decode imported audio for feature extraction:', err);
      }

      // Focus user to train or save sample
      setTimeout(() => setTrainingMessage('✅ Audio ready - select emotion and click Train'), 500);
    } catch (error) {
      console.error('Audio import error:', error);
      setTrainingMessage('❌ Failed to import audio file');
    } finally {
      // reset file input value to allow re-importing same file if needed
      if (event.target) event.target.value = '';
    }
  };

  // Bulk Upload Functions
  const handleBulkUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log(`🗂️ Bulk upload selected: ${files.length} files`);
    
    // Validate file types
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    const invalidFiles = files.length - audioFiles.length;
    
    if (invalidFiles > 0) {
      alert(`⚠️ ${invalidFiles} non-audio files were excluded. Processing ${audioFiles.length} audio files.`);
    }
    
    setBulkUploadFiles(audioFiles);
    setProcessedCount(0);
    setBulkProgress(0);
  };

  const processBulkUpload = async () => {
    if (bulkUploadFiles.length === 0) return;
    
    setBulkProcessing(true);
    setProcessedCount(0);
    setBulkProgress(0);
    
    console.log(`🚀 Starting bulk processing of ${bulkUploadFiles.length} files for ${selectedEmotion} training...`);
    setTrainingMessage(`🚀 Starting bulk processing of ${bulkUploadFiles.length} files...`);
    
    const batchSize = 25; // Process 25 files at a time
    const results = [];
    const trainingManager = new VoiceTrainingManager();
    
    try {
      for (let i = 0; i < bulkUploadFiles.length; i += batchSize) {
        const batch = bulkUploadFiles.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} files`);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (file, index) => {
          try {
            // Simulate processing and extract features
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
            
            if (!activeAnalyzer) {
              throw new Error('Analyzer not available');
            }

            // Initialize analyzer if needed
            const initialized = await activeAnalyzer.initialize();
            if (!initialized) {
              throw new Error('Could not initialize audio context');
            }

            // Decode audio and extract features
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await activeAnalyzer.audioContext.decodeAudioData(arrayBuffer);
            
            // Extract features using same logic as single file import
            let rms = 0;
            let centroid = 0;
            let estFreq = 0;

            const channelData = audioBuffer.getChannelData(0);
            
            // Use Meyda if available
            if (window.Meyda && window.Meyda.extract) {
              const frameSize = Math.min(2048, channelData.length);
              const start = Math.max(0, Math.floor((channelData.length - frameSize) / 2));
              const frame = channelData.slice(start, start + frameSize);
              const features = window.Meyda.extract(['rms', 'spectralCentroid'], frame);
              if (features) {
                rms = features.rms || 0;
                centroid = features.spectralCentroid || 0;
              }
            }

            // Estimate pitch
            try {
              estFreq = estimatePitchFromAudioBuffer(audioBuffer) || 0;
            } catch (pf) {
              estFreq = 0;
            }

            // Fallback RMS calculation if needed
            if (!rms) {
              let rmsAcc = 0;
              const step = Math.max(1, Math.floor(channelData.length / 1000));
              for (let i = 0; i < channelData.length; i += step) {
                const v = channelData[i];
                rmsAcc += v * v;
              }
              rms = Math.sqrt(rmsAcc / Math.max(1, Math.floor(channelData.length / step)));
            }

            const voiceFeatures = {
              pitch: estFreq,
              volume: Math.round(rms * 100),
              spectralCentroid: Math.round(centroid),
              duration: audioBuffer.duration,
              sampleRate: audioBuffer.sampleRate
            };

            // Save to voice storage
            const sample = await trainingManager.voiceStorage.saveVoiceSample(
              selectedEmotion,
              file,
              voiceFeatures,
              file.name
            );

            // Add to training data
            trainingManager.addTrainingData(selectedEmotion, {
              pitch: estFreq,
              volume: rms,
              spectralCentroid: centroid,
              transcript: file.name
            });

            // Upload to ultra-reliable server
            try {
              const uploadUrl = remoteUrl || localStorage.getItem('remoteVoiceTrainingUrl') || 'http://localhost:4000/api/upload';
              const formData = new FormData();
              formData.append('audio', file);
              formData.append('emotion', selectedEmotion);
              formData.append('transcript', file.name);
              formData.append('voiceFeatures', JSON.stringify(voiceFeatures));
              formData.append('confidence', '85');
              formData.append('bulkUploadIndex', i + index);
              formData.append('totalBulkFiles', bulkUploadFiles.length);

              const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                  'X-Upload-ID': `bulk_${Date.now()}_${i + index}`,
                  'X-Retry-Count': '0'
                },
                body: formData
              });

              const uploadResult = await uploadResponse.json();
              
              if (!uploadResult.success) {
                console.warn('Server upload failed, but local storage succeeded', uploadResult);
              } else {
                console.log('✅ Uploaded to server:', uploadResult.uploadId);
              }
            } catch (serverError) {
              console.warn('Server upload failed, continuing with local storage only:', serverError.message);
            }

            // Update progress
            setProcessedCount(prev => {
              const newCount = prev + 1;
              setBulkProgress(Math.round((newCount / bulkUploadFiles.length) * 100));
              return newCount;
            });

            return {
              id: sample.id,
              filename: file.name,
              emotion: selectedEmotion,
              features: voiceFeatures,
              processedAt: new Date().toISOString(),
              success: true
            };
            
          } catch (error) {
            console.error(`❌ Error processing ${file.name}:`, error);
            
            // Still update progress even on error
            setProcessedCount(prev => {
              const newCount = prev + 1;
              setBulkProgress(Math.round((newCount / bulkUploadFiles.length) * 100));
              return newCount;
            });

            return {
              filename: file.name,
              error: error.message,
              processedAt: new Date().toISOString(),
              success: false
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < bulkUploadFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      console.log(`✅ Bulk processing complete! ${successCount} successful, ${errorCount} errors`);
      
      // Update training stats
      await updateTrainingStats();
      
      // Show summary
      const message = `🎉 Bulk Training Complete!\n\n✅ Successfully processed: ${successCount} files\n❌ Errors: ${errorCount} files\n\n🏋️ All files added to "${selectedEmotion}" training data!`;
      setTrainingMessage(message);
      alert(message);
      
    } catch (error) {
      console.error('❌ Bulk processing failed:', error);
      const errorMsg = `❌ Bulk processing failed: ${error.message}`;
      setTrainingMessage(errorMsg);
      alert(errorMsg);
    } finally {
      setBulkProcessing(false);
      setBulkUploadFiles([]);
      setBulkProgress(0);
      setProcessedCount(0);
    }
  };

  const clearBulkUpload = () => {
    setBulkUploadFiles([]);
    setProcessedCount(0);
    setBulkProgress(0);
    if (bulkInputRef.current) {
      bulkInputRef.current.value = '';
    }
  };

  // Draw waveform on canvas
  const drawWaveform = (audioBuffer) => {
    if (!canvasRef.current || !audioBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.clientWidth * devicePixelRatio;
    const height = canvas.height = 100 * devicePixelRatio;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#eef2ff';
    ctx.fillRect(0, 0, width, height);

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const x = i;
      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;
      ctx.fillRect(x, height - y2, 1, y2 - y1);
    }

    // draw trim markers and draggable handles
    if (audioBuffer.duration) {
      const startX = Math.floor((trimStart / audioBuffer.duration) * width);
      const endX = Math.floor((trimEnd / audioBuffer.duration) * width);
      ctx.fillStyle = 'rgba(239,68,68,0.25)';
      ctx.fillRect(0, 0, Math.max(0, startX), height);
      ctx.fillRect(Math.max(0, endX), 0, Math.max(0, width - endX), height);
      // markers
      ctx.fillStyle = 'rgba(59,130,246,0.9)';
      ctx.fillRect(startX - 2, 0, 4, height);
      ctx.fillRect(endX - 2, 0, 4, height);

      // draw draggable circles
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(startX, height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Canvas mouse handlers for draggable trim handles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBufferForPreview) return;
    const onPointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * devicePixelRatio;
      const width = canvas.width;
      const duration = audioBufferForPreview.duration || 1;
      const startX = Math.floor((trimStart / duration) * width);
      const endX = Math.floor((trimEnd / duration) * width);
      const distToStart = Math.abs(x - startX);
      const distToEnd = Math.abs(x - endX);
      const threshold = 12 * devicePixelRatio;
      if (distToStart < threshold) {
        setIsDraggingStart(true);
      } else if (distToEnd < threshold) {
        setIsDraggingEnd(true);
      }
    };
    const onPointerMove = (e) => {
      if (!isDraggingStart && !isDraggingEnd) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * devicePixelRatio;
      const width = canvas.width;
      const duration = audioBufferForPreview.duration || 1;
      const time = Math.max(0, Math.min(duration, (x / width) * duration));
      if (isDraggingStart) {
        setTrimStart(Math.min(time, Math.max(0, trimEnd - 0.05)));
      } else if (isDraggingEnd) {
        setTrimEnd(Math.max(time, Math.min(duration, trimStart + 0.05)));
      }
    };
    const onPointerUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [canvasRef, audioBufferForPreview, isDraggingStart, isDraggingEnd, trimStart, trimEnd]);

  const downloadTrimmed = () => {
    if (!audioBufferForPreview) return;
    try {
      const blob = audioBufferToWavBlob(audioBufferForPreview, trimStart, trimEnd);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed-${selectedEmotion}-${new Date().toISOString()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      setTrainingMessage('📥 Trimmed audio downloaded');
      setTimeout(() => setTrainingMessage(''), 2000);
    } catch (err) {
      console.warn('Download trimmed failed', err);
      setTrainingMessage('❌ Failed to download trimmed audio');
    }
  };

  // Play trimmed segment using audio element
  const playTrimmed = () => {
    const audioEl = audioPreviewRef.current;
    if (!audioEl) return;
    try {
      audioEl.currentTime = Math.max(0, trimStart);
      setIsPlayingTrim(true);
      audioEl.play();
    } catch (e) {
      console.warn('Play trimmed failed', e);
    }
  };

  const onAudioTimeUpdate = () => {
    const audioEl = audioPreviewRef.current;
    if (!audioEl || !audioBufferForPreview) return;
    if (audioEl.currentTime >= Math.max(0, trimEnd)) {
      audioEl.pause();
      setIsPlayingTrim(false);
    }
  };

  useEffect(() => {
    if (audioBufferForPreview) drawWaveform(audioBufferForPreview);
  }, [audioBufferForPreview, trimStart, trimEnd]);

  // Convert AudioBuffer slice to WAV Blob (16-bit PCM)
  const audioBufferToWavBlob = (audioBuffer, startSec = 0, endSec = null) => {
    const sampleRate = audioBuffer.sampleRate || 44100;
    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.floor((endSec || audioBuffer.duration) * sampleRate);
    const length = Math.max(0, endSample - startSample);
    const numChannels = audioBuffer.numberOfChannels;
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);

    // write WAV header
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    // write interleaved samples
    let offset = 44;
    for (let i = startSample; i < endSample; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        const sample = Math.max(-1, Math.min(1, channelData[i] || 0));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // Compute MFCC mean and variance for an MFCC sequence (array of arrays or single array)
  const computeMfccStats = (mfccArray) => {
    if (!mfccArray) return { means: [], vars: [] };
    let frames = [];
    if (Array.isArray(mfccArray[0])) frames = mfccArray;
    else frames = [mfccArray];
    if (frames.length === 0) return { means: [], vars: [] };
    const k = frames[0].length;
    const means = new Array(k).fill(0);
    const vars = new Array(k).fill(0);
    const N = frames.length;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < k; j++) means[j] += frames[i][j] || 0;
    }
    for (let j = 0; j < k; j++) means[j] /= N;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < k; j++) {
        const d = (frames[i][j] || 0) - means[j];
        vars[j] += d * d;
      }
    }
    for (let j = 0; j < k; j++) vars[j] = vars[j] / Math.max(1, N);
    return { means, vars };
  };

  // Generic array stats helper
  const computeArrayStats = (arr) => {
    if (!arr || !arr.length) return { mean: 0, median: 0, std: 0, min: 0, max: 0, count: 0 };
    const N = arr.length;
    const copy = Array.from(arr).filter(v => isFinite(v));
    if (!copy.length) return { mean: 0, median: 0, std: 0, min: 0, max: 0, count: 0 };
    copy.sort((a, b) => a - b);
    const sum = copy.reduce((s, v) => s + v, 0);
    const mean = sum / copy.length;
    const median = copy.length % 2 === 1 ? copy[(copy.length - 1) / 2] : (copy[copy.length / 2 - 1] + copy[copy.length / 2]) / 2;
    const varSum = copy.reduce((s, v) => s + Math.pow(v - mean, 2), 0);
    const std = Math.sqrt(varSum / copy.length);
    return { mean, median, std, min: copy[0], max: copy[copy.length - 1], count: copy.length };
  };

  // Slice an AudioBuffer's first channel samples into a Float32Array segment
  const sliceChannel = (audioBuffer, startSec = 0, endSec = null) => {
    if (!audioBuffer) return null;
    const sampleRate = audioBuffer.sampleRate || 44100;
    const start = Math.max(0, Math.floor(startSec * sampleRate));
    const end = Math.min(audioBuffer.length, Math.floor((endSec || audioBuffer.duration) * sampleRate));
    const len = Math.max(0, end - start);
    const out = new Float32Array(len);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) out[i] = channel[start + i] || 0;
    return out;
  };

  // Extract frame-wise features (MFCC, spectral centroid, rolloff, RMS, ZCR) and pitch estimates
  const extractFeaturesFromAudioBuffer = async (audioBuffer, startSec = 0, endSec = null) => {
    if (!audioBuffer) return null;
    try {
      const sr = audioBuffer.sampleRate || 44100;
      const frameSize = 2048;
      const hop = 1024; // 50% overlap
      const startSample = Math.max(0, Math.floor(startSec * sr));
      const endSample = Math.min(audioBuffer.length, Math.floor((endSec || audioBuffer.duration) * sr));
      const channel = audioBuffer.getChannelData(0);
      const mfccFrames = [];
      const centroidArr = [];
      const rolloffArr = [];
      const rmsArr = [];
      const zcrArr = [];
      const pitchArr = [];

      for (let i = startSample; i + 64 < endSample; i += hop) {
        const frameEnd = Math.min(i + frameSize, endSample);
        const frame = channel.slice(i, frameEnd);
        // pad if needed
        if (frame.length < frameSize) {
          const padded = new Float32Array(frameSize);
          padded.set(frame, 0);
          // leave rest as zeros
          // use padded for Meyda
          try {
            const feats = Meyda && Meyda.extract ? Meyda.extract(['rms', 'spectralCentroid', 'mfcc', 'spectralRolloff'], padded) : null;
            if (feats) {
              if (feats.mfcc) mfccFrames.push(feats.mfcc);
              if (feats.spectralCentroid != null) centroidArr.push(feats.spectralCentroid);
              if (feats.spectralRolloff != null) rolloffArr.push(feats.spectralRolloff);
              if (feats.rms != null) rmsArr.push(feats.rms);
            }
          } catch (e) {}
        } else {
          try {
            const feats = Meyda && Meyda.extract ? Meyda.extract(['rms', 'spectralCentroid', 'mfcc', 'spectralRolloff'], frame) : null;
            if (feats) {
              if (feats.mfcc) mfccFrames.push(feats.mfcc);
              if (feats.spectralCentroid != null) centroidArr.push(feats.spectralCentroid);
              if (feats.spectralRolloff != null) rolloffArr.push(feats.spectralRolloff);
              if (feats.rms != null) rmsArr.push(feats.rms);
            }
          } catch (e) {}
        }

        // compute ZCR for this frame
        try {
          let zc = 0;
          for (let k = 1; k < frame.length; k++) if ((frame[k - 1] >= 0) !== (frame[k] >= 0)) zc++;
          zcrArr.push(zc / Math.max(1, frame.length));
        } catch (e) {}

        // estimate pitch for the frame by creating a small AudioBuffer and calling estimator
        try {
          if (typeof estimatePitchFromAudioBuffer === 'function') {
            // create temporary AudioBuffer
            const tmp = activeAnalyzer && activeAnalyzer.audioContext ? activeAnalyzer.audioContext.createBuffer(1, frame.length, sr) : null;
            if (tmp) {
              tmp.copyToChannel(frame, 0, 0);
              const p = estimatePitchFromAudioBuffer(tmp) || 0;
              if (p) pitchArr.push(p);
            }
          }
        } catch (e) {}
      }

      const mfccStats = computeMfccStats(mfccFrames);
      const pitchStats = computeArrayStats(pitchArr);
      const centroidStats = computeArrayStats(centroidArr);
      const rolloffStats = computeArrayStats(rolloffArr);
      const energyStats = computeArrayStats(rmsArr);
      const zcrStats = computeArrayStats(zcrArr);

      return {
        mfccFramesCount: mfccFrames.length,
        mfccMeans: mfccStats.means,
        mfccVars: mfccStats.vars,
        pitchStats,
        spectralCentroidMean: centroidStats.mean,
        spectralCentroidStd: centroidStats.std,
        spectralRolloffMean: rolloffStats.mean,
        energyMean: energyStats.mean,
        energyStd: energyStats.std,
        zcrMean: zcrStats.mean,
        zcrStd: zcrStats.std
      };
    } catch (err) {
      console.warn('extractFeaturesFromAudioBuffer failed', err);
      return null;
    }
  };

  const handleTrainEmotion = async () => {
    // Allow training if either transcript exists or there is an audio blob (audio-only training)
    const hasAudioBlob = !!(activeAnalyzer && activeAnalyzer.currentAnalysis && activeAnalyzer.currentAnalysis.audioBlob);
    if (!activeAnalyzer || (!activeTranscript.trim() && !hasAudioBlob)) {
      setTrainingMessage('❌ Please record or import an audio sample first!');
      return;
    }

    setIsTraining(true);
    setTrainingMessage(`🎯 Training ${selectedEmotion} emotion...`);

    try {
      // Prepare voice features with richer aggregates (prefer trimmed audio when available)
      const ca = activeAnalyzer.currentAnalysis || {};
      let voiceFeatures = {
        pitch: ca.pitch || 0,
        volume: (ca.volume || 0) / 100,
        spectralCentroid: ca.spectralCentroid || 0,
        mfccMeans: [],
        mfccVars: [],
        pitchStats: {},
        spectralRolloffMean: 0,
        energyMean: 0,
        zcrMean: 0
      };

      // If we have an audioBuffer preview and a meaningful trim window, extract frame-wise stats
      try {
        if (audioBufferForPreview && trimEnd > trimStart + 0.05) {
          const feats = await extractFeaturesFromAudioBuffer(audioBufferForPreview, trimStart, trimEnd);
          if (feats) {
            voiceFeatures = {
              ...voiceFeatures,
              pitch: (feats.pitchStats && feats.pitchStats.median) || voiceFeatures.pitch,
              volume: Math.max(0, Math.min(1, (feats.energyMean || voiceFeatures.volume))),
              spectralCentroid: feats.spectralCentroidMean || voiceFeatures.spectralCentroid,
              mfccMeans: feats.mfccMeans || voiceFeatures.mfccMeans,
              mfccVars: feats.mfccVars || voiceFeatures.mfccVars,
              pitchStats: feats.pitchStats || {},
              spectralRolloffMean: feats.spectralRolloffMean || 0,
              energyMean: feats.energyMean || 0,
              zcrMean: feats.zcrMean || 0
            };
          }
        } else if (ca && ca.mfcc && ca.mfcc.length) {
          // fallback: use real-time Meyda frame if available
          const mfccStats = computeMfccStats(ca.mfcc || []);
          voiceFeatures.mfccMeans = mfccStats.means;
          voiceFeatures.mfccVars = mfccStats.vars;
        }
      } catch (err) {
        console.warn('Feature extraction during training prep failed', err);
      }

      // Prepare audio blob: prefer trimmed clip if set
      let finalBlob = null;
      try {
        if (audioBufferForPreview && trimEnd > trimStart + 0.05) {
          // create WAV blob from buffer slice
          finalBlob = audioBufferToWavBlob(audioBufferForPreview, trimStart, trimEnd);
        } else if (ca.audioBlob) {
          finalBlob = ca.audioBlob;
        }
      } catch (err) {
        console.warn('Failed to prepare audio blob for training:', err);
      }

      const sample = await activeAnalyzer.addTrainingSample(selectedEmotion, voiceFeatures, activeTranscript, finalBlob);
      
      // Update all stats
      setTrainingStats(activeAnalyzer.getTrainingStats());
      setUserCalibration(activeAnalyzer.getUserCalibration());
      setSessionStats(activeAnalyzer.getSessionStats());
      await updateStorageStats();

      // Upload to remote training server if enabled
      if (remoteUploadEnabled) {
        try {
          setRemoteUploadStatus('Uploading...');
          const form = new FormData();
          form.append('emotion', selectedEmotion);
          form.append('transcript', activeTranscript || '');
          form.append('voiceFeatures', JSON.stringify(voiceFeatures || {}));
          if (finalBlob) {
            const mime = finalBlob.type || '';
            let ext = '.wav';
            if (mime.includes('webm') || mime.includes('opus')) ext = '.webm';
            else if (mime.includes('mpeg') || mime.includes('mp3')) ext = '.mp3';
            else if (mime.includes('ogg')) ext = '.ogg';
            else if (mime.includes('wav')) ext = '.wav';
            form.append('audio', finalBlob, `${sample.id}${ext}`);
          }
          const uploadUrl = remoteUrl || localStorage.getItem('remoteVoiceTrainingUrl') || 'http://localhost:4000/api/upload';
          console.debug('Uploading single sample to', uploadUrl, { sampleId: sample.id, emotion: selectedEmotion, hasAudio: !!finalBlob });
          const res = await fetch(uploadUrl, { method: 'POST', body: form });
          if (res.ok) {
            setRemoteUploadStatus('Uploaded ✅');
          } else {
            const text = await res.text().catch(()=>'');
            console.warn('Upload failed', res.status, res.statusText, text);
            setRemoteUploadStatus('Upload failed');
          }
        } catch (err) {
          console.warn('Remote upload error', err);
          setRemoteUploadStatus('Upload error');
        }
      }
      
      const stats = trainingStats[selectedEmotion];
      const voiceStorageCount = storageStats[selectedEmotion]?.voiceSamples || 0;
      
      const uploadInfo = remoteUploadEnabled ? ' + Uploaded to server!' : '';
      setTrainingMessage(`✅ Successfully trained ${selectedEmotion} emotion!${uploadInfo} 
        Memory: ${stats?.count || 0} samples, Voice Storage: ${voiceStorageCount} recordings, 
        Accuracy: ${stats?.accuracy || 0}%`);
      
      setTimeout(() => setTrainingMessage(''), 4000);
      } catch (error) {
        let errorMsg = '❌ Training failed. Please try again.';
        if (error && error.message) {
          errorMsg += `\nError: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMsg += `\nError: ${error}`;
        } else if (error) {
          errorMsg += `\nError: ${JSON.stringify(error)}`;
        }
        setTrainingMessage(errorMsg);
        console.error('Training error:', error);
      }

      setIsTraining(false);
  };

  const saveRemoteSettings = () => {
    if (remoteUploadEnabled) {
      localStorage.setItem('remoteVoiceTrainingUrl', remoteUrl);
    } else {
      localStorage.removeItem('remoteVoiceTrainingUrl');
    }
    setTrainingMessage('🔁 Remote settings saved');
    setTimeout(() => setTrainingMessage(''), 1500);
  };

  const exportData = () => {
    if (!activeAnalyzer) return;
    
    const data = activeAnalyzer.exportTrainingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-emotion-training-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTrainingMessage('📥 Training data exported successfully!');
    setTimeout(() => setTrainingMessage(''), 3000);
  };

  // Bulk push all local IndexedDB voice samples to configured remote server
  const pushAllToServer = async () => {
    const remoteUrl = localStorage.getItem('remoteVoiceTrainingUrl') || 'http://localhost:4000/api/upload';
    console.log('🔍 Bulk upload using URL:', remoteUrl);
    if (!remoteUrl) {
      setTrainingMessage('⚠️ remoteVoiceTrainingUrl not set in localStorage');
      setTimeout(() => setTrainingMessage(''), 3000);
      return;
    }
    setTrainingMessage('⏳ Uploading samples to server...');
    try {
      if (!voiceManager) {
        setTrainingMessage('❌ Voice manager not available. Initialize the analyzer first.');
        setTimeout(() => setTrainingMessage(''), 3000);
        return;
      }
      const samples = await voiceManager.voiceStorage.getVoiceSamples();
      let uploaded = 0;
      for (const s of samples) {
        try {
          await voiceManager.voiceStorage.updateUploadStatus(s.id, 'uploading');
          const form = new FormData();
          form.append('emotion', s.emotion);
          form.append('transcript', s.transcript || '');
          form.append('voiceFeatures', JSON.stringify(s.voiceFeatures || {}));
          if (s.audioBlob) {
            const mime = s.audioBlob.type || '';
            let ext = '.wav';
            if (mime.includes('webm') || mime.includes('opus')) ext = '.webm';
            else if (mime.includes('mpeg') || mime.includes('mp3')) ext = '.mp3';
            else if (mime.includes('ogg')) ext = '.ogg';
            else if (mime.includes('wav')) ext = '.wav';
            form.append('audio', s.audioBlob, `${s.id}${ext}`);
          }
          console.debug('Bulk uploading sample', s.id, remoteUrl);
          const resp = await fetch(remoteUrl, { method: 'POST', body: form });
          if (resp.ok) {
            uploaded++;
            await voiceManager.voiceStorage.updateUploadStatus(s.id, 'uploaded');
          } else {
            let text = '';
            try { text = await resp.text(); } catch(e) {}
            console.warn('Bulk upload failed for', s.id, resp.status, resp.statusText, text);
            await voiceManager.voiceStorage.updateUploadStatus(s.id, 'failed');
          }
        } catch (e) {
          console.warn('upload sample failed', s.id, e);
          try { await voiceManager.voiceStorage.updateUploadStatus(s.id, 'failed'); } catch (_) {}
        }
        setTrainingMessage(`Uploading... ${uploaded}/${samples.length}`);
      }
      setTrainingMessage(`✅ Uploaded ${uploaded}/${samples.length} samples`);
      setTimeout(() => setTrainingMessage(''), 3000);
    } catch (err) {
      console.warn('pushAllToServer error', err);
      setTrainingMessage('❌ Failed to push samples');
      setTimeout(() => setTrainingMessage(''), 3000);
    }
  };

  const retryFailedUploads = async () => {
    const remoteUrl = localStorage.getItem('remoteVoiceTrainingUrl') || 'http://localhost:4000/api/upload';
    if (!remoteUrl) { setTrainingMessage('⚠️ remoteVoiceTrainingUrl not set'); setTimeout(()=>setTrainingMessage(''),2000); return; }
    setTrainingMessage('⏳ Retrying failed uploads...');
    try {
      if (!voiceManager) {
        setTrainingMessage('❌ Voice manager not available. Initialize the analyzer first.');
        setTimeout(() => setTrainingMessage(''), 3000);
        return;
      }
      const failed = await voiceManager.voiceStorage.getSamplesByUploadStatus('failed');
      let retried = 0;
      for (const s of failed) {
        try {
          await voiceManager.voiceStorage.updateUploadStatus(s.id, 'uploading');
          const form = new FormData();
          form.append('emotion', s.emotion);
          form.append('transcript', s.transcript || '');
          form.append('voiceFeatures', JSON.stringify(s.voiceFeatures || {}));
          if (s.audioBlob) form.append('audio', s.audioBlob, `${s.id}.wav`);
          const resp = await fetch(remoteUrl, { method: 'POST', body: form });
          if (resp.ok) { retried++; await voiceManager.voiceStorage.updateUploadStatus(s.id, 'uploaded'); }
          else await voiceManager.voiceStorage.updateUploadStatus(s.id, 'failed');
        } catch (e) { await voiceManager.voiceStorage.updateUploadStatus(s.id, 'failed'); }
      }
      setTrainingMessage(`✅ Retried ${retried}/${failed.length}`);
      setTimeout(()=>setTrainingMessage(''),2000);
    } catch (e) { setTrainingMessage('❌ Retry failed'); setTimeout(()=>setTrainingMessage(''),2000); }
  };

  // Train ML model from collected trainingData
  const trainMlModel = async () => {
    if (!activeAnalyzer) return;
    const data = activeAnalyzer.exportTrainingData().trainingData;
    const flat = Object.values(data).flat();
    if (flat.length < 10) {
      setTrainingMessage('❌ Need at least 10 samples to train a model');
      return;
    }
    setIsTrainingModel(true);
    setTrainingMessage('🧠 Training model (worker)...');
    // build labels map
    const labels = Array.from(new Set(flat.map(s => s.emotion)));
    const labelsMap = {};
    labels.forEach((l, i) => labelsMap[l] = i);

    // Use worker if available
    if (trainerWorker) {
      try {
        trainerWorker.postMessage({ type: 'train', payload: { samples: flat, labelsMap, mfccLen: 13, epochs: 40, batchSize: 8 } });
        // UI will be updated by worker messages
      } catch (e) {
        console.warn('Worker training failed, falling back', e);
        setTrainingMessage('❌ Worker training failed, falling back to main thread');
      }
    } else {
      // fallback to main thread training
      try {
        const dataset = buildDataset(flat, labelsMap, 13);
        const model = await createModel(dataset.xs.shape[1], labels.length);
        await trainModel(model, dataset, 40, 8, (epoch, logs) => {
          setTrainingProgress({ epoch, logs });
        });
        await saveModelLocal(model, 'local-voice-model');
        try { localStorage.setItem('local-voice-model_meta', JSON.stringify({ labelsMap, norm: dataset.norm })); } catch (e) {}
        setMlModel(model);
        setTrainingMessage('✅ Model trained and saved locally');
      } catch (err) {
        console.error('Main thread training failed', err);
        setTrainingMessage('❌ Main thread training failed');
      }
    }
    setIsTrainingModel(false);
  };

  const loadMlModel = async () => {
    if (!activeAnalyzer) return;
    const ok = await activeAnalyzer.loadMlModelAndMeta('local-voice-model');
    if (ok) {
      setMlModel(activeAnalyzer.mlModel);
      setTrainingMessage('✅ Model loaded into analyzer');
    } else {
      setTrainingMessage('❌ No model found or failed to load');
    }
    setTimeout(() => setTrainingMessage(''), 2000);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file || !activeAnalyzer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        activeAnalyzer.importTrainingData(data);
        setTrainingStats(activeAnalyzer.getTrainingStats());
        setTrainingMessage('📤 Training data imported successfully!');
        setTimeout(() => setTrainingMessage(''), 3000);
      } catch (error) {
        setTrainingMessage('❌ Failed to import training data.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllStorage = async () => {
    if (!activeAnalyzer) return;
    
    if (!window.confirm('⚠️ This will permanently delete ALL voice recordings and training data. Continue?')) {
      return;
    }
    
    try {
      setTrainingMessage('🗑️ Clearing all stored data...');
      
      // Clear voice storage
      await activeAnalyzer.clearStoredSamples();
      
      // Clear training data
      activeAnalyzer.trainingManager.clearTrainingData();
      
      // Clear user calibration
      localStorage.removeItem('voiceEmotionUserCalibration');
      
      // Clear session stats
      localStorage.removeItem('voiceEmotionSessionStats');
      
      // Update all stats
      setTrainingStats(activeAnalyzer.getTrainingStats());
      setUserCalibration(activeAnalyzer.getUserCalibration());
      setSessionStats(activeAnalyzer.getSessionStats());
      await updateStorageStats();
      
      setTrainingMessage('✅ All training data and voice recordings cleared!');
      setTimeout(() => setTrainingMessage(''), 3000);
    } catch (error) {
      setTrainingMessage('❌ Failed to clear storage.');
      console.error('Clear storage error:', error);
    }
  };

  const selectedEmotionData = emotions.find(e => e.id === selectedEmotion);
  const totalSamples = Object.values(trainingStats).reduce((sum, stat) => sum + (stat.count || 0), 0);
  const avgAccuracy = Object.values(trainingStats).reduce((sum, stat) => sum + (stat.accuracy || 0), 0) / 10;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Training Overview */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '2rem' }}>
          🎯 AI Training Center
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f0f9ff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>
              {totalSamples}
            </div>
            <div style={{ color: '#6b7280' }}>Total Samples</div>
          </div>
          
          <div style={{
            background: '#f0fdf4',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #22c55e'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
              {Math.round(avgAccuracy)}%
            </div>
            <div style={{ color: '#6b7280' }}>Avg Accuracy</div>
          </div>
          
          <div style={{
            background: '#fef3c7',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤖</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d97706' }}>
              {totalSamples > 50 ? 'Advanced' : totalSamples > 20 ? 'Trained' : 'Learning'}
            </div>
            <div style={{ color: '#6b7280' }}>AI Status</div>
          </div>
        </div>

        {trainingMessage && (
          <div style={{
            background: trainingMessage.includes('❌') ? '#fef2f2' : '#f0fdf4',
            border: trainingMessage.includes('❌') ? '2px solid #ef4444' : '2px solid #22c55e',
            color: trainingMessage.includes('❌') ? '#dc2626' : '#16a34a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            {trainingMessage}
          </div>
        )}
      </div>

      {/* Storage & Calibration Statistics */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          💾 Voice Storage & User Calibration
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#475569' }}>🎤 Voice Storage</h4>
            <div style={{ fontSize: '0.9em', color: '#64748b' }}>
              <div>Total Voice Samples: <strong>{Object.values(storageStats).reduce((sum, stat) => sum + (stat.voiceSamples || 0), 0)}</strong></div>
              <div>Uploaded to Server: <strong style={{ color: '#16a34a' }}>{Object.values(storageStats).reduce((sum, stat) => sum + (stat.uploadedCount || 0), 0)}</strong></div>
              <div>Pending Upload: <strong style={{ color: '#d97706' }}>{Object.values(storageStats).reduce((sum, stat) => sum + (stat.pendingCount || 0), 0)}</strong></div>
              <div>Failed Upload: <strong style={{ color: '#dc2626' }}>{Object.values(storageStats).reduce((sum, stat) => sum + (stat.failedCount || 0), 0)}</strong></div>
              <div>Storage Size: <strong>{Math.round(Object.values(storageStats).reduce((sum, stat) => sum + (stat.totalSize || 0), 0) / 1024)}KB</strong></div>
              <div>Last Recording: <strong>
                {Object.values(storageStats).reduce((latest, stat) => {
                  if (!stat.lastSample) return latest;
                  return !latest || new Date(stat.lastSample) > new Date(latest) ? stat.lastSample : latest;
                }, null)?.split('T')[0] || 'Never'}
              </strong></div>
              <div>Last Upload: <strong>
                {Object.values(storageStats).reduce((latest, stat) => {
                  if (!stat.lastUploaded) return latest;
                  return !latest || new Date(stat.lastUploaded) > new Date(latest) ? stat.lastUploaded : latest;
                }, null)?.split('T')[0] || 'Never'}
              </strong></div>
            </div>
          </div>
          
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#475569' }}>🎚️ Voice Calibration</h4>
            <div style={{ fontSize: '0.9em', color: '#64748b' }}>
              <div>Baseline Pitch: <strong>{Math.round(userCalibration.baselinePitch || 150)}Hz</strong></div>
              <div>Pitch Range: <strong>{Math.round(userCalibration.pitchRange?.min || 80)}-{Math.round(userCalibration.pitchRange?.max || 400)}Hz</strong></div>
              <div>Training Samples: <strong>{userCalibration.samplesCount || 0}</strong></div>
              <div>Last Calibrated: <strong>{userCalibration.lastCalibrated?.split('T')[0] || 'Never'}</strong></div>
            </div>
          </div>
          
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#475569' }}>📈 Session Stats</h4>
            <div style={{ fontSize: '0.9em', color: '#64748b' }}>
              <div>Total Sessions: <strong>{sessionStats.sessionsCount || 0}</strong></div>
              <div>Session Samples: <strong>{sessionStats.totalSamples || 0}</strong></div>
              <div>Average Accuracy: <strong>{sessionStats.averageAccuracy || 0}%</strong></div>
              <div>Last Session: <strong>{sessionStats.lastSession?.split('T')[0] || 'Never'}</strong></div>
            </div>
          </div>
        </div>
        
        <div style={{
          background: '#eff6ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #3b82f6',
          textAlign: 'center'
        }}>
          <div style={{ color: '#1e40af', fontSize: '0.9em' }}>
            💡 <strong>Enhanced Storage:</strong> Your voice samples are now stored persistently using IndexedDB. 
            Voice calibration data helps improve emotion detection accuracy for your unique voice patterns.
          </div>
        </div>
      </div>

      {/* Training Progress Grid */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          📈 Training Progress by Emotion
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {emotions.map(emotion => {
            const stats = trainingStats[emotion.id] || { count: 0, accuracy: 0 };
            const storage = storageStats[emotion.id] || { voiceSamples: 0, totalSize: 0 };
            const progress = Math.min(100, (stats.count / 10) * 100);
            
            return (
              <div key={emotion.id} style={{
                background: stats.count > 0 ? emotion.color : '#f3f4f6',
                color: stats.count > 0 ? 'white' : '#6b7280',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                  {emotion.label.split(' ')[1]}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  {stats.count} samples
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  {stats.accuracy}% accuracy
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.9 }}>
                  📼 {storage.voiceSamples} recordings
                  <br />
                  📤 {storage.uploadedCount || 0} uploaded
                  {storage.pendingCount > 0 && <span style={{ color: '#f59e0b' }}> • {storage.pendingCount} pending</span>}
                  {storage.failedCount > 0 && <span style={{ color: '#dc2626' }}> • {storage.failedCount} failed</span>}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.3)',
                  height: '4px',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'white',
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.5s ease'
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
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          🎤 Train New Emotion Sample
        </h3>

        {/* Emotion Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '1.1rem',
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
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #d1d5db',
              fontSize: '1rem',
              background: 'white'
            }}
          >
            {emotions.map(emotion => (
              <option key={emotion.id} value={emotion.id}>
                {emotion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        {selectedEmotionData && (
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {selectedEmotionData.label.split(' ')[1]}
            </div>
            <div style={{
              fontSize: '1.1rem',
              color: '#0369a1',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Training: {selectedEmotionData.label.split(' ')[0]}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#0369a1'
            }}>
              {selectedEmotionData.instruction}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div style={{
          background: '#f3f4f6',
          border: '2px solid #d1d5db',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>
            🎤 Voice Recording
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            {!activeRecording ? (
              <button
                onClick={startLocalRecording}
                disabled={!activeAnalyzer}
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  background: activeAnalyzer ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#9ca3af',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: activeAnalyzer ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={stopLocalRecording}
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🛑 Stop Recording
              </button>
            )}

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              🎧 Import audio
              <input type="file" accept="audio/*" onChange={handleAudioFileImport} style={{ display: 'inline-block' }} />
            </label>

            {/* Bulk Upload Toggle */}
            <button
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              disabled={bulkProcessing}
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'white',
                background: showBulkUpload ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 'linear-gradient(135deg, #4834d4, #686de0)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {showBulkUpload ? '📁 Single Import' : '🗂️ Bulk Import'}
            </button>
          </div>

          {/* Bulk Upload Section */}
          {showBulkUpload && (
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              border: '2px dashed #6c757d',
              borderRadius: '12px',
              padding: '20px',
              margin: '15px 0',
              textAlign: 'center'
            }}>
              <h4 style={{ 
                color: '#495057', 
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                🚀 Bulk Training Import
              </h4>
              
              <p style={{ 
                color: '#6c757d', 
                marginBottom: '15px',
                fontSize: '13px'
              }}>
                Import multiple audio files for training the <strong>"{selectedEmotion}"</strong> emotion. System handles any number of files with intelligent batching!
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                <button
                  onClick={() => bulkInputRef.current?.click()}
                  disabled={bulkProcessing}
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📂 Select Files
                </button>

                {bulkUploadFiles.length > 0 && (
                  <>
                    <button
                      onClick={processBulkUpload}
                      disabled={bulkProcessing}
                      style={{
                        background: bulkProcessing ? 'linear-gradient(135deg, #6c757d, #adb5bd)' : 'linear-gradient(135deg, #007bff, #0056b3)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        cursor: bulkProcessing ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {bulkProcessing ? '⏳ Processing...' : `🚀 Train ${bulkUploadFiles.length} Files`}
                    </button>

                    <button
                      onClick={clearBulkUpload}
                      disabled={bulkProcessing}
                      style={{
                        background: 'linear-gradient(135deg, #dc3545, #c82333)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🗑️ Clear
                    </button>
                  </>
                )}
              </div>

              <input
                type="file"
                ref={bulkInputRef}
                accept="audio/*"
                multiple
                onChange={handleBulkUpload}
                style={{ display: 'none' }}
              />

              {/* File List */}
              {bulkUploadFiles.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    <span>📋 Selected Files ({bulkUploadFiles.length})</span>
                    <span>Will train as: <strong>{selectedEmotion}</strong></span>
                  </div>
                  {bulkUploadFiles.slice(0, 10).map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderBottom: '1px solid #dee2e6',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: '#495057' }}>🎵 {file.name}</span>
                      <span style={{ color: '#6c757d' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                  {bulkUploadFiles.length > 10 && (
                    <div style={{ textAlign: 'center', padding: '8px', color: '#6c757d', fontSize: '11px' }}>
                      ... and {bulkUploadFiles.length - 10} more files
                    </div>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {bulkProcessing && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h5 style={{ color: '#495057', marginBottom: '8px', fontSize: '14px' }}>
                    ⚡ Training Progress
                  </h5>
                  <div style={{
                    background: '#e9ecef',
                    borderRadius: '8px',
                    height: '16px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      height: '100%',
                      width: `${bulkProgress}%`,
                      transition: 'width 0.3s ease',
                      borderRadius: '8px'
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#495057'
                  }}>
                    <span>📊 {processedCount} / {bulkUploadFiles.length} files</span>
                    <span>🎯 {bulkProgress}% complete</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            Status: {activeRecording ? '🔴 Recording...' : activeTranscript ? '✅ Ready to train' : '⏳ No recording yet'}
          </div>
          
          {activeTranscript && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: '#e5e7eb',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#374151'
            }}>
              Sample: "{activeTranscript.substring(0, 50)}{activeTranscript.length > 50 ? '...' : ''}"
            </div>
          )}
          {audioPreviewUrl && (
            <div style={{ marginTop: 12 }}>
              <audio
                ref={audioPreviewRef}
                controls
                src={audioPreviewUrl}
                style={{ width: '100%' }}
                onTimeUpdate={onAudioTimeUpdate}
                onEnded={() => setIsPlayingTrim(false)}
              />
        <div style={{ marginTop: 10 }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: 100, background: '#eef2ff', borderRadius: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <label>Start: <input type="number" step="0.1" value={trimStart} onChange={e => setTrimStart(Math.max(0, Math.min(parseFloat(e.target.value || 0), audioBufferForPreview?.duration || 0)))} style={{ width: 80 }} /></label>
                  <label>End: <input type="number" step="0.1" value={trimEnd} onChange={e => setTrimEnd(Math.max(0, Math.min(parseFloat(e.target.value || 0), audioBufferForPreview?.duration || 0)))} style={{ width: 80 }} /></label>
                  <button onClick={playTrimmed} style={{ padding: '6px 12px' }}>Play Trimmed</button>
          <button onClick={downloadTrimmed} style={{ padding: '6px 12px' }}>Download Trimmed</button>
                  <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#374151' }}>
                    Preview Emotion: <strong>{activeAnalyzer?.currentAnalysis?.dominantEmotion || 'unknown'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Recording Status */}
        <div style={{
          background: activeRecording ? '#f0fdf4' : '#fef3c7',
          border: activeRecording ? '2px solid #22c55e' : '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: activeRecording ? '#16a34a' : '#d97706',
            marginBottom: '8px'
          }}>
            {activeRecording ? '🎤 Recording Active' : '⏸️ Recording Stopped'}
          </div>
          <div style={{ 
            color: activeRecording ? '#16a34a' : '#d97706',
            fontSize: '1rem'
          }}>
            Current transcript: "{activeTranscript || 'No speech detected'}"
          </div>
        </div>

        {/* Training Action */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleTrainEmotion}
            disabled={isTraining || (!activeTranscript.trim() && !audioPreviewUrl)}
            style={{
              padding: '16px 32px',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              background: isTraining ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '25px',
              cursor: isTraining || !activeTranscript.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              marginBottom: '16px',
              marginRight: '16px'
            }}
          >
            {isTraining ? '🎯 Training...' : `🎯 Train ${selectedEmotionData?.label.split(' ')[0]} Emotion`}
          </button>

          {/* Individual Upload Status Indicator */}
          {remoteUploadStatus && (
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              marginRight: '16px',
              marginBottom: '16px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              background: remoteUploadStatus.includes('✅') ? 'linear-gradient(135deg, #10b981, #059669)' :
                         remoteUploadStatus.includes('failed') || remoteUploadStatus.includes('error') ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                         'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              📤 Server: {remoteUploadStatus}
            </div>
          )}
          <button
            onClick={trainMlModel}
            disabled={isTrainingModel}
            style={{
              marginLeft: 12,
              padding: '16px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: isTrainingModel ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '12px',
              cursor: isTrainingModel ? 'not-allowed' : 'pointer'
            }}
          >
            {isTrainingModel ? '🧠 Training Model...' : '🧠 Train ML Model'}
          </button>
          <button onClick={loadMlModel} style={{ marginLeft: 12, padding: '16px 20px', borderRadius: 12 }}>Load ML Model</button>
          <label style={{ marginLeft: 12, fontSize: '0.95rem' }}>
            <input type="checkbox" checked={activeAnalyzer?.useMlDetection || false} onChange={(e) => { if (activeAnalyzer) { activeAnalyzer.useMlDetection = e.target.checked; setMlModel(activeAnalyzer.mlModel); } }} /> Use ML Detection
          </label>
        </div>

        <div style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          1. Start recording in the Detection tab<br/>
          2. Speak the suggested phrase with the target emotion<br/>
          3. Come back here and click "Train Emotion"<br/>
          4. Repeat for better accuracy
        </div>
      </div>

      {/* Data Management */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          💾 Training Data Management
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <button
            onClick={async () => {
              setTrainingMessage('🔄 Refreshing upload statistics...');
              await updateStorageStats();
              await fetchServerData();
              setTrainingMessage('✅ Upload statistics refreshed!');
              setTimeout(() => setTrainingMessage(''), 2000);
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Upload Stats
          </button>
          
          <button
            onClick={async () => {
              if (!activeAnalyzer) {
                setTrainingMessage('❌ No active analyzer found');
                setTimeout(() => setTrainingMessage(''), 2000);
                return;
              }
              
              try {
                // Debug training data
                console.log('🐛 Debugging Training Data:');
                console.log('Active Analyzer:', activeAnalyzer);
                console.log('Training Manager:', activeAnalyzer.trainingManager);
                
                const stats = activeAnalyzer.getTrainingStats();
                console.log('Training Stats:', stats);
                
                const trainingData = activeAnalyzer.trainingManager?.trainingData || {};
                console.log('Raw Training Data:', trainingData);
                
                // Check voice storage
                const allVoiceSamples = await activeAnalyzer.trainingManager?.voiceStorage?.getVoiceSamples() || [];
                console.log('Voice Samples:', allVoiceSamples.length, allVoiceSamples);
                
                // Check localStorage
                const localData = localStorage.getItem('voiceEmotionTrainingData');
                console.log('LocalStorage Training Data:', localData ? JSON.parse(localData) : 'None');
                
                // Fetch server data
                const serverData = await fetchServerData();
                console.log('Server Data:', serverData);
                
                // Test server connectivity
                const serverConnected = await testServerConnection();
                console.log('Server Connected:', serverConnected);
                
                const message = `Debug Results:
Training Stats: ${Object.keys(stats).length} emotions
Voice Samples: ${allVoiceSamples.length} samples
LocalStorage: ${localData ? 'Found' : 'Empty'}
Server Uploads: ${serverData?.metadata?.length || 0} files
Server Connected: ${serverConnected ? 'Yes' : 'No'}
Check console for details`;
                
                setTrainingMessage(message);
                setTimeout(() => setTrainingMessage(''), 5000);
                
              } catch (error) {
                console.error('Debug error:', error);
                setTrainingMessage('❌ Debug failed: ' + error.message);
                setTimeout(() => setTrainingMessage(''), 3000);
              }
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🐛 Debug Training Data
          </button>

          <button
            onClick={async () => {
              if (!activeAnalyzer) {
                setTrainingMessage('❌ No active analyzer');
                setTimeout(() => setTrainingMessage(''), 2000);
                return;
              }
              
              setTrainingMessage('� Force refreshing all statistics...');
              
              try {
                // Force refresh all statistics
                setTrainingStats(activeAnalyzer.getTrainingStats());
                setUserCalibration(activeAnalyzer.getUserCalibration());
                setSessionStats(activeAnalyzer.getSessionStats());
                await updateStorageStats();
                
                // Force save to localStorage
                const exportData = activeAnalyzer.exportTrainingData();
                localStorage.setItem('voiceEmotionTrainingData', JSON.stringify(exportData));
                
                setTrainingMessage('✅ All statistics force refreshed!');
                setTimeout(() => setTrainingMessage(''), 2000);
                
              } catch (error) {
                console.error('Force refresh error:', error);
                setTrainingMessage('❌ Force refresh failed: ' + error.message);
                setTimeout(() => setTrainingMessage(''), 3000);
              }
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Force Refresh All
          </button>

          <button
            onClick={async () => {
              setTrainingMessage('🔧 Testing server connection...');
              const isConnected = await testServerConnection();
              if (isConnected) {
                setTrainingMessage('✅ Server connection successful!');
              } else {
                setTrainingMessage('❌ Server connection failed - check console');
              }
              setTimeout(() => setTrainingMessage(''), 3000);
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔧 Test Server
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={exportData}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📥 Export Training Data
          </button>
          <button
            onClick={() => {
              // Export aggregated MFCC + features CSV
              if (!activeAnalyzer) return;
              const all = activeAnalyzer.exportTrainingData();
              const rows = [];
              const headers = ['id','emotion','pitch','pitch_median','pitch_mean','volume','spectralCentroid','spectralRolloff','energy','zcr','mfccMeans','mfccVars','transcript','timestamp'];
              rows.push(headers.join(','));
              Object.values(all.trainingData).flat().forEach(s => {
                const f = s.voiceFeatures || {};
                const line = [
                  s.id,
                  s.emotion,
                  f.pitch || '',
                  (f.pitchStats && f.pitchStats.median) || '',
                  (f.pitchStats && f.pitchStats.mean) || '',
                  f.volume || '',
                  f.spectralCentroid || '',
                  f.spectralRolloffMean || '',
                  f.energyMean || '',
                  f.zcrMean || '',
                  '"' + (f.mfccMeans ? f.mfccMeans.join(';') : '') + '"',
                  '"' + (f.mfccVars ? f.mfccVars.join(';') : '') + '"',
                  '"' + (s.transcript ? s.transcript.replace(/"/g,'""') : '') + '"',
                  s.timestamp || ''
                ];
                rows.push(line.join(','));
              });
              const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `voice-features-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              setTrainingMessage('📥 Features CSV exported');
              setTimeout(() => setTrainingMessage(''), 2000);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #14b8a6, #0ea5a2)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📊 Export Features CSV
          </button>
          <button
            onClick={pushAllToServer}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔁 Push All to Server
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <input
              type="text"
              value={remoteUrl}
              onChange={e => setRemoteUrl(e.target.value)}
              placeholder="http://localhost:4000/api/upload"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '320px' }}
            />
            <button
              onClick={() => {
                localStorage.setItem('remoteVoiceTrainingUrl', remoteUrl);
                setRemoteUploadEnabled(Boolean(remoteUrl));
                setRemoteUploadStatus('Saved');
                setTimeout(()=>setRemoteUploadStatus(''),2000);
              }}
              style={{ padding: '10px 14px', borderRadius: '6px', background: '#06b6d4', color: 'white', border: 'none' }}
            >
              💾 Save
            </button>
            <button
              onClick={async () => {
                try {
                  const test = await fetch(remoteUrl, { method: 'OPTIONS' });
                  setRemoteUploadStatus(test.ok ? 'OK' : `Err ${test.status}`);
                } catch (e) { setRemoteUploadStatus('Failed'); }
                setTimeout(()=>setRemoteUploadStatus(''),2000);
              }}
              style={{ padding: '10px 14px', borderRadius: '6px', background: '#8b5cf6', color: 'white', border: 'none' }}
            >
              🔗 Test
            </button>
            <div style={{ minWidth: '80px', color: '#374151', fontWeight: 600 }}>{remoteUploadStatus}</div>
          </div>

          {/* Netlify Deployment Section */}
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
              🌐 Netlify Deployment
              <span style={{ fontSize: '0.8rem', opacity: '0.8', marginLeft: '10px' }}>
                Share your trained model globally
              </span>
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <input
                type="url"
                value={netlifyUrl}
                onChange={(e) => setNetlifyUrl(e.target.value)}
                placeholder="https://your-app.netlify.app"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#333'
                }}
              />
              <button
                onClick={saveNetlifySettings}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                💾 Save URL
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={deployToNetlify}
                disabled={!netlifyUrl}
                style={{
                  padding: '10px 16px',
                  background: netlifyUrl ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: netlifyUrl ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🚀 Deploy Model
              </button>
              
              <button
                onClick={downloadFromNetlify}
                disabled={!netlifyUrl}
                style={{
                  padding: '10px 16px',
                  background: netlifyUrl ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: netlifyUrl ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                📥 Download Model
              </button>

              <button
                onClick={() => {
                  if (netlifyUrl) {
                    window.open(`${netlifyUrl}/.netlify/functions/voice-model`, '_blank');
                  }
                }}
                disabled={!netlifyUrl}
                style={{
                  padding: '10px 16px',
                  background: netlifyUrl ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: netlifyUrl ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🔗 View Public API
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '10px' }}>
              💡 Deploy your trained model to Netlify to share with others instantly!
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <button
              onClick={async () => {
                const failed = await voiceManager.voiceStorage.getSamplesByUploadStatus('failed');
                if (!failed || failed.length === 0) { setTrainingMessage('No failed uploads'); setTimeout(()=>setTrainingMessage(''),2000); return; }
                retryFailedUploads();
              }}
              style={{ padding: '10px 14px', borderRadius: '6px', background: '#f59e0b', color: 'white', border: 'none' }}
            >
              🔁 Retry Failed
            </button>
            <div style={{ color: '#6b7280', fontWeight: 600 }}>
              {/* show failed count */}
            </div>
          </div>
          <label style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            📤 Import Training Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
          
          <button
            onClick={clearAllStorage}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear All Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter;
