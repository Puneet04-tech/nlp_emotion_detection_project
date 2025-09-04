// Test script to verify emotion detection in browser context
console.log('🧪 Testing Browser Emotion Detection');

// Test the Novel BERT system with various emotions
const testTexts = [
  "I am so happy and excited about this project!",
  "This is really making me angry and frustrated", 
  "I feel very sad and disappointed about what happened",
  "I'm scared and worried about the results",
  "Wow! That's absolutely amazing and surprising!",
  "Hello, how are you doing today?"
];

// Function to test emotion detection
async function testEmotions() {
  for (const text of testTexts) {
    console.log(`\n📝 Testing: "${text}"`);
    
    try {
      // Import the BERT emotion analyzer
      const { analyzeEmotionWithBERT } = await import('./src/utils/bertEmotionApi.js');
      const result = await analyzeEmotionWithBERT(text);
      
      const topEmotion = result.array[0];
      console.log(`✅ Detected: ${topEmotion?.label} (${(topEmotion?.score * 100).toFixed(1)}%)`);
      
      // Check if we're getting proper emotions instead of just neutral
      if (topEmotion?.label !== 'neutral' && topEmotion?.score > 0.75) {
        console.log(`🎉 SUCCESS: Proper emotion detected with high confidence!`);
      } else if (topEmotion?.label === 'neutral') {
        console.log(`⚠️  Still detecting as neutral - needs investigation`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${text}":`, error);
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testEmotions };
} else {
  // Run directly if in browser
  testEmotions();
}
