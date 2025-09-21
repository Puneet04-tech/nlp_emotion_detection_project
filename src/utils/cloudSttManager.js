// Cloud STT Manager - template supporting multiple providers
// This file provides a simple interface: initialize(config), transcribeAudio(blob)
// Supported providers (templates): Deepgram, Whisper API (OpenAI-style), Google
// To enable a provider, set the appropriate config and provide API keys via
// environment variables or a secure config store.

const DEFAULT_CONFIG = {
  provider: 'none', // 'deepgram' | 'whisper' | 'google' | 'none'
  apiKey: null,
  url: null, // optional custom endpoint
  timeoutMs: 120000
};

export class CloudSttManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.initialized = false;
  }

  initialize(config = {}) {
    this.config = { ...this.config, ...config };
    // Basic validation
    if (!this.config.provider || this.config.provider === 'none') {
      this.initialized = true;
      return Promise.resolve({ success: true, message: 'Cloud STT disabled' });
    }

    if (!this.config.apiKey) {
      return Promise.reject(new Error('Cloud STT provider selected but no apiKey provided'));
    }

    this.initialized = true;
    return Promise.resolve({ success: true, message: `Cloud STT initialized for ${this.config.provider}` });
  }

  // transcribeAudio accepts a Blob or ArrayBuffer and returns { success, text }
  async transcribeAudio(audioBlob, onProgress = null) {
    if (!this.initialized) {
      throw new Error('CloudSttManager not initialized');
    }

    if (!this.config.provider || this.config.provider === 'none') {
      return { success: false, error: 'Cloud STT disabled' };
    }

    // Convert Blob to base64 or ArrayBuffer depending on provider requirement
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Example: Deepgram REST API
    if (this.config.provider === 'deepgram') {
      const url = this.config.url || 'https://api.deepgram.com/v1/listen?punctuate=true';
      if (onProgress) onProgress('🔒 Sending audio to Deepgram...');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'Authorization': `Token ${this.config.apiKey}`
        },
        body: arrayBuffer
      });
      if (!res.ok) {
        const t = await res.text();
        return { success: false, error: `Deepgram error: ${res.status} ${t}` };
      }
      const json = await res.json();
      const transcript = json?.results?.channels?.[0]?.alternatives?.[0]?.transcript || json?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      return { success: true, text: transcript, provider: 'deepgram', raw: json };
    }

    // Example: Whisper-compatible generic API (OpenAI-like)
    if (this.config.provider === 'whisper') {
      const url = this.config.url || 'https://api.openai.com/v1/audio/transcriptions';
      if (onProgress) onProgress('🔒 Sending audio to Whisper API...');
      const form = new FormData();
      // try to create a File from buffer
      const file = new File([audioBlob], 'upload.wav', { type: 'audio/wav' });
      form.append('file', file);
      form.append('model', this.config.model || 'whisper-1');

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: form
      });
      if (!res.ok) {
        const t = await res.text();
        return { success: false, error: `Whisper API error: ${res.status} ${t}` };
      }
      const json = await res.json();
      const transcript = json?.text || '';
      return { success: true, text: transcript, provider: 'whisper', raw: json };
    }

    // Google Speech-to-Text (REST): requires base64-encoded audio and a JSON payload
    if (this.config.provider === 'google') {
      if (onProgress) onProgress('🔒 Sending audio to Google Speech-to-Text...');
      // Note: user must configure endpoint and credentials; this is a template
      const base64 = arrayBufferToBase64(arrayBuffer);
      const payload = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: this.config.sampleRate || 16000,
          languageCode: this.config.language || 'en-US'
        },
        audio: { content: base64 }
      };
      const url = this.config.url || `https://speech.googleapis.com/v1/speech:recognize?key=${this.config.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.text();
        return { success: false, error: `Google STT error: ${res.status} ${t}` };
      }
      const json = await res.json();
      const transcript = (json?.results && json.results.map(r => r.alternatives[0].transcript).join(' ')) || '';
      return { success: true, text: transcript, provider: 'google', raw: json };
    }

    return { success: false, error: 'Unsupported provider' };
  }
}

// Helpers
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const cloudSttManager = new CloudSttManager();

export default CloudSttManager;
