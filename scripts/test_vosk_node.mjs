(async () => {
  try {
    console.log('🔍 Attempting to import vosk-browser in Node...');
    const vosk = await import('vosk-browser');
    console.log('✅ Imported vosk-browser:', typeof vosk);

    // Try to inspect available exports
    console.log('Available exports:', Object.keys(vosk).slice(0, 40));

    const modelPath = './public/models/vosk-model-small-en-us-0.15';
    console.log('📁 Attempting to create/load model at', modelPath);

    if (vosk.createModel) {
      try {
        const model = await vosk.createModel(modelPath);
        console.log('✅ vosk.createModel succeeded, model:', model && typeof model);
      } catch (e) {
        console.error('❌ vosk.createModel failed:', e && e.message ? e.message : e);
      }
    } else if (vosk.Model) {
      try {
        const model = new vosk.Model(modelPath);
        console.log('✅ vosk.Model constructor succeeded, model:', model && typeof model);
      } catch (e) {
        console.error('❌ vosk.Model constructor failed:', e && e.message ? e.message : e);
      }
    } else {
      console.warn('⚠️ No model creation API found on vosk export; unable to test model load in Node.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed or unexpected error:', error && error.message ? error.message : error);
    process.exit(2);
  }
})();
