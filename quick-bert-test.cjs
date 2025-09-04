// Quick Novel BERT Fix Verification
const fs = require('fs');

// Test the lexical fallback directly
function lexicalFallback(text) {
  const t = (text || '').toLowerCase();
  const scores = {};
  const inc = (k, v=1) => scores[k] = Math.min(1, (scores[k]||0) + v);

  // Enhanced emotion patterns
  const patterns = {
    joy: /(happy|joy|excited|amazing|wonderful|love|great|awesome|yay|hooray|fantastic|brilliant|excellent|perfect|thrilled|delighted|cheerful|pleased|glad|elated|celebrate|celebration)/g,
    sadness: /(sad|depressed|unhappy|miserable|sobbing|tears|down|heartbroken|lonely|devastated|disappointed|hurt|crying|gloomy|hopeless|broken|grief|sorrow)/g,
    anger: /(angry|mad|furious|hate|stupid|idiot|damn|fuck|shit|pissed|rage|irritated|annoyed|frustrated|outrageous|unacceptable|terrible|awful|furious|livid)/g,
    fear: /(scared|afraid|terrified|panic|anxious|worried|creepy|nervous|frightened|alarmed|dread|intimidated|fearful|petrified)/g,
    surprise: /(surprised|shocked|wow|oh my|unbelievable|whoa|amazed|astonished|stunned|incredible|unexpected|startling)/g,
    neutral: /(^okay$|^fine$|^normal$|^alright$|^hello$|^yes$|^no$)/g
  };

  let totalMatches = 0;
  let hasSpecificEmotion = false;
  
  Object.entries(patterns).forEach(([k, rx]) => {
    const m = t.match(rx) || [];
    if (m.length) {
      const baseScore = Math.min(0.90, 0.4 + (0.2 * m.length));
      inc(k, baseScore);
      totalMatches += m.length;
      
      if (k !== 'neutral') {
        hasSpecificEmotion = true;
      }
    }
  });

  // Only add neutral if NO specific emotions were detected
  if (!hasSpecificEmotion && totalMatches === 0 && text.trim().length > 0) {
    scores.neutral = 0.70;
  }

  // Remove neutral if specific emotions were found
  if (hasSpecificEmotion && scores.neutral) {
    delete scores.neutral;
  }

  // Boost non-neutral emotions
  if (hasSpecificEmotion) {
    Object.keys(scores).forEach(k => {
      if (k !== 'neutral') {
        scores[k] = Math.min(0.95, scores[k] * 1.2);
      }
    });
  }

  const arr = Object.entries(scores).map(([label, score]) => ({ label, score }));
  arr.sort((a,b) => b.score - a.score);
  
  return { map: scores, array: arr, hasSpecificEmotion, totalMatches };
}

console.log('🧪 Quick Novel BERT Fix Verification\n');

const tests = [
  "I am so happy and excited about this amazing project!",
  "This is making me really angry and frustrated!",
  "I feel very sad and disappointed",
  "I'm scared and worried about this",
  "Wow! That's absolutely incredible!",
  "Hello there"
];

tests.forEach(text => {
  console.log(`📝 Testing: "${text}"`);
  const result = lexicalFallback(text);
  const top = result.array[0];
  
  console.log(`✅ Result: ${top?.label} (${(top?.score * 100).toFixed(1)}%)`);
  console.log(`📊 Has specific emotion: ${result.hasSpecificEmotion}`);
  console.log(`📊 Total matches: ${result.totalMatches}`);
  
  if (result.hasSpecificEmotion && top?.label !== 'neutral') {
    console.log('🎉 SUCCESS: Non-neutral emotion detected!');
  } else if (top?.label === 'neutral') {
    console.log('❌ ISSUE: Still detecting neutral');
  }
  
  console.log('---');
});

console.log('\n🏁 Verification complete!');
console.log('✅ If emotions show as non-neutral with high confidence, the fix is working!');
