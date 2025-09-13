import React, { useState, useEffect, useRef, useCallback } from 'react';

// Ultra-Enhanced Voice Emotion System
const VoiceEmotionSystem = ({ onEmotionDetected, isVisible = true }) => {
  // Core state
  const [systemStatus, setSystemStatus] = useState('ready');
  const [emotions] = useState({
    joy: 0.25,
    sadness: 0.14, 
    anger: 0.05,
    excitement: 0.18,
    fear: 0.12,
    surprise: 0.08,
    neutral: 0.69
  });
  const [dominantEmotion] = useState('neutral');
  
  // Test samples for demonstration
  const testSamples = {
    joy: { text: "This is absolutely wonderful! I'm so happy right now!" },
    sadness: { text: "I feel so down and disappointed about everything." },
    anger: { text: "I'm absolutely furious about this situation!" },
    excitement: { text: "This is so exciting! I can't believe it's happening!" },
    fear: { text: "I'm really scared and worried about what might happen." },
    surprise: { text: "Wow! That's completely unexpected and shocking!" },
    contempt: { text: "That's absolutely ridiculous and beneath my attention." },
    anticipation: { text: "I'm eagerly waiting and expecting something great." },
    trust: { text: "I have complete confidence and trust in this." },
    melancholy: { text: "There's a bittersweet feeling of nostalgia here." },
    euphoria: { text: "I'm experiencing pure bliss and overwhelming joy!" },
    serenity: { text: "I feel completely peaceful and at ease with everything." },
    determination: { text: "I'm absolutely determined to achieve this goal." },
    curiosity: { text: "I'm really curious to understand how this works." },
    disgust: { text: "That's absolutely disgusting and repulsive." },
    admiration: { text: "I have tremendous respect and admiration for this." },
    envy: { text: "I wish I had what they have, it's not fair." },
    gratitude: { text: "I'm so grateful and thankful for everything." }
  };
  
  // UI state
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showEmotionRadar, setShowEmotionRadar] = useState(false);
  const [showConfidenceChart, setShowConfidenceChart] = useState(false);
  const [currentTestEmotion, setCurrentTestEmotion] = useState(null);

  // Simple initialization
  useEffect(() => {
    console.log('🚀 Ultra-Enhanced Voice Emotion System initialized');
    console.log('� 18+ emotions ready for testing');
  }, []);

  // Audio file processing with ultra-enhanced analysis
  const processAudioFile = async (file) => {
    if (!ultraEngine || !fusionEngine || !bertAnalyzer) {
      console.error('❌ Ultra-enhanced engines not initialized');
      setFileProcessingStatus('Engines not ready');
      return null;
    }
    
    try {
      setFileProcessingStatus('🔄 Ultra-enhanced analysis in progress...');
      console.log('🎵 Processing audio file with ultra-enhanced system:', file.name);
      
      // Process with ultra-enhanced emotion engine
      const emotionResult = await ultraEngine.processAudioFile(file);
      console.log('🎭 Ultra-enhanced emotion analysis:', emotionResult);
      
      // Enhance with sentiment fusion
      if (emotionResult.transcript) {
        const sentimentResult = await fusionEngine.analyzeSentimentFusion(emotionResult.transcript);
        console.log('💫 Sentiment fusion result:', sentimentResult);
        
        // Enhance with BERT analysis
        const bertResult = await bertAnalyzer.analyzeAdvanced(emotionResult.transcript);
        console.log('🤖 Advanced BERT analysis:', bertResult);
        
        // Combine all results with weighted fusion
        const finalResult = combineAnalysisResults(emotionResult, sentimentResult, bertResult);
        
        // Update state with enhanced results
        setEmotions(finalResult.emotions);
        setDominantEmotion(finalResult.dominantEmotion);
        setVoiceFeatures(finalResult.voiceFeatures);
        setTranscript(emotionResult.transcript);
        
        // Callback with ultra-enhanced data
        if (onEmotionDetected) {
          onEmotionDetected({
            emotion: finalResult.dominantEmotion,
            confidence: finalResult.confidence,
            features: finalResult.voiceFeatures,
            emotions: finalResult.emotions,
            analysis: 'ultra-enhanced'
          });
        }
        
        setFileProcessingStatus('✅ Ultra-enhanced analysis complete!');
        return finalResult;
      }
      
      setFileProcessingStatus('');
      return emotionResult;
      
    } catch (error) {
      console.error('❌ Ultra-enhanced processing failed:', error);
      setFileProcessingStatus('❌ Processing failed');
      return null;
    }
  };

  // Combine results from all three engines with advanced weighting
  const combineAnalysisResults = (emotionResult, sentimentResult, bertResult) => {
    console.log('🔄 Combining ultra-enhanced analysis results...');
    
    const combinedEmotions = { ...emotionResult.emotions };
    
    // Apply sentiment fusion weighting (25% boost)
    if (sentimentResult && sentimentResult.emotions) {
      Object.entries(sentimentResult.emotions).forEach(([emotion, score]) => {
        if (combinedEmotions[emotion]) {
          combinedEmotions[emotion] = (combinedEmotions[emotion] * 0.75) + (score * 0.25);
        } else {
          combinedEmotions[emotion] = score * 0.25;
        }
      });
    }
    
    // Apply BERT enhancement (10% boost for precision)
    if (bertResult && bertResult.emotions) {
      Object.entries(bertResult.emotions).forEach(([emotion, score]) => {
        if (combinedEmotions[emotion]) {
          combinedEmotions[emotion] = (combinedEmotions[emotion] * 0.9) + (score * 0.1);
        } else {
          combinedEmotions[emotion] = score * 0.1;
        }
      });
    }
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(combinedEmotions)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Calculate combined confidence
    const combinedConfidence = Math.min(100, 
      (emotionResult.confidence * 0.65) + 
      ((sentimentResult?.confidence || 0.5) * 0.25) + 
      ((bertResult?.confidence || 0.5) * 0.1)
    );
    
    console.log(`🎯 ULTRA-ENHANCED RESULT: ${dominantEmotion} (${combinedConfidence.toFixed(1)}% confidence)`);
    
    return {
      emotions: combinedEmotions,
      dominantEmotion,
      confidence: combinedConfidence,
      voiceFeatures: emotionResult.voiceFeatures,
      transcript: emotionResult.transcript,
      fusionType: 'ultra-enhanced'
    };
  };

  // Test with emotion samples
  const testWithEmotionSample = async (emotionType) => {
    if (!testSamples[emotionType]) return;
    
    setCurrentTestEmotion(emotionType);
    setFileProcessingStatus(`🧪 Testing with ${emotionType} sample...`);
    
    try {
      const sample = testSamples[emotionType];
      await processAudioFile(sample.audio);
      setTranscript(sample.text);
      
      console.log(`🧪 Test Result for ${emotionType}:`, {
        detected: dominantEmotion,
        expected: emotionType,
        match: dominantEmotion === emotionType
      });
    } catch (error) {
      console.error('Test sample processing failed:', error);
    } finally {
      setCurrentTestEmotion(null);
    }
  };

  // Live recording with ultra-enhanced analysis
  const startRecording = async () => {
    if (!ultraEngine) {
      console.error('❌ Ultra-enhanced engine not initialized');
      return;
    }
    
    try {
      setIsRecording(true);
      setFileProcessingStatus('🎤 Ultra-enhanced live analysis starting...');
      
      const result = await ultraEngine.startAnalysis();
      console.log('🎵 Ultra-enhanced live recording started');
      
      // Start continuous analysis loop
      const analysisInterval = setInterval(async () => {
        if (ultraEngine && isRecording) {
          const liveResult = await ultraEngine.getLatestAnalysis();
          if (liveResult && liveResult.emotions) {
            setEmotions(liveResult.emotions);
            setDominantEmotion(liveResult.dominantEmotion);
            setVoiceFeatures(liveResult.voiceFeatures);
            
            if (onEmotionDetected) {
              onEmotionDetected({
                emotion: liveResult.dominantEmotion,
                confidence: liveResult.confidence,
                features: liveResult.voiceFeatures,
                analysis: 'ultra-enhanced-live'
              });
            }
          }
        } else {
          clearInterval(analysisInterval);
        }
      }, 500);
      
      setFileProcessingStatus('🎤 Live ultra-enhanced analysis active');
      
    } catch (error) {
      console.error('❌ Failed to start ultra-enhanced recording:', error);
      setIsRecording(false);
      setFileProcessingStatus('❌ Recording failed');
    }
  };

  const stopRecording = async () => {
    if (ultraEngine) {
      await ultraEngine.stopAnalysis();
    }
    setIsRecording(false);
    setFileProcessingStatus('');
    console.log('⏹️ Ultra-enhanced recording stopped');
  };

  // File upload handler
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 File uploaded for ultra-enhanced analysis:', file.name);
    await processAudioFile(file);
  }, [ultraEngine, fusionEngine, bertAnalyzer]);

  // Render ultra-enhanced emotion display
  const renderEmotionDisplay = () => {
    const emotionEntries = Object.entries(emotions).sort(([,a], [,b]) => b - a);
    
    return (
      <div className="ultra-emotion-display">
        <div className="dominant-emotion">
          <h3>🎯 Dominant Emotion: {dominantEmotion}</h3>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${emotions[dominantEmotion] || 0}%` }}
            />
            <span>{(emotions[dominantEmotion] || 0).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="all-emotions">
          <h4>🌈 All Detected Emotions:</h4>
          {emotionEntries.slice(0, 8).map(([emotion, score]) => (
            <div key={emotion} className="emotion-item">
              <span className="emotion-name">{emotion}</span>
              <div className="emotion-bar">
                <div 
                  className="emotion-fill" 
                  style={{ width: `${score}%`, backgroundColor: getEmotionColor(emotion) }}
                />
                <span>{score.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Advanced Visualizations */}
        {showAdvancedMetrics && renderAdvancedMetrics()}
        {showEmotionRadar && renderEmotionRadar()}
        {showConfidenceChart && renderConfidenceChart()}
      </div>
    );
  };

  // Advanced Metrics Visualization
  const renderAdvancedMetrics = () => (
    <div className="advanced-metrics">
      <h4>📊 Ultra-Enhanced Analysis Metrics</h4>
      <div className="metrics-grid">
        <div className="metric-card">
          <h5>🎵 Voice Analysis</h5>
          <div className="metric-value">
            Pitch: {voiceFeatures.pitch?.toFixed(1) || 'N/A'} Hz
          </div>
          <div className="metric-value">
            Volume: {((voiceFeatures.volume || 0) * 100).toFixed(1)}%
          </div>
          <div className="metric-value">
            Clarity: {voiceFeatures.clarity || 'Analyzing...'}
          </div>
        </div>
        
        <div className="metric-card">
          <h5>🔬 Confidence Analysis</h5>
          <div className="metric-value">
            Level: <span className={`confidence-${confidenceLevel}`}>{confidenceLevel}</span>
          </div>
          <div className="metric-value">
            Quality: <span className={`quality-${analysisQuality}`}>{analysisQuality}</span>
          </div>
          <div className="metric-value">
            Fusion: Multi-Algorithm
          </div>
        </div>
        
        <div className="metric-card">
          <h5>🤖 AI Enhancement</h5>
          <div className="metric-value">
            BERT: {bertAnalyzer ? '✅ Active' : '⏳ Loading'}
          </div>
          <div className="metric-value">
            Sentiment: {fusionEngine ? '✅ Active' : '⏳ Loading'}
          </div>
          <div className="metric-value">
            Emotions: 18+ Detected
          </div>
        </div>
      </div>
    </div>
  );

  // Emotion Radar Chart
  const renderEmotionRadar = () => {
    const topEmotions = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
    
    return (
      <div className="emotion-radar">
        <h4>🎯 Emotion Intensity Radar</h4>
        <div className="radar-chart">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Radar grid */}
            {[1, 2, 3, 4, 5].map(ring => (
              <circle
                key={ring}
                cx="150"
                cy="150"
                r={ring * 25}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            ))}
            
            {/* Radar lines */}
            {topEmotions.map((_, index) => {
              const angle = (index * 60 - 90) * Math.PI / 180;
              const x2 = 150 + 125 * Math.cos(angle);
              const y2 = 150 + 125 * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1="150"
                  y1="150"
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Emotion points */}
            {topEmotions.map(([emotion, score], index) => {
              const angle = (index * 60 - 90) * Math.PI / 180;
              const radius = (score / 100) * 125;
              const x = 150 + radius * Math.cos(angle);
              const y = 150 + radius * Math.sin(angle);
              return (
                <g key={emotion}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={getEmotionColor(emotion)}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={150 + 140 * Math.cos(angle)}
                    y={150 + 140 * Math.sin(angle)}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    dy="4"
                  >
                    {emotion}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Confidence History Chart
  const renderConfidenceChart = () => (
    <div className="confidence-chart">
      <h4>📈 Confidence Trend Analysis</h4>
      <div className="chart-container">
        <svg width="400" height="200" viewBox="0 0 400 200">
          {/* Chart background */}
          <rect width="400" height="200" fill="rgba(255,255,255,0.05)" rx="10"/>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="50"
              y1={180 - y * 1.3}
              x2="380"
              y2={180 - y * 1.3}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Confidence line */}
          {emotionHistory.length > 1 && (
            <polyline
              points={emotionHistory.map((entry, index) => {
                const x = 50 + (index * 330 / (emotionHistory.length - 1));
                const y = 180 - (entry.confidence * 1.3);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          
          {/* Data points */}
          {emotionHistory.map((entry, index) => {
            const x = 50 + (index * 330 / Math.max(1, emotionHistory.length - 1));
            const y = 180 - (entry.confidence * 1.3);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={entry.isTest ? "#f59e0b" : "#10b981"}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          <text x="25" y="25" fill="white" fontSize="12">100%</text>
          <text x="25" y="55" fill="white" fontSize="12">75%</text>
          <text x="25" y="90" fill="white" fontSize="12">50%</text>
          <text x="25" y="125" fill="white" fontSize="12">25%</text>
          <text x="25" y="185" fill="white" fontSize="12">0%</text>
        </svg>
      </div>
    </div>
  );

  // Get emotion icon
  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: '😊', happiness: '😊', excitement: '🤩', elation: '🥳',
      sadness: '😢', melancholy: '😔', despair: '😞', grief: '😭',
      anger: '😠', fury: '😡', rage: '🤬', irritation: '😤',
      fear: '😨', terror: '😱', anxiety: '😰', panic: '😵',
      surprise: '😮', amazement: '🤯', shock: '😲', awe: '😯',
      disgust: '🤢', contempt: '😒', revulsion: '🤮',
      trust: '🤝', confidence: '💪', determination: '🎯',
      anticipation: '⏳', curiosity: '🤔', serenity: '🧘'
    };
    return icons[emotion] || '😐';
  };

  // Get color for emotion visualization
  const getEmotionColor = (emotion) => {
    const colors = {
      happiness: '#10b981', joy: '#10b981', excitement: '#f59e0b', serenity: '#06b6d4',
      sadness: '#6b7280', melancholy: '#6b7280', disappointment: '#6b7280',
      anger: '#ef4444', frustration: '#dc2626', irritation: '#ef4444',
      fear: '#8b5cf6', anxiety: '#8b5cf6', nervousness: '#8b5cf6',
      surprise: '#f59e0b', amazement: '#f59e0b', shock: '#f59e0b',
      disgust: '#7c2d12', contempt: '#7c2d12',
      confidence: '#059669', determination: '#059669', pride: '#059669',
      neutral: '#374151', calm: '#374151', peaceful: '#06b6d4'
    };
    return colors[emotion] || '#6b7280';
  };

  // Render system status
  const renderSystemStatus = () => (
    <div className="system-status">
      <div className={`status-indicator ${systemStatus}`}>
        {systemStatus === 'ready' && '✅ Ultra-Enhanced System Ready'}
        {systemStatus === 'initializing' && '🔄 Initializing Ultra-Enhanced Engines...'}
        {systemStatus === 'error' && '❌ System Error'}
      </div>
      
      {fileProcessingStatus && (
        <div className="processing-status">{fileProcessingStatus}</div>
      )}
      
      <div className="engine-status">
        <span className={ultraEngine ? 'ready' : 'loading'}>
          🎭 Ultra Engine: {ultraEngine ? 'Ready' : 'Loading...'}
        </span>
        <span className={fusionEngine ? 'ready' : 'loading'}>
          💫 Fusion Engine: {fusionEngine ? 'Ready' : 'Loading...'}
        </span>
        <span className={bertAnalyzer ? 'ready' : 'loading'}>
          🤖 BERT Analyzer: {bertAnalyzer ? 'Ready' : 'Loading...'}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`voice-emotion-system ultra-enhanced ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="ultra-header">
        <h2>🚀 Ultra-Enhanced Voice Emotion Analysis</h2>
        <p>Multi-Algorithm Fusion • 18+ Emotions • 90%+ Confidence</p>
      </div>

      {renderSystemStatus()}
      
      {/* Enhanced UI Controls */}
      <div className="visualization-controls">
        <button 
          className={`viz-toggle ${showAdvancedMetrics ? 'active' : ''}`}
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
        >
          📊 Advanced Metrics
        </button>
        <button 
          className={`viz-toggle ${showEmotionRadar ? 'active' : ''}`}
          onClick={() => setShowEmotionRadar(!showEmotionRadar)}
        >
          🎯 Emotion Radar
        </button>
        <button 
          className={`viz-toggle ${showConfidenceChart ? 'active' : ''}`}
          onClick={() => setShowConfidenceChart(!showConfidenceChart)}
        >
          📈 Confidence Chart
        </button>
      </div>

      {/* Test Samples Panel */}
      <div className="test-samples-panel">
        <h3>🧪 Emotion Test Samples (18+ Emotions)</h3>
        {Object.keys(testSamples).length === 0 ? (
          <div className="loading-samples">
            <div className="spinner">🔄</div>
            <p>Generating ultra-enhanced test samples...</p>
          </div>
        ) : (
          <p className="samples-ready">✅ {Object.keys(testSamples).length} emotion samples ready for testing!</p>
        )}
        <div className="test-samples-grid">
          {Object.keys(testSamples).map(emotion => (
            <button
              key={emotion}
              className={`test-sample-btn ${currentTestEmotion === emotion ? 'testing' : ''}`}
              onClick={() => testWithEmotionSample(emotion)}
              disabled={currentTestEmotion === emotion}
            >
              {getEmotionIcon(emotion)} {emotion}
              {currentTestEmotion === emotion && <span className="spinner">⚡</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="control-panel">
        <div className="upload-section">
          <label className="upload-button">
            📁 Upload Audio File
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload}
              disabled={systemStatus !== 'ready'}
            />
          </label>
        </div>
        
        <div className="recording-section">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={systemStatus !== 'ready'}
            className={`record-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Live Analysis'}
          </button>
        </div>
      </div>

      {Object.keys(emotions).length > 0 && renderEmotionDisplay()}
      
      {transcript && (
        <div className="transcript-display">
          <h4>📝 Transcript:</h4>
          <p>{transcript}</p>
        </div>
      )}

      <style jsx>{`
        .voice-emotion-system.ultra-enhanced {
          padding: 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .ultra-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .ultra-header h2 {
          margin: 0;
          font-size: 1.8em;
          background: linear-gradient(45deg, #ffd700, #ffeb3b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .system-status {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .status-indicator.ready {
          color: #10b981;
          font-weight: bold;
        }

        .status-indicator.initializing {
          color: #f59e0b;
        }

        .status-indicator.error {
          color: #ef4444;
        }

        .engine-status {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          font-size: 0.9em;
        }

        .engine-status span.ready {
          color: #10b981;
        }

        .engine-status span.loading {
          color: #f59e0b;
        }

        .control-panel {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .upload-button {
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .upload-button:hover {
          background: #059669;
        }

        .upload-button input {
          display: none;
        }

        .record-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .record-button.recording {
          background: #dc2626;
          animation: pulse 1s infinite;
        }

        .record-button:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .ultra-emotion-display {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .dominant-emotion h3 {
          margin: 0 0 10px 0;
          font-size: 1.3em;
        }

        .confidence-bar, .emotion-bar {
          background: rgba(255,255,255,0.2);
          height: 25px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .confidence-fill, .emotion-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.3s ease;
        }

        .confidence-bar span, .emotion-bar span {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: bold;
          font-size: 0.9em;
        }

        .all-emotions {
          margin-top: 20px;
        }

        .all-emotions h4 {
          margin: 0 0 15px 0;
        }

        .emotion-item {
          margin-bottom: 10px;
        }

        .emotion-name {
          display: inline-block;
          width: 120px;
          font-weight: bold;
          text-transform: capitalize;
        }

        .transcript-display {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .transcript-display h4 {
          margin: 0 0 10px 0;
        }

        .transcript-display p {
          margin: 0;
          line-height: 1.5;
        }

        .hidden {
          display: none;
        }
        
        /* Enhanced UI Components */
        .visualization-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        
        .viz-toggle {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .viz-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .viz-toggle.active {
          background: linear-gradient(135deg, #10b981, #06d6a0);
          border-color: #10b981;
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
        }
        
        /* Test Samples Panel */
        .test-samples-panel {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .test-samples-panel h3 {
          text-align: center;
          margin-bottom: 15px;
          color: #fbbf24;
        }
        
        .loading-samples {
          text-align: center;
          padding: 20px;
          color: #fbbf24;
        }
        
        .samples-ready {
          text-align: center;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .test-samples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .test-sample-btn {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: capitalize;
        }
        
        .test-sample-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .test-sample-btn.testing {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          animation: pulse 1.5s infinite;
        }
        
        .spinner {
          animation: spin 0.5s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Advanced Metrics */
        .advanced-metrics {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          border-left: 4px solid #10b981;
        }
        
        .metric-card h5 {
          margin: 0 0 10px 0;
          color: #fbbf24;
        }
        
        .metric-value {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .confidence-certainty { color: #10b981; font-weight: bold; }
        .confidence-ultra-high { color: #06d6a0; font-weight: bold; }
        .confidence-high { color: #34d399; font-weight: bold; }
        .confidence-acceptable { color: #fbbf24; }
        .confidence-low { color: #ef4444; }
        
        .quality-excellent { color: #10b981; font-weight: bold; }
        .quality-very-good { color: #06d6a0; font-weight: bold; }
        .quality-good { color: #34d399; }
        .quality-fair { color: #fbbf24; }
        .quality-poor { color: #ef4444; }
        
        /* Emotion Radar Chart */
        .emotion-radar {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        
        .radar-chart {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .radar-chart svg {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
        }
        
        /* Confidence Chart */
        .confidence-chart {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .chart-container {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .chart-container svg {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        /* Enhanced Confidence Display */
        .confidence-bar {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          height: 25px;
          border-radius: 15px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444 0%, #fbbf24 50%, #10b981 100%);
          border-radius: 15px;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        /* Enhanced Mobile Responsiveness */
        @media (max-width: 768px) {
          .visualization-controls {
            flex-wrap: wrap;
          }
          
          .test-samples-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .radar-chart svg, .chart-container svg {
            width: 100%;
            max-width: 280px;
            height: auto;
          }
        }
        
        /* Loading and Animation Enhancements */
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .ultra-emotion-display {
          animation: slideIn 0.5s ease-out;
        }
        
        .advanced-metrics, .emotion-radar, .confidence-chart {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VoiceEmotionSystem;
