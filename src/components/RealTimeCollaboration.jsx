// Step 5: Real-time Collaboration & Multi-User Support
// Advanced real-time features for collaborative analysis

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './RealTimeCollaboration.css';

// Simulated WebSocket connection for real-time features
class CollaborationManager {
  constructor() {
    this.listeners = new Map();
    this.users = new Map();
    this.isConnected = false;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  connect() {
    // Simulate connection
    setTimeout(() => {
      this.isConnected = true;
      this.emit('connected', { sessionId: this.sessionId });
    }, 1000);
  }

  disconnect() {
    this.isConnected = false;
    this.emit('disconnected');
  }

  addUser(user) {
    this.users.set(user.id, user);
    this.emit('userJoined', user);
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    this.users.delete(userId);
    this.emit('userLeft', user);
  }

  shareAnalysis(analysis) {
    this.emit('analysisShared', {
      analysis,
      userId: 'current_user',
      timestamp: Date.now()
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// User Avatar Component
const UserAvatar = ({ user, isOnline = true, size = 40 }) => (
  <div 
    className="user-avatar"
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: user.color || '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: size * 0.4,
      position: 'relative',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}
    title={user.name}
  >
    {user.name.charAt(0).toUpperCase()}
    {isOnline && (
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: size * 0.25,
        height: size * 0.25,
        borderRadius: '50%',
        background: '#10b981',
        border: '2px solid white'
      }} />
    )}
  </div>
);

// Real-time Activity Indicator
const ActivityIndicator = ({ activity, timestamp }) => (
  <div className="activity-indicator" style={{
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '16px',
    marginBottom: '8px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    animation: 'slideInRight 0.3s ease-out'
  }}>
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#10b981',
      marginRight: '8px',
      animation: 'pulse 2s infinite'
    }} />
    <span style={{ fontSize: '0.9em', color: '#1f2937' }}>
      {activity}
    </span>
    <span style={{ 
      fontSize: '0.8em', 
      color: '#64748b',
      marginLeft: 'auto'
    }}>
      {new Date(timestamp).toLocaleTimeString()}
    </span>
  </div>
);

// Shared Analysis Card
const SharedAnalysisCard = ({ analysis, user, onView, onComment }) => (
  <div className="shared-analysis-card" style={{
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
      <UserAvatar user={user} size={32} />
      <div style={{ marginLeft: '12px', flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#1f2937' }}>
          {user.name}
        </div>
        <div style={{ fontSize: '0.8em', color: '#64748b' }}>
          {new Date(analysis.timestamp).toLocaleString()}
        </div>
      </div>
      <button
        onClick={() => onView(analysis)}
        style={{
          padding: '6px 12px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8em',
          cursor: 'pointer'
        }}
      >
        View
      </button>
    </div>
    
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '0.9em', color: '#4b5563', marginBottom: '4px' }}>
        Detected Emotion: <strong style={{ color: analysis.emotion.color }}>
          {analysis.emotion.type}
        </strong>
      </div>
      <div style={{ fontSize: '0.8em', color: '#64748b' }}>
        Confidence: {analysis.confidence}% | Processing: {analysis.processingTime}ms
      </div>
    </div>
    
    <div style={{
      display: 'flex',
      gap: '8px'
    }}>
      <button
        onClick={() => onComment(analysis)}
        style={{
          padding: '4px 8px',
          background: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.8em',
          cursor: 'pointer',
          color: '#6b7280'
        }}
      >
        💬 Comment
      </button>
      <button
        style={{
          padding: '4px 8px',
          background: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.8em',
          cursor: 'pointer',
          color: '#6b7280'
        }}
      >
        ⭐ Star
      </button>
    </div>
  </div>
);

// Main Real-time Collaboration Component
const RealTimeCollaboration = ({ currentAnalysis, onAnalysisUpdate }) => {
  const [collaborationManager] = useState(() => new CollaborationManager());
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [sharedAnalyses, setSharedAnalyses] = useState([]);
  const [realtimeActivities, setRealtimeActivities] = useState([]);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // Initialize collaboration
  useEffect(() => {
    collaborationManager.on('connected', ({ sessionId }) => {
      setIsConnected(true);
      setRealtimeActivities(prev => [{
        activity: `Connected to session ${sessionId}`,
        timestamp: Date.now()
      }, ...prev]);
    });

    collaborationManager.on('userJoined', (user) => {
      setActiveUsers(prev => new Map(prev.set(user.id, user)));
      setRealtimeActivities(prev => [{
        activity: `${user.name} joined the session`,
        timestamp: Date.now()
      }, ...prev]);
    });

    collaborationManager.on('userLeft', (user) => {
      setActiveUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(user.id);
        return newMap;
      });
      setRealtimeActivities(prev => [{
        activity: `${user.name} left the session`,
        timestamp: Date.now()
      }, ...prev]);
    });

    collaborationManager.on('analysisShared', ({ analysis, userId }) => {
      setSharedAnalyses(prev => [analysis, ...prev]);
      setRealtimeActivities(prev => [{
        activity: `New analysis shared: ${analysis.emotion.type}`,
        timestamp: Date.now()
      }, ...prev]);
    });

    collaborationManager.connect();

    // Simulate some users joining
    setTimeout(() => {
      collaborationManager.addUser({
        id: 'user1',
        name: 'Alice Johnson',
        color: '#8b5cf6'
      });
    }, 2000);

    setTimeout(() => {
      collaborationManager.addUser({
        id: 'user2',
        name: 'Bob Smith',
        color: '#10b981'
      });
    }, 3000);

    return () => {
      collaborationManager.disconnect();
    };
  }, [collaborationManager]);

  // Share current analysis
  const shareCurrentAnalysis = useCallback(() => {
    if (currentAnalysis && isConnected) {
      const sharedAnalysis = {
        id: Date.now(),
        emotion: {
          type: currentAnalysis.fast?.basicSentiment || 'neutral',
          color: '#3b82f6'
        },
        confidence: Math.round(Math.random() * 40 + 60),
        processingTime: Math.round(Math.random() * 500 + 200),
        timestamp: Date.now(),
        text: currentAnalysis.text || 'Sample analysis text...'
      };

      collaborationManager.shareAnalysis(sharedAnalysis);
    }
  }, [currentAnalysis, isConnected, collaborationManager]);

  const handleViewSharedAnalysis = (analysis) => {
    // View shared analysis details
    console.log('Viewing shared analysis:', analysis);
  };

  const handleCommentOnAnalysis = (analysis) => {
    // Add comment functionality
    console.log('Adding comment to analysis:', analysis);
  };

  return (
    <div className="realtime-collaboration">
      {/* Collaboration Toggle Button */}
      <button
        onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
        className="collaboration-toggle"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: isConnected ? '#10b981' : '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        title={isConnected ? 'Collaboration Active' : 'Collaboration Offline'}
      >
        {isConnected ? '👥' : '🔌'}
      </button>

      {/* Collaboration Panel */}
      {showCollaborationPanel && (
        <div className="collaboration-panel" style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          width: '400px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 999,
          overflow: 'hidden',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, flex: 1 }}>
                🤝 Collaboration Hub
              </h3>
              <button
                onClick={() => setShowCollaborationPanel(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#ef4444'
              }} />
              <span style={{ fontSize: '0.9em' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Panel Content */}
          <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Active Users */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
                Active Users ({activeUsers.size})
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Array.from(activeUsers.values()).map(user => (
                  <UserAvatar key={user.id} user={user} size={36} />
                ))}
                {activeUsers.size === 0 && (
                  <div style={{ color: '#64748b', fontSize: '0.9em' }}>
                    No other users online
                  </div>
                )}
              </div>
            </div>

            {/* Share Analysis */}
            {currentAnalysis && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
                  Share Current Analysis
                </h4>
                <button
                  onClick={shareCurrentAnalysis}
                  disabled={!isConnected}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: isConnected ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    fontSize: '0.9em',
                    fontWeight: 500
                  }}
                >
                  📤 Share Analysis Results
                </button>
              </div>
            )}

            {/* Real-time Activities */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
                Recent Activity
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {realtimeActivities.slice(0, 10).map((activity, index) => (
                  <ActivityIndicator
                    key={index}
                    activity={activity.activity}
                    timestamp={activity.timestamp}
                  />
                ))}
                {realtimeActivities.length === 0 && (
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '0.9em',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            {/* Shared Analyses */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
                Shared Analyses ({sharedAnalyses.length})
              </h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {sharedAnalyses.map(analysis => (
                  <SharedAnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    user={Array.from(activeUsers.values())[Math.floor(Math.random() * activeUsers.size)] || { name: 'Unknown', color: '#6b7280' }}
                    onView={handleViewSharedAnalysis}
                    onComment={handleCommentOnAnalysis}
                  />
                ))}
                {sharedAnalyses.length === 0 && (
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '0.9em',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    No shared analyses yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeCollaboration;
