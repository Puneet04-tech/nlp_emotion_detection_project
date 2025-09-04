// Simple Vosk Test
export const testVoskAvailability = async () => {
  try {
    console.log('Testing Vosk availability...');
    
    // Test 1: Can we import vosk-browser?
    const voskModule = await import('vosk-browser');
    console.log('✅ vosk-browser imported successfully');
    console.log('Available functions:', Object.keys(voskModule));
    
    // Test 2: Check if createModel function exists
    if (typeof voskModule.createModel === 'function') {
      console.log('✅ createModel function available');
    } else {
      console.log('❌ createModel function not found');
    }
    
    return {
      success: true,
      module: voskModule,
      message: 'Vosk library loaded successfully'
    };
  } catch (error) {
    console.error('❌ Vosk test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Vosk library not available'
    };
  }
};

// Test model loading
export const testModelLoading = async () => {
  try {
    const voskTest = await testVoskAvailability();
    if (!voskTest.success) {
      throw new Error(voskTest.message);
    }
    
    console.log('Testing model loading...');
    const modelUrl = `${window.location.origin}/models/vosk-model-small-en-us-0.15`;
    console.log('Model URL:', modelUrl);
    
    // Test if the model URL is accessible first
    try {
      const response = await fetch(`${modelUrl}/README`);
      if (response.ok) {
        console.log('✅ Model directory is accessible');
      } else {
        console.warn('⚠️ Model directory might not be accessible:', response.status);
      }
    } catch (fetchError) {
      console.warn('⚠️ Could not test model directory accessibility:', fetchError.message);
    }
    
    // Try to load the model with longer timeout (60 seconds)
    console.log('⏳ Loading model (this may take up to 60 seconds)...');
    const loadPromise = voskTest.module.createModel(modelUrl);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Model loading timeout (60s)')), 60000);
    });
    
    const model = await Promise.race([loadPromise, timeoutPromise]);
    console.log('✅ Model loaded successfully');
    
    return {
      success: true,
      model,
      message: 'Model loaded successfully'
    };
  } catch (error) {
    console.error('❌ Model loading failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Model loading failed'
    };
  }
};

// Test model files accessibility
export const testModelFiles = async () => {
  try {
    const modelPath = '/models/vosk-model-small-en-us-0.15';
    const baseUrl = `${window.location.origin}${modelPath}`;
    
    console.log('Testing model files accessibility...');
    
    // Test key model files
    const filesToTest = [
      'README',
      'am/final.mdl',
      'conf/model.conf',
      'graph/HCLG.fst'
    ];
    
    const results = {};
    
    for (const file of filesToTest) {
      try {
        const response = await fetch(`${baseUrl}/${file}`);
        results[file] = {
          accessible: response.ok,
          status: response.status,
          size: response.headers.get('content-length')
        };
        console.log(`${response.ok ? '✅' : '❌'} ${file}: ${response.status} (${results[file].size} bytes)`);
      } catch (error) {
        results[file] = {
          accessible: false,
          error: error.message
        };
        console.log(`❌ ${file}: ${error.message}`);
      }
    }
    
    return {
      success: true,
      results,
      message: 'Model files accessibility test completed'
    };
  } catch (error) {
    console.error('❌ Model files test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Model files test failed'
    };
  }
};
