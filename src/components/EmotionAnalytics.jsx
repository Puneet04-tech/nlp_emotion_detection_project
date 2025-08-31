import React, { useState, useEffect } from 'react';
import './EmotionAnalytics.css';

/**
 * Advanced Emotion Analytics Dashboard - Step 4
 * Displays real-time emotion tracking, trends, and insights
 */
const EmotionAnalytics = ({ emotionEngine, isVisible }) => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('session');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  useEffect(() => {
    if (!emotionEngine || !isVisible) return;

    const updateAnalytics = () => {
      try {
        const data = emotionEngine.getEmotionAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error getting emotion analytics:', error);
      }
    };

    // Initial update
    updateAnalytics();

    // Set up refresh interval
    const interval = setInterval(updateAnalytics, refreshInterval);

    return () => clearInterval(interval);
  }, [emotionEngine, isVisible, refreshInterval]);

  if (!isVisible || !analytics) {
    return null;
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      sarcasm: '#ff6b6b',
      frustration: '#ff8e8e',
      enthusiasm: '#51cf66',
      excitement: '#74c0fc',
      confidence: '#69db7c',
      concern: '#ffd43b',
      politeLie: '#9775fa',
      sadness: '#748ffc',
      neutral: '#868e96'
    };
    return colors[emotion] || '#868e96';
  };

  const getStrengthIndicator = (strength) => {
    const indicators = {
      'very-strong': '████████████',
      'strong': '████████',
      'moderate': '██████',
      'mild': '████',
      'weak': '██'
    };
    return indicators[strength] || '██';
  };

  return (
    <div className="emotion-analytics-dashboard">
      <div className="analytics-header">
        <h3>🧠 Emotion Analytics Dashboard</h3>
        <div className="analytics-controls">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-selector"
          >
            <option value="session">Full Session</option>
            <option value="30min">Last 30 Minutes</option>
            <option value="5min">Last 5 Minutes</option>
          </select>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-selector"
          >
            <option value={1000}>1s refresh</option>
            <option value={5000}>5s refresh</option>
            <option value={10000}>10s refresh</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Current State Card */}
        <div className="analytics-card current-state">
          <h4>🎭 Current State</h4>
          <div className="current-emotion">
            <span 
              className="emotion-badge"
              style={{ backgroundColor: getEmotionColor(analytics.currentState.detected) }}
            >
              {analytics.currentState.detected}
            </span>
            <div className="confidence-info">
              <span className="confidence-score">{Math.round(analytics.currentState.confidence)}%</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ 
                    width: `${analytics.currentState.confidence}%`,
                    backgroundColor: getEmotionColor(analytics.currentState.detected)
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          {analytics.currentState.emotionStrength && (
            <div className="emotion-strength">
              <span>Intensity: </span>
              <span className="strength-indicator">
                {getStrengthIndicator(analytics.currentState.emotionStrength)}
              </span>
              <span className="strength-label">{analytics.currentState.emotionStrength}</span>
            </div>
          )}

          {analytics.currentState.secondaryEmotions && analytics.currentState.secondaryEmotions.length > 0 && (
            <div className="secondary-emotions">
              <h5>Secondary Emotions:</h5>
              {analytics.currentState.secondaryEmotions.map((emotion, idx) => (
                <div key={idx} className="secondary-emotion">
                  <span 
                    className="emotion-dot"
                    style={{ backgroundColor: getEmotionColor(emotion.emotion) }}
                  ></span>
                  {emotion.emotion} ({emotion.confidence}%)
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Statistics Card */}
        <div className="analytics-card session-stats">
          <h4>📊 Session Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">{formatDuration(analytics.sessionDuration)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Analyses:</span>
              <span className="stat-value">{analytics.totalAnalyses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Confidence:</span>
              <span className="stat-value">{Math.round(analytics.averageSessionConfidence)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transitions:</span>
              <span className="stat-value">{analytics.emotionTransitions?.length || 0}</span>
            </div>
          </div>
          
          {analytics.calculatedInsights?.sessionSummary && (
            <div className="session-summary">
              <p>Analysis every {analytics.calculatedInsights.sessionSummary.analysisFrequency}s</p>
            </div>
          )}
        </div>

        {/* Emotion Distribution Card */}
        <div className="analytics-card emotion-distribution">
          <h4>📈 Emotion Distribution</h4>
          <div className="distribution-chart">
            {Object.entries(analytics.emotionDistribution || {}).map(([emotion, data]) => (
              <div key={emotion} className="distribution-item">
                <div className="emotion-label">
                  <span 
                    className="emotion-color"
                    style={{ backgroundColor: getEmotionColor(emotion) }}
                  ></span>
                  {emotion}
                </div>
                <div className="percentage-bar">
                  <div 
                    className="percentage-fill"
                    style={{ 
                      width: `${data.percentage}%`,
                      backgroundColor: getEmotionColor(emotion)
                    }}
                  ></div>
                </div>
                <span className="percentage-text">{data.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trends Card */}
        <div className="analytics-card trends">
          <h4>📉 Trends & Patterns</h4>
          
          {analytics.recentTrend && (
            <div className="trend-item">
              <span className="trend-label">Pattern:</span>
              <span className="trend-value">{analytics.recentTrend.pattern || 'Analyzing...'}</span>
            </div>
          )}
          
          {analytics.calculatedInsights?.emotionalVolatility !== undefined && (
            <div className="trend-item">
              <span className="trend-label">Volatility:</span>
              <span className="trend-value">
                {(analytics.calculatedInsights.emotionalVolatility * 100).toFixed(1)}%
              </span>
            </div>
          )}
          
          {analytics.calculatedInsights?.confidenceTrend && (
            <div className="trend-item">
              <span className="trend-label">Confidence Trend:</span>
              <span className={`trend-value trend-${analytics.calculatedInsights.confidenceTrend}`}>
                {analytics.calculatedInsights.confidenceTrend}
              </span>
            </div>
          )}

          {analytics.calculatedInsights?.dominantEmotion && (
            <div className="trend-item">
              <span className="trend-label">Dominant:</span>
              <span 
                className="emotion-badge small"
                style={{ backgroundColor: getEmotionColor(analytics.calculatedInsights.dominantEmotion[0]) }}
              >
                {analytics.calculatedInsights.dominantEmotion[0]} 
                ({analytics.calculatedInsights.dominantEmotion[1]})
              </span>
            </div>
          )}
        </div>

        {/* Insights Card */}
        <div className="analytics-card insights">
          <h4>💡 Insights</h4>
          <div className="insights-list">
            {analytics.insights && analytics.insights.length > 0 ? (
              analytics.insights.map((insight, idx) => (
                <div key={idx} className="insight-item">
                  <span className="insight-icon">💡</span>
                  <span className="insight-text">{insight}</span>
                </div>
              ))
            ) : (
              <div className="no-insights">
                <span>Continue analyzing to generate insights...</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Timeline Card */}
        <div className="analytics-card timeline">
          <h4>⏱️ Recent Activity</h4>
          <div className="timeline-container">
            {analytics.emotionTrends?.[selectedTimeframe === '5min' ? 'last5Minutes' : 
                                       selectedTimeframe === '30min' ? 'last30Minutes' : 
                                       'sessionOverall']?.slice(-10).map((entry, idx) => (
              <div key={idx} className="timeline-entry">
                <div className="timeline-time">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
                <div className="timeline-emotion">
                  <span 
                    className="emotion-dot"
                    style={{ backgroundColor: getEmotionColor(entry.emotion) }}
                  ></span>
                  {entry.emotion}
                  <span className="timeline-confidence">({entry.confidence}%)</span>
                </div>
              </div>
            )) || (
              <div className="no-timeline">
                <span>No recent activity data</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="analytics-footer">
        <div className="quick-actions">
          <button 
            className="action-btn"
            onClick={() => {
              const data = emotionEngine.getEmotionAnalytics();
              console.log('Full Analytics Data:', data);
            }}
          >
            📋 Export Data
          </button>
          <button 
            className="action-btn"
            onClick={() => {
              emotionEngine.emotionAnalytics.emotionCounts = {};
              emotionEngine.emotionAnalytics.totalAnalyses = 0;
              emotionEngine.emotionHistory = [];
              emotionEngine.emotionStream = [];
            }}
          >
            🗑️ Clear History
          </button>
          <button 
            className="action-btn"
            onClick={() => {
              const summary = emotionEngine.generateSessionSummary();
              alert(`Session Summary:\n${JSON.stringify(summary, null, 2)}`);
            }}
          >
            📈 Session Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalytics;
