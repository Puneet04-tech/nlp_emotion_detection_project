// Simple Animated Background Component
import React from 'react';

const AnimatedBackground = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: -1,
        opacity: 0.1
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
