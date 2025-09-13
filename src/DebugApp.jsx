import React from 'react';

// Debug App Component - Simple version to test if page loads
const DebugApp = () => {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>🔧 Debug App</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2>✅ Status Check</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Vite dev server is running</li>
          <li>✅ Basic components are loading</li>
        </ul>
      </div>
      
      <button 
        onClick={() => alert('Button clicked! JavaScript is working.')}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default DebugApp;
