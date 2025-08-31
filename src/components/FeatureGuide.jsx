import React from 'react';
import './FeatureGuide.css';

const features = [
  {
    title: '🎙️ Speech Recognition',
    description: 'Convert your speech to text in real-time with support for multiple languages and accents.',
  },
  {
    title: '📁 File Upload',
    description: 'Upload audio, video, text, PDF, Word, and image files for automatic transcription and OCR.',
  },
  {
    title: '📝 Text Input',
    description: 'Paste or type any text to analyze, summarize, and export.',
  },
  {
    title: '🔄 Translation',
    description: 'Auto-translate transcripts between English and Hindi with a single click.',
  },
  {
    title: '📋 AI Summarization',
    description: 'Generate intelligent summaries of transcripts, documents, and uploaded files.',
  },
  {
    title: '💾 Export',
    description: 'Export your transcript and summary as a text file for easy sharing and storage.',
  },
  {
    title: '🗑️ Clear All',
    description: 'Quickly clear all content and start a new session with a single click.',
  },
  {
    title: '🌐 Language Selection',
    description: 'Choose from a variety of supported languages for speech recognition.',
  },
  {
    title: '📊 Word & Character Count',
    description: 'See real-time statistics for your transcript or uploaded text.',
  },
];

const FeatureGuide = ({ onBack }) => {
  return (
    <div className="feature-guide-overlay">
      <div className="feature-guide-header">
        <button className="feature-guide-back" onClick={onBack}>
          ← Back
        </button>
        <h2>App Features Guide</h2>
      </div>
      <div className="feature-guide-cards">
        {features.map((feature, idx) => (
          <div className="feature-card animated" key={idx} style={{ animationDelay: `${idx * 0.08 + 0.1}s` }}>
            <div className="feature-card-title">{feature.title}</div>
            <div className="feature-card-desc">{feature.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGuide; 