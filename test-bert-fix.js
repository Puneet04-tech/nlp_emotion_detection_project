// BERT Model Fix Verification Test
const testNovelBERT = async () => {
  console.log('🧪 Testing Novel BERT Enhancement System...');
  
  try {
    // Import the system
    const { default: NovelBERTClass } = await import('./src/utils/novelBERTEnhancementSystem.js');
    
    if (!NovelBERTClass) {
      throw new Error('NovelBERTEnhancementSystem not found');
    }
    
    console.log('📦 Creating Novel BERT instance...');
    const novelBERT = new NovelBERTClass();
    
    console.log('🔧 Initializing BERT models...');
    await novelBERT.init();
    
    // Check model status
    const status = novelBERT.getModelStatus();
    console.log('📊 BERT Model Status:', status);
    
    if (status.bertLoaded && !status.fallbackMode) {
      console.log('✅ BERT models loaded successfully!');
      console.log('🚀 Loading strategy:', status.loadingStrategy);
    } else {
      console.log('⚠️ BERT models using fallback mode');
      console.log('🔄 Loading strategy:', status.loadingStrategy);
    }
    
    // Test analysis
    console.log('🔍 Testing emotion analysis...');
    const testText = "I am feeling really stressed about this important deadline and need help managing my anxiety";
    const context = { domain: 'business', urgency: true };
    
    const result = await novelBERT.analyzeForRealWorldProblems(testText, context);
    
    console.log('🎯 Analysis Result:');
    console.log('  📊 Emotions:', result.emotions);
    console.log('  💡 Recommendations:', result.recommendations);
    console.log('  🤖 BERT Enhanced:', result.bertEnhanced);
    console.log('  📈 Analysis Method:', result.analysisMethod);
    console.log('  🔧 Model Info:', result.modelInfo);
    
    if (result.bertEnhanced) {
      console.log('🎉 SUCCESS: Novel BERT is using real BERT models!');
      console.log('🚀 BERT model fix is working correctly');
    } else {
      console.log('⚠️ NOTICE: Novel BERT is using fallback analysis');
      console.log('🔄 This is expected if BERT models failed to load');
    }
    
    return {
      success: true,
      status,
      result,
      bertWorking: result.bertEnhanced
    };
    
  } catch (error) {
    console.error('❌ Novel BERT test failed:', error);
    return {
      success: false,
      error: error.message,
      bertWorking: false
    };
  }
};

// Run the test
window.testNovelBERT = testNovelBERT;

// Also auto-run test
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🧪 Auto-running Novel BERT test...');
    testNovelBERT().then(result => {
      console.log('🏁 Test completed:', result);
    }).catch(error => {
      console.error('🚨 Test error:', error);
    });
  }, 2000);
}

console.log('🧪 Novel BERT test script loaded. Run testNovelBERT() in console to test manually.');
