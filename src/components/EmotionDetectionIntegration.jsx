// Enhanced App Component Integration for Emotion Detection V4
// This shows how to integrate the advanced emotion analytics into your main app

import React, { useState, useRef, useEffect } from 'react';
import EmotionDetectionEngineV4 from '../utils/emotionDetectionEngine-v4';
import EmotionAnalytics from './EmotionAnalytics';

/**
 * Example integration of Emotion Detection Engine V4
 * Add this to your existing App-simple.jsx or create a new component
 */
export const EmotionDetectionIntegration = () => {
  const [emotionEngine] = useState(() => new EmotionDetectionEngineV4());
  const [isEngineInitialized, setIsEngineInitialized] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showTestSuite, setShowTestSuite] = useState(false);

  // Enhanced test texts for different emotions with more variety
  const testTexts = {
    sarcasm: "Oh great, this is just fantastic! Another wonderful day where everything goes perfectly wrong.",
    enthusiasm: "This is absolutely amazing! I'm so excited about this breakthrough and the incredible results we've achieved!",
    frustration: "I'm so tired of these constant issues. This is ridiculous and I'm fed up with the same problems happening again and again.",
    confidence: "I'm absolutely certain this will work perfectly. We have a solid plan and I'm completely confident in our approach.",
    concern: "I'm a bit worried about this approach. I hope everything works out but I'm not entirely sure about the risks involved.",
    excitement: "I can't wait for this to happen! I'm so pumped and buzzing with excitement about what's coming next!",
    // New test cases for enhanced emotions
    happiness: "I'm feeling really happy today! Everything is going so well and I'm in such a great mood.",
    anger: "I'm absolutely furious about this! This makes me so angry I can't even think straight.",
    sadness: "I'm feeling really down and sad about this situation. It's just so disappointing and heartbreaking.",
    // More challenging test cases
    subtleSarcasm: "Well, that worked out perfectly, didn't it?",
    mildFrustration: "This is getting a bit annoying now.",
    genuineExcitement: "I can hardly contain my excitement! This is going to be incredible!",
    deepConcern: "I'm genuinely worried about what might happen here.",
    strongConfidence: "I have absolutely no doubt this will succeed perfectly."
  };

  // Initialize emotion engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        console.log('🚀 Initializing Emotion Detection Engine V4...');
        const success = await emotionEngine.initialize();
        if (success) {
          setIsEngineInitialized(true);
          emotionEngine.startDetection();
          console.log('✅ Emotion Detection Engine V4 ready!');
        } else {
          console.error('❌ Failed to initialize emotion engine');
        }
      } catch (error) {
        console.error('Error initializing emotion engine:', error);
      }
    };

    initEngine();

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
      emotionEngine.dispose();
    };
  }, []);

  // Auto-analysis functionality
  useEffect(() => {
    if (autoAnalyze && isEngineInitialized) {
      const interval = setInterval(() => {
        // Simulate ongoing analysis with random test text
        const emotions = Object.keys(testTexts);
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        analyzeEmotion(testTexts[randomEmotion]);
      }, 3000); // Analyze every 3 seconds

      setAnalysisInterval(interval);
      return () => clearInterval(interval);
    } else if (analysisInterval) {
      clearInterval(analysisInterval);
      setAnalysisInterval(null);
    }
  }, [autoAnalyze, isEngineInitialized]);

  // Enhanced analyze emotion function with detailed logging
  const analyzeEmotion = async (text) => {
    if (!isEngineInitialized || !text?.trim()) {
      console.warn('Engine not ready or no text provided');
      return;
    }

    try {
      console.log('🔍 Analyzing emotion for:', text);
      
      // DIRECT TEST: Check if patterns exist
      console.log('🔧 Direct pattern test for "furious":');
      const patterns = emotionEngine.emotionPatterns;
      if (patterns && patterns.anger) {
        const angerMarkers = patterns.anger.textMarkers;
        console.log('😡 Anger markers:', angerMarkers.slice(0, 10));
        console.log('📍 Contains "furious"?', angerMarkers.includes('furious'));
        console.log('📍 Text includes furious?', text.toLowerCase().includes('furious'));
      } else {
        console.log('❌ No anger patterns found!');
      }
      
      const result = await emotionEngine.analyzeCurrentEmotion(text);
      
      if (debugMode) {
        console.log('🎭 Detailed Analysis Result:', {
          input: text,
          detected: result.detected,
          confidence: Math.round(result.confidence),
          strength: result.emotionStrength,
          secondary: result.secondaryEmotions,
          breakdown: result.breakdown,
          textEvidence: result.textEvidence,
          insights: result.insights,
          timestamp: new Date(result.timestamp).toLocaleTimeString()
        });
        
        // Log individual emotion scores for debugging
        console.log('📊 Individual Emotion Scores:');
        Object.entries(result.breakdown || {}).forEach(([emotion, score]) => {
          console.log(`  ${emotion}: ${score.totalScore} (text: ${score.textScore}, audio: ${score.audioScore}, context: ${score.contextScore})`);
        });
      } else {
        console.log('📊 Emotion Analysis Result:', {
          detected: result.detected,
          confidence: Math.round(result.confidence),
          strength: result.emotionStrength,
          secondary: result.secondaryEmotions,
          insights: result.insights
        });
      }

      setCurrentEmotion(result);
      
      // Add to history
      setAnalysisHistory(prev => [
        ...prev.slice(-9), // Keep last 9 entries
        {
          text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          result: result,
          timestamp: Date.now()
        }
      ]);
      
      return result;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return null;
    }
  };

  // Test specific emotion
  const testEmotion = (emotionType) => {
    const text = testTexts[emotionType];
    if (text) {
      analyzeEmotion(text);
    }
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    if (!isEngineInitialized) return null;
    
    try {
      const analytics = emotionEngine.getEmotionAnalytics();
      console.log('📈 Current Analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  };

  return (
    <div className="emotion-detection-v4-demo">
      <div className="emotion-controls-header">
        <h2>🧠 Emotion Detection Engine V4 - Advanced Analytics</h2>
        
        <div className="engine-status">
          <span className={`status-indicator ${isEngineInitialized ? 'active' : 'inactive'}`}>
            {isEngineInitialized ? '✅ Engine Active' : '⏳ Initializing...'}
          </span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="emotion-control-panel">
        <div className="control-section">
          <h3>🎮 Test Controls</h3>
          <div className="test-buttons">
            {Object.keys(testTexts).map(emotion => (
              <button
                key={emotion}
                className={`test-btn test-${emotion}`}
                onClick={() => testEmotion(emotion)}
                disabled={!isEngineInitialized}
              >
                Test {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>🔄 Auto Analysis</h3>
          <div className="auto-controls">
            <label className="auto-toggle">
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                disabled={!isEngineInitialized}
              />
              <span>Enable Auto Analysis (every 3s)</span>
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3>� Debug Controls</h3>
          <div className="debug-controls">
            <label className="debug-toggle">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
              <span>Enable Debug Mode (detailed console logs)</span>
            </label>
            <button
              className="clear-history-btn"
              onClick={() => setAnalysisHistory([])}
              disabled={analysisHistory.length === 0}
            >
              🗑️ Clear History
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>�📊 Analytics</h3>
          <div className="analytics-controls">
            <button
              className="analytics-btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
              disabled={!isEngineInitialized}
            >
              {showAnalytics ? '📊 Hide Analytics' : '📈 Show Analytics'}
            </button>
            <button
              className="summary-btn"
              onClick={getAnalyticsSummary}
              disabled={!isEngineInitialized}
            >
              📋 Console Summary
            </button>
            <button
              className="test-suite-btn"
              onClick={() => setShowTestSuite(!showTestSuite)}
              disabled={!isEngineInitialized}
            >
              {showTestSuite ? '🧪 Hide Test Suite' : '🔬 Show Test Suite'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Emotion Display */}
      {currentEmotion && (
        <div className="current-emotion-display">
          <h3>🎭 Current Analysis</h3>
          <div className="emotion-result">
            <div className="primary-emotion">
              <span className="emotion-label">Primary:</span>
              <span className={`emotion-badge ${currentEmotion.detected}`}>
                {currentEmotion.detected}
              </span>
              <span className="confidence-score">
                {Math.round(currentEmotion.confidence)}%
              </span>
              {currentEmotion.emotionStrength && (
                <span className="emotion-strength">
                  ({currentEmotion.emotionStrength})
                </span>
              )}
            </div>

            {currentEmotion.secondaryEmotions && currentEmotion.secondaryEmotions.length > 0 && (
              <div className="secondary-emotions">
                <span className="emotion-label">Secondary:</span>
                {currentEmotion.secondaryEmotions.map((emotion, idx) => (
                  <span key={idx} className={`emotion-badge secondary ${emotion.emotion}`}>
                    {emotion.emotion} ({emotion.confidence}%)
                  </span>
                ))}
              </div>
            )}

            {currentEmotion.insights && currentEmotion.insights.length > 0 && (
              <div className="emotion-insights">
                <span className="emotion-label">Insights:</span>
                <ul className="insights-list">
                  {currentEmotion.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="analysis-details">
              <span className="emotion-label">Analysis Time:</span>
              <span className="timestamp">
                {new Date(currentEmotion.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div className="analysis-history">
          <h3>📋 Recent Analysis History</h3>
          <div className="history-list">
            {analysisHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className="history-item">
                <div className="history-text">"{entry.text}"</div>
                <div className="history-result">
                  <span className={`emotion-badge ${entry.result.detected}`}>
                    {entry.result.detected}
                  </span>
                  <span className="confidence-score">
                    {Math.round(entry.result.confidence)}%
                  </span>
                  <span className="timestamp">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics Dashboard */}
      {showAnalytics && (
        <EmotionAnalytics 
          emotionEngine={emotionEngine}
          isVisible={showAnalytics}
        />
      )}

      {/* Custom Text Input */}
      <div className="custom-text-section">
        <h3>✏️ Custom Text Analysis</h3>
        <div className="text-input-area">
          <textarea
            className="custom-text-input"
            placeholder="Enter any text to analyze its emotional content..."
            rows={4}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                analyzeEmotion(e.target.value);
              }
            }}
          />
          <button
            className="analyze-btn"
            onClick={(e) => {
              const textarea = e.target.parentElement.querySelector('textarea');
              analyzeEmotion(textarea.value);
            }}
            disabled={!isEngineInitialized}
          >
            🔍 Analyze Text (Ctrl+Enter)
          </button>
        </div>
      </div>

      {/* Integration Instructions */}
      <div className="integration-help">
        <h3>🔧 Integration Guide</h3>
        <div className="help-content">
          <h4>Step 4 Features Added:</h4>
          <ul>
            <li>✅ <strong>Real-time Analytics:</strong> Live emotion tracking and trends</li>
            <li>✅ <strong>Enhanced Scoring:</strong> Contextual modifiers and multi-dimensional analysis</li>
            <li>✅ <strong>Secondary Emotions:</strong> Detect multiple emotions simultaneously</li>
            <li>✅ <strong>Emotion Strength:</strong> Intensity measurement (weak to very-strong)</li>
            <li>✅ <strong>Session Analytics:</strong> Volatility, trends, and insights</li>
            <li>✅ <strong>Advanced UI:</strong> Comprehensive analytics dashboard</li>
            <li>✅ <strong>Pattern Detection:</strong> Emotion transitions and consistency</li>
            <li>✅ <strong>Confidence Calibration:</strong> Improved accuracy with learning</li>
          </ul>
          
          <h4>Next Steps for Step 5:</h4>
          <ul>
            <li>🔮 <strong>Machine Learning:</strong> Train models on user feedback</li>
            <li>🎯 <strong>Personalization:</strong> Adapt to individual speech patterns</li>
            <li>🌐 <strong>Multi-language:</strong> Support for different languages</li>
            <li>🔊 <strong>Audio Integration:</strong> Real-time voice analysis</li>
            <li>📱 <strong>Mobile Support:</strong> Cross-platform compatibility</li>
            <li>🤖 <strong>AI Integration:</strong> LLM-powered emotion understanding</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmotionDetectionIntegration;
