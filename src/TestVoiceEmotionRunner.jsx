import React, { useState, useEffect } from 'react';
import VoiceEmotionSystem from './components/VoiceEmotionSystem-simple';

// Test runner: mounts the simple voice emotion system and simulates an audio upload
export default function TestVoiceEmotionRunner() {
  const [testStatus, setTestStatus] = useState('idle');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    // create a tiny 1-second mono WAV buffer at 16kHz with a sine tone
    const sampleRate = 16000;
    const durationSec = 1;
    const samples = sampleRate * durationSec;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * t) * 0.3;
      view.setInt16(44 + i * 2, sample * 0x7fff, true);
    }

    const testFile = new File([buffer], 'test-tone.wav', { type: 'audio/wav' });

    // Start test after a short delay to allow component mount
    setTestStatus('running');
    console.log('TestVoiceEmotionRunner: dispatching simulated file to VoiceEmotionSystem');

    // We'll use a small helper function to dispatch by creating a hidden input and triggering change
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files[0];
      console.log('Test runner input onchange, file:', file);
      // Nothing else here; VoiceEmotionSystem listens to file input inside its UI when user clicks Upload
    };

    document.body.appendChild(input);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(testFile);
    input.files = dataTransfer.files;

    // Find the upload file input inside the VoiceEmotionSystem wrapper (best effort)
    setTimeout(() => {
      const uploadInputs = document.querySelectorAll('input[type=file]');
      if (uploadInputs && uploadInputs.length > 0) {
        // Use the last file input
        const targetInput = uploadInputs[uploadInputs.length - 1];
        const evt = new Event('change', { bubbles: true });
        // set files via DataTransfer
        try {
          const dt = new DataTransfer();
          dt.items.add(testFile);
          Object.defineProperty(targetInput, 'files', {
            value: dt.files,
            writable: false
          });
          targetInput.dispatchEvent(evt);
          console.log('TestVoiceEmotionRunner: dispatched change to upload input');
        } catch (e) {
          console.warn('Could not programmatically set files on input:', e);
        }
      } else {
        console.warn('No file inputs found to dispatch to.');
      }
      document.body.removeChild(input);
    }, 500);

    // Cleanup on unmount
    return () => {};
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>Test: Voice Emotion System Runner</h2>
      <p>Status: {testStatus}</p>
      {lastResult && (
        <div>
          <h3>Last Result</h3>
          <pre>{JSON.stringify(lastResult, null, 2)}</pre>
        </div>
      )}

      <VoiceEmotionSystem
        onEmotionDetected={(data) => {
          console.log('Test runner received emotion data:', data);
          setLastResult(data);
          setTestStatus('complete');
        }}
        isVisible={true}
      />
    </div>
  );
}
