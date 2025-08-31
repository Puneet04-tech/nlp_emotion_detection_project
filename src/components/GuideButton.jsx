import React, { useState } from "react";

const GUIDE_CONTENT = (
  <div>
    <h2>App Feature Guide</h2>
    <ul>
      <li><b>Speech-to-Text (Transcription):</b> Converts spoken audio into written text using advanced models (e.g., Vosk, browser APIs). Supports multiple languages and file types.</li>
      <li><b>Spam Detection:</b> Automatically detects and flags spam or irrelevant content in transcripts using custom logic and keyword analysis.</li>
      <li><b>Content Analysis:</b> Analyzes transcripts for key metrics: word count, unique words, speaking speed, filler words, and more.</li>
      <li><b>Summarization:</b> Generates concise summaries of transcripts, highlighting main points and important information.</li>
      <li><b>Language Selection:</b> Choose from supported languages for accurate transcription and analysis.</li>
      <li><b>Domain Selection:</b> Tailor analysis for specific domains (e.g., healthcare, education) to improve relevance and accuracy.</li>
      <li><b>File Upload & Preview:</b> Upload audio, video, or text files for analysis. Preview file details and remove files as needed.</li>
      <li><b>Live Microphone Input:</b> Record speech directly from your microphone for real-time transcription and analysis.</li>
      <li><b>Text Input:</b> Paste or type text for instant analysis and summarization.</li>
      <li><b>Processing Stats:</b> View detailed statistics: duration, word/sentence count, unique words, filler words, and more.</li>
      <li><b>Error Handling:</b> Friendly error messages and diagnostics for unsupported files, network issues, or analysis errors.</li>
      {/* Removed: Animated Background (Three.js) feature */}
      <li><b>Responsive Design:</b> Fully responsive UI for desktop and mobile devices.</li>
      <li><b>Accessibility:</b> Keyboard navigation and accessible controls for all users.</li>
    </ul>
    <p style={{marginTop: 18, fontSize: '1rem', opacity: 0.8}}>
      <b>Tip:</b> Click the tabs to switch between input modes, and use the controls to process, summarize, or analyze your content. For more help, contact the developer.
    </p>
  </div>
);

export default function GuideButton({ onClick }) {
  if (onClick) {
    return (
      <button className="guide-btn" onClick={onClick} title="Show Feature Guide">
        Guide
      </button>
    );
  }
  return (
    <a
      className="guide-btn"
      href="/guide.html"
      target="_blank"
      rel="noopener noreferrer"
      title="Show Feature Guide"
      style={{ display: 'inline-block', textDecoration: 'none' }}
    >
      Guide
    </a>
  );
}
