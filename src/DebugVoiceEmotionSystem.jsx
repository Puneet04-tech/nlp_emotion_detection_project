import React, { useState, useEffect } from 'react';

function DebugVoiceEmotionSystem() {
  const [apiStatus, setApiStatus] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Test API keys
    const testApiKeys = async () => {
      const status = {};
      const errorList = [];

      // Test OpenAI
      try {
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.REACT_APP_OPENAI_API_KEY;
        if (openaiKey && openaiKey !== 'your-openai-key') {
          status.openai = '✅ API Key Found';
        } else {
          status.openai = '❌ API Key Missing';
          errorList.push('OpenAI API key not configured');
        }
      } catch (error) {
        status.openai = '❌ Error checking OpenAI';
        errorList.push(`OpenAI check error: ${error.message}`);
      }

      // Test HuggingFace
      try {
        const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || import.meta.env.REACT_APP_HUGGINGFACE_API_KEY;
        if (hfKey && hfKey !== 'your-huggingface-key') {
          status.huggingface = '✅ API Key Found';
        } else {
          status.huggingface = '❌ API Key Missing';
          errorList.push('HuggingFace API key not configured');
        }
      } catch (error) {
        status.huggingface = '❌ Error checking HuggingFace';
        errorList.push(`HuggingFace check error: ${error.message}`);
      }

      setApiStatus(status);
      setErrors(errorList);
    };

    testApiKeys();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f5f5f5' }}>
      <h2>🔍 Voice Emotion System Debug</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>API Keys Status:</h3>
        {Object.entries(apiStatus).map(([api, status]) => (
          <div key={api} style={{ margin: '5px 0' }}>
            <strong>{api.toUpperCase()}:</strong> {status}
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: '20px', color: 'red' }}>
          <h3>❌ Errors Found:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <div>VITE_OPENAI_API_KEY: {import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not Set'}</div>
        <div>VITE_HUGGINGFACE_API_KEY: {import.meta.env.VITE_HUGGINGFACE_API_KEY ? 'Set' : 'Not Set'}</div>
        <div>REACT_APP_OPENAI_API_KEY: {import.meta.env.REACT_APP_OPENAI_API_KEY ? 'Set' : 'Not Set'}</div>
        <div>REACT_APP_HUGGINGFACE_API_KEY: {import.meta.env.REACT_APP_HUGGINGFACE_API_KEY ? 'Set' : 'Not Set'}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Check if API keys are properly set in your .env file</li>
          <li>Make sure the .env file is in the root directory</li>
          <li>Restart the development server after changing .env</li>
          <li>Check browser console for JavaScript errors</li>
          <li>Try uploading a small audio file to test functionality</li>
        </ol>
      </div>
    </div>
  );
}

export default DebugVoiceEmotionSystem;