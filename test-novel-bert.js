// Test the Novel BERT emotion detection system
import NovelBERTEnhancementSystem from './src/utils/novelBERTEnhancementSystem.js';

async function testNovelBERT() {
  console.log('🧪 Testing Novel BERT Emotion Detection\n');
  
  const novelBERT = new NovelBERTEnhancementSystem();
  
  try {
    console.log('🔧 Initializing Novel BERT...');
    await novelBERT.init();
    
    const testTexts = [
      "I am so happy and excited about this amazing project!",
      "This is making me really angry and frustrated", 
      "I feel very sad and disappointed about what happened",
      "I'm scared and worried about the results",
      "Wow! That's absolutely amazing and surprising!",
      "Hello, how are you doing today?"
    ];
    
    for (const text of testTexts) {
      console.log(`\n📝 Testing: "${text}"`);
      console.log('---');
      
      const result = await novelBERT.analyzeForRealWorldProblems(text, { domain: 'business' });
      
      console.log('✅ Result:', {
        topEmotions: Object.entries(result.emotions || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([emotion, score]) => `${emotion}: ${(score * 100).toFixed(1)}%`),
        confidence: result.confidence,
        bertEnhanced: result.bertEnhanced
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-novel-bert')) {
  testNovelBERT();
}

export { testNovelBERT };
