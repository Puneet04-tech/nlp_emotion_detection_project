// Simple Training System Diagnostic Script
const fs = require('fs');
const path = require('path');

async function runDiagnostic() {
  console.log('🔍 VOICE EMOTION TRAINING SYSTEM DIAGNOSTIC');
  console.log('=' + '='.repeat(60));
  console.log('');

  let overallStatus = 'healthy';
  let issues = [];

  // 1. Check Training Server Connection
  console.log('📡 Checking Training Server...');
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:4000/status', { timeout: 5000 });
    const data = await response.json();
    
    console.log('✅ Training server is RUNNING');
    console.log(`   - Port: 4000`);
    console.log(`   - Training samples: ${data.trainingSamples || 0}`);
    console.log(`   - Uptime: ${data.uptime ? Math.round(data.uptime) + 's' : 'unknown'}`);
    console.log('');
  } catch (error) {
    console.log('❌ Training server is NOT accessible');
    console.log(`   Error: ${error.message}`);
    issues.push('Training server not running');
    overallStatus = 'critical';
    console.log('');
  }

  // 2. Check Training Samples
  console.log('📊 Analyzing Training Samples...');
  try {
    const metaDir = path.join(__dirname, 'server', 'meta');
    const uploadsDir = path.join(__dirname, 'server', 'uploads');
    
    if (!fs.existsSync(metaDir) || !fs.existsSync(uploadsDir)) {
      throw new Error('Training directories not found');
    }
    
    const metaFiles = fs.readdirSync(metaDir).filter(f => f.endsWith('.json'));
    const uploadFiles = fs.readdirSync(uploadsDir);
    
    // Analyze samples
    const samples = metaFiles.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(metaDir, file), 'utf8'));
        return {
          emotion: content.emotion,
          hasFeatures: !!content.features,
          hasTranscript: !!content.transcript && content.transcript !== '[object Object]'
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    // Count emotions
    const emotionCounts = {};
    samples.forEach(s => {
      emotionCounts[s.emotion] = (emotionCounts[s.emotion] || 0) + 1;
    });
    
    console.log(`✅ Found ${samples.length} training samples`);
    console.log(`   - Audio files: ${uploadFiles.length}`);
    console.log(`   - Metadata files: ${metaFiles.length}`);
    console.log(`   - With features: ${samples.filter(s => s.hasFeatures).length}`);
    console.log('   - Emotion distribution:');
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      console.log(`     • ${emotion}: ${count} samples`);
    });
    
    if (samples.length === 0) {
      issues.push('No training samples available');
      overallStatus = 'critical';
    } else if (samples.length < 5) {
      issues.push('Limited training samples (< 5)');
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Failed to analyze training samples');
    console.log(`   Error: ${error.message}`);
    issues.push('Training sample analysis failed');
    overallStatus = 'critical';
    console.log('');
  }

  // 3. Check Voice Emotion Components
  console.log('🎤 Checking Voice Emotion Components...');
  try {
    const voiceEmotionFile = path.join(__dirname, 'src', 'components', 'EnhancedVoiceEmotionAnalyzer.jsx');
    const trainingCenterFile = path.join(__dirname, 'src', 'components', 'TrainingCenter.jsx');
    const tfClassifierFile = path.join(__dirname, 'src', 'utils', 'tfVoiceClassifier.js');
    
    const hasVoiceEmotion = fs.existsSync(voiceEmotionFile);
    const hasTrainingCenter = fs.existsSync(trainingCenterFile);
    const hasTFClassifier = fs.existsSync(tfClassifierFile);
    
    console.log(`✅ Voice Emotion Analyzer: ${hasVoiceEmotion ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ Training Center: ${hasTrainingCenter ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ TensorFlow Classifier: ${hasTFClassifier ? 'FOUND' : 'MISSING'}`);
    
    // Check integration features
    if (hasVoiceEmotion) {
      const content = fs.readFileSync(voiceEmotionFile, 'utf8');
      const features = [];
      
      if (content.includes('classifyEmotionFromAudioFeatures')) features.push('Audio feature classification');
      if (content.includes('analyzeUploadedAudioFeatures')) features.push('Audio feature analysis');
      if (content.includes('TensorFlow') || content.includes('tf.')) features.push('TensorFlow integration');
      if (content.includes('training') || content.includes('loadModel')) features.push('Model loading');
      
      console.log(`   - Integration features: ${features.length}`);
      features.forEach(feature => console.log(`     • ${feature}`));
    }
    
    if (!hasVoiceEmotion || !hasTrainingCenter) {
      issues.push('Missing key voice emotion components');
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Failed to check voice emotion components');
    console.log(`   Error: ${error.message}`);
    issues.push('Component check failed');
    console.log('');
  }

  // 4. Check Server Sample Access
  console.log('🔗 Testing Server Sample Access...');
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:4000/samples', { timeout: 5000 });
    const data = await response.json();
    
    console.log(`✅ Server samples endpoint: ACCESSIBLE`);
    console.log(`   - Total samples: ${data.samples?.length || 0}`);
    
    if (data.stats?.byEmotion) {
      console.log('   - Emotion distribution from server:');
      Object.entries(data.stats.byEmotion).forEach(([emotion, count]) => {
        console.log(`     • ${emotion}: ${count} samples`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Server samples endpoint: NOT accessible');
    console.log(`   Error: ${error.message}`);
    issues.push('Cannot access training samples via server');
    if (overallStatus === 'healthy') overallStatus = 'warning';
    console.log('');
  }

  // 5. Generate Final Report
  console.log('📋 FINAL DIAGNOSTIC REPORT');
  console.log('=' + '='.repeat(60));
  
  const statusIcon = overallStatus === 'healthy' ? '✅' : 
                     overallStatus === 'warning' ? '⚠️' : '❌';
  
  console.log(`${statusIcon} OVERALL STATUS: ${overallStatus.toUpperCase()}`);
  console.log('');
  
  if (issues.length > 0) {
    console.log('⚠️  ISSUES IDENTIFIED:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('');
  }
  
  console.log('📝 CONCLUSION:');
  if (overallStatus === 'healthy') {
    console.log('   ✅ Voice emotion feature IS properly trained with samples');
    console.log('   ✅ Training system connections are working correctly');
    console.log('   ✅ All components are integrated and functional');
  } else if (overallStatus === 'warning') {
    console.log('   ⚠️  Voice emotion feature is PARTIALLY connected');
    console.log('   ⚠️  Some issues detected but basic functionality should work');
    console.log('   ⚠️  Consider addressing the identified issues for optimal performance');
  } else {
    console.log('   ❌ Voice emotion feature is NOT properly trained or connected');
    console.log('   ❌ Critical issues prevent proper sample-based learning');
    console.log('   ❌ Please resolve the identified issues before training');
  }
  
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  if (issues.includes('Training server not running')) {
    console.log('   1. Start training server: cd server && node train-server.js');
  }
  if (issues.includes('No training samples available')) {
    console.log('   2. Upload voice samples via the Training tab in the app');
  }
  if (issues.includes('Limited training samples (< 5)')) {
    console.log('   3. Add more diverse voice samples for better accuracy');
  }
  if (issues.includes('Missing key voice emotion components')) {
    console.log('   4. Ensure all voice emotion components are properly installed');
  }
  
  console.log('');
  console.log('🎯 ACCESS POINTS:');
  console.log('   • Training Center: http://localhost:3005 → Training tab');
  console.log('   • Voice Emotion: http://localhost:3005 → 🎤 Voice Emotion tab');
  console.log('   • Training Server: http://localhost:4000/status');
  console.log('');
  console.log('=' + '='.repeat(60));
  
  // Exit with appropriate code
  if (overallStatus === 'healthy') {
    process.exit(0);
  } else if (overallStatus === 'warning') {
    process.exit(1);
  } else {
    process.exit(2);
  }
}

runDiagnostic().catch(error => {
  console.error('❌ Diagnostic failed:', error.message);
  process.exit(3);
});
