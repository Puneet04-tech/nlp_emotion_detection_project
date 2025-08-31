// Robust pitch estimator using autocorrelation (fastYIN-like approximation)
// Returns frequency in Hz or 0 if not found
export function estimatePitchFromAudioBuffer(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate || 44100;
  const channelData = audioBuffer.getChannelData(0);
  // Use a short window from the center to reduce compute
  const N = Math.min(2048, channelData.length);
  const start = Math.max(0, Math.floor((channelData.length - N) / 2));
  const x = channelData.subarray(start, start + N);

  // Autocorrelation
  const ac = new Float32Array(N);
  for (let lag = 0; lag < N; lag++) {
    let sum = 0;
    for (let i = 0; i < N - lag; i++) {
      sum += x[i] * x[i + lag];
    }
    ac[lag] = sum;
  }

  // Find peak in autocorrelation after 30Hz min lag and below ~1000Hz
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

  // Parabolic interpolation for better accuracy
  const y0 = ac[bestLag - 1] || 0;
  const y1 = ac[bestLag] || 0;
  const y2 = ac[bestLag + 1] || 0;
  const denom = (y0 - 2 * y1 + y2);
  let shift = 0;
  if (denom !== 0) shift = 0.5 * (y0 - y2) / denom;
  const trueLag = bestLag + shift;
  const freq = sampleRate / trueLag;

  if (!isFinite(freq) || freq < minFreq || freq > maxFreq) return 0;
  return Math.round(freq);
}
