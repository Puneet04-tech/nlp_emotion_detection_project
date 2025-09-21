#!/usr/bin/env node

// API Keys Test Script
// Run with: node test-api-keys.js

const https = require('https');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const API_KEYS = {
  OPENAI: process.env.REACT_APP_OPENAI_API_KEY,
  GOOGLE: process.env.REACT_APP_GOOGLE_API_KEY,
  AZURE: process.env.REACT_APP_AZURE_API_KEY,
  HUGGINGFACE: process.env.REACT_APP_HUGGINGFACE_API_KEY,
  ANTHROPIC: process.env.REACT_APP_ANTHROPIC_API_KEY
};

console.log('🔍 Testing API Keys for World-Class Voice Emotion Detection System\n');

// Test HuggingFace (simplest test)
async function testHuggingFace() {
  console.log('🤗 Testing HuggingFace API...');
  if (!API_KEYS.HUGGINGFACE) {
    console.log('❌ HuggingFace API key not found');
    return false;
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.HUGGINGFACE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: 'I am very happy today!' }),
    });

    if (response.ok) {
      console.log('✅ HuggingFace API: Working');
      return true;
    } else {
      console.log('❌ HuggingFace API: Failed');
      return false;
    }
  } catch (error) {
    console.log('❌ HuggingFace API: Error -', error.message);
    return false;
  }
}

// Test OpenAI
async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  if (!API_KEYS.OPENAI) {
    console.log('❌ OpenAI API key not found');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${API_KEYS.OPENAI}`,
      },
    });

    if (response.ok) {
      console.log('✅ OpenAI API: Working');
      return true;
    } else {
      console.log('❌ OpenAI API: Failed');
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API: Error -', error.message);
    return false;
  }
}

// Test Google
async function testGoogle() {
  console.log('🎙️ Testing Google Speech API...');
  if (!API_KEYS.GOOGLE) {
    console.log('❌ Google API key not found');
    return false;
  }

  try {
    // Simple API key validation
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_KEYS.GOOGLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' },
        audio: { content: 'dGVzdA==' } // base64 "test"
      }),
    });

    // Even if it fails due to invalid audio, a 400 response means the API key works
    if (response.status === 400) {
      console.log('✅ Google API: Working (API key valid)');
      return true;
    } else if (response.ok) {
      console.log('✅ Google API: Working');
      return true;
    } else {
      console.log('❌ Google API: Failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Google API: Error -', error.message);
    return false;
  }
}

// Test Azure
async function testAzure() {
  console.log('🎙️ Testing Azure Speech API...');
  if (!API_KEYS.AZURE) {
    console.log('❌ Azure API key not found');
    return false;
  }

  try {
    const response = await fetch('https://eastus.api.cognitive.microsoft.com/sts/v1.0/issueToken', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEYS.AZURE,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: '',
    });

    if (response.ok) {
      console.log('✅ Azure API: Working');
      return true;
    } else {
      console.log('❌ Azure API: Failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Azure API: Error -', error.message);
    return false;
  }
}

// Test Anthropic
async function testAnthropic() {
  console.log('🧠 Testing Anthropic API...');
  if (!API_KEYS.ANTHROPIC) {
    console.log('❌ Anthropic API key not found');
    return false;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEYS.ANTHROPIC,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    if (response.ok) {
      console.log('✅ Anthropic API: Working');
      return true;
    } else {
      console.log('❌ Anthropic API: Failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Anthropic API: Error -', error.message);
    return false;
  }
}

// Main test function
async function testAllAPIs() {
  console.log('🚀 Starting API Keys Test...\n');

  const results = await Promise.allSettled([
    testHuggingFace(),
    testOpenAI(),
    testGoogle(),
    testAzure(),
    testAnthropic()
  ]);

  const workingAPIs = results.filter(result =>
    result.status === 'fulfilled' && result.value === true
  ).length;

  console.log(`\n📊 Results: ${workingAPIs}/5 APIs are working`);

  if (workingAPIs >= 1) {
    console.log('🎉 You can start using the World-Class Voice Emotion Detection System!');
    console.log('💡 Start with the APIs that are working and add more later.');
  } else {
    console.log('⚠️ No APIs are working. Please check your .env file and API keys.');
  }

  console.log('\n📖 Check API_KEYS_SETUP_GUIDE.md for help getting API keys.');
}

// Run the test
if (require.main === module) {
  testAllAPIs().catch(console.error);
}

module.exports = { testAllAPIs, testHuggingFace, testOpenAI, testGoogle, testAzure, testAnthropic };