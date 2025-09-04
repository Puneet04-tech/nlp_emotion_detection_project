// Test script to verify enhanced emotion detection and confidence
import { analyzeEmotionWithBERT } from './src/utils/bertEmotionApi.js';

async function testEmotionConfidence() {
  console.log('🧪 Testing Enhanced Emotion Detection System\n');
  
  const testCases = [
    { text: "I am so happy and excited about this amazing project!", expected: "joy" },
    { text: "This is really frustrating and making me angry", expected: "anger" },
    { text: "I feel very sad and heartbroken about what happened", expected: "sadness" },
    { text: "I'm extremely worried and scared about the outcome", expected: "fear" },
    { text: "Wow! That was completely unexpected and shocking!", expected: "surprise" },
    { text: "I'm feeling stressed and overwhelmed with all this work", expected: "stress" },
    { text: "I have some concerns about this approach", expected: "concern" },
    { text: "Hello, how are you doing today?", expected: "neutral" },
    { text: "I'm confident this will work perfectly", expected: "confidence" }
  ];

  console.log('Testing emotion detection with confidence scoring...\n');
  
  for (const testCase of testCases) {
    console.log(`📝 Testing: "${testCase.text}"`);
    console.log(`🎯 Expected: ${testCase.expected}`);
    
    try {
      const result = await analyzeEmotionWithBERT(testCase.text);
      const topEmotion = result.array[0];
      const confidence = topEmotion ? topEmotion.score : 0;
      
      console.log(`✅ Detected: ${topEmotion?.label} (${(confidence * 100).toFixed(1)}%)`);
      console.log(`📊 All scores:`, result.map);
      
      // Check if confidence is above 75% (our target for high confidence)
      if (confidence >= 0.75) {
        console.log(`🎉 HIGH CONFIDENCE ACHIEVED: ${(confidence * 100).toFixed(1)}%`);
      } else {
        console.log(`⚠️  Low confidence: ${(confidence * 100).toFixed(1)}% (target: 75%+)`);
      }
      
      console.log('---');
    } catch (error) {
      console.error(`❌ Error testing "${testCase.text}":`, error);
    }
  }
  
  // Test neutral default case
  console.log('\n🧪 Testing neutral cases that should NOT default to 50%...\n');
  
  const neutralTests = [
    "Hello there",
    "Yes, I understand",
    "The weather is normal today",
    "Standard procedure applies"
  ];
  
  for (const text of neutralTests) {
    console.log(`📝 Testing neutral: "${text}"`);
    const result = await analyzeEmotionWithBERT(text);
    const topEmotion = result.array[0];
    const confidence = topEmotion ? topEmotion.score : 0;
    
    console.log(`✅ Result: ${topEmotion?.label} (${(confidence * 100).toFixed(1)}%)`);
    
    if (confidence >= 0.75) {
      console.log(`🎉 ENHANCED CONFIDENCE: ${(confidence * 100).toFixed(1)}% (no longer 50% default)`);
    }
    console.log('---');
  }
}

// Run the test
testEmotionConfidence().catch(console.error);
