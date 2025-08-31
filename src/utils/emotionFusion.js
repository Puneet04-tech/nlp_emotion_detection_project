// Multi-modal emotion fusion utility
// Combines BERT, pitch, energy, speech rate, and spectral features

export function fuseEmotionScores({ bertScores = {}, voiceScores = {}, spectralScores = {}, textScores = {} }) {
  // Weighted fusion (customize weights as needed)
  const weights = {
    bert: 0.45,
    voice: 0.25,
    spectral: 0.15,
    text: 0.15
  };
  const allLabels = Array.from(new Set([
    ...Object.keys(bertScores),
    ...Object.keys(voiceScores),
    ...Object.keys(spectralScores),
    ...Object.keys(textScores)
  ]));
  const fused = {};
  allLabels.forEach(label => {
    fused[label] = (weights.bert * (bertScores[label] || 0)) +
                   (weights.voice * (voiceScores[label] || 0)) +
                   (weights.spectral * (spectralScores[label] || 0)) +
                   (weights.text * (textScores[label] || 0));
  });

  // Safety rule: if voice strongly indicates anger but text and spectral do not, lower anger
  const voiceAnger = (voiceScores.anger || 0) > 0.7;
  const textAnger = (textScores.anger || 0) > 0.4;
  const spectralAnger = (spectralScores.spectralCentroid || 0) > 0.6;
  if (voiceAnger && !textAnger && !spectralAnger) {
    fused.anger = Math.min(fused.anger * 0.35, 0.4); // down-weight false-positive anger
  }

  // Normalize fused values to 0..1 range (simple clamp)
  Object.keys(fused).forEach(k => {
    fused[k] = Math.max(0, Math.min(1, fused[k]));
  });

  return fused;
}
