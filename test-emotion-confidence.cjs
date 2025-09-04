// Test script to verify enhanced emotion detection and confidence
const fs = require('fs');
const path = require('path');

// Load the emotion API code by evaluating it
const bertApiPath = path.join(__dirname, 'src', 'utils', 'bertEmotionApi.js');
const bertApiCode = fs.readFileSync(bertApiPath, 'utf8');

// Create a mock module environment
const mockGlobal = {
  console,
  localStorage: {
    getItem: () => null
  },
  fetch: async () => ({ ok: false })
};

// Evaluate the BERT API code in our context
let analyzeEmotionWithBERT;
try {
  // Extract just the lexical fallback function for testing
  const lexicalFallbackMatch = bertApiCode.match(/function lexicalFallback\(text\) \{[\s\S]*?\n\}/);
  if (lexicalFallbackMatch) {
    eval(lexicalFallbackMatch[0]);
    console.log('✅ Successfully loaded lexical fallback function');
  }
} catch (error) {
  console.error('❌ Error loading BERT API:', error);
}

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
      const result = lexicalFallback(testCase.text);
      const topEmotion = result.array[0];
      const confidence = topEmotion ? topEmotion.score : 0;
      
      console.log(`✅ Detected: ${topEmotion?.label} (${(confidence * 100).toFixed(1)}%)`);
      console.log(`📊 All scores:`, Object.entries(result.map).map(([k,v]) => `${k}: ${(v*100).toFixed(1)}%`).join(', '));
      
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
    const result = lexicalFallback(text);
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
