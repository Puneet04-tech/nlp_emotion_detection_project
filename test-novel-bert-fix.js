// Novel BERT Emotion Detection Test
// Testing if the fixes resolved the neutral-only detection issue

async function testNovelBERTEmotionDetection() {
  console.log('🧪 Testing Novel BERT Emotion Detection System');
  console.log('=====================================\n');

  try {
    // Import the Novel BERT system
    const { default: NovelBERTEnhancementSystem } = await import('./src/utils/novelBERTEnhancementSystem.js');
    
    if (!NovelBERTEnhancementSystem) {
      throw new Error('Failed to import Novel BERT system');
    }

    // Create instance and initialize
    console.log('🔧 Initializing Novel BERT system...');
    const novelBERT = new NovelBERTEnhancementSystem();
    await novelBERT.init();
    
    // Test cases that should NOT return neutral
    const testCases = [
      {
        text: "I am so happy and excited about this amazing project!",
        expected: "joy/happiness",
        description: "Strong positive emotion"
      },
      {
        text: "This is making me really angry and frustrated!",
        expected: "anger",
        description: "Clear anger expression"
      },
      {
        text: "I feel very sad and disappointed about what happened",
        expected: "sadness",
        description: "Sadness and disappointment"
      },
      {
        text: "I'm scared and worried about the results",
        expected: "fear/anxiety",
        description: "Fear and worry"
      },
      {
        text: "Wow! That's absolutely incredible and surprising!",
        expected: "surprise/joy",
        description: "Surprise and amazement"
      }
    ];

    console.log('🔍 Running emotion detection tests...\n');
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`Test ${i + 1}: ${testCase.description}`);
      console.log(`Text: "${testCase.text}"`);
      console.log(`Expected: ${testCase.expected}`);
      
      try {
        // Test the main analysis method
        const result = await novelBERT.analyzeForRealWorldProblems(testCase.text, {
          domain: 'general',
          urgency: false
        });
        
        console.log('📊 Raw Result:', result);
        
        if (result && result.emotions) {
          console.log('✅ Emotions found:', Object.keys(result.emotions));
          
          // Find the top emotion
          const emotions = result.emotions;
          const topEmotion = Object.entries(emotions)
            .sort(([,a], [,b]) => b - a)[0];
          
          if (topEmotion) {
            const [emotion, confidence] = topEmotion;
            console.log(`🎯 Top Emotion: ${emotion} (${(confidence * 100).toFixed(1)}%)`);
            
            // Check if it's detecting something other than neutral
            if (emotion !== 'neutral' && emotion !== 'emotion_neutral' && confidence > 0.6) {
              console.log('🎉 SUCCESS: Non-neutral emotion detected with good confidence!');
            } else if (emotion === 'neutral' || emotion === 'emotion_neutral') {
              console.log('❌ ISSUE: Still detecting as neutral');
            } else {
              console.log('⚠️  LOW CONFIDENCE: Emotion detected but confidence too low');
            }
          } else {
            console.log('❌ ISSUE: No emotions in result');
          }
        } else {
          console.log('❌ ISSUE: No emotions found in result');
        }
        
      } catch (error) {
        console.error(`❌ Error testing "${testCase.text}":`, error);
      }
      
      console.log('---\n');
    }
    
    console.log('🏁 Novel BERT emotion detection test completed!');
    
  } catch (error) {
    console.error('❌ Failed to test Novel BERT system:', error);
  }
}

// Test the enhanced BERT API directly as well
async function testBERTAPIDirectly() {
  console.log('\n🧪 Testing BERT API directly...');
  
  try {
    const { analyzeEmotionWithBERT } = await import('./src/utils/bertEmotionApi.js');
    
    const testText = "I am so happy and excited about this amazing project!";
    console.log(`Testing: "${testText}"`);
    
    const result = await analyzeEmotionWithBERT(testText);
    console.log('📊 BERT API Result:', result);
    
    if (result && result.array && result.array.length > 0) {
      const topEmotion = result.array[0];
      console.log(`🎯 Top Emotion: ${topEmotion.label} (${(topEmotion.score * 100).toFixed(1)}%)`);
      
      if (topEmotion.label !== 'neutral' && topEmotion.score > 0.75) {
        console.log('🎉 BERT API SUCCESS: Non-neutral emotion with high confidence!');
      } else {
        console.log('❌ BERT API ISSUE: Still neutral or low confidence');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing BERT API directly:', error);
  }
}

// Run both tests
testNovelBERTEmotionDetection();
testBERTAPIDirectly();
