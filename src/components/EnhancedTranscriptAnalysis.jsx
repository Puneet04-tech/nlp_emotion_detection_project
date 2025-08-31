// Enhanced TranscriptAnalysis Component - Fast and Progressive
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getFastAnalysis, getProgressiveAnalysis, clearAnalysisCache } from '../utils/optimizedAnalyzer';
import './EnhancedTranscriptAnalysis.css';

// Loading Spinner Component
const LoadingSpinner = ({ size = 20, color = "#4f8cff" }) => (
  <div 
    className="spinner"
    style={{
      width: size,
      height: size,
      border: `3px solid ${color}33`,
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}
  />
);

// Progress Bar Component
const ProgressBar = ({ progress, message, stage }) => (
  <div className="progress-container" style={{
    background: 'linear-gradient(120deg, #2a3f5f 60%, #1e3a5f 100%)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    border: '1px solid #4f8cff'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <LoadingSpinner size={16} />
      <span style={{ color: '#4f8cff', fontWeight: 600 }}>{message}</span>
      <span style={{ color: '#7ed957', fontSize: '0.9em' }}>({progress}%)</span>
    </div>
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      height: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: `linear-gradient(90deg, #4f8cff 0%, #7ed957 ${progress}%)`,
        height: '100%',
        width: `${progress}%`,
        transition: 'width 0.3s ease',
        borderRadius: '8px'
      }} />
    </div>
  </div>
);

// Quick Stats Component
const QuickStats = ({ stats, isLoading = false }) => (
  <div className="quick-stats" style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  }}>
    <div className="stat-card" style={{
      background: 'linear-gradient(135deg, #4f8cff 0%, #7ed957 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
        {isLoading ? <LoadingSpinner color="#fff" /> : stats.wordCount.toLocaleString()}
      </div>
      <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Words</div>
    </div>
    
    <div className="stat-card" style={{
      background: 'linear-gradient(135deg, #a97fff 0%, #f76e6e 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
        {isLoading ? <LoadingSpinner color="#fff" /> : stats.sentenceCount}
      </div>
      <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Sentences</div>
    </div>
    
    <div className="stat-card" style={{
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
        {isLoading ? <LoadingSpinner color="#fff" /> : `${stats.readingTime}m`}
      </div>
      <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Reading Time</div>
    </div>
    
    <div className="stat-card" style={{
      background: stats.basicSentiment === 'sarcastic' 
        ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
        : stats.basicSentiment === 'positive'
        ? 'linear-gradient(135deg, #26c6da 0%, #43a047 100%)'
        : stats.basicSentiment === 'negative'
        ? 'linear-gradient(135deg, #ef5350 0%, #ec407a 100%)'
        : 'linear-gradient(135deg, #78909c 0%, #607d8b 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5em', fontWeight: 'bold', textTransform: 'capitalize' }}>
        {isLoading ? <LoadingSpinner color="#fff" /> : (
          <div>
            {stats.basicSentiment === 'sarcastic' ? '😏' : 
             stats.basicSentiment === 'positive' ? '😊' :
             stats.basicSentiment === 'negative' ? '😞' : '😐'} {stats.basicSentiment}
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.8em', opacity: 0.9 }}>
        {stats.sarcasmDetected && `${Math.round(stats.sarcasmConfidence * 100)}% Sarcasm`}
        {!stats.sarcasmDetected && stats.sentimentConfidence && `${Math.round(stats.sentimentConfidence * 100)}% Confidence`}
      </div>
    </div>
  </div>
);

// Key Phrases Component
const KeyPhrases = ({ phrases, isLoading = false }) => (
  <div className="key-phrases" style={{
    background: 'linear-gradient(120deg, #23272f 60%, #2a2d43 100%)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px'
  }}>
    <h3 style={{ color: '#7ed957', fontWeight: 700, marginBottom: '16px' }}>
      🔑 Key Phrases
    </h3>
    {isLoading ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LoadingSpinner />
        <span style={{ color: '#b0b0c0' }}>Extracting key phrases...</span>
      </div>
    ) : (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {phrases.map((phrase, idx) => (
          <span
            key={idx}
            style={{
              background: 'linear-gradient(90deg, #4f8cff 0%, #a97fff 100%)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.9em',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {phrase.phrase}
            <span style={{
              background: 'rgba(255,255,255,0.3)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '0.8em'
            }}>
              {phrase.count}
            </span>
          </span>
        ))}
      </div>
    )}
  </div>
);

// Sarcasm Detection Component
const SarcasmDetection = ({ sentiment, fastAnalysis, isLoading = false }) => {
  const showSarcasm = fastAnalysis?.sarcasmDetected || sentiment?.sarcasmDetected;
  
  if (!showSarcasm && !isLoading) return null;
  
  return (
    <div className="sarcasm-detection" style={{
      background: 'linear-gradient(120deg, #ff6b35 60%, #f7931e 100%)',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '24px',
      border: '2px solid #ff8f65'
    }}>
      <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        😏 Sarcasm Detected
        {fastAnalysis?.sarcasmConfidence && (
          <span style={{
            background: 'rgba(255,255,255,0.3)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8em',
            fontWeight: 600
          }}>
            {Math.round(fastAnalysis.sarcasmConfidence * 100)}% Confidence
          </span>
        )}
      </h3>
      
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LoadingSpinner color="#fff" />
          <span style={{ color: '#fff' }}>Analyzing sarcasm patterns...</span>
        </div>
      ) : (
        <div>
          <div style={{ color: '#fff', marginBottom: '12px', fontSize: '1.1em' }}>
            🎭 <strong>Analysis:</strong> This text appears to contain sarcastic elements
          </div>
          
          {sentiment?.sarcasmPatterns && sentiment.sarcasmPatterns.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ color: '#fff', fontSize: '1em', marginBottom: '8px' }}>🔍 Detected Patterns:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.9)' }}>
                {sentiment.sarcasmPatterns.slice(0, 3).map((pattern, idx) => (
                  <li key={idx} style={{ marginBottom: '4px', fontSize: '0.9em' }}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}
          
          {fastAnalysis?.reasoning && (
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.9em',
              color: 'rgba(255,255,255,0.95)'
            }}>
              <strong>💡 Why this is sarcastic:</strong> {fastAnalysis.reasoning[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sentiment Analysis Component
const SentimentAnalysis = ({ sentiment, isLoading = false }) => (
  <div className="sentiment-analysis" style={{
    background: 'linear-gradient(120deg, #2a3f5f 60%, #1e3a5f 100%)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px'
  }}>
    <h3 style={{ color: '#4f8cff', fontWeight: 700, marginBottom: '16px' }}>
      📊 Sentiment Analysis
    </h3>
    {isLoading ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LoadingSpinner />
        <span style={{ color: '#b0b0c0' }}>Analyzing sentiment...</span>
      </div>
    ) : sentiment ? (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#b0b0c0' }}>Overall Score</span>
            <span style={{ 
              color: sentiment.overallScore > 0 ? '#7ed957' : sentiment.overallScore < 0 ? '#f76e6e' : '#ffa726',
              fontWeight: 600 
            }}>
              {sentiment.overallScore > 0 ? '+' : ''}{sentiment.overallScore}
            </span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: sentiment.overallScore > 0 ? '#7ed957' : sentiment.overallScore < 0 ? '#f76e6e' : '#ffa726',
              height: '100%',
              width: `${Math.abs(sentiment.overallScore) * 50 + 50}%`,
              transition: 'width 0.5s ease',
              borderRadius: '8px'
            }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#b0b0c0' }}>
          <span>Confidence: {Math.round(sentiment.confidence * 100)}%</span>
          <span>Trend: <span style={{ color: '#7ed957', textTransform: 'capitalize' }}>{sentiment.trend}</span></span>
        </div>
      </div>
    ) : null}
  </div>
);

// Topic Analysis Component
const TopicAnalysis = ({ topics, isLoading = false }) => (
  <div className="topic-analysis" style={{
    background: 'linear-gradient(120deg, #3f2a5f 60%, #5f1e3a 100%)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '24px'
  }}>
    <h3 style={{ color: '#a97fff', fontWeight: 700, marginBottom: '16px' }}>
      🏷️ Topics & Themes
    </h3>
    {isLoading ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LoadingSpinner />
        <span style={{ color: '#b0b0c0' }}>Analyzing topics...</span>
      </div>
    ) : topics ? (
      <div>
        {topics.categories && topics.categories.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#f76e6e', fontSize: '1em', marginBottom: '8px' }}>Main Categories</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {topics.categories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'linear-gradient(90deg, #a97fff 0%, #f76e6e 100%)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '15px',
                    fontSize: '0.85em',
                    fontWeight: 500
                  }}
                >
                  {cat.category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 style={{ color: '#f76e6e', fontSize: '1em', marginBottom: '8px' }}>Top Topics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {topics.topTopics?.slice(0, 6).map((topic, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.9em'
                }}
              >
                <span style={{ color: '#e0e0e0' }}>{topic.topic}</span>
                <span style={{ 
                  color: '#a97fff', 
                  fontWeight: 600,
                  background: 'rgba(169, 127, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.8em'
                }}>
                  {topic.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : null}
  </div>
);

// Main Enhanced TranscriptAnalysis Component
const EnhancedTranscriptAnalysis = ({ transcript, isVisible, onAnalysisComplete }) => {
  const [fastAnalysis, setFastAnalysis] = useState(null);
  const [progressiveAnalysis, setProgressiveAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  
  const analysisRef = useRef(null);

  // Handle progress updates from progressive analysis
  const handleProgress = useCallback((progressValue, message, stage) => {
    setProgress(progressValue);
    setProgressMessage(message);
    setCurrentStage(stage);
  }, []);

  // Start analysis when component becomes visible
  useEffect(() => {
    if (isVisible && transcript && transcript.trim().length > 0) {
      startAnalysis();
    }
  }, [isVisible, transcript]);

  const startAnalysis = useCallback(async () => {
    if (!transcript || transcript.trim().length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setProgress(0);
    setProgressMessage('Starting analysis...');
    
    try {
      // Step 1: Get fast analysis immediately (< 100ms)
      const fast = getFastAnalysis(transcript);
      setFastAnalysis(fast);
      setProgress(15);
      setProgressMessage('Basic analysis complete');
      
      // Step 2: Start progressive analysis
      const progressive = await getProgressiveAnalysis(transcript, handleProgress);
      setProgressiveAnalysis(progressive);
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete({
          fast,
          progressive,
          transcript,
          processingTime: Date.now() - analysisStartTime
        });
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setProgressMessage('Analysis failed - using basic results');
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, handleProgress, onAnalysisComplete, analysisStartTime]);

  // Clear cache function
  const handleClearCache = () => {
    clearAnalysisCache();
    setFastAnalysis(null);
    setProgressiveAnalysis(null);
    setProgress(0);
    setProgressMessage('Cache cleared');
  };

  if (!isVisible || !transcript) {
    return null;
  }

  return (
    <div className="enhanced-transcript-analysis" ref={analysisRef} style={{
      background: 'linear-gradient(120deg, #1e2235 0%, #2a2d43 100%)',
      borderRadius: '18px',
      padding: '24px',
      marginTop: '24px',
      color: '#e6e6f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          color: '#7ed957',
          fontWeight: 800,
          fontSize: '1.5em',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Enhanced Analysis
          {isAnalyzing && <LoadingSpinner size={20} />}
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            style={{
              background: 'linear-gradient(90deg, #4f8cff 0%, #7ed957 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 600,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.6 : 1,
              fontSize: '0.9em'
            }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </button>
          
          <button
            onClick={handleClearCache}
            style={{
              background: 'linear-gradient(90deg, #f76e6e 0%, #a97fff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <ProgressBar 
          progress={progress} 
          message={progressMessage} 
          stage={currentStage} 
        />
      )}

      {/* Fast Analysis Results (shown immediately) */}
      {fastAnalysis && (
        <>
          <QuickStats stats={fastAnalysis} isLoading={!fastAnalysis} />
          
          {/* Sarcasm Detection Display */}
          <SarcasmDetection 
            sentiment={progressiveAnalysis?.sentiment}
            fastAnalysis={fastAnalysis}
            isLoading={isAnalyzing}
          />
          
          <KeyPhrases phrases={fastAnalysis.keyPhrases || []} isLoading={!fastAnalysis} />
        </>
      )}

      {/* Progressive Analysis Results (shown as they complete) */}
      {progressiveAnalysis && (
        <>
          {progressiveAnalysis.sentiment && (
            <SentimentAnalysis sentiment={progressiveAnalysis.sentiment} />
          )}
          
          {progressiveAnalysis.topics && (
            <TopicAnalysis topics={progressiveAnalysis.topics} />
          )}
          
          {progressiveAnalysis.advanced && (
            <div className="advanced-analysis" style={{
              background: 'linear-gradient(120deg, #5f3a2a 60%, #3a5f2a 100%)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#ff7f50', fontWeight: 700, marginBottom: '16px' }}>
                🔬 Advanced Patterns
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#7ed957' }}>
                    {progressiveAnalysis.advanced.averageSentenceLength}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#b0b0c0' }}>Avg Sentence Length</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#4f8cff' }}>
                    {progressiveAnalysis.advanced.complexityScore}%
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#b0b0c0' }}>Complexity Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#a97fff' }}>
                    {progressiveAnalysis.advanced.readabilityGrade}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#b0b0c0' }}>Reading Grade</div>
                </div>
              </div>
              
              {progressiveAnalysis.advanced.keyInsights && progressiveAnalysis.advanced.keyInsights.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ color: '#ff7f50', fontSize: '1em', marginBottom: '8px' }}>Key Insights</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#e0e0e0' }}>
                    {progressiveAnalysis.advanced.keyInsights.map((insight, idx) => (
                      <li key={idx} style={{ marginBottom: '4px', fontSize: '0.9em' }}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Performance Info */}
      {fastAnalysis && !isAnalyzing && (
        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: 'rgba(127, 217, 87, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(127, 217, 87, 0.3)',
          fontSize: '0.85em',
          color: '#7ed957'
        }}>
          ⚡ Analysis completed in {fastAnalysis.processingTime}ms 
          {fastAnalysis.cached && ' (cached result)'}
          {analysisStartTime && ` | Total time: ${Date.now() - analysisStartTime}ms`}
        </div>
      )}
    </div>
  );
};

export default EnhancedTranscriptAnalysis;
