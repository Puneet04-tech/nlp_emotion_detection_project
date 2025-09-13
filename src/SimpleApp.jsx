import React, { useState } from 'react';
import './App-simple.css';

// Ultra-Enhanced Voice Emotion System with 18+ emotions and advanced visualizations
import VoiceEmotionSystem from './components/VoiceEmotionSystem-simple';

function SimpleApp() {
  const [activeTab, setActiveTab] = useState('voice-emotion');

  return (
    <div className="App">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px' }}>
            🚀 Ultra-Enhanced Voice Emotion Detection
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>
            Advanced AI-Powered Emotion Analysis with 18+ Emotions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <button
            className={`tab-btn ${activeTab === 'voice-emotion' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice-emotion')}
            style={{
              background: activeTab === 'voice-emotion' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              margin: '0 10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            🎭 Voice Emotion Analysis
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'voice-emotion' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <VoiceEmotionSystem 
              onEmotionDetected={(data) => {
                console.log('🎭 Ultra-Enhanced Emotion Detected:', data);
              }}
              onTrainingData={(trainingData) => {
                console.log('🎓 Training Data Received:', trainingData);
              }}
              isVisible={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleApp;
