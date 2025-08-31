// Simple Three Scene Component (placeholder)
import React from 'react';

const ThreeScene = () => {
  return (
    <div 
      style={{
        width: '100%',
        height: '200px',
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem',
        margin: '20px 0'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎨</div>
        <div>3D Visualization Scene</div>
        <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
          Interactive 3D elements will appear here
        </div>
      </div>
    </div>
  );
};

export default ThreeScene;
