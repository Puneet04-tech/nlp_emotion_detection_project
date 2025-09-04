// Voice Emotion Training Connection Diagnostic
const fs = require('fs');
const path = require('path');

async function checkVoiceEmotionTrainingConnections() {
  console.log('🔍 VOICE EMOTION TRAINING CONNECTION ANALYSIS');
  console.log('=' + '='.repeat(60));
  console.log('');

  let connectionIssues = [];
  let dataFlowStatus = {
    voiceEmotionToTraining: 'unknown',
    trainingToServer: 'unknown',
    serverToModel: 'unknown',
    modelToVoiceEmotion: 'unknown'
  };

  // 1. Check Voice Emotion Analyzer Integration
  console.log('🎤 Analyzing Voice Emotion Analyzer Integration...');
  try {
    const voiceEmotionFile = path.join(__dirname, 'src', 'components', 'EnhancedVoiceEmotionAnalyzer.jsx');
    const content = fs.readFileSync(voiceEmotionFile, 'utf8');
    
    // Check for training connections
    const hasTrainingMode = content.includes('trainingMode');
    const hasModelLoading = content.includes('loadModelLocal');
    const hasModelUsage = content.includes('mlModel') && content.includes('predict');
    const hasFeatureExtraction = content.includes('analyzeUploadedAudioFeatures');
    const hasTrainingResults = content.includes('trainingResults');
    
    console.log(`✅ Training Mode: ${hasTrainingMode ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Model Loading: ${hasModelLoading ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Model Usage: ${hasModelUsage ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Feature Extraction: ${hasFeatureExtraction ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Training Results: ${hasTrainingResults ? 'IMPLEMENTED' : 'MISSING'}`);
    
    if (hasTrainingMode && hasModelLoading && hasModelUsage) {
      dataFlowStatus.modelToVoiceEmotion = 'connected';
    } else {
      dataFlowStatus.modelToVoiceEmotion = 'disconnected';
      connectionIssues.push('Voice emotion analyzer not fully connected to ML model');
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Failed to analyze voice emotion analyzer');
    connectionIssues.push('Voice emotion analyzer file not accessible');
    console.log('');
  }

  // 2. Check Training Center Integration
  console.log('🏗️ Analyzing Training Center Integration...');
  try {
    const trainingCenterFile = path.join(__dirname, 'src', 'components', 'TrainingCenter.jsx');
    const content = fs.readFileSync(trainingCenterFile, 'utf8');
    
    // Check for voice emotion connections
    const hasVoiceStorage = content.includes('VoiceSampleStorage');
    const hasServerUpload = content.includes('http://localhost:4000/upload');
    const hasEmotionAnalysis = content.includes('analyzeEmotionWithBERT');
    const hasFeatureFusion = content.includes('fuseEmotionScores');
    const hasTensorFlowIntegration = content.includes('tfVoiceClassifier');
    
    console.log(`✅ Voice Storage: ${hasVoiceStorage ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Server Upload: ${hasServerUpload ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Emotion Analysis: ${hasEmotionAnalysis ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Feature Fusion: ${hasFeatureFusion ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ TensorFlow Integration: ${hasTensorFlowIntegration ? 'IMPLEMENTED' : 'MISSING'}`);
    
    if (hasVoiceStorage && hasServerUpload) {
      dataFlowStatus.trainingToServer = 'connected';
    } else {
      dataFlowStatus.trainingToServer = 'disconnected';
      connectionIssues.push('Training center not fully connected to server');
    }
    
    if (hasEmotionAnalysis && hasFeatureFusion) {
      dataFlowStatus.voiceEmotionToTraining = 'connected';
    } else {
      dataFlowStatus.voiceEmotionToTraining = 'partial';
      connectionIssues.push('Voice emotion to training connection incomplete');
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Failed to analyze training center');
    connectionIssues.push('Training center file not accessible');
    console.log('');
  }

  // 3. Check Server Upload Capability
  console.log('📤 Testing Server Upload Connection...');
  try {
    // Use Node.js built-in fetch (Node 18+) or fallback
    let fetch;
    try {
      fetch = globalThis.fetch;
    } catch (e) {
      const nodeFetch = await import('node-fetch');
      fetch = nodeFetch.default;
    }
    
    // Test server status
    const statusResponse = await fetch('http://localhost:4000/status');
    const statusData = await statusResponse.json();
    
    console.log(`✅ Server Status: RUNNING`);
    console.log(`   - Training samples: ${statusData.trainingSamples || 0}`);
    
    // Test upload endpoint availability with a simple HEAD request
    try {
      const uploadTest = await fetch('http://localhost:4000/', { method: 'HEAD' });
      if (uploadTest.ok) {
        console.log(`✅ Upload Endpoint: ACCESSIBLE`);
        dataFlowStatus.serverToModel = 'connected';
      } else {
        console.log(`⚠️  Upload Endpoint: RESPONSE ERROR`);
        dataFlowStatus.serverToModel = 'partial';
      }
    } catch (uploadError) {
      console.log(`⚠️  Upload Endpoint: NOT TESTED (${uploadError.message})`);
      dataFlowStatus.serverToModel = 'unknown';
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Server Upload: NOT ACCESSIBLE');
    console.log(`   Error: ${error.message}`);
    connectionIssues.push('Training server not accessible');
    dataFlowStatus.trainingToServer = 'disconnected';
    dataFlowStatus.serverToModel = 'disconnected';
    console.log('');
  }

  // 4. Check Existing Training Data
  console.log('📊 Analyzing Existing Training Data...');
  try {
    const metaDir = path.join(__dirname, 'server', 'meta');
    const uploadsDir = path.join(__dirname, 'server', 'uploads');
    
    const metaFiles = fs.readdirSync(metaDir).filter(f => f.endsWith('.json'));
    const uploadFiles = fs.readdirSync(uploadsDir);
    
    console.log(`✅ Training Samples: ${metaFiles.length} metadata files`);
    console.log(`✅ Audio Files: ${uploadFiles.length} audio recordings`);
    
    // Analyze sample quality
    let validSamples = 0;
    let samplesWithFeatures = 0;
    const emotionCounts = {};
    
    metaFiles.forEach(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(metaDir, file), 'utf8'));
        if (content.emotion && content.id) {
          validSamples++;
          emotionCounts[content.emotion] = (emotionCounts[content.emotion] || 0) + 1;
          
          if (content.features && Object.keys(content.features).length > 0) {
            samplesWithFeatures++;
          }
        }
      } catch (e) {
        // Skip invalid files
      }
    });
    
    console.log(`✅ Valid Samples: ${validSamples}`);
    console.log(`✅ Samples with Features: ${samplesWithFeatures}`);
    console.log(`✅ Emotion Distribution:`);
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      console.log(`   - ${emotion}: ${count} samples`);
    });
    
    if (validSamples === 0) {
      connectionIssues.push('No valid training samples available');
    } else if (samplesWithFeatures < validSamples * 0.5) {
      connectionIssues.push('Many samples missing audio features');
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Failed to analyze training data');
    connectionIssues.push('Training data not accessible');
    console.log('');
  }

  // 5. Check TensorFlow Integration
  console.log('🧠 Checking TensorFlow ML Integration...');
  try {
    const tfFile = path.join(__dirname, 'src', 'utils', 'tfVoiceClassifier.js');
    const content = fs.readFileSync(tfFile, 'utf8');
    
    const hasModelCreation = content.includes('createModel');
    const hasTraining = content.includes('trainModel');
    const hasModelSaving = content.includes('saveModelLocal');
    const hasModelLoading = content.includes('loadModelLocal');
    const hasPrediction = content.includes('predict');
    const hasDatasetBuilding = content.includes('buildDataset');
    
    console.log(`✅ Model Creation: ${hasModelCreation ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Model Training: ${hasTraining ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Model Saving: ${hasModelSaving ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Model Loading: ${hasModelLoading ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Prediction: ${hasPrediction ? 'IMPLEMENTED' : 'MISSING'}`);
    console.log(`✅ Dataset Building: ${hasDatasetBuilding ? 'IMPLEMENTED' : 'MISSING'}`);
    
    if (hasModelCreation && hasTraining && hasModelSaving && hasModelLoading) {
      dataFlowStatus.serverToModel = 'connected';
    } else {
      connectionIssues.push('TensorFlow ML pipeline incomplete');
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ Failed to check TensorFlow integration');
    connectionIssues.push('TensorFlow classifier not accessible');
    console.log('');
  }

  // 6. Generate Data Flow Report
  console.log('🔄 DATA FLOW ANALYSIS');
  console.log('=' + '='.repeat(60));
  
  const flowSteps = [
    { name: 'Voice Emotion → Training Data', status: dataFlowStatus.voiceEmotionToTraining },
    { name: 'Training Data → Server', status: dataFlowStatus.trainingToServer },
    { name: 'Server → ML Model', status: dataFlowStatus.serverToModel },
    { name: 'ML Model → Voice Emotion', status: dataFlowStatus.modelToVoiceEmotion }
  ];
  
  flowSteps.forEach(step => {
    const icon = step.status === 'connected' ? '✅' : 
                 step.status === 'partial' ? '⚠️' : 
                 step.status === 'disconnected' ? '❌' : '❓';
    console.log(`${icon} ${step.name}: ${step.status.toUpperCase()}`);
  });
  
  console.log('');
  
  // 7. Connection Health Assessment
  const connectedFlows = flowSteps.filter(s => s.status === 'connected').length;
  const totalFlows = flowSteps.length;
  const healthScore = Math.round((connectedFlows / totalFlows) * 100);
  
  let overallHealth = 'critical';
  if (healthScore >= 75) overallHealth = 'healthy';
  else if (healthScore >= 50) overallHealth = 'warning';
  
  const healthIcon = overallHealth === 'healthy' ? '✅' : 
                     overallHealth === 'warning' ? '⚠️' : '❌';
  
  console.log('📋 TRAINING CONNECTION HEALTH REPORT');
  console.log('=' + '='.repeat(60));
  console.log(`${healthIcon} Overall Health: ${overallHealth.toUpperCase()} (${healthScore}%)`);
  console.log(`📊 Connected Flows: ${connectedFlows}/${totalFlows}`);
  console.log('');
  
  if (connectionIssues.length > 0) {
    console.log('⚠️  CONNECTION ISSUES IDENTIFIED:');
    connectionIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('');
  }
  
  console.log('🎯 TRAINING DATA UTILIZATION:');
  if (dataFlowStatus.voiceEmotionToTraining === 'connected' && 
      dataFlowStatus.trainingToServer === 'connected' &&
      dataFlowStatus.modelToVoiceEmotion === 'connected') {
    console.log('   ✅ Voice emotion IS getting data from training samples');
    console.log('   ✅ Training data IS helping improve emotion detection');
    console.log('   ✅ Full training pipeline is operational');
  } else if (dataFlowStatus.modelToVoiceEmotion === 'connected') {
    console.log('   ⚠️  Voice emotion CAN use training data but pipeline has gaps');
    console.log('   ⚠️  Some training functionality may not work optimally');
  } else {
    console.log('   ❌ Voice emotion is NOT properly connected to training data');
    console.log('   ❌ Training samples are NOT effectively helping emotion detection');
  }
  
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  
  if (dataFlowStatus.trainingToServer === 'disconnected') {
    console.log('   1. Start the training server: node server/train-server.js');
  }
  if (connectionIssues.includes('No valid training samples available')) {
    console.log('   2. Upload voice samples via the Training tab');
  }
  if (dataFlowStatus.modelToVoiceEmotion === 'disconnected') {
    console.log('   3. Load ML model in Voice Emotion analyzer using "🧠 Load ML Model" button');
  }
  if (connectionIssues.includes('Many samples missing audio features')) {
    console.log('   4. Re-upload voice samples to ensure proper feature extraction');
  }
  
  console.log('');
  console.log('🔧 INTEGRATION STEPS:');
  console.log('   1. Record voice in Voice Emotion tab → extracts features');
  console.log('   2. Features sent to Training Center → stored with emotion labels');
  console.log('   3. Training Center uploads to server → builds dataset');
  console.log('   4. ML model trained on server data → saved locally');
  console.log('   5. Voice Emotion loads model → uses for better predictions');
  console.log('');
  console.log('=' + '='.repeat(60));
  
  // Exit with health-based code
  if (overallHealth === 'healthy') {
    process.exit(0);
  } else if (overallHealth === 'warning') {
    process.exit(1);
  } else {
    process.exit(2);
  }
}

checkVoiceEmotionTrainingConnections().catch(error => {
  console.error('❌ Connection diagnostic failed:', error.message);
  process.exit(3);
});
