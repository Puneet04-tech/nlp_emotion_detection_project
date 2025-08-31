import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { FaUpload, FaSpinner, FaTrash, FaDownload } from 'react-icons/fa';
import { MdImageSearch, MdAnalytics, MdTranscript, MdError } from 'react-icons/md';

const TextOCR = ({ onTextExtracted, onAnalysisComplete }) => {
  console.log('🔥 TextOCR component loaded!');
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const fileInputRef = useRef(null);

  // Enhanced state management
  const [exportFormat, setExportFormat] = useState('txt');
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError('');
      setExtractedText('');
      setAnalysisResult(null);
      setOcrConfidence(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  // Estimate syllables for readability calculations
  const estimateSyllables = (word) => {
    if (!word || word.length === 0) return 0;
    
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 3) return 1;
    
    let syllables = 0;
    let previousWasVowel = false;
    const vowels = 'aeiouy';
    
    for (let i = 0; i < cleanWord.length; i++) {
      const isVowel = vowels.includes(cleanWord[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e' at the end
    if (cleanWord.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    return Math.max(1, syllables);
  };

  // Perform sentiment analysis
  const performSentimentAnalysis = (text) => {
    const positiveWords = [
      'excellent', 'outstanding', 'amazing', 'wonderful', 'fantastic', 'great', 'good', 'superb', 'brilliant',
      'love', 'perfect', 'success', 'effective', 'helpful', 'clear', 'accurate', 'valuable'
    ];

    const negativeWords = [
      'terrible', 'awful', 'horrible', 'bad', 'poor', 'wrong', 'difficult', 'slow', 'problem',
      'error', 'hate', 'failed', 'broken', 'confused', 'unclear', 'disappointing'
    ];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const totalSentimentWords = positiveScore + negativeScore;
    let overallSentiment = 'Neutral';
    let confidence = 50;

    if (totalSentimentWords > 0) {
      if (positiveScore > negativeScore) {
        overallSentiment = 'Positive';
        confidence = Math.round((positiveScore / totalSentimentWords) * 100);
      } else if (negativeScore > positiveScore) {
        overallSentiment = 'Negative';
        confidence = Math.round((negativeScore / totalSentimentWords) * 100);
      }
    }

    return {
      sentiment: overallSentiment,
      confidence: Math.max(confidence, 10),
      positiveWords: positiveScore,
      negativeWords: negativeScore,
      totalWords: words.length
    };
  };

  // Calculate advanced statistics
  const calculateAdvancedStatistics = (text) => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, '').length;

    const wordLengths = words.map(w => w.replace(/[^\w]/g, '').length).filter(l => l > 0);
    const avgWordLength = wordLengths.length > 0 ? wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length : 0;

    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
    const avgWordsPerSentence = sentenceLengths.length > 0 ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length : 0;

    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')));
    const vocabularyRichness = words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0;

    const readingTime = Math.ceil(words.length / 250); // Average reading speed
    const speakingTime = Math.ceil(words.length / 160); // Average speaking speed

    return {
      basic: {
        words: words.length,
        sentences: sentences.length,
        paragraphs: paragraphs.length,
        characters: characters,
        charactersNoSpaces: charactersNoSpaces,
        uniqueWords: uniqueWords.size
      },
      averages: {
        wordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        wordLength: Math.round(avgWordLength * 10) / 10
      },
      vocabulary: {
        richness: Math.round(vocabularyRichness * 10) / 10
      },
      timeEstimates: {
        reading: readingTime,
        speaking: speakingTime
      }
    };
  };

  // Calculate readability metrics
  const calculateReadabilityMetrics = (text, words) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    
    const totalSyllables = words.reduce((acc, word) => acc + estimateSyllables(word), 0);
    const avgSyllablesPerWord = words.length > 0 ? totalSyllables / words.length : 0;
    
    // Flesch Reading Ease Score
    let fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    fleschScore = Math.max(0, Math.min(100, Math.round(fleschScore * 10) / 10));
    
    // Flesch-Kincaid Grade Level
    let fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    fleschKincaidGrade = Math.max(0, Math.round(fleschKincaidGrade * 10) / 10);
    
    let complexityLevel = 'Easy';
    if (fleschScore >= 90) complexityLevel = 'Very Easy';
    else if (fleschScore >= 80) complexityLevel = 'Easy';
    else if (fleschScore >= 70) complexityLevel = 'Fairly Easy';
    else if (fleschScore >= 60) complexityLevel = 'Standard';
    else if (fleschScore >= 50) complexityLevel = 'Fairly Difficult';
    else if (fleschScore >= 30) complexityLevel = 'Difficult';
    else complexityLevel = 'Very Difficult';

    return {
      fleschScore,
      fleschKincaidGrade,
      complexityLevel,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
    };
  };

  // Perform comprehensive text analysis
  const performAnalysis = (text) => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const sentimentAnalysis = performSentimentAnalysis(text);
    const advancedStats = calculateAdvancedStatistics(text);
    const readabilityMetrics = calculateReadabilityMetrics(text, words);

    // Simple language detection
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const textWords = text.toLowerCase().split(/\s+/);
    const englishMatches = englishWords.filter(word => textWords.includes(word)).length;
    const detectedLanguage = englishMatches > 3 ? 'English' : 'Unknown';

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      characterCount: text.length,
      estimatedReadingTime: Math.ceil(words.length / 250),
      
      sentiment: sentimentAnalysis,
      statistics: advancedStats,
      readability: readabilityMetrics,
      detectedLanguage,
      
      overallQuality: readabilityMetrics.fleschScore >= 70 ? 'Good' : 
                     readabilityMetrics.fleschScore >= 50 ? 'Fair' : 'Difficult'
    };
  };

  // Process image with Tesseract
  const processImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');
    setProgressMessage('Initializing OCR...');

    try {
      const result = await Tesseract.recognize(
        selectedImage,
        selectedLanguage,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progressPercent = Math.round(m.progress * 100);
              setProgress(progressPercent);
              setProgressMessage(`Recognizing text: ${progressPercent}%`);
            }
          }
        }
      );

      const text = result.data.text.trim();
      const confidence = Math.round(result.data.confidence);

      if (confidence < confidenceThreshold) {
        setError(`OCR confidence (${confidence}%) is below threshold (${confidenceThreshold}%). Results may be inaccurate.`);
      }

      setExtractedText(text);
      setOcrConfidence(confidence);
      setProgressMessage('Text extraction complete!');

      // Perform analysis
      if (text.length > 0) {
        const analysis = performAnalysis(text);
        setAnalysisResult(analysis);
        
        // Call parent callbacks
        if (onTextExtracted) onTextExtracted(text);
        if (onAnalysisComplete) onAnalysisComplete(analysis);
      }

    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  // Clear all data
  const clearAll = () => {
    setSelectedImage(null);
    setExtractedText('');
    setAnalysisResult(null);
    setOcrConfidence(null);
    setError('');
    setProgress(0);
    setProgressMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download extracted text
  const downloadText = () => {
    if (!extractedText) return;
    
    let content = '';
    const timestamp = new Date().toLocaleString();

    if (exportFormat === 'txt') {
      content = `Text Extraction Report
Generated: ${timestamp}
OCR Confidence: ${ocrConfidence}%

EXTRACTED TEXT:
${extractedText}

${analysisResult ? `
ANALYSIS RESULTS:
- Word Count: ${analysisResult.wordCount}
- Sentence Count: ${analysisResult.sentenceCount}
- Character Count: ${analysisResult.characterCount}
- Reading Time: ${analysisResult.estimatedReadingTime} minutes
- Language: ${analysisResult.detectedLanguage}
- Overall Quality: ${analysisResult.overallQuality}

READABILITY:
- Flesch Score: ${analysisResult.readability.fleschScore}
- Grade Level: ${analysisResult.readability.fleschKincaidGrade}
- Complexity: ${analysisResult.readability.complexityLevel}

SENTIMENT:
- Overall: ${analysisResult.sentiment.sentiment}
- Confidence: ${analysisResult.sentiment.confidence}%
- Positive Words: ${analysisResult.sentiment.positiveWords}
- Negative Words: ${analysisResult.sentiment.negativeWords}
` : ''}`;
    } else if (exportFormat === 'json') {
      content = JSON.stringify({
        timestamp,
        ocrConfidence,
        extractedText,
        analysis: analysisResult
      }, null, 2);
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-extraction-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-ocr-container">
      <div className="ocr-header">
        <h2><MdImageSearch /> Text Recognition & Analysis</h2>
        <p>Extract and analyze text from images using OCR technology</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="upload-controls">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="upload-btn"
            disabled={isProcessing}
          >
            <FaUpload /> Select Image
          </button>
          
          {selectedImage && (
            <button
              onClick={processImage}
              className="process-btn"
              disabled={isProcessing}
            >
              {isProcessing ? <FaSpinner className="spinning" /> : <MdImageSearch />}
              {isProcessing ? 'Processing...' : 'Extract Text'}
            </button>
          )}
          
          {(selectedImage || extractedText) && (
            <button onClick={clearAll} className="clear-btn">
              <FaTrash /> Clear All
            </button>
          )}
        </div>

        {/* OCR Settings */}
        <div className="ocr-settings">
          <div className="setting-item">
            <label>Language:</label>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Confidence Threshold:</label>
            <input 
              type="range" 
              min="50" 
              max="95" 
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
            />
            <span>{confidenceThreshold}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-text">{progress}% Complete</span>
            {progressMessage && (
              <span className="progress-message">{progressMessage}</span>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <div className="image-preview">
          <h4>Selected Image:</h4>
          <img 
            src={URL.createObjectURL(selectedImage)} 
            alt="Selected" 
            style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
          />
        </div>
      )}

      {/* Text Display */}
      {extractedText && (
        <div className="text-display">
          <div className="text-header">
            <h4>Extracted Text {ocrConfidence && `(${ocrConfidence}% confidence)`}</h4>
            <div className="text-controls">
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="txt">Text Report</option>
                <option value="json">JSON Data</option>
              </select>
              <button onClick={downloadText} className="download-btn">
                <FaDownload /> Download
              </button>
            </div>
          </div>
          
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="text-area"
            rows="8"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="analysis-results">
          <h4><MdAnalytics /> Text Analysis</h4>
          
          <div className="analysis-grid">
            {/* Basic Stats */}
            <div className="analysis-card">
              <h5>📊 Basic Statistics</h5>
              <div className="stats">
                <div className="stat-item">Words: {analysisResult.wordCount}</div>
                <div className="stat-item">Sentences: {analysisResult.sentenceCount}</div>
                <div className="stat-item">Characters: {analysisResult.characterCount}</div>
                <div className="stat-item">Reading Time: {analysisResult.estimatedReadingTime} min</div>
                <div className="stat-item">Language: {analysisResult.detectedLanguage}</div>
                <div className="stat-item">Quality: {analysisResult.overallQuality}</div>
              </div>
            </div>

            {/* Readability */}
            <div className="analysis-card">
              <h5>📚 Readability</h5>
              <div className="stats">
                <div className="stat-item">Flesch Score: {analysisResult.readability.fleschScore}</div>
                <div className="stat-item">Grade Level: {analysisResult.readability.fleschKincaidGrade}</div>
                <div className="stat-item">Complexity: {analysisResult.readability.complexityLevel}</div>
                <div className="stat-item">Avg Words/Sentence: {analysisResult.readability.avgWordsPerSentence}</div>
              </div>
            </div>

            {/* Sentiment */}
            <div className="analysis-card">
              <h5>😊 Sentiment</h5>
              <div className="stats">
                <div className={`sentiment-badge ${analysisResult.sentiment.sentiment.toLowerCase()}`}>
                  {analysisResult.sentiment.sentiment}
                </div>
                <div className="stat-item">Confidence: {analysisResult.sentiment.confidence}%</div>
                <div className="stat-item">Positive Words: {analysisResult.sentiment.positiveWords}</div>
                <div className="stat-item">Negative Words: {analysisResult.sentiment.negativeWords}</div>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="analysis-card">
              <h5>📈 Advanced Metrics</h5>
              <div className="stats">
                <div className="stat-item">Unique Words: {analysisResult.statistics.basic.uniqueWords}</div>
                <div className="stat-item">Vocab Richness: {analysisResult.statistics.vocabulary.richness}%</div>
                <div className="stat-item">Avg Word Length: {analysisResult.statistics.averages.wordLength}</div>
                <div className="stat-item">Speaking Time: {analysisResult.statistics.timeEstimates.speaking} min</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <MdError /> {error}
        </div>
      )}
    </div>
  );
};

export default TextOCR;
