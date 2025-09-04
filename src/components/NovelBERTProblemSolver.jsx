import React, { useState, useRef, useEffect } from 'react';

/**
 * Novel BERT Real-World Problem Solver
 * Advanced testing interface for practical AI applications
 */
const NovelBERTProblemSolver = () => {
  const [novelBERT, setNovelBERT] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState({ bertLoaded: false, ready: false });
  const [testInput, setTestInput] = useState('I am feeling overwhelmed with work deadlines and I really need help managing this stress');
  const [selectedDomain, setSelectedDomain] = useState('business');
  const [contextData, setContextData] = useState({
    userId: 'user_001',
    timestamp: Date.now(),
    urgency: false,
    conversationHistory: []
  });

  // Real-world test scenarios
  const realWorldScenarios = [
    {
      domain: 'healthcare',
      scenario: 'Patient Communication',
      text: 'I have been experiencing severe chest pain for the past hour, and I am really worried',
      context: { urgency: true, symptoms: ['chest pain'], duration: 'acute' },
      expectedOutcome: 'High concern detection, immediate action recommendation'
    },
    {
      domain: 'education',
      scenario: 'Student Struggling',
      text: 'I don\'t understand this calculus problem at all, and I have an exam tomorrow',
      context: { subject: 'mathematics', deadline: 'urgent', difficulty: 'high' },
      expectedOutcome: 'Confusion detection, learning support recommendations'
    },
    {
      domain: 'mentalHealth',
      scenario: 'Mental Health Support',
      text: 'I feel like everything is falling apart and I can\'t handle anything anymore',
      context: { riskFactors: ['overwhelm'], support: 'needed' },
      expectedOutcome: 'Overwhelm detection, support resources recommendation'
    },
    {
      domain: 'business',
      scenario: 'Workplace Stress',
      text: 'The project deadline is tomorrow and we are nowhere near completion, this is a disaster',
      context: { deadline: 'critical', stress: 'high', teamWork: true },
      expectedOutcome: 'Urgency and pressure detection, resource allocation advice'
    },
    {
      domain: 'customerSupport',
      scenario: 'Escalated Customer',
      text: 'This is completely unacceptable! I want to speak to your manager immediately!',
      context: { escalation: true, satisfaction: 'low', priority: 'high' },
      expectedOutcome: 'Escalation detection, immediate supervisor involvement'
    },
    {
      domain: 'social',
      scenario: 'Relationship Conflict',
      text: 'We had a huge argument and now I don\'t know how to fix our friendship',
      context: { relationship: 'friendship', conflict: true, resolution: 'seeking' },
      expectedOutcome: 'Conflict detection, harmony restoration suggestions'
    }
  ];

  // Advanced analysis features
  const analysisFeatures = [
    'Multi-Modal Fusion',
    'Real-Time Learning',
    'Context Memory',
    'Domain Adaptation',
    'Temporal Patterns',
    'User Personalization'
  ];

  useEffect(() => {
    const initializeNovelBERT = async () => {
      console.log('🚀 Initializing Novel BERT Enhancement System...');
      setModelStatus({ bertLoaded: false, ready: false });
      
      try {
        const { default: NovelBERTClass } = await import('../utils/novelBERTEnhancementSystem.js');
        
        if (!NovelBERTClass) {
          throw new Error('NovelBERTEnhancementSystem not exported');
        }
        
        console.log('📦 NovelBERT class loaded, creating instance...');
        const novelBERTInstance = new NovelBERTClass();
        
        console.log('🔧 Initializing BERT models...');
        await novelBERTInstance.init();
        
        // Get actual model status
        const actualStatus = novelBERTInstance.getModelStatus();
        console.log('📊 Actual BERT status:', actualStatus);
        
        console.log('✅ Novel BERT initialization complete');
        setNovelBERT(novelBERTInstance);
        setModelStatus({
          bertLoaded: actualStatus.bertLoaded,
          ready: actualStatus.ready,
          fallbackMode: actualStatus.fallbackMode
        });
        
      } catch (error) {
        console.error('❌ Novel BERT initialization failed:', error.message);
        setModelStatus({ bertLoaded: false, ready: false, fallbackMode: true });
        
        // Create fallback
        setNovelBERT({
          analyzeForRealWorldProblems: async (text, context) => {
            console.log('📋 Using component fallback analysis for:', text);
            return {
              emotions: { 
                concern: 0.6, 
                neutral: 0.4,
                stress: text.toLowerCase().includes('stress') ? 0.8 : 0.2
              },
              recommendations: { 
                support: [{ 
                  action: 'Consider seeking professional support', 
                  priority: 'medium',
                  type: 'support'
                }] 
              },
              confidence: 0.5,
              domain: context.domain || 'general',
              bertEnhanced: false,
              analysisMethod: 'Component Fallback'
            };
          },
          updateContextMemory: (data) => {
            console.log('📝 Fallback: Context memory update called');
          },
          getModelStatus: () => ({
            bertLoaded: false,
            ready: false,
            fallbackMode: true
          })
        });
      }
    };
    
    initializeNovelBERT();
  }, []);

  const analyzeRealWorldProblem = async (text, context = {}) => {
    if (!novelBERT) {
      console.error('❌ NovelBERT not available');
      setAnalysis({ error: 'System not ready. Please wait or refresh.' });
      return;
    }
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      console.log('🌍 Analyzing real-world problem:', text);
      console.log('📋 Context:', context);
      const fullContext = { ...contextData, ...context, domain: selectedDomain };
      
      // Check if novelBERT has the required method
      if (typeof novelBERT.analyzeForRealWorldProblems !== 'function') {
        throw new Error('analyzeForRealWorldProblems method not available');
      }
      
      const result = await novelBERT.analyzeForRealWorldProblems(text, fullContext);
      
      console.log('🔍 Raw Novel BERT result:', result);
      
      // Validate emotions
      if (result && result.emotions) {
        console.log('✅ Found emotions:', Object.keys(result.emotions));
        console.log('📊 Emotion scores:', result.emotions);
      } else {
        console.warn('⚠️ No emotions found in result');
      }
      
      setAnalysis(result);
      
      // Update context memory (with safety check)
      if (novelBERT && typeof novelBERT.updateContextMemory === 'function') {
        novelBERT.updateContextMemory({
          text,
          result,
          timestamp: Date.now(),
          domain: selectedDomain
        });
      } else {
        console.warn('⚠️ updateContextMemory method not available');
      }
      
      console.log('🎯 Final real-world analysis result:', result);
    } catch (error) {
      console.error('❌ Real-world analysis failed:', error);
      setAnalysis({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const runScenario = (scenario) => {
    setTestInput(scenario.text);
    setSelectedDomain(scenario.domain);
    setContextData(prev => ({ ...prev, ...scenario.context }));
    analyzeRealWorldProblem(scenario.text, scenario.context);
  };

  const formatEmotionScore = (score) => {
    // Handle invalid values
    if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
      return '0.0%';
    }
    
    // Ensure score is between 0 and 1
    const normalizedScore = Math.max(0, Math.min(1, score));
    return (normalizedScore * 100).toFixed(1) + '%';
  };

  const getRecommendationIcon = (type) => {
    const icons = {
      immediate: '🚨',
      support: '🤝',
      engagement: '🎯',
      connection: '🔗',
      resolution: '✅',
      critical: '⚠️'
    };
    return icons[type] || '💡';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#65a30d'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
      borderRadius: '15px',
      color: 'white',
      minHeight: '100vh'
    }}>
      {/* Add advanced CSS */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .analysis-card {
            animation: slideIn 0.5s ease-out;
          }
          
          .feature-badge {
            transition: all 0.3s ease;
          }
          
          .feature-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          
          .recommendation-item {
            transition: all 0.3s ease;
          }
          
          .recommendation-item:hover {
            background: rgba(255,255,255,0.1);
            transform: translateX(5px);
          }
        `}
      </style>

      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5em' }}>
        🌟 Novel BERT Real-World Problem Solver
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.2em', opacity: 0.9 }}>
        Advanced AI system for practical problem solving across domains
      </p>

      {/* System Status */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: modelStatus.bertLoaded && !modelStatus.fallbackMode ? '#10b981' : 
                        modelStatus.fallbackMode ? '#f59e0b' : '#ef4444',
            margin: '0 auto 8px',
            animation: modelStatus.ready ? 'none' : 'pulse 2s infinite'
          }}></div>
          <span>
            BERT Model: {
              modelStatus.bertLoaded && !modelStatus.fallbackMode ? '✅ Active' : 
              modelStatus.fallbackMode ? '⚠️ Fallback' : '❌ Failed'
            }
          </span>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <span>🎯 Domains: {modelStatus.domainsSupported?.length || 6}</span>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <span>⚡ Features: {modelStatus.featuresActive?.length || 4} Active</span>
        </div>
      </div>

      {/* Advanced Features */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>🚀 Novel Features</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {analysisFeatures.map((feature, index) => (
            <div key={feature} className="feature-badge" style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              borderRadius: '20px',
              padding: '8px 16px',
              textAlign: 'center',
              fontSize: '0.9em'
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Domain Selection */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🎯 Problem Domain</h3>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            background: 'white',
            color: '#1f2937'
          }}
        >
          <option value="healthcare">🏥 Healthcare Communication</option>
          <option value="education">🎓 Educational Support</option>
          <option value="mentalHealth">🧠 Mental Health Support</option>
          <option value="business">💼 Business Communication</option>
          <option value="customerSupport">📞 Customer Support</option>
          <option value="social">👥 Social Interaction</option>
        </select>
      </div>

      {/* Input Section */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>💬 Problem Description</h3>
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '15px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder="Describe the real-world problem or situation..."
        />
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => analyzeRealWorldProblem(testInput)}
            disabled={isLoading || !testInput.trim()}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Analyze Problem'}
          </button>
          
          <button
            onClick={() => {
              setTestInput('');
              setAnalysis(null);
            }}
            style={{
              background: 'rgba(107, 114, 128, 0.8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Real-World Scenarios */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🌍 Real-World Test Scenarios</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {realWorldScenarios.map((scenario, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => runScenario(scenario)}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
              e.target.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {scenario.scenario}
              </div>
              <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '8px' }}>
                {scenario.text.substring(0, 80)}...
              </div>
              <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                Expected: {scenario.expectedOutcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-card" style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#1f2937',
          borderRadius: '15px',
          padding: '25px',
          marginTop: '20px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1e40af' }}>
            🎯 Real-World Problem Analysis
          </h2>
          
          {analysis.error ? (
            <div style={{ color: '#dc2626', padding: '15px', background: '#fef2f2', borderRadius: '8px' }}>
              ❌ Error: {analysis.error}
            </div>
          ) : (
            <div>
              {/* Domain and Confidence */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
              }}>
                <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
                  <strong>Domain:</strong> {analysis.domain || 'Unknown'}
                </div>
                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                  <strong>Confidence:</strong> {formatEmotionScore(analysis.confidence || 0)}
                </div>
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px' }}>
                  <strong>Enhancement:</strong> {analysis.bertEnhanced ? '🤖 BERT' : '📋 Fallback'}
                </div>
              </div>

              {/* Detected Emotions */}
              {analysis.emotions && Object.keys(analysis.emotions).length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#1e40af' }}>🎭 Detected Emotions</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '12px'
                  }}>
                    {Object.entries(analysis.emotions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 8)
                      .map(([emotion, score]) => (
                        <div key={emotion} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}>
                            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                              {emotion}
                            </span>
                            <span style={{ fontWeight: 'bold', color: '#059669' }}>
                              {formatEmotionScore(score)}
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${score * 100}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #10b981, #059669)',
                              transition: 'width 0.8s ease'
                            }} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#1e40af' }}>💡 Recommendations</h3>
                  {Object.entries(analysis.recommendations).map(([category, recommendations]) => (
                    recommendations.length > 0 && (
                      <div key={category} style={{ marginBottom: '20px' }}>
                        <h4 style={{
                          marginBottom: '10px',
                          color: '#374151',
                          textTransform: 'capitalize'
                        }}>
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div style={{
                          display: 'grid',
                          gap: '8px'
                        }}>
                          {recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-item" style={{
                              background: '#f9fafb',
                              border: `2px solid ${getPriorityColor(rec.priority)}`,
                              borderRadius: '8px',
                              padding: '12px',
                              borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px'
                              }}>
                                <span>{getRecommendationIcon(rec.type)}</span>
                                <span style={{
                                  background: getPriorityColor(rec.priority),
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.8em',
                                  fontWeight: 'bold'
                                }}>
                                  {rec.priority?.toUpperCase()}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.95em', lineHeight: '1.4' }}>
                                {rec.action}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Advanced Features Display */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                {analysis.multiModalFusion && (
                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
                    <strong>🔄 Multi-Modal:</strong> {analysis.multiModalFusion}
                  </div>
                )}
                {analysis.personalizedLearning && (
                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                    <strong>🧠 Learning:</strong> Active
                  </div>
                )}
                {analysis.emotionalTrajectory && (
                  <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px' }}>
                    <strong>📈 Trajectory:</strong> {analysis.emotionalTrajectory.trend}
                  </div>
                )}
                {analysis.domainFusion && (
                  <div style={{ background: '#fdf4ff', padding: '12px', borderRadius: '8px' }}>
                    <strong>🎯 Domain:</strong> Optimized
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Statistics */}
      {analysis && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>📊 Analysis Summary</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                {Object.keys(analysis.emotions || {}).length}
              </div>
              <div style={{ opacity: 0.8 }}>Emotions Detected</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                {analysis.recommendations ? 
                  Object.values(analysis.recommendations).flat().length : 0}
              </div>
              <div style={{ opacity: 0.8 }}>Recommendations</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                {analysis.confidence ? Math.round(analysis.confidence * 100) : 0}%
              </div>
              <div style={{ opacity: 0.8 }}>Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelBERTProblemSolver;
