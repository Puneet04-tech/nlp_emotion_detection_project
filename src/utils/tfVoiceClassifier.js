// Small MLP classifier for voice features (mfccMeans, pitch, volume, spectralCentroid)
// Data format: features: { pitch, volume, spectralCentroid, mfccMeans: [], mfccVars: [] }

export async function createModel(inputDim, numClasses) {
  const tf = await import('@tensorflow/tfjs');
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 64, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.3 }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
  model.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
  return model;
}

export async function featuresToTensorRow(features, mfccLen = 13) {
  const tf = await import('@tensorflow/tfjs');
  const row = [];
  row.push(features.pitch || 0);
  row.push(features.volume || 0);
  row.push(features.spectralCentroid || 0);
  const means = features.mfccMeans || [];
  for (let i = 0; i < mfccLen; i++) row.push(means[i] || 0);
  return tf.tensor2d([row]);
}

export function buildDataset(samples, labelsMap, mfccLen = 13) {
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

  // Compute per-column normalization (mean/std)
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
    for (let i = 0; i < N; i++) {
      const d = (xs[i][j] || 0) - means[j];
      ssum += d * d;
    }
    stds[j] = Math.sqrt(ssum / Math.max(1, N));
    if (stds[j] === 0) stds[j] = 1;
  }

  // Normalize xs in JS arrays before creating tensors
  const xsNorm = xs.map(row => row.map((v, j) => ((v || 0) - means[j]) / stds[j]));

  return { xs: xsNorm, ys: ys, norm: { means, stds } };
}

export async function trainModel(model, dataset, epochs = 30, batchSize = 16, onEpoch) {
  // dataset.xs and .ys may be raw arrays (if buildDataset returned arrays) or tensors
  const tf = await import('@tensorflow/tfjs');
  let xsTensor, ysTensor;
  if (Array.isArray(dataset.xs)) xsTensor = tf.tensor2d(dataset.xs);
  else xsTensor = dataset.xs;
  if (Array.isArray(dataset.ys)) ysTensor = tf.tensor2d(dataset.ys);
  else ysTensor = dataset.ys;
  const res = await model.fit(xsTensor, ysTensor, { epochs, batchSize, shuffle: true, callbacks: onEpoch ? { onEpochEnd: onEpoch } : undefined });
  try { xsTensor.dispose && xsTensor.dispose(); ysTensor.dispose && ysTensor.dispose(); } catch (e) {}
  return res;
}

export async function saveModelLocal(model, name = 'local-voice-model') {
  const tf = await import('@tensorflow/tfjs');
  await model.save(`localstorage://${name}`);
}

export async function loadModelLocal(name = 'local-voice-model') {
  try {
    const tf = await import('@tensorflow/tfjs');
    const model = await tf.loadLayersModel(`localstorage://${name}`);
    return model;
  } catch (e) {
    return null;
  }
}

export async function predict(model, featureRowTensor) {
  const out = model.predict(featureRowTensor);
  const arr = out.arraySync ? out.arraySync() : await out.data();
  return arr;
}
