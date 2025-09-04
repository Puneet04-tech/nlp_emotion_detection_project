// Audio Stream Coordinator
// Manages shared audio access between speech recognition and recording systems
// Prevents conflicts between MediaRecorder and SpeechRecognition APIs

class AudioStreamCoordinator {
  constructor() {
    this.mediaStream = null;
    this.audioContext = null;
    this.isInitialized = false;
    this.activeUsers = new Set();
    this.speechRecognition = null;
    this.mediaRecorder = null;
    this.onTranscriptUpdate = null;
    this.onRecordingData = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('🎤 Initializing shared audio stream...');
      
      // Request microphone access once
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
      this.isInitialized = true;
      
      console.log('✅ Shared audio stream initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize shared audio stream:', error);
      return false;
    }
  }

  // Initialize speech recognition without starting it
  initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      return false;
    }
    
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
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(currentTranscript);
      }
    };
    
    this.speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // Don't restart automatically on error to prevent conflicts
    };
    
    this.speechRecognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.activeUsers.delete('speech');
    };
    
    return true;
  }

  // Initialize media recorder without starting it
  initializeMediaRecorder() {
    if (!this.mediaStream) return false;
    
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.onRecordingData) {
          this.onRecordingData(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        console.log('🎵 Media recording stopped');
        this.activeUsers.delete('recording');
      };
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MediaRecorder:', error);
      return false;
    }
  }

  // Start recording with conflict resolution
  startRecording(onDataCallback) {
    if (!this.isInitialized) {
      console.error('Audio coordinator not initialized');
      return false;
    }

    // Stop speech recognition if it's running to avoid conflicts
    if (this.activeUsers.has('speech')) {
      console.log('🔄 Stopping speech recognition to start recording...');
      this.stopSpeechRecognition();
    }

    if (!this.mediaRecorder) {
      this.initializeMediaRecorder();
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.onRecordingData = onDataCallback;
      this.activeUsers.add('recording');
      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('🎵 Recording started');
      return true;
    }

    return false;
  }

  // Stop recording
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.activeUsers.delete('recording');
      console.log('🎵 Recording stopped');
      return true;
    }
    return false;
  }

  // Start speech recognition with conflict resolution
  startSpeechRecognition(onTranscriptCallback) {
    if (!this.isInitialized) {
      console.error('Audio coordinator not initialized');
      return false;
    }

    // Stop recording if it's running to avoid conflicts
    if (this.activeUsers.has('recording')) {
      console.log('🔄 Stopping recording to start speech recognition...');
      this.stopRecording();
    }

    if (!this.speechRecognition) {
      this.initializeSpeechRecognition();
    }

    if (this.speechRecognition && !this.activeUsers.has('speech')) {
      try {
        this.onTranscriptUpdate = onTranscriptCallback;
        this.activeUsers.add('speech');
        this.speechRecognition.start();
        console.log('🎤 Speech recognition started');
        return true;
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        this.activeUsers.delete('speech');
        return false;
      }
    }

    return false;
  }

  // Stop speech recognition
  stopSpeechRecognition() {
    if (this.speechRecognition && this.activeUsers.has('speech')) {
      this.speechRecognition.stop();
      this.activeUsers.delete('speech');
      console.log('🎤 Speech recognition stopped');
      return true;
    }
    return false;
  }

  // Get the audio context for voice analysis
  getAudioContext() {
    return this.audioContext;
  }

  // Get the media stream for voice analysis
  getMediaStream() {
    return this.mediaStream;
  }

  // Check if a specific service is active
  isActive(service) {
    return this.activeUsers.has(service);
  }

  // Get list of active services
  getActiveServices() {
    return Array.from(this.activeUsers);
  }

  // Stop all services and cleanup
  cleanup() {
    this.stopRecording();
    this.stopSpeechRecognition();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.activeUsers.clear();
    this.isInitialized = false;
    console.log('🧹 Audio coordinator cleaned up');
  }
}

export default AudioStreamCoordinator;
