self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg && msg.type === 'train') {
      const { samples, labelsMap, mfccLen = 13, epochs = 30, batchSize = 16 } = msg.payload || {};
      // dynamically import helper to avoid bundling TF into main
      const api = await import('../utils/tfVoiceClassifier');
      const { createModel, buildDataset, trainModel } = api;

      // build dataset (includes normalization)
      const dataset = buildDataset(samples, labelsMap, mfccLen);
      const inputDim = Array.isArray(dataset.xs) && dataset.xs[0] ? dataset.xs[0].length : (dataset.xs.shape ? dataset.xs.shape[1] : 0);
      const numClasses = Object.keys(labelsMap).length;

      // create model
      const model = await createModel(inputDim, numClasses);

      // train with epoch callback
      await trainModel(model, dataset, epochs, batchSize, (epoch, logs) => {
        try { self.postMessage({ type: 'progress', epoch, logs }); } catch (e) {}
      });

      // serialize weights: get data buffers + shapes
      const weights = model.getWeights();
      const serialized = [];
      for (let i = 0; i < weights.length; i++) {
        const w = weights[i];
        const vals = await w.data();
        serialized.push({ buffer: vals.buffer, shape: w.shape, dtype: w.dtype });
      }

      // clean up tensors
      try { /* dataset tensors disposed in trainModel */ } catch (e) {}
      try { weights.forEach(w => w.dispose && w.dispose()); } catch (e) {}

      // post back trained weights and metadata; transfer weight buffers
      const transfer = serialized.map(s => s.buffer);
      self.postMessage({ type: 'trained', payload: { inputDim, numClasses, weights: serialized, norm: dataset.norm, labelsMap } }, transfer);
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: String(err) });
  }
};
