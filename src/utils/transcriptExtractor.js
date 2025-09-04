// Transcript Extraction Utility
// Extracts clean transcript text from Vosk processing results

export function extractTranscriptFromVoskResult(voskResult) {
  if (!voskResult || typeof voskResult !== 'string') {
    return null;
  }

  console.log('📋 Raw Vosk result:', voskResult.substring(0, 200) + '...');

  // Method 1: Look for explicit speech content marker
  const speechContentMatch = voskResult.match(/📝 Speech Content:\s*(.+?)(?:\n|$)/s);
  if (speechContentMatch && speechContentMatch[1].trim()) {
    const transcript = speechContentMatch[1].trim();
    console.log('✅ Method 1 - Found speech content:', transcript.substring(0, 100) + '...');
    return transcript;
  }

  // Method 2: Look for transcript after markers
  const transcriptMatch = voskResult.match(/Transcript:\s*(.+?)(?:\n|$)/s);
  if (transcriptMatch && transcriptMatch[1].trim()) {
    const transcript = transcriptMatch[1].trim();
    console.log('✅ Method 2 - Found transcript:', transcript.substring(0, 100) + '...');
    return transcript;
  }

  // Method 3: Extract text after removing formatting
  let cleaned = voskResult
    // Remove headers and metadata
    .replace(/🎵.*?COMPLETE.*?\n/g, '')
    .replace(/📁 File Information:.*?\n/g, '')
    .replace(/📊 Processing Results:.*?\n/g, '')
    .replace(/⏱ Timing Information:.*?\n/g, '')
    .replace(/🔍 Quality Metrics:.*?\n/g, '')
    // Remove bullet points and metadata lines
    .replace(/•.*?\n/g, '')
    .replace(/\*.*?\n/g, '')
    // Remove emoji-prefixed lines
    .replace(/[📁📊⏱🔍📝].*?:/g, '')
    // Clean up extra whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Method 4: Look for sentences (text with actual words)
  const sentences = cleaned.split(/[.!?]+/).filter(sentence => {
    const words = sentence.trim().split(/\s+/).filter(word => 
      word.length > 2 && /[a-zA-Z]/.test(word)
    );
    return words.length >= 3; // At least 3 meaningful words
  });

  if (sentences.length > 0) {
    const transcript = sentences.join('. ').trim();
    if (transcript.length > 10) {
      console.log('✅ Method 4 - Extracted sentences:', transcript.substring(0, 100) + '...');
      return transcript;
    }
  }

  // Method 5: Last resort - look for any meaningful text
  const words = cleaned.split(/\s+/).filter(word => 
    word.length > 2 && /[a-zA-Z]/.test(word) && !word.includes('MB') && !word.includes('sec')
  );

  if (words.length >= 5) {
    const transcript = words.join(' ');
    console.log('✅ Method 5 - Extracted words:', transcript.substring(0, 100) + '...');
    return transcript;
  }

  console.log('❌ No meaningful transcript found in result');
  return null;
}

export function validateTranscript(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return { valid: false, reason: 'No transcript provided' };
  }

  const trimmed = transcript.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, reason: 'Transcript too short' };
  }

  // Check for meaningful content (not just metadata)
  const meaningfulWords = trimmed.split(/\s+/).filter(word => 
    word.length > 2 && 
    /[a-zA-Z]/.test(word) && 
    !word.includes('MB') && 
    !word.includes('sec') &&
    !word.includes('File') &&
    !word.includes('Audio')
  );

  if (meaningfulWords.length < 2) {
    return { valid: false, reason: 'No meaningful words found' };
  }

  return { 
    valid: true, 
    wordCount: meaningfulWords.length,
    estimatedSpeechTime: Math.max(1, Math.round(meaningfulWords.length / 2)) // ~2 words per second
  };
}
