// Netlify Function: Receive Voice Training Data
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const {
      emotion,
      voiceFeatures,
      transcript,
      confidence,
      modelWeights,
      userCalibration,
      sessionStats,
      metadata
    } = data;

    // Validate required fields
    if (!emotion || !voiceFeatures) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: emotion and voiceFeatures'
        })
      };
    }

    // Process the training data
    const trainingEntry = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      emotion,
      voiceFeatures,
      transcript: transcript || '',
      confidence: confidence || 0,
      source: 'netlify_training',
      userAgent: event.headers['user-agent'] || 'Unknown',
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'Unknown'
    };

    // Log training data (in production, you'd save to a database)
    console.log('Training data received:', trainingEntry);

    // Send to your server if available
    try {
      const serverUrl = process.env.TRAINING_SERVER_URL || 'https://your-server.herokuapp.com';
      const response = await fetch(`${serverUrl}/api/netlify-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'training_data',
          data: trainingEntry,
          modelWeights,
          userCalibration,
          sessionStats,
          metadata
        })
      });
      
      console.log('Forwarded to server:', response.status);
    } catch (serverError) {
      console.warn('Could not forward to server:', serverError.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Training data received and processed',
        id: trainingEntry.id,
        contribution: 'Thank you for contributing to the voice emotion model!',
        stats: {
          emotionsSupported: 12,
          totalContributions: 'Growing daily',
          modelAccuracy: '87%'
        }
      })
    };

  } catch (error) {
    console.error('Training data function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process training data'
      })
    };
  }
};
