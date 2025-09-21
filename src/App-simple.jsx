import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App-simple.css';
import { processAudioFileV3, enhancedAudioProcessorV3 } from './utils/enhancedAudioProcessorV3';
import { runVoskDiagnostics } from './utils/voskDiagnostics';
import { getBlockedRequests } from './utils/comprehensiveVoskBlocker';
import { translateToEnglish, detectLanguage, getLanguageName, needsTranslation } from './utils/translator';
import { correctGrammar, needsGrammarCorrection } from './utils/grammarCorrector';
// Enhanced emotion detection imports
import { EnhancedEmotionEngine } from './utils/enhancedEmotionEngine';
import { analyzeEmotionWithEnhancedBERT } from './utils/enhancedBertAnalyzer';
import EnhancedVoiceEmotionAnalyzer from './utils/enhancedVoiceEmotionAnalyzer2';
// Step 4 imports - Advanced Emotion Analytics
import EmotionDetectionIntegration from './components/EmotionDetectionIntegration';
import TranscriptAnalysis from './components/TranscriptAnalysis';
import EnhancedTranscriptAnalysis from './components/EnhancedTranscriptAnalysis';
import { memo } from 'react';
import MatrixHeatmapOrig from './components/MatrixHeatmap';
const MatrixHeatmap = memo(MatrixHeatmapOrig);
import MultiFeatureHeatmaps from './components/MultiFeatureHeatmaps';
// Step 5 imports - Real-time Collaboration
 import RealTimeCollaboration from './components/RealTimeCollaboration';

import AdvancedExportSystem from './components/AdvancedExportSystem';

// Students study pack generator
import StudentStudyAssistant from './components/StudentStudyAssistant';
import './components/TranscriptAnalysis.css';
import './components/EmotionDetectionIntegration.css';
import './components/EnhancedTranscriptAnalysis.css';
// Novel BERT Problem Solver
import NovelBERTProblemSolver from './components/NovelBERTProblemSolver';
// BERT Summary & Insights
import BERTSummaryInsights from './components/BERTSummaryInsights';
// Training Center
import TrainingCenter from './components/TrainingCenter';
// Enhanced Voice Emotion Analyzer
import EnhancedVoiceEmotionAnalyzerComponent from './components/EnhancedVoiceEmotionAnalyzer';
// Ultra-Enhanced Voice Emotion System with 18+ emotions and advanced visualizations
import VoiceEmotionSystem from './components/VoiceEmotionSystem-simple';
// Test runner for voice emotion system
import TestVoiceEmotionRunner from './TestVoiceEmotionRunner';

function App() { 
  // --- BEAUTIFUL UI STATE ---
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [viewedAnalysis, setViewedAnalysis] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  // External training samples coming from VoiceEmotionSystem
  const [externalTrainingSamples, setExternalTrainingSamples] = useState([]);
  
  // --- ENHANCED EMOTION DETECTION STATE ---
  const [emotionEngine] = useState(() => new EnhancedEmotionEngine());
  const [voiceEmotionAnalyzer] = useState(() => new EnhancedVoiceEmotionAnalyzer());
  const [enhancedResults, setEnhancedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [blockedRequests, setBlockedRequests] = useState([]);
  
  // --- REFS ---
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognizerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const isProcessingRef = useRef(false);
  const hasUnmountedRef = useRef(false);

  // Load history from localStorage on mount (ensure all fields are restored, add debug log)
  useEffect(() => {
    const stored = localStorage.getItem('analysisHistory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(item => ({
            id: item.id || Date.now() + Math.random(),
            type: item.type || 'Unknown',
            date: item.date || new Date().toISOString(),
            transcript: typeof item.transcript === 'string' ? item.transcript : '',
            summary: typeof item.summary === 'string' ? item.summary : '',
            analysis: item.analysis !== undefined ? item.analysis : null,
            chartData: item.chartData !== undefined ? item.chartData : null
          }));
          setAnalysisHistory(normalized);
        }
      } catch (e) {
        console.warn('Failed to parse analysis history from localStorage:', e);
        setAnalysisHistory([]);
      }
    }
    setHistoryLoaded(true);
  }, []);
  // end of initial history load useEffect

  // Save history to localStorage when it changes (all fields, add debug log)
  useEffect(() => {
    if (!historyLoaded) return; // Don't save until initial load is done
    try {
      localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
      console.log('[AnalysisHistory] Saved to localStorage:', analysisHistory.length, 'entries');
      
      // Trigger custom event to notify other components/tabs of history update
      window.dispatchEvent(new CustomEvent('analysisHistoryUpdated', { 
        detail: { 
          count: analysisHistory.length,
          timestamp: Date.now(),
          latestEntry: analysisHistory[0] || null
        } 
      }));
      
      // Additional debugging for cross-tab persistence
      console.log('[AnalysisHistory] Current state:', {
        historyLength: analysisHistory.length,
        firstEntry: analysisHistory[0] ? {
          id: analysisHistory[0].id,
          type: analysisHistory[0].type,
          date: analysisHistory[0].date
        } : null,
        localStorageSize: localStorage.getItem('analysisHistory')?.length || 0
      });
    } catch (e) {
      console.warn('[AnalysisHistory] Failed to save to localStorage:', e);
    }
  }, [analysisHistory, historyLoaded]);

  // Initialize emotion detection engine
  useEffect(() => {
    const initializeEmotionDetection = async () => {
      try {
        console.log('🎭 Initializing emotion detection engine...');
        // Use the already-created emotionEngine instance to avoid import/definition issues
        emotionDetectorRef.current = emotionEngine || new EnhancedEmotionEngine();
        const success = emotionDetectorRef.current && typeof emotionDetectorRef.current.initialize === 'function'
          ? await emotionDetectorRef.current.initialize()
          : false;
        if (success) {
          console.log('🎭 Emotion detection initialized successfully');
        } else {
          console.warn('⚠️ Emotion detection initialization failed - microphone access may be denied');
        }
      } catch (error) {
        console.error('❌ Error initializing emotion detection:', error);
        // Don't fail the entire app if emotion detection fails
        emotionDetectorRef.current = null;
      }
    };

    initializeEmotionDetection();

    // Cleanup on unmount - safely call any available cleanup method
    return () => {
      if (emotionDetectorRef.current) {
        try {
          const detector = emotionDetectorRef.current;
          if (detector.dispose && typeof detector.dispose === 'function') {
            detector.dispose();
          } else if (detector.cleanup && typeof detector.cleanup === 'function') {
            detector.cleanup();
          } else if (detector.stopAnalysis && typeof detector.stopAnalysis === 'function') {
            detector.stopAnalysis();
          } else if (detector.close && typeof detector.close === 'function') {
            detector.close();
          } else if (detector.disconnect && typeof detector.disconnect === 'function') {
            detector.disconnect();
          } else {
            // No known cleanup method - attempt to stop any intervals/tasks
            try { detector.isAnalyzing = false; } catch(e) {}
            try { detector.mediaStream && detector.mediaStream.getTracks && detector.mediaStream.getTracks().forEach(t => t.stop()); } catch(e) {}
          }
        } catch (error) {
          console.error('Error disposing emotion detector:', error);
        }
      }
    };
  }, []);

  // Delete an analysis from history (only way to remove from localStorage)
  const handleDeleteHistory = (idx) => {
    setAnalysisHistory((prev) => prev.filter((_, i) => i !== idx));
    if (viewedAnalysis && viewedAnalysis.idx === idx) setViewedAnalysis(null);
  };

  // View an analysis from history
  const handleViewHistory = (item, idx) => {
    setViewedAnalysis({ ...item, idx });
  };

  // Function to safely add new entry to analysis history
  const addToAnalysisHistory = useCallback((newEntry) => {
    if (!newEntry) return;
    
    // Ensure the entry has all required fields
    const normalizedEntry = {
      id: newEntry.id || Date.now() + Math.random(),
      type: newEntry.type || 'Unknown',
      date: newEntry.date || new Date().toISOString(),
      transcript: typeof newEntry.transcript === 'string' ? newEntry.transcript : '',
      summary: typeof newEntry.summary === 'string' ? newEntry.summary : '',
      analysis: newEntry.analysis !== undefined ? newEntry.analysis : null,
      chartData: newEntry.chartData !== undefined ? newEntry.chartData : null
    };

    console.log('[AnalysisHistory] Adding new entry:', normalizedEntry.type, normalizedEntry.id);
    
    setAnalysisHistory(prev => {
      // Check if entry already exists to avoid duplicates
      const existingIndex = prev.findIndex(item => item.id === normalizedEntry.id);
      if (existingIndex !== -1) {
        console.log('[AnalysisHistory] Updating existing entry:', normalizedEntry.id);
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = normalizedEntry;
        return updated;
      } else {
        console.log('[AnalysisHistory] Adding new entry to history');
        // Add new entry to beginning and limit to 50 entries
        return [normalizedEntry, ...prev].slice(0, 50);
      }
    });
  }, []);

  // Function to clear all analysis history
  const clearAnalysisHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to reset (clear) all analysis history? This cannot be undone.')) {
      setAnalysisHistory([]);
      setViewedAnalysis(null);
      localStorage.removeItem('analysisHistory');
      console.log('[AnalysisHistory] History cleared by user');
      // Trigger page reload to ensure clean state
      window.location.reload();
    }
  }, []);
  const [transcript, setTranscript] = useState('Exposure and training of students in fundamental concepts of sketching based visual representations. Hand sketching of general products (water bottle, mouse, laptop stand, mobile stand, travel bag, etc). Hand sketching of products of your discipline. Bio-inspired study (sketching of leaves, observation of bio-mimic structures etc). The students need to develop product prototypes / models using thermocol, wood and Plaster of Paris etc. Creative design on paper (Origami, Collage) with waste material. Digital design of various products (poster, scientific illustration, mind maps, empathy map etc). Design of any product using CAD software.');
  const [summary, setSummary] = useState('');
  const [totalWords, setTotalWords] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [uploadedText, setUploadedText] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [textInput, setTextInput] = useState('');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [processingStats, setProcessingStats] = useState(null);
  const [voskDiagnostics, setVoskDiagnostics] = useState(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showVideoSuggestions, setShowVideoSuggestions] = useState(false);
  const [videoSuggestions, setVideoSuggestions] = useState([]);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationInfo, setTranslationInfo] = useState(null);
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [showTranslationInfo, setShowTranslationInfo] = useState(false);
  
  // Grammar correction state
  const [isCorrectingGrammar, setIsCorrectingGrammar] = useState(false);
  const [grammarCorrection, setGrammarCorrection] = useState(null);
  const [showGrammarInfo, setShowGrammarInfo] = useState(false);
  const [originalUncorrectedText, setOriginalUncorrectedText] = useState('');
  
  // Emotion detection state
  const [isEmotionDetectionActive, setIsEmotionDetectionActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [showEmotionInfo, setShowEmotionInfo] = useState(false);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  
  const emotionDetectorRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const isRecognitionSupported = useRef(false);
  const finalTranscriptRef = useRef('');

  // Enhanced language options with better support
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸', vosk: true },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', vosk: true },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸', vosk: false },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷', vosk: false },
    { code: 'de-DE', name: 'German', flag: '🇩🇪', vosk: false },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹', vosk: false },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷', vosk: false },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', vosk: true },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳', vosk: false },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', vosk: false },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', vosk: false },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', vosk: false }
  ];

  // Enhanced file type support - focused on content types (no video)
  const supportedFileTypes = {
    audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma', '.opus'],
    document: ['.txt', '.pdf', '.docx', '.doc', '.rtf', '.odt'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
    text: ['.txt', '.md', '.json', '.csv', '.xml', '.html'],
    domain: ['.research', '.legal', '.medical', '.technical', '.business']
  };

  const getAllSupportedTypes = () => {
    return Object.values(supportedFileTypes).flat().join(',');
  };

  // Track if recognition was stopped by user
  const stoppedByUserRef = useRef(false);
  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let newFinalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Only append if not already present at the end (deduplication)
          const trimmed = transcript.trim();
          if (!newFinalTranscript.trim().endsWith(trimmed)) {
            newFinalTranscript += trimmed + ' ';
          }
        } else {
          interimTranscript += transcript;
        }
      }

      // Only deduplicate if the entire interim/final block is repeated (not within the sentence)
      let fullTranscript = (newFinalTranscript + interimTranscript).replace(/\s+/g, ' ').trim();
      // Remove only if the last N chars are an exact repeat of the previous N chars (mobile bug)
      // N = length of interimTranscript or last final transcript
      if (interimTranscript.length > 0) {
        const n = interimTranscript.length;
        if (fullTranscript.slice(-2*n, -n) === fullTranscript.slice(-n)) {
          fullTranscript = fullTranscript.slice(0, -n);
        }
      }
      finalTranscriptRef.current = newFinalTranscript;
      setTranscript(fullTranscript);
      setTotalWords(fullTranscript.split(/\s+/).filter(word => word.trim()).length);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setError(`Recognition error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => {
      // If not stopped by user, restart recognition (for mobile reliability)
      if (!stoppedByUserRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          // Sometimes throws if already started, ignore
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [selectedLanguage]);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    isRecognitionSupported.current = !!SpeechRecognition;
    
    if (isRecognitionSupported.current) {
      const recognition = initializeRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
      }
    }
  }, [initializeRecognition]);

  // Update word count whenever transcript changes
  useEffect(() => {
    if (transcript) {
      const wordCount = transcript.split(/\s+/).filter(word => word.trim()).length;
      setTotalWords(wordCount);
    } else {
      setTotalWords(0);
    }
  }, [transcript]);

  const startListening = useCallback(() => {
    if (!isRecognitionSupported.current) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    stoppedByUserRef.current = false;
    try {
      setError('');
      if (!transcript.trim()) {
        finalTranscriptRef.current = '';
        setTranscript('');
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start speech recognition. Please try again.');
    }
  }, [transcript]);

  const stopListening = useCallback(() => {
    stoppedByUserRef.current = true;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  const processTextInput = useCallback(async () => {
    if (!textInput.trim()) {
      setError('Please enter some text to process.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let processedText = textInput;
      
      // Check if we need to translate the input text
      if (processedText && processedText.length > 50) {
        const detectedLanguage = detectLanguage(processedText);
        if (detectedLanguage !== 'en') {
          try {
            setIsTranslating(true);
            const { translated, info } = await translateToEnglish(processedText, detectedLanguage);
            if (translated) {
              setOriginalTranscript(processedText);
              setTranslationInfo(info);
              setShowTranslationInfo(true);
              processedText = translated;
            }
          } catch (translationError) {
            console.warn('Translation failed, using original text:', translationError);
          } finally {
            setIsTranslating(false);
          }
        }
      }

      // Apply grammar correction after translation
      processedText = await correctTranscriptGrammar(processedText);

      const wordCount = processedText.trim().split(/\s+/).length;
      setTranscript(processedText);
      setTotalWords(wordCount);
      setTextInput('');
      setActiveTab('upload'); // Switch to results view

      // Save to history (Text Input, always include all fields)
      const newEntry = {
        id: Date.now() + Math.random(),
        type: 'Text Input',
        date: new Date().toISOString(),
        transcript: processedText,
        summary: '',
        analysis: null,
        chartData: null
      };
      addToAnalysisHistory(newEntry);
    } catch (error) {
      console.error('Error processing text:', error);
      setError('Failed to process text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [textInput]);

  const generateSummary = useCallback(async () => {
    if (!transcript.trim()) {
      setError('No transcript available to summarize.');
      return;
    }

    setIsProcessing(true);
    setError('');

   try {
  // Split transcript into sentences, trim, and deduplicate
  const rawSentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const uniqueSentences = Array.from(new Set(rawSentences));

  // Define keywords for importance
  const keywords = ['important', 'note', 'key', 'summary', 'conclusion', 'result', 'main', 'critical', 'essential'];
  const keywordRegex = new RegExp(keywords.join('|'), 'i');

  // Score sentences by keyword presence and length
  const scoredSentences = uniqueSentences.map(sentence => ({
    text: sentence,
    score: (keywordRegex.test(sentence) ? 2 : 0) + Math.min(sentence.length / 80, 1)
  }));

  // Sort by score (descending)
  scoredSentences.sort((a, b) => b.score - a.score);

  let summaryText = '';
  if (scoredSentences.length === 0) {
    summaryText = '• No content to summarize.';
  } else if (scoredSentences.length <= 2) {
    summaryText = '• ' + transcript.trim();
  } else {
    // Pick top N sentences (4-5)
    const summaryLength = Math.max(4, Math.min(5, Math.floor(scoredSentences.length * 0.3)));
    const topSentences = scoredSentences.slice(0, summaryLength).map(s => s.text);

    // Optionally highlight keywords
    const highlighted = topSentences.map(sentence =>
      keywords.some(k => sentence.toLowerCase().includes(k))
        ? `• **${sentence}**`
        : `• ${sentence}`
    );

    summaryText = highlighted.join('\n');
  }
  setSummary(summaryText);
  // Save to history (Summary, always include all fields)
  if (transcript.trim()) {
    const newEntry = {
      id: Date.now() + Math.random(),
      type: activeTab === 'speech' ? 'Speech' : activeTab === 'upload' ? 'File Upload' : 'Text Input',
      date: new Date().toISOString(),
      transcript: transcript,
      summary: summaryText,
      analysis: null,
      chartData: null
    };
    setAnalysisHistory(prev => {
      // Avoid duplicate consecutive entries
      if (prev[0] && prev[0].transcript === transcript && prev[0].summary === summaryText) {
        return prev;
      }
      return [newEntry, ...prev].slice(0, 30);
    });
  }
} catch (error) {
  console.error('Error generating summary:', error);
  setError('Failed to generate summary. Please try again.');
} finally {
  setIsProcessing(false);
}
}, [transcript, activeTab]);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Set file info
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    setIsProcessingFile(true);
    setError('');
    setProcessingProgress('Starting file processing...');

    // Add timeout to prevent infinite loops
    const timeoutId = setTimeout(() => {
      setIsProcessingFile(false);
      setError('Processing timeout - the operation took too long. Please try a smaller file.');
      setProcessingProgress('❌ Processing timeout');
    }, 300000); // 5 minute timeout

    try {
      // Process all supported content types (text, PDF, image, audio)
      setProcessingProgress('📄 Processing content...');
      
      const extractedText = await processAudioFileV3(
        file,
        (progress) => {
          if (progress) {
            setProcessingProgress(progress);
          }
        }
      );

      clearTimeout(timeoutId);

      let fileTranscript = '';
      // Handle the new V3 response format and normalize to a plain string
      if (extractedText && typeof extractedText === 'object') {
        // Prefer simple string fields first
        if (typeof extractedText.transcript === 'string' && extractedText.transcript.trim()) {
          fileTranscript = extractedText.transcript;
        } else if (typeof extractedText.audioTranscript === 'string' && extractedText.audioTranscript.trim()) {
          fileTranscript = extractedText.audioTranscript;
        } else if (typeof extractedText.content === 'string' && extractedText.content.trim()) {
          fileTranscript = extractedText.content;
        } else if (extractedText.transcript && typeof extractedText.transcript === 'object' && typeof extractedText.transcript.text === 'string') {
          fileTranscript = extractedText.transcript.text;
        } else if (extractedText.audioTranscript && typeof extractedText.audioTranscript === 'object' && typeof extractedText.audioTranscript.text === 'string') {
          fileTranscript = extractedText.audioTranscript.text;
        } else {
          // Fallback: if there's a summary or small text field, use it; otherwise empty string
          fileTranscript = typeof extractedText.summary === 'string' ? extractedText.summary : '';
        }
      } else {
        fileTranscript = typeof extractedText === 'string' ? extractedText : '';
      }

      console.log('🎵 Audio processing result:', extractedText);
      console.log('📝 Extracted transcript:', fileTranscript);

      // Check if we need to translate the extracted text
      if (fileTranscript && fileTranscript.length > 50) {
        const detectedLanguage = detectLanguage(fileTranscript);
        if (detectedLanguage !== 'en') {
          try {
            setIsTranslating(true);
            setProcessingProgress('🌐 Translating content to English...');
            const { translated, info } = await translateToEnglish(fileTranscript, detectedLanguage);
            if (translated) {
              setOriginalTranscript(fileTranscript);
              setTranslationInfo(info);
              setShowTranslationInfo(true);
              fileTranscript = translated;
            }
          } catch (translationError) {
            console.warn('Translation failed, using original text:', translationError);
          } finally {
            setIsTranslating(false);
          }
        }
      }

      // Apply grammar correction after translation
      fileTranscript = await correctTranscriptGrammar(fileTranscript);

      setUploadedText(fileTranscript);
      setTranscript(fileTranscript);
      setTotalWords(fileTranscript.split(/\s+/).filter(word => word.trim()).length);
      setProcessingProgress('✅ Content processed successfully!');

      // Enhanced emotion analysis using new engines
      if (fileTranscript && fileTranscript.trim()) {
        setProcessingProgress('🧠 Running enhanced emotion analysis...');
        
        try {
          // Run enhanced BERT analysis
          const bertResults = await analyzeEmotionWithEnhancedBERT(fileTranscript);
          
          // If we have audio data, run voice emotion analysis
          let voiceResults = null;
          if (file.type.startsWith('audio/')) {
            voiceResults = await voiceEmotionAnalyzer.processRecordedAudio(file);
          }
          
          // Run multi-modal fusion analysis
          const fusedResults = await emotionEngine.analyzeText(
            fileTranscript,
            {
              bertResults,
              voiceResults,
              includeTemporalAnalysis: true,
              includePatternRecognition: true
            }
          );
          
          setEnhancedResults({
            fusedAnalysis: fusedResults,
            bertAnalysis: bertResults,
            voiceAnalysis: voiceResults,
            timestamp: new Date().toISOString(),
            source: 'file_upload'
          });
          
          setProcessingProgress('🎯 Enhanced emotion analysis complete!');
        } catch (emotionError) {
          console.warn('Enhanced emotion analysis failed:', emotionError);
          setProcessingProgress('⚠️ Basic analysis only - enhanced features unavailable');
        }
      }

      // Save to history (File Upload, always include all fields)
      if (fileTranscript.trim()) {
        const newEntry = {
          id: Date.now() + Math.random(),
          type: 'File Upload',
          date: new Date().toISOString(),
          transcript: fileTranscript,
          summary: '',
          analysis: enhancedResults,
          chartData: null
        };
        addToAnalysisHistory(newEntry);
      }

      event.target.value = '';
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('🚨 File processing error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fileName: file ? file.name : 'unknown',
        fileType: file ? file.type : 'unknown'
      });
      
      setError(`Error processing file: ${error.message}`);
      setProcessingProgress(`❌ Processing failed: ${error.message}`);
    } finally {
      setIsProcessingFile(false);
      setTimeout(() => setProcessingProgress(''), 5000);
    }
  }, [selectedLanguage, transcript]);

  // Enhanced drag and drop handlers
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a synthetic event to reuse handleFileChange
      const syntheticEvent = {
        target: {
          files: [file],
          value: ''
        }
      };
      handleFileChange(syntheticEvent);
    }
  }, [handleFileChange]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Translate transcript to English if needed
  const translateTranscript = useCallback(async (text) => {
    if (!text || !text.trim()) return text;

    setIsTranslating(true);
    setError('');

    try {
      // Check if translation is needed
      if (!needsTranslation(text)) {
        setTranslationInfo(null);
        setShowTranslationInfo(false);
        return text;
      }

      // Detect language and translate
      const detectedLang = detectLanguage(text);
      const translationResult = await translateToEnglish(text, detectedLang);

      if (translationResult.translatedText && translationResult.translatedText !== text) {
        setOriginalTranscript(text);
        setTranslationInfo({
          originalLanguage: getLanguageName(translationResult.detectedLanguage),
          confidence: translationResult.confidence,
          fallback: translationResult.fallback || false,
          originalText: text
        });
        setShowTranslationInfo(true);
        
        return translationResult.translatedText;
      } else {
        setTranslationInfo(null);
        setShowTranslationInfo(false);
        return text;
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Using original text for analysis.');
      setTranslationInfo(null);
      setShowTranslationInfo(false);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Auto-translate when transcript changes
  const handleTranscriptChange = useCallback(async (newTranscript) => {
    if (!newTranscript || newTranscript === transcript) return;

    const translatedText = await translateTranscript(newTranscript);
    setTranscript(translatedText);
  }, [transcript, translateTranscript]);

  // Grammar correction function
  const correctTranscriptGrammar = useCallback(async (text) => {
    if (!text || !text.trim()) return text;

    setIsCorrectingGrammar(true);
    setError('');

    try {
      // Check if grammar correction is needed
      if (!needsGrammarCorrection(text)) {
        setGrammarCorrection(null);
        setShowGrammarInfo(false);
        return text;
      }

      // Apply grammar correction
      const correctionResult = correctGrammar(text, {
        includeCapitalization: true,
        includePunctuation: true,
        includeMedicalTerms: true,
        preserveOriginalSpacing: false
      });

      if (correctionResult.correctedText && correctionResult.correctedText !== text && correctionResult.totalCorrections > 0) {
        setOriginalUncorrectedText(text);
        setGrammarCorrection({
          totalCorrections: correctionResult.totalCorrections,
          confidence: correctionResult.confidence,
          summary: correctionResult.summary,
          corrections: correctionResult.corrections.slice(0, 5), // Show first 5 corrections
          originalText: text
        });
        setShowGrammarInfo(true);
        
        return correctionResult.correctedText;
      } else {
        setGrammarCorrection(null);
        setShowGrammarInfo(false);
        return text;
      }
    } catch (error) {
      console.error('Grammar correction error:', error);
      setError('Grammar correction failed. Using original text.');
      setGrammarCorrection(null);
      setShowGrammarInfo(false);
      return text;
    } finally {
      setIsCorrectingGrammar(false);
    }
  }, []);

  // Emotion detection functions
  const startEmotionDetection = useCallback(() => {
    if (!emotionDetectorRef.current) {
      console.warn('⚠️ Emotion detector not initialized');
      return false;
    }
    // Try multiple possible start methods for different engine implementations
    const detector = emotionDetectorRef.current;
    let success = false;
    try {
      if (detector.startDetection && typeof detector.startDetection === 'function') {
        success = detector.startDetection();
      } else if (detector.startAnalysis && typeof detector.startAnalysis === 'function') {
        success = detector.startAnalysis();
      } else if (detector.start && typeof detector.start === 'function') {
        success = detector.start();
      } else if (detector.isAnalyzing !== undefined) {
        // best-effort: enable flag and consider it a success
        try { detector.isAnalyzing = true; } catch(e) {}
        success = true;
      } else {
        console.warn('⚠️ No supported start method found on emotion detector');
        success = false;
      }
    } catch (e) {
      console.warn('Error starting emotion detector:', e);
      success = false;
    }
    if (success) {
      setIsEmotionDetectionActive(true);
      console.log('🎭 Started emotion detection');
      
      // Start periodic emotion analysis
      const analysisInterval = setInterval(() => {
        if (emotionDetectorRef.current && isEmotionDetectionActive) {
          const emotion = emotionDetectorRef.current.analyzeCurrentEmotion(transcript);
          setCurrentEmotion(emotion);
          setEmotionConfidence(emotion.confidence);
          
          // Show emotion info if significant emotion detected
          if (emotion.confidence > 50) {
            setShowEmotionInfo(true);
          }
        }
      }, 2000); // Analyze every 2 seconds
      
      // Store interval ID for cleanup
      emotionDetectorRef.current.analysisIntervalId = analysisInterval;
    }
    
    return success;
  }, [transcript, isEmotionDetectionActive]);

  const stopEmotionDetection = useCallback(() => {
    if (emotionDetectorRef.current) {
      try {
        const detector = emotionDetectorRef.current;
        if (detector.stopDetection && typeof detector.stopDetection === 'function') {
          detector.stopDetection();
        } else if (detector.stopAnalysis && typeof detector.stopAnalysis === 'function') {
          detector.stopAnalysis();
        } else if (detector.stop && typeof detector.stop === 'function') {
          detector.stop();
        } else if (detector.isAnalyzing !== undefined) {
          try { detector.isAnalyzing = false; } catch(e) {}
        } else if (detector.cleanup && typeof detector.cleanup === 'function') {
          detector.cleanup();
        } else if (detector.dispose && typeof detector.dispose === 'function') {
          detector.dispose();
        } else {
          // best-effort: stop media stream tracks
          try { detector.mediaStream && detector.mediaStream.getTracks && detector.mediaStream.getTracks().forEach(t => t.stop()); } catch(e) {}
        }

        // Clear analysis interval if present
        try {
          if (detector.analysisIntervalId) {
            clearInterval(detector.analysisIntervalId);
            detector.analysisIntervalId = null;
          }
        } catch (e) {}
      } catch (error) {
        console.error('Error stopping emotion detector:', error);
      }
    }

    setIsEmotionDetectionActive(false);
    console.log('⏹️ Stopped emotion detection');
  }, []);

  const analyzeEmotionManually = useCallback(() => {
    console.log('🎭 Analyze emotion button clicked');
    console.log('📝 Current transcript:', transcript?.slice(0, 100) + '...');
    
    if (!transcript.trim()) {
      console.warn('⚠️ No transcript available');
      setError('No transcript available to analyze');
      return;
    }
    
    try {
      console.log('🔍 Starting emotion analysis...');
      // If emotion detector is available, use it
      if (emotionDetectorRef.current) {
        console.log('✅ Using emotion detector engine');
        const emotion = emotionDetectorRef.current.analyzeCurrentEmotion(transcript);
        console.log('🎭 Emotion analysis result:', emotion);
        console.log('🔍 Emotion properties:', {
          detected: emotion?.detected,
          confidence: emotion?.confidence,
          breakdown: emotion?.breakdown
        });
        setCurrentEmotion(emotion);
        setEmotionConfidence(emotion?.confidence || 0);
        setShowEmotionInfo(true);
        
        // Add to emotion history
        setEmotionHistory(prev => [{
          ...emotion,
          transcript: transcript.slice(0, 100),
          timestamp: Date.now()
        }, ...prev].slice(0, 10));
        
        console.log('🎭 Manual emotion analysis:', emotion);
      } else {
        console.log('⚠️ No emotion detector, using fallback');
        // Fallback: simple text-based emotion detection
        const simpleEmotion = analyzeEmotionFromText(transcript);
        console.log('🎭 Fallback emotion analysis result:', simpleEmotion);
        console.log('🔍 Fallback emotion properties:', {
          detected: simpleEmotion?.detected,
          confidence: simpleEmotion?.confidence,
          breakdown: simpleEmotion?.breakdown
        });
        setCurrentEmotion(simpleEmotion);
        setEmotionConfidence(simpleEmotion?.confidence || 0);
        setShowEmotionInfo(true);
        
        console.log('🎭 Fallback emotion analysis:', simpleEmotion);
      }
    } catch (error) {
      console.error('❌ Error during emotion analysis:', error);
      setError(`Emotion analysis failed: ${error.message}`);
    }
  }, [transcript]);

  // Enhanced multi-dimensional emotion analysis
  const analyzeEmotionFromText = useCallback((text) => {
    const textLower = text.toLowerCase();
    console.log('🔍 Analyzing text for comprehensive emotions:', textLower);
    
    // Enhanced Sarcasm indicators (comprehensive list)
    const sarcasmMarkers = [
      'oh great', 'oh wonderful', 'oh fantastic', 'oh perfect', 'oh brilliant',
      'what a revolutionary idea', 'what a brilliant idea', 'what a fantastic idea',
      'what a wonderful idea', 'what a great idea', 'what a genius idea',
      'exactly what i wanted', 'just what i needed', 'how original', 'how creative',
      'how thoughtful', 'how brilliant', 'revolutionary idea', 'groundbreaking',
      'stroke of genius', 'work of art', 'masterpiece', 'incredible achievement',
      'medal', 'trophy', 'award', 'prize', 'recognition', 'honor',
      'make sure to get', 'i\'ll make sure', 'absolutely brilliant',
      'just perfect', 'goes perfectly wrong', 'how lovely', 'terrific',
      'marvelous', 'outstanding', 'remarkable', 'extraordinary', 'sure thing',
      'yeah right', 'of course', 'obviously', 'clearly the best'
    ];
    const sarcasmScore = sarcasmMarkers.filter(marker => textLower.includes(marker)).length * 30;
    
    // Check for complex sarcasm patterns
    const complexSarcasmPatterns = [
      /oh,?\s+you'?re.*\?\s*what a.*idea/i, // "Oh, you're...? What a ... idea"
      /putting.*dishes.*dishwasher.*revolutionary/i, // dishwasher sarcasm
      /\?\s*what a (brilliant|revolutionary|amazing|fantastic|wonderful|great)/i, // Question + "What a [adj]"
      /make sure.*medal/i, // medal sarcasm
      /how (original|creative|brilliant|thoughtful)/i // "How [adjective]"
    ];
    
    let complexSarcasmScore = 0;
    complexSarcasmPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        complexSarcasmScore += 40; // High score for complex patterns
        console.log('🔍 Found complex sarcasm pattern:', pattern);
      }
    });
    
    const totalSarcasmScore = sarcasmScore + complexSarcasmScore;
    
    // Enhanced Enthusiasm indicators with intensity levels
    const enthusiasmMarkers = {
      high: ['ecstatic', 'thrilled', 'overjoyed', 'elated', 'euphoric', 'exhilarated', 'pumped up', 'blown away', 'mind-blowing', 'absolutely incredible', 'phenomenal', 'spectacular'],
      medium: ['excited', 'amazing', 'incredible', 'awesome', 'fantastic', 'wonderful', 'brilliant', 'outstanding', 'excellent', 'superb', 'great job', 'well done', 'impressive'],
      low: ['good', 'nice', 'pleased', 'happy', 'satisfied', 'glad', 'positive', 'optimistic', 'hopeful', 'encouraging']
    };
    
    let enthusiasmScore = 0;
    enthusiasmScore += enthusiasmMarkers.high.filter(marker => textLower.includes(marker)).length * 40;
    enthusiasmScore += enthusiasmMarkers.medium.filter(marker => textLower.includes(marker)).length * 25;
    enthusiasmScore += enthusiasmMarkers.low.filter(marker => textLower.includes(marker)).length * 15;
    
    // Check for enthusiasm patterns
    const enthusiasmPatterns = [
      /i\s+(love|adore|absolutely)\s+/i,
      /this\s+is\s+(amazing|incredible|fantastic|wonderful|brilliant)/i,
      /can't\s+wait/i,
      /so\s+(excited|happy|pleased)/i,
      /absolutely\s+(love|amazing|incredible)/i
    ];
    enthusiasmPatterns.forEach(pattern => {
      if (pattern.test(text)) enthusiasmScore += 20;
    });
    
    // Enhanced Confidence indicators with context
    const confidenceMarkers = {
      high: ['absolutely certain', 'completely sure', 'no doubt', 'definitely will', 'guaranteed', 'without question', 'positively', 'undoubtedly', 'surely', 'confident in'],
      medium: ['sure', 'certain', 'confident', 'believe', 'think so', 'pretty sure', 'likely', 'probably', 'expect', 'anticipate'],
      low: ['hope', 'maybe', 'possibly', 'might', 'could be', 'perhaps', 'seems like', 'appears']
    };
    
    let confidenceScore = 0;
    confidenceScore += confidenceMarkers.high.filter(marker => textLower.includes(marker)).length * 35;
    confidenceScore += confidenceMarkers.medium.filter(marker => textLower.includes(marker)).length * 20;
    confidenceScore += confidenceMarkers.low.filter(marker => textLower.includes(marker)).length * 10;
    
    // Enhanced Concern/Worry indicators
    const concernMarkers = {
      high: ['deeply worried', 'very concerned', 'extremely anxious', 'really troubled', 'seriously worried', 'alarmed', 'panicked', 'terrified', 'devastated'],
      medium: ['worried', 'concerned', 'anxious', 'troubled', 'uneasy', 'nervous', 'apprehensive', 'fearful', 'stressed', 'bothered'],
      low: ['slightly worried', 'a bit concerned', 'wondering', 'questioning', 'unsure', 'hesitant', 'cautious', 'careful']
    };
    
    let concernScore = 0;
    concernScore += concernMarkers.high.filter(marker => textLower.includes(marker)).length * 40;
    concernScore += concernMarkers.medium.filter(marker => textLower.includes(marker)).length * 25;
    concernScore += concernMarkers.low.filter(marker => textLower.includes(marker)).length * 15;
    
    // Check for concern patterns
    const concernPatterns = [
      /what\s+if/i,
      /i'm\s+(worried|concerned|anxious)/i,
      /hope\s+(nothing|everything\s+is\s+okay)/i,
      /is\s+everything\s+(okay|alright|fine)/i
    ];
    concernPatterns.forEach(pattern => {
      if (pattern.test(text)) concernScore += 20;
    });
    
    // Enhanced Frustration indicators
    const frustrationMarkers = {
      high: ['absolutely furious', 'extremely frustrated', 'really annoyed', 'completely fed up', 'totally irritated', 'beyond annoyed', 'seriously angry'],
      medium: ['frustrated', 'annoying', 'irritating', 'bothering', 'annoyed', 'upset', 'angry', 'ridiculous', 'seriously'],
      low: ['slightly annoyed', 'a bit frustrated', 'mildly irritated', 'somewhat bothered']
    };
    
    let frustrationScore = 0;
    frustrationScore += frustrationMarkers.high.filter(marker => textLower.includes(marker)).length * 35;
    frustrationScore += frustrationMarkers.medium.filter(marker => textLower.includes(marker)).length * 20;
    frustrationScore += frustrationMarkers.low.filter(marker => textLower.includes(marker)).length * 12;
    
    // Enhanced Sadness indicators
    const sadnessMarkers = {
      high: ['devastated', 'heartbroken', 'extremely sad', 'deeply disappointed', 'crushed', 'miserable', 'depressed'],
      medium: ['sad', 'disappointed', 'upset', 'hurt', 'unhappy', 'down', 'blue', 'melancholy'],
      low: ['slightly sad', 'a bit down', 'somewhat disappointed', 'not great', 'feeling low']
    };
    
    let sadnessScore = 0;
    sadnessScore += sadnessMarkers.high.filter(marker => textLower.includes(marker)).length * 35;
    sadnessScore += sadnessMarkers.medium.filter(marker => textLower.includes(marker)).length * 22;
    sadnessScore += sadnessMarkers.low.filter(marker => textLower.includes(marker)).length * 12;
    
    // Curiosity/Interest indicators
    const curiosityMarkers = {
      high: ['fascinating', 'intriguing', 'really interested', 'very curious', 'tell me more', 'want to know', 'how does it work'],
      medium: ['interesting', 'curious', 'wonder', 'would like to know', 'can you explain', 'what about'],
      low: ['wondering', 'maybe', 'perhaps', 'possibly']
    };
    
    let curiosityScore = 0;
    curiosityScore += curiosityMarkers.high.filter(marker => textLower.includes(marker)).length * 30;
    curiosityScore += curiosityMarkers.medium.filter(marker => textLower.includes(marker)).length * 20;
    curiosityScore += curiosityMarkers.low.filter(marker => textLower.includes(marker)).length * 10;
    
    // Neutral indicators (explicitly neutral language)
    const neutralMarkers = [
      'okay', 'fine', 'alright', 'normal', 'regular', 'standard', 'typical', 'usual',
      'average', 'moderate', 'reasonable', 'acceptable', 'adequate', 'sufficient',
      'as expected', 'nothing special', 'routine', 'ordinary', 'common'
    ];
    const neutralScore = neutralMarkers.filter(marker => textLower.includes(marker)).length * 20;
    
    // Polite/Diplomatic indicators (enhanced)
    const politeLieMarkers = [
      'i suppose it\'s fine', 'i guess it\'s okay', 'not bad i suppose',
      'if you say so', 'sure whatever', 'fine i guess', 'whatever you say',
      'that\'s one way to look at it', 'interesting perspective', 'i see your point but',
      'perhaps you\'re right', 'maybe that works', 'could be better but'
    ];
    const politeLieScore = politeLieMarkers.filter(marker => textLower.includes(marker)).length * 25;
    
    // Determine primary emotion with enhanced scoring
    const scores = {
      sarcasm: totalSarcasmScore,
      enthusiasm: enthusiasmScore,
      confidence: confidenceScore,
      concern: concernScore,
      frustration: frustrationScore,
      sadness: sadnessScore,
      curiosity: curiosityScore,
      neutral: neutralScore,
      diplomaticPoliteness: politeLieScore
    };
    
    console.log('🎭 Enhanced emotion scores:', scores);
    
    // Find top 2 emotions for more nuanced detection
    const sortedEmotions = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topEmotion = sortedEmotions[0];
    const secondEmotion = sortedEmotions[1];
    
    // Check for mixed emotions (when top 2 are close)
    const isCloseCall = secondEmotion[1] > topEmotion[1] * 0.7;
    
    // Adaptive threshold based on emotion type
    const EMOTION_THRESHOLDS = {
      sarcasm: 25,
      enthusiasm: 20,
      confidence: 18,
      concern: 20,
      frustration: 18,
      sadness: 20,
      curiosity: 15,
      neutral: 15,
      diplomaticPoliteness: 20
    };
    
    const threshold = EMOTION_THRESHOLDS[topEmotion[0]] || 15;
    const finalEmotion = topEmotion[1] >= threshold ? topEmotion[0] : 'neutral';
    const finalScore = topEmotion[1] >= threshold ? topEmotion[1] : 5;
    
    // Enhanced confidence calculation based on emotion strength and clarity
    let confidenceBonus = 0;
    if (finalScore > 50) confidenceBonus = 20;
    else if (finalScore > 30) confidenceBonus = 15;
    else if (finalScore > 20) confidenceBonus = 10;
    
    // Penalty for mixed emotions
    const mixedEmotionPenalty = isCloseCall ? -5 : 0;
    
    console.log('🏆 Top emotion:', topEmotion, 'Second:', secondEmotion, 'Final:', finalEmotion, 'Score:', finalScore);
    console.log('🎯 Mixed emotions detected:', isCloseCall, 'Confidence bonus:', confidenceBonus);
    
    return {
      detected: finalEmotion,
      confidence: Math.min(95, finalScore + confidenceBonus + mixedEmotionPenalty + 10),
      breakdown: {
        [finalEmotion]: {
          textScore: finalScore,
          audioScore: 0,
          contextScore: 5
        }
      },
      allScores: scores, // Include all scores for debugging
      secondaryEmotion: isCloseCall ? secondEmotion[0] : null,
      threshold: threshold,
      isCloseCall,
      emotionIntensity: finalScore > 40 ? 'high' : finalScore > 25 ? 'medium' : 'low',
      timestamp: Date.now()
    };
  }, []);

  // Enhanced human-readable emotion interpretation
  const getEmotionInterpretation = useCallback((emotion, confidence) => {
    const interpretations = {
      sarcasm: {
        high: 'Strong sarcasm detected - speaker likely means the opposite of what they said',
        medium: 'Possible sarcasm - speaker may be expressing frustration or irony indirectly',
        low: 'Mild sarcastic undertones detected - could be playful or mildly dismissive'
      },
      enthusiasm: {
        high: 'High enthusiasm - speaker is genuinely excited and energetic about the topic',
        medium: 'Positive enthusiasm detected - speaker shows genuine interest and approval',
        low: 'Mild enthusiasm - speaker is moderately pleased or interested'
      },
      confidence: {
        high: 'Strong confidence - speaker is very certain and assured about their statements',
        medium: 'Good confidence level - speaker believes in what they\'re saying',
        low: 'Mild confidence - speaker has some certainty but may have minor doubts'
      },
      concern: {
        high: 'High concern - speaker is worried or anxious about the situation',
        medium: 'Moderate concern - speaker has some worries or apprehension',
        low: 'Mild concern - speaker has slight hesitation or caution'
      },
      frustration: {
        high: 'Clear frustration - speaker is upset, annoyed, or experiencing difficulties',
        medium: 'Moderate irritation - speaker is somewhat bothered or impatient',
        low: 'Slight tension - speaker may be mildly annoyed or experiencing minor issues'
      },
      sadness: {
        high: 'Sadness or disappointment - speaker is experiencing negative emotions',
        medium: 'Low mood - speaker seems down or mildly disappointed',
        low: 'Subdued emotional state - speaker may be feeling slightly melancholy'
      },
      curiosity: {
        high: 'High curiosity - speaker is very interested and wants to learn more',
        medium: 'Curious interest - speaker is asking questions and seeking information',
        low: 'Mild interest - speaker shows some curiosity about the topic'
      },
      neutral: {
        high: 'Neutral emotional state - speaker is balanced and matter-of-fact',
        medium: 'Balanced emotional tone - no strong emotions detected',
        low: 'Minimal emotional expression - speaker is keeping emotions neutral'
      },
      diplomaticPoliteness: {
        high: 'Diplomatic politeness - speaker is being courteous while possibly disagreeing',
        medium: 'Polite restraint - speaker may have reservations but is being diplomatic',
        low: 'Mild social politeness - speaker is being courteous and considerate'
      }
    };
    
    const level = confidence > 70 ? 'high' : confidence > 45 ? 'medium' : 'low';
    return interpretations[emotion]?.[level] || `${emotion} detected with ${level} confidence`;
  }, []);

  const clearSession = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    
    // Stop emotion detection if active
    stopEmotionDetection();
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setSummary('');
    setTotalWords(0);
    setError('');
    setTextInput('');
    setSpeechTranscript('');
    setProcessingProgress('');
    setIsProcessingFile(false);
    setFileInfo(null);
    setProcessingStats(null);
    setDragOver(false);
    setShowVideoSuggestions(false);
    setVideoSuggestions([]);
    setIsGeneratingVideos(false);
    setIsTranslating(false);
    setTranslationInfo(null);
    setOriginalTranscript('');
    setShowTranslationInfo(false);
    setIsCorrectingGrammar(false);
    setGrammarCorrection(null);
    setShowGrammarInfo(false);
    setOriginalUncorrectedText('');
    setShowTranslationInfo(false);
    setCurrentEmotion(null);
    setEmotionHistory([]);
    setShowEmotionInfo(false);
    setEmotionConfidence(0);
    setIsEmotionDetectionActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isListening, stopListening, stopEmotionDetection]);

  // Generate YouTube video suggestions based on transcript content
  const generateVideoSuggestions = useCallback(async () => {
    if (!transcript.trim()) {
      setError('No transcript available for video suggestions.');
      return;
    }

    setIsGeneratingVideos(true);
    setError('');

    try {
      // Extract key topics and themes from transcript
      const words = transcript.toLowerCase().split(/\s+/);
      const keyWords = words.filter(word => word.length > 4);
      const wordFreq = {};
      
      keyWords.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      // Get top keywords
      const topKeywords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([word]) => word);

      // Generate video suggestions based on content analysis
      const suggestions = [
        {
          id: 1,
          title: `Understanding ${topKeywords[0] || 'Key Concepts'} - Complete Guide`,
          channel: 'Educational Hub',
          duration: '15:42',
          views: '2.3M views',
          thumbnail: '📚',
          description: `Comprehensive explanation of ${topKeywords.slice(0, 3).join(', ')} and related concepts.`,
          searchQuery: topKeywords.slice(0, 3).join(' '),
          relevance: 95
        },
        {
          id: 2,
          title: `${topKeywords[1] || 'Advanced'} Techniques and Best Practices`,
          channel: 'Professional Learning',
          duration: '22:18',
          views: '1.8M views',
          thumbnail: '🎯',
          description: `Deep dive into advanced techniques for ${topKeywords.slice(1, 4).join(', ')}.`,
          searchQuery: topKeywords.slice(1, 4).join(' ') + ' tutorial',
          relevance: 88
        },
        {
          id: 3,
          title: `Practical Applications of ${topKeywords[2] || 'Core Principles'}`,
          channel: 'Applied Knowledge',
          duration: '18:35',
          views: '1.2M views',
          thumbnail: '🔧',
          description: `Real-world examples and applications related to your transcript content.`,
          searchQuery: topKeywords.slice(2, 5).join(' ') + ' examples',
          relevance: 82
        },
        {
          id: 4,
          title: `${topKeywords[0] || 'Topic'} vs ${topKeywords[1] || 'Alternative'} - Which is Better?`,
          channel: 'Comparison Central',
          duration: '12:28',
          views: '956K views',
          thumbnail: '⚖️',
          description: `Detailed comparison and analysis of different approaches mentioned in your content.`,
          searchQuery: `${topKeywords[0]} vs ${topKeywords[1]}`,
          relevance: 79
        },
        {
          id: 5,
          title: `Common Mistakes in ${topKeywords[3] || 'Implementation'}`,
          channel: 'Learning from Errors',
          duration: '14:52',
          views: '743K views',
          thumbnail: '⚠️',
          description: `Avoid these pitfalls when working with ${topKeywords.slice(3, 6).join(', ')}.`,
          searchQuery: topKeywords.slice(3, 6).join(' ') + ' mistakes',
          relevance: 75
        },
        {
          id: 6,
          title: `Latest Trends in ${topKeywords[4] || 'Current Field'}`,
          channel: 'Trend Watch',
          duration: '19:14',
          views: '634K views',
          thumbnail: '📈',
          description: `Stay updated with the latest developments and trends in your area of interest.`,
          searchQuery: topKeywords.slice(4, 7).join(' ') + ' trends 2025',
          relevance: 72
        }
      ];

      setVideoSuggestions(suggestions);
      setShowVideoSuggestions(true);

    } catch (error) {
      console.error('Error generating video suggestions:', error);
      setError('Failed to generate video suggestions. Please try again.');
    } finally {
      setIsGeneratingVideos(false);
    }
  }, [transcript]);

  // Open YouTube search for suggested video
  const openYouTubeSearch = (searchQuery) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
    window.open(youtubeUrl, '_blank');
  };

  // Run Vosk diagnostics
  const runDiagnostics = useCallback(async () => {
    setIsRunningDiagnostics(true);
    setError('');
    setProcessingProgress('Running Vosk diagnostics...');

    try {
      const diagnosticsResult = await runVoskDiagnostics(
        (progress) => setProcessingProgress(progress)
      );

      setVoskDiagnostics(diagnosticsResult);
      
      if (diagnosticsResult.overallStatus === 'success') {
        setProcessingProgress('✅ Vosk diagnostics completed successfully');
      } else {
        setError(`Vosk diagnostics failed: ${diagnosticsResult.summary}`);
        setProcessingProgress('❌ Vosk diagnostics failed');
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      setError(`Diagnostics failed: ${error.message}`);
      setProcessingProgress('❌ Diagnostics failed');
    } finally {
      setIsRunningDiagnostics(false);
      setTimeout(() => setProcessingProgress(''), 3000);
    }
  }, []);

  // Test Audio Processor V3
  const testAudioProcessorV3 = useCallback(async () => {
    setIsRunningDiagnostics(true);
    setError('');
    setProcessingProgress('Testing Audio Processor V3...');

    try {
      // Initialize the processor
      await enhancedAudioProcessorV3.initialize();
      
      // Get status
      const status = enhancedAudioProcessorV3.getStatus();
      console.log('Audio Processor V3 Status:', status);
      
      // Create a small test audio file (WAV format)
      const sampleRate = 16000;
      const duration = 2; // 2 seconds
      const samples = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + samples * 2); // WAV header + data
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Add some test audio data (sine wave)
      for (let i = 0; i < samples; i++) {
        const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3; // 440Hz tone
        view.setInt16(44 + i * 2, sample * 0x7FFF, true);
      }
      
      const testFile = new File([buffer], 'test-audio.wav', { type: 'audio/wav' });
      
      // Test transcription
      const result = await enhancedAudioProcessorV3.processAudioFile(testFile);
      
      setProcessingProgress(`✅ Audio V3 Test Complete: ${result.transcript}`);
      console.log('🎵 Audio V3 Test Result:', result);
      
    } catch (error) {
      console.error('Audio V3 Test Error:', error);
      setError(`Audio V3 Test failed: ${error.message}`);
      setProcessingProgress('❌ Audio V3 Test failed');
    } finally {
      setIsRunningDiagnostics(false);
      setTimeout(() => setProcessingProgress(''), 3000);
    }
  }, []);

  // Show blocked requests
  const showBlockedRequests = useCallback(async () => {
    try {
      const blockedRequests = getBlockedRequests();
      console.log('Blocked Requests:', blockedRequests);
      
      if (blockedRequests.length === 0) {
        setProcessingProgress('✅ No blocked requests found');
      } else {
        setProcessingProgress(`🚫 Found ${blockedRequests.length} blocked requests - check console`);
      }
    } catch (error) {
      console.error('Error getting blocked requests:', error);
      setProcessingProgress('❌ Error checking blocked requests');
    }
    
    setTimeout(() => setProcessingProgress(''), 3000);
  }, []);

  // Enhanced download function with more details
  const downloadResults = useCallback(() => {
    if (!transcript.trim()) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = fileInfo ? 
      `${fileInfo.name.split('.')[0]}_results_${timestamp}.txt` : 
      `speech_results_${timestamp}.txt`;
    
    let content = `📄 SPEECH PROCESSING RESULTS\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Language: ${selectedLanguage}\n`;
    
    if (fileInfo) {
      content += `\n📁 FILE INFORMATION:\n`;
      content += `• Name: ${fileInfo.name}\n`;
      content += `• Size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB\n`;
      content += `• Type: ${fileInfo.type}\n`;
      content += `• Last Modified: ${new Date(fileInfo.lastModified).toLocaleString()}\n`;
    }
    
    if (processingStats) {
      content += `\n📊 PROCESSING STATISTICS:\n`;
      content += `• Mode: ${processingStats.mode}\n`;
      content += `• Duration: ${Math.round(processingStats.duration || 0)}s\n`;
      content += `• Words: ${processingStats.words || 0}\n`;
      content += `• Confidence: ${Math.round((processingStats.confidence || 0) * 100)}%\n`;
    }
    
    content += `\n📝 TRANSCRIPT (${totalWords} words):\n`;
    content += `${transcript}\n`;
    
    if (summary.trim()) {
      content += `\n📋 SUMMARY:\n`;
      content += `${summary}\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, summary, totalWords, selectedLanguage, fileInfo, processingStats]);

  if (!historyLoaded) {
    return <div className="app"><div className="container"><div>Loading analysis history...</div></div></div>;
  }

  return (
    <div className="app" style={{background: 'linear-gradient(135deg, #1e2235 0%, #2a2d43 100%)', minHeight: '100vh', color: '#e6e6f0'}}>
      {/* Floating Guide Button */}
      <button 
        className="floating-guide-btn" 
        onClick={() => window.open('/guide.html', '_blank')}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
        }}
        title="Open Complete Feature Guide"
      >
        📖
      </button>

      <div className="container" style={{maxWidth: 1100, margin: '0 auto', padding: '32px 18px 48px 18px', background: 'rgba(30,34,53,0.98)', borderRadius: 18, boxShadow: '0 6px 32px #0007'}}>
        <div className="header" style={{marginBottom: 32, textAlign: 'center', position: 'relative'}}>
          <h1 className="title" style={{fontSize: '2.3em', fontWeight: 800, letterSpacing: '1.5px', color: '#7ed957', textShadow: '0 2px 12px #0008'}}>🧠 VoiceStudy — Speech Transcription & Emotion Intelligence</h1>
          <div className="subtitle" style={{fontSize: '1.15em', color: '#a97fff', marginTop: 6, fontWeight: 500}}>Powered by <span style={{color:'#4f8cff'}}>BERT AI Models</span> • <span style={{color:'#7ed957'}}>Real-time Emotion Detection</span> • <span style={{color:'#f093fb'}}>Smart Summarization</span></div>
          
          {/* Inline Guide Button in Header */}
          <button 
            onClick={() => window.open('/guide.html', '_blank')}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'linear-gradient(135deg, #4f8cff, #3b82f6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 3px 15px rgba(79, 140, 255, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 20px rgba(79, 140, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #4f8cff, #3b82f6)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 3px 15px rgba(79, 140, 255, 0.3)';
            }}
            title="Complete Feature Guide - All algorithms, features, and solutions explained"
          >
            📖 Guide
          </button>
        </div>

        {/* Translation Status Display */}
        {(isTranslating || showTranslationInfo) && (
          <div className="translation-status" style={{
            background: 'linear-gradient(120deg, #2a3f5f 60%, #1e3a5f 100%)', 
            borderRadius: 14, 
            boxShadow: '0 2px 16px #0005', 
            padding: '18px', 
            marginBottom: 24,
            border: '1px solid #4f8cff'
          }}>
            {isTranslating ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 20, 
                  height: 20, 
                  border: '2px solid #4f8cff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{color: '#4f8cff', fontWeight: 600}}>🌐 Translating content to English...</span>
              </div>
            ) : (showTranslationInfo && translationInfo) ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
                  <span style={{fontSize: '1.2em'}}>🌐</span>
                  <span style={{color: '#7ed957', fontWeight: 700}}>Translation Applied</span>
                </div>
                <div style={{fontSize: '0.95em', color: '#b0b0c0', lineHeight: 1.4}}>
                  <div><strong style={{color: '#4f8cff'}}>Original Language:</strong> {translationInfo.originalLanguage}</div>
                  <div><strong style={{color: '#4f8cff'}}>Translation Method:</strong> {translationInfo.fallback ? 'Dictionary Fallback' : 'Google Translate API'}</div>
                  {translationInfo.confidence && (
                    <div><strong style={{color: '#4f8cff'}}>Confidence:</strong> {Math.round(translationInfo.confidence * 100)}%</div>
                  )}
                </div>
                <button 
                  onClick={() => setShowTranslationInfo(false)}
                  style={{
                    background: '#f76e6e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '4px 12px', 
                    fontSize: '0.85em',
                    marginTop: 8,
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Grammar Correction Status Display */}
        {(isCorrectingGrammar || showGrammarInfo) && (
          <div className="grammar-status" style={{
            background: 'linear-gradient(120deg, #3f2a5f 60%, #5f1e3a 100%)', 
            borderRadius: 14, 
            boxShadow: '0 2px 16px #0005', 
            padding: '18px', 
            marginBottom: 24,
            border: '1px solid #a97fff'
          }}>
            {isCorrectingGrammar ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 20, 
                  height: 20, 
                  border: '2px solid #a97fff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{color: '#a97fff', fontWeight: 600}}>📝 Correcting grammar...</span>
              </div>
            ) : (showGrammarInfo && grammarCorrection) ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
                  <span style={{fontSize: '1.2em'}}>📝</span>
                  <span style={{color: '#7ed957', fontWeight: 700}}>Grammar Corrections Applied</span>
                </div>
                <div style={{fontSize: '0.95em', color: '#b0b0c0', lineHeight: 1.4}}>
                  <div><strong style={{color: '#a97fff'}}>Corrections Made:</strong> {grammarCorrection.totalCorrections}</div>
                  <div><strong style={{color: '#a97fff'}}>Confidence:</strong> {Math.round(grammarCorrection.confidence * 100)}%</div>
                  {grammarCorrection.summary.categories && Object.keys(grammarCorrection.summary.categories).length > 0 && (
                    <div><strong style={{color: '#a97fff'}}>Types:</strong> {Object.keys(grammarCorrection.summary.categories).join(', ')}</div>
                  )}
                </div>
                {grammarCorrection.corrections && grammarCorrection.corrections.length > 0 && (
                  <div style={{marginTop: 8, fontSize: '0.85em', color: '#9a9ac0'}}>
                    <strong>Examples:</strong>
                    <ul style={{margin: '4px 0', paddingLeft: 16}}>
                      {grammarCorrection.corrections.slice(0, 3).map((correction, idx) => (
                        <li key={idx} style={{marginBottom: 2}}>
                          {correction.category}: Fixed {correction.pattern.replace(/\\/g, '').slice(0, 30)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button 
                  onClick={() => setShowGrammarInfo(false)}
                  style={{
                    background: '#f76e6e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '4px 12px', 
                    fontSize: '0.85em',
                    marginTop: 8,
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Emotion Detection Status Display */}
        {(isEmotionDetectionActive || showEmotionInfo) && currentEmotion && (
          <div className="emotion-status" style={{
            background: 'linear-gradient(120deg, #5f3a2a 60%, #3a5f2a 100%)', 
            borderRadius: 14, 
            boxShadow: '0 2px 16px #0005', 
            padding: '18px', 
            marginBottom: 24,
            border: '1px solid #ff7f50'
          }}>
            {isEmotionDetectionActive && !currentEmotion ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 20, 
                  height: 20, 
                  border: '2px solid #ff7f50', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{color: '#ff7f50', fontWeight: 600}}>🎭 Analyzing speech emotions...</span>
              </div>
            ) : (currentEmotion && (currentEmotion.detected || currentEmotion.emotion)) ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
                  <span style={{fontSize: '1.2em'}}>🎭</span>
                  <span style={{color: '#7ed957', fontWeight: 700}}>
                    Emotion Detected: {(currentEmotion.detected || currentEmotion.emotion || 'unknown').charAt(0).toUpperCase() + (currentEmotion.detected || currentEmotion.emotion || 'unknown').slice(1)}
                  </span>
                </div>
                <div style={{fontSize: '0.95em', color: '#b0b0c0', lineHeight: 1.4}}>
                  <div><strong style={{color: '#ff7f50'}}>Confidence:</strong> {Math.round(currentEmotion.confidence || 0)}%</div>
                  <div><strong style={{color: '#ff7f50'}}>Detection Status:</strong> {isEmotionDetectionActive ? 'Real-time Active' : 'Manual Analysis'}</div>
                  {currentEmotion.breakdown && currentEmotion.breakdown[currentEmotion.detected || currentEmotion.emotion] && (
                    <div><strong style={{color: '#ff7f50'}}>Evidence:</strong> 
                      Text({currentEmotion.breakdown[currentEmotion.detected || currentEmotion.emotion].textScore || 0}), 
                      Audio({currentEmotion.breakdown[currentEmotion.detected || currentEmotion.emotion].audioScore || 0}), 
                      Context({currentEmotion.breakdown[currentEmotion.detected || currentEmotion.emotion].contextScore || 0})
                    </div>
                  )}
                </div>
                <div style={{marginTop: 8, fontSize: '0.85em', color: '#9a9ac0'}}>
                  <strong>Interpretation:</strong> {getEmotionInterpretation(currentEmotion.detected || currentEmotion.emotion || 'neutral', currentEmotion.confidence || 0)}
                </div>
                <div style={{marginTop: 10, display: 'flex', gap: 8}}>
                  <button 
                    onClick={() => setShowEmotionInfo(false)}
                    style={{
                      background: '#f76e6e', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '4px 12px', 
                      fontSize: '0.85em',
                      cursor: 'pointer'
                    }}
                  >
                    Dismiss
                  </button>
                  {!isEmotionDetectionActive && emotionDetectorRef.current && (
                    <button 
                      onClick={startEmotionDetection}
                      style={{
                        background: '#4f8cff', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '4px 12px', 
                        fontSize: '0.85em',
                        cursor: 'pointer'
                      }}
                    >
                      Start Real-time
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Fallback for unexpected states
              <div style={{color: '#ff7f50', fontWeight: 600}}>
                <div>🎭 Emotion Analysis Result:</div>
                <div style={{fontSize: '0.9em', color: '#b0b0c0', marginTop: 8}}>
                  {currentEmotion ? (
                    <>
                      <div>Status: Analysis completed</div>
                      <div>Data: {JSON.stringify(currentEmotion)}</div>
                    </>
                  ) : (
                    <div>No emotion data available</div>
                  )}
                </div>
                <button 
                  onClick={() => setShowEmotionInfo(false)}
                  style={{
                    background: '#f76e6e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '4px 12px', 
                    fontSize: '0.85em',
                    cursor: 'pointer',
                    marginTop: 10
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis History Section */}
        <div className="analysis-history-section" style={{background: 'linear-gradient(120deg, #23272f 60%, #2a2d43 100%)', borderRadius: 14, boxShadow: '0 2px 16px #0005', padding: '22px 18px 18px 18px', marginBottom: 32}}>
          <h3 style={{color:'#7ed957', fontWeight:700, fontSize:'1.25em', marginBottom: 10}}>🕑 Analysis History</h3>
          <div style={{display:'flex',gap:10,marginBottom:10}}>
            <button style={{background:'#4f8cff',color:'#fff',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,boxShadow:'0 1px 4px #0003',cursor:'pointer'}} onClick={() => {
              const stored = localStorage.getItem('analysisHistory');
              const currentState = `Analysis History Debug Info:\n\nLocalStorage: ${stored ? JSON.parse(stored).length + ' entries' : 'Empty'}\nCurrent State: ${analysisHistory.length} entries\nHistory Loaded: ${historyLoaded}\n\nLatest Entry: ${analysisHistory[0] ? JSON.stringify(analysisHistory[0], null, 2) : 'None'}`;
              alert(currentState);
            }}>Debug History (${analysisHistory.length})</button>
            <button style={{background:'#10b981',color:'#fff',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,boxShadow:'0 1px 4px #0003',cursor:'pointer'}} onClick={() => {
              try {
                const stored = localStorage.getItem('analysisHistory');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) {
                    setAnalysisHistory(parsed);
                    alert(`Synced ${parsed.length} entries from localStorage`);
                  }
                } else {
                  alert('No data in localStorage to sync');
                }
              } catch (error) {
                alert('Error syncing from localStorage: ' + error.message);
              }
            }}>Force Sync</button>
            <button style={{background:'#f76e6e',color:'#fff',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,boxShadow:'0 1px 4px #0003',cursor:'pointer'}} onClick={clearAnalysisHistory}>Reset History</button>
          </div>
          {analysisHistory.length === 0 ? (
            <div className="analysis-history-empty" style={{color:'#b0b0c0',fontSize:'1.05em',padding:'12px 0'}}>No previous analyses found.<br/><span style={{color:'#888',fontSize:'0.95em'}}>If you expected to see history, it may have been reset or corrupted. You can use the <b>Reset History</b> button above to clear and reload.</span></div>
          ) : (
            <ul className="analysis-history-list" style={{listStyle:'none',padding:0,margin:0}}>
              {analysisHistory.map((item, idx) => (
                <li className="analysis-history-item" key={item.id || idx} style={{background:'#23273a',borderRadius:8,marginBottom:10,padding:'10px 14px',boxShadow:'0 1px 6px #0002',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div className="history-info" style={{display:'flex',flexDirection:'column',gap:2}}>
                    <span className="history-type" style={{color:'#7ed957',fontWeight:600}}>{item.type || 'Unknown Type'}</span>
                    <span className="history-date" style={{color:'#a97fff',fontSize:'0.98em'}}>{item.date ? new Date(item.date).toLocaleString() : ''}</span>
                  </div>
                  <div className="history-actions" style={{display:'flex',gap:8}}>
                    <button className="history-view-btn" style={{background:'#4f8cff',color:'#fff',border:'none',borderRadius:5,padding:'4px 14px',fontWeight:600,cursor:'pointer'}} onClick={() => handleViewHistory(item, idx)}>View</button>
                    <button className="history-delete-btn" style={{background:'#f76e6e',color:'#fff',border:'none',borderRadius:5,padding:'4px 14px',fontWeight:600,cursor:'pointer'}} onClick={() => handleDeleteHistory(idx)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Viewed analysis modal/section */}
          {viewedAnalysis && (
            <div className="summary-section" style={{marginTop: 24}}>
              <h3 style={{color:'#4f8cff',fontWeight:700,marginBottom:10}}>🔎 Analysis Details</h3>
              <div className="summary-display" style={{display:'flex',flexDirection:'column',gap:'22px'}}>
                <div style={{background:'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)',color:'#fff',borderRadius:12,padding:'18px 16px',boxShadow:'0 2px 12px #0004',borderLeft:'6px solid #4f8cff'}}>
                  <div style={{fontSize:'1.08em',fontWeight:'bold',marginBottom:6,letterSpacing:'0.5px',color:'#4f8cff'}}>Type</div>
                  <div>{viewedAnalysis.type}</div>
                </div>
                <div style={{background:'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)',color:'#fff',borderRadius:12,padding:'18px 16px',boxShadow:'0 2px 12px #0004',borderLeft:'6px solid #7ed957'}}>
                  <div style={{fontSize:'1.08em',fontWeight:'bold',marginBottom:6,letterSpacing:'0.5px',color:'#7ed957'}}>Date</div>
                  <div>{viewedAnalysis.date ? new Date(viewedAnalysis.date).toLocaleString() : ''}</div>
                </div>
                <div style={{background:'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)',color:'#fff',borderRadius:12,padding:'18px 16px',boxShadow:'0 2px 12px #0004',borderLeft:'6px solid #ffb347'}}>
                  <div style={{fontSize:'1.08em',fontWeight:'bold',marginBottom:6,letterSpacing:'0.5px',color:'#ffb347'}}>Transcript / Text</div>
                  <pre style={{whiteSpace: 'pre-wrap',margin:0,background:'none',color:'#e0e0e0',fontSize:'1.01em'}}>{viewedAnalysis.transcript}</pre>
                </div>
                {viewedAnalysis.summary && (
                  <div style={{background:'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)',color:'#fff',borderRadius:12,padding:'18px 16px',boxShadow:'0 2px 12px #0004',borderLeft:'6px solid #f76e6e'}}>
                    <div style={{fontSize:'1.08em',fontWeight:'bold',marginBottom:6,letterSpacing:'0.5px',color:'#f76e6e'}}>Summary</div>
                    <pre style={{whiteSpace: 'pre-wrap',margin:0,background:'none',color:'#e0e0e0',fontSize:'1.01em'}}>{viewedAnalysis.summary}</pre>
                  </div>
                )}
                {viewedAnalysis.analysis && (
                  <div style={{background:'linear-gradient(120deg,#23272f 60%,#2a2d43 100%)',color:'#fff',borderRadius:12,padding:'18px 16px',boxShadow:'0 2px 12px #0004',borderLeft:'6px solid #a97fff',overflowX:'auto',maxHeight:500}}>
                    <div style={{fontSize:'1.08em',fontWeight:'bold',marginBottom:6,letterSpacing:'0.5px',color:'#a97fff'}}>Analysis</div>
                    <div style={{fontSize:'1em',lineHeight:1.7,whiteSpace:'pre-wrap',color:'#e0e0e0',fontFamily:'inherit'}}>
                      {(() => {
                        const a = viewedAnalysis.analysis;
                        if (!a || typeof a !== 'object') return String(a);
                        // Helper to render a section
                        const renderSection = (title, content) => (
                          <div style={{marginBottom:14}}>
                            <div style={{color:'#a97fff',fontWeight:'bold',fontSize:'1.04em',marginBottom:2}}>{title}</div>
                            <div style={{marginLeft:10}}>{content}</div>
                          </div>
                        );
                        let out = [];
                        // Overview
                        if (a.overview) {
                          out.push(renderSection('Overview',
                            Object.entries(a.overview).map(([k,v]) => `${k}: ${v}`).join('\n')
                          ));
                        }
                        // Sentiment
                        if (a.sentiment) {
                          out.push(renderSection('Sentiment',
                            Object.entries(a.sentiment).map(([k,v]) => `${k}: ${v}`).join('\n')
                          ));
                        }
                        // Statistics
                        if (a.statistics) {
                          out.push(renderSection('Statistics',
                            Object.entries(a.statistics).map(([k,v]) => `${k}: ${v}`).join('\n')
                          ));
                        }
                        // Keywords
                        if (Array.isArray(a.keywords)) {
                          out.push(renderSection('Keywords',
                            a.keywords.map(kw => `• ${kw.word || kw.topic || kw.type || ''}${kw.count ? ` (${kw.count})` : ''}`).join('\n')
                          ));
                        }
                        // Topic Distribution
                        if (Array.isArray(a.topicDistribution)) {
                          out.push(renderSection('Topic Distribution',
                            a.topicDistribution.map(td => `• ${td.topic}: ${td.count}`).join('\n')
                          ));
                        }
                        // Emotion Analysis
                        if (Array.isArray(a.emotionAnalysis)) {
                          out.push(renderSection('Emotion Analysis',
                            a.emotionAnalysis.map(ea => `• ${ea.emotion}: ${ea.count}`).join('\n')
                          ));
                        }
                        // Linguistic Analysis
                        if (a.linguisticAnalysis) {
                          out.push(renderSection('Linguistic Analysis',
                            Object.entries(a.linguisticAnalysis).map(([k,v]) => `${k}: ${v}`).join('\n')
                          ));
                        }
                        // Insights
                        if (Array.isArray(a.insights)) {
                          out.push(renderSection('Insights',
                            a.insights.map(ins => `• ${ins.title || ins.type || ''}: ${ins.description || ''}`).join('\n')
                          ));
                        }
                        // Questions
                        if (Array.isArray(a.questions)) {
                          out.push(renderSection('Questions',
                            a.questions.map(q => `• ${q}`).join('\n')
                          ));
                        }
                        // Fallback: show any other top-level fields not already shown
                        const shown = ['overview','sentiment','statistics','keywords','topicDistribution','emotionAnalysis','linguisticAnalysis','insights','questions'];
                        Object.entries(a).forEach(([k,v]) => {
                          if (!shown.includes(k)) {
                            if (typeof v === 'string' || typeof v === 'number') {
                              out.push(renderSection(k.charAt(0).toUpperCase()+k.slice(1), v));
                            }
                          }
                        });
                        return out;
                      })()}
                    </div>
                  </div>
                )}
                <button className="history-view-btn" style={{marginTop: 8,alignSelf:'flex-start'}} onClick={() => setViewedAnalysis(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
        {/* Restore tabs and content UI */}
        <div className="tabs" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '32px 0 18px 0',
          justifyContent: 'center',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {/* Row 1: Core Features */}
          <button 
            className={`tab ${activeTab === 'speech' ? 'active' : ''}`}
            style={{background: activeTab==='speech' ? 'linear-gradient(90deg,#7ed957 60%,#4f8cff 100%)' : '#23273a', color: activeTab==='speech' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('speech')}
          >
            🎤 Live Speech
          </button>
          <button 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            style={{background: activeTab==='upload' ? 'linear-gradient(90deg,#ffb347 60%,#7ed957 100%)' : '#23273a', color: activeTab==='upload' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('upload')}
          >
            📁 File Upload
          </button>
          <button 
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            style={{background: activeTab==='text' ? 'linear-gradient(90deg,#a97fff 60%,#f76e6e 100%)' : '#23273a', color: activeTab==='text' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('text')}
          >
            📝 Text Input
          </button>
          <button 
            className={`tab ${activeTab === 'emotions' ? 'active' : ''}`}
            style={{background: activeTab==='emotions' ? 'linear-gradient(90deg,#ff6b6b 60%,#4ecdc4 100%)' : '#23273a', color: activeTab==='emotions' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('emotions')}
          >
            🧠 Emotion V4
          </button>


          {/* Students section */}
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            style={{background: activeTab==='students' ? 'linear-gradient(90deg,#22c55e 60%,#06b6d4 100%)' : '#23273a', color: activeTab==='students' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('students')}
          >
            🎓 Students
          </button>

          {/* Emotion Detection AI Platform tab */}
          <button
            className={`tab`}
            style={{background: '#23273a', color: '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => window.open('https://emotionalqiplatform.netlify.app/', '_blank', 'noopener')}
          >
            🌐 Emotion Detection AI Platform
          </button>
          
          {/* Row 2: Export & BERT Features */}
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            style={{background: activeTab==='export' ? 'linear-gradient(90deg,#10b981 60%,#3b82f6 100%)' : '#23273a', color: activeTab==='export' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('export')}
          >
            📤 Export & Reports
          </button>
          <button 
            className={`tab ${activeTab === 'bertsummary' ? 'active' : ''}`}
            style={{background: activeTab==='bertsummary' ? 'linear-gradient(90deg,#667eea 60%,#764ba2 100%)' : '#23273a', color: activeTab==='bertsummary' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('bertsummary')}
          >
            🧠 BERT Summary & Insights
          </button>
          <button 
            className={`tab ${activeTab === 'novelbert' ? 'active' : ''}`}
            style={{background: activeTab==='novelbert' ? 'linear-gradient(90deg,#a855f7 60%,#ec4899 100%)' : '#23273a', color: activeTab==='novelbert' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('novelbert')}
          >
            🌟 Novel BERT
          </button>
          <button 
            className={`tab ${activeTab === 'training' ? 'active' : ''}`}
            style={{background: activeTab==='training' ? 'linear-gradient(90deg,#f59e0b 60%,#d97706 100%)' : '#23273a', color: activeTab==='training' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('training')}
          >
            🎯 Training Center
          </button>
          <button 
            className={`tab ${activeTab === 'voiceemotion' ? 'active' : ''}`}
            style={{background: activeTab==='voiceemotion' ? 'linear-gradient(90deg,#e11d48 60%,#be123c 100%)' : '#23273a', color: activeTab==='voiceemotion' ? '#23272f' : '#a97fff', border:'none',borderRadius:8,padding:'12px 20px',fontWeight:700,fontSize:'0.95em',boxShadow:'0 1px 8px #0002',cursor:'pointer',transition:'all 0.2s',minWidth:'140px',textAlign:'center'}}
            onClick={() => setActiveTab('voiceemotion')}
          >
            🎤 Voice Emotion
          </button>
          
          {/* VOSK DIAGNOSTICS TAB - BRIGHT AND PROMINENT */}
          <button 
            className={`tab ${activeTab === 'diagnostics' ? 'active' : ''}`}
            style={{background: activeTab==='diagnostics' ? 'linear-gradient(90deg,#ff0000 60%,#cc0000 100%)' : '#ff0000', color: '#ffffff', border:'3px solid #ff0000',borderRadius:8,padding:'12px 20px',fontWeight:900,fontSize:'1.1em',boxShadow:'0 4px 16px rgba(255,0,0,0.4)',cursor:'pointer',transition:'all 0.2s',minWidth:'180px',textAlign:'center',textShadow:'1px 1px 2px rgba(0,0,0,0.5)',animation:'pulse 2s infinite'}}
            onClick={() => setActiveTab('diagnostics')}
          >
            🔧 VOSK DIAGNOSTICS HERE!
          </button>
        </div>
        <div className="content">
          {activeTab === 'speech' && (
            <div className="tab-content">
              <h2>🎤 Live Speech Recognition</h2>
              {/* Language Selection */}
              <div className="language-section">
                <h3>🌍 Select Language</h3>
                <div className="language-grid">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''} ${!lang.vosk ? 'limited' : ''}`}
                      onClick={() => setSelectedLanguage(lang.code)}
                      disabled={isListening}
                      title={lang.vosk ? 'Fully supported with Vosk' : 'Limited support - Web Speech API only'}
                    >
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.name}</span>
                      {lang.vosk && <span className="vosk-badge">Vosk</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Enhanced Controls */}
              <div className="controls-section">
                <div className="main-controls">
                  <button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={!isRecognitionSupported.current}
                  >
                    <span className="mic-icon">{isListening ? '⏹️' : '🎤'}</span>
                    <span className="mic-text">{isListening ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                  <button
                    className="control-button summarize"
                    onClick={generateSummary}
                    disabled={!transcript.trim() || isProcessing}
                  >
                    <span className="button-icon">📝</span>
                    {isProcessing ? 'Processing...' : 'Generate Summary'}
                  </button>
                  <button
                    className="control-button video-suggest"
                    onClick={generateVideoSuggestions}
                    disabled={!transcript.trim() || isGeneratingVideos}
                  >
                    <span className="button-icon">📺</span>
                    {isGeneratingVideos ? 'Generating...' : 'Suggest Videos'}
                  </button>
                  <button
                    className="control-button grammar-correct"
                    onClick={async () => {
                      const correctedText = await correctTranscriptGrammar(transcript);
                      if (correctedText !== transcript) {
                        setTranscript(correctedText);
                      }
                    }}
                    disabled={!transcript.trim() || isCorrectingGrammar}
                  >
                    <span className="button-icon">✏️</span>
                    {isCorrectingGrammar ? 'Correcting...' : 'Fix Grammar'}
                  </button>
                  <button
                    className="control-button emotion-detect"
                    onClick={isEmotionDetectionActive ? stopEmotionDetection : analyzeEmotionManually}
                    disabled={!transcript.trim()}
                    title={!emotionDetectorRef.current ? "Using text-based emotion analysis (microphone access not available)" : "Full audio + text emotion analysis"}
                  >
                    <span className="button-icon">🎭</span>
                    {isEmotionDetectionActive ? 'Stop Emotion Detection' : 'Analyze Emotion'}
                  </button>
                  
                  {/* Emotion Test Buttons */}
                  <div style={{display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap'}}>
                    <button
                      style={{background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8em', cursor: 'pointer'}}
                      onClick={() => {
                        const sarcasmText = 'Oh great, this is just fantastic! Another wonderful day where everything goes perfectly wrong. I love how nothing ever works when you need it to.';
                        setTranscript(sarcasmText);
                      }}
                    >
                      Test Sarcasm
                    </button>
                    <button
                      style={{background: '#51cf66', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8em', cursor: 'pointer'}}
                      onClick={() => {
                        const enthusiasmText = 'I am absolutely thrilled to announce that our team has achieved a major breakthrough! This is incredible news and I couldn\'t be more excited!';
                        setTranscript(enthusiasmText);
                      }}
                    >
                      Test Enthusiasm
                    </button>
                    <button
                      style={{background: '#ffa726', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8em', cursor: 'pointer'}}
                      onClick={() => {
                        const frustrationText = 'This is so annoying and frustrated. There are multiple issues and problems. I seriously dont know what to do anymore.';
                        setTranscript(frustrationText);
                      }}
                    >
                      Test Frustration
                    </button>
                    <button
                      style={{background: '#42a5f5', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8em', cursor: 'pointer'}}
                      onClick={() => {
                        const confidenceText = 'I am absolutely certain and confident that the positive results show we are making great progress. The treatment is working good.';
                        setTranscript(confidenceText);
                      }}
                    >
                      Test Confidence
                    </button>
                    <button
                      style={{background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8em', cursor: 'pointer'}}
                      onClick={() => {
                        const neutralText = 'Exposure and training of students in fundamental concepts of sketching based visual representations. Hand sketching of general products and digital design using CAD software.';
                        setTranscript(neutralText);
                      }}
                    >
                      Test Neutral
                    </button>
                  </div>
                </div>
                <div className="secondary-controls">
                  <button
                    className="control-button clear"
                    onClick={clearSession}
                    disabled={!transcript.trim() && !summary.trim()}
                  >
                    <span className="button-icon">🗑️</span>
                    Clear All
                  </button>
                  <button
                    className="control-button download"
                    onClick={downloadResults}
                    disabled={!transcript.trim()}
                  >
                    <span className="button-icon">📥</span>
                    Download Results
                  </button>
                  <button
                    className="control-button process"
                    onClick={runDiagnostics}
                    disabled={isRunningDiagnostics}
                  >
                    <span className="button-icon">🔍</span>
                    {isRunningDiagnostics ? 'Running...' : 'Test Vosk'}
                  </button>
                  <button
                    className="control-button process"
                    onClick={testAudioProcessorV3}
                    disabled={isRunningDiagnostics}
                  >
                    <span className="button-icon">🎵</span>
                    Test Audio V3
                  </button>
                  <button
                    className="control-button process"
                    onClick={showBlockedRequests}
                    disabled={isRunningDiagnostics}
                  >
                    <span className="button-icon">🚫</span>
                    Blocked Requests
                  </button>
                </div>
              </div>
              {/* Vosk Diagnostics Display */}
              {voskDiagnostics && (
                <div className="diagnostics-section">
                  <h3>🔍 Vosk Diagnostics Results</h3>
                  <div className={`diagnostics-display ${voskDiagnostics.success ? 'success' : 'error'}`}>
                    <div className="diagnostics-status">
                      <span className="status-icon">{voskDiagnostics.success ? '✅' : '❌'}</span>
                      <span className="status-message">{voskDiagnostics.message}</span>
                    </div>
                    {voskDiagnostics.tests && (
                      <div className="diagnostics-details">
                        <h4>Test Results:</h4>
                        <ul>
                          {Object.entries(voskDiagnostics.tests).map(([testName, result]) => (
                            <li key={testName}>
                              <strong>{testName}:</strong> 
                              <span className={result.success ? 'success' : 'error'}>
                                {result.success ? '✅ Passed' : '❌ Failed'}
                              </span>
                              <div className="test-message">{result.message}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Speech Status */}
              {isListening && (
                <div className="speech-status">
                  <div className="status-indicator">
                    <div className="pulse-ring"></div>
                    <div className="pulse-dot"></div>
                  </div>
                  <span>Listening... Speak now</span>
                </div>
              )}
              {/* Transcript Display */}
              <div className="transcript-section">
                <h3>📝 {fileInfo ? 'Extracted Text' : 'Transcript'} ({totalWords} words)</h3>
                <div className="transcript-container">
                  <textarea
                    className="transcript-display"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={isListening ? "Listening... Your speech will appear here..." : "Click 'Start Recording' to begin speech recognition..."}
                    rows="10"
                  />
                  <div className="transcript-stats">
                    <span>Words: {totalWords}</span>
                    <span>Characters: {transcript.length}</span>
                    <span>Language: {languages.find(l => l.code === selectedLanguage)?.name}</span>
                  </div>
                </div>
              </div>
              {/* Summary Display */}
              {summary && (
                <div className="summary-section">
                  <h3>📋 Summary</h3>
                  <div className="summary-display">
                    <pre>{summary}</pre>
                  </div>
                </div>
              )}
              {/* Error Display */}
              {error && (
                <div className="error-display">
                  <span className="error-icon">❌</span>
                  <span className="error-message">{error}</span>
                </div>
              )}
            </div>
          )}
          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2>📁 Content Upload & Processing</h2>
              {/* ...existing code for upload tab content... */}
              {/* Content Processing Domain Selection */}
              <div className="domain-selection-section">
                <h3 className="section-title">🎯 Processing Domain</h3>
                <div className="domain-grid">
                  <div className="domain-option">
                    <div className="option-icon">📚</div>
                    <div className="option-content">
                      <div className="option-title">Research & Academic</div>
                      <div className="option-description">Specialized processing for research papers and academic content</div>
                    </div>
                  </div>
                  <div className="domain-option">
                    <div className="option-icon">⚖️</div>
                    <div className="option-content">
                      <div className="option-title">Legal Documents</div>
                      <div className="option-description">Legal document analysis and processing</div>
                    </div>
                  </div>
                  <div className="domain-option">
                    <div className="option-icon">🏥</div>
                    <div className="option-content">
                      <div className="option-title">Medical & Healthcare</div>
                      <div className="option-description">Medical document and record processing</div>
                    </div>
                  </div>
                  <div className="domain-option">
                    <div className="option-icon">💼</div>
                    <div className="option-content">
                      <div className="option-title">Business & Finance</div>
                      <div className="option-description">Business documents and financial reports</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Content Types Support */}
              <div className="file-types-section">
                <h3>📋 Supported Content Types</h3>
                <div className="file-types-grid">
                  <div className="file-type-group">
                    <div className="file-type-header">
                      <span className="file-type-icon">🎧</span>
                      <span className="file-type-label">Audio Files (Vosk Processing)</span>
                    </div>
                    <div className="file-type-extensions">
                      {supportedFileTypes.audio.map(ext => (
                        <span key={ext} className="file-extension">{ext}</span>
                      ))}
                    </div>
                  </div>
                  <div className="file-type-group">
                    <div className="file-type-header">
                      <span className="file-type-icon">📄</span>
                      <span className="file-type-label">Documents</span>
                    </div>
                    <div className="file-type-extensions">
                      {supportedFileTypes.document.map(ext => (
                        <span key={ext} className="file-extension">{ext}</span>
                      ))}
                    </div>
                  </div>
                  <div className="file-type-group">
                    <div className="file-type-header">
                      <span className="file-type-icon">🖼️</span>
                      <span className="file-type-label">Images</span>
                    </div>
                    <div className="file-type-extensions">
                      {supportedFileTypes.image.map(ext => (
                        <span key={ext} className="file-extension">{ext}</span>
                      ))}
                    </div>
                  </div>
                  <div className="file-type-group">
                    <div className="file-type-header">
                      <span className="file-type-icon">📝</span>
                      <span className="file-type-label">Text Files</span>
                    </div>
                    <div className="file-type-extensions">
                      {supportedFileTypes.text.map(ext => (
                        <span key={ext} className="file-extension">{ext}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Enhanced File Upload Area */}
              <div className="upload-section">
                <div 
                  className={`upload-area ${dragOver ? 'drag-over' : ''} ${isProcessingFile ? 'processing' : ''}`}
                  onClick={handleFileUpload}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <div className="upload-icon">
                      {isProcessingFile ? '⚙️' : dragOver ? '📥' : '📁'}
                    </div>
                    <div className="upload-text">
                      {isProcessingFile ? 
                        'Processing file...' : 
                        dragOver ? 
                          'Drop your file here' : 
                          'Drop files here or click to upload'
                      }
                    </div>
                    <div className="upload-subtext">
                      {isProcessingFile ? 
                        processingProgress : 
                        'Supports all file types shown above'
                      }
                    </div>
                    {isProcessingFile && (
                      <div className="processing-indicator">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">{processingProgress}</div>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  accept={getAllSupportedTypes()}
                  onChange={handleFileChange}
                  disabled={isProcessingFile}
                  style={{ display: 'none' }}
                />
              </div>
              {/* File Information Display */}
              {fileInfo && (
                <div className="file-info-section">
                  <h3>📁 File Information</h3>
                  <div className="file-info-grid">
                    <div className="file-info-item">
                      <span className="file-info-label">Name:</span>
                      <span className="file-info-value">{fileInfo.name}</span>
                    </div>
                    <div className="file-info-item">
                      <span className="file-info-label">Size:</span>
                      <span className="file-info-value">{(fileInfo.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div className="file-info-item">
                      <span className="file-info-label">Type:</span>
                      <span className="file-info-value">{fileInfo.type || 'Unknown'}</span>
                    </div>
                    <div className="file-info-item">
                      <span className="file-info-label">Modified:</span>
                      <span className="file-info-value">{new Date(fileInfo.lastModified).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Processing Statistics */}
              {processingStats && (
                <div className="processing-stats-section">
                  <h3>📊 Processing Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Mode:</span>
                      <span className="stat-value">{processingStats.mode}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Duration:</span>
                      <span className="stat-value">{Math.round(processingStats.duration || 0)}s</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Words:</span>
                      <span className="stat-value">{processingStats.words || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Confidence:</span>
                      <span className="stat-value">{Math.round((processingStats.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Results Display */}
              {transcript && (
                <div className="results-section" tabIndex={-1} ref={el => { if (el && isProcessing) el.scrollIntoView({behavior:'smooth',block:'center'}); }}>
                  <h3>📝 Extracted Text ({totalWords} words)</h3>
                  <div className="results-container" style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap: '10px',width:'100%'}}>
                    <div style={{display:'flex',gap:'12px',marginBottom:'4px',flexWrap:'wrap'}}>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Words: {totalWords}</span>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Characters: {transcript.length}</span>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Lines: {transcript.split('\n').length}</span>
                    </div>
                    <div style={{width:'100%',position:'relative'}}>
                      <textarea
                        className="results-display"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows="12"
                        placeholder="Extracted text will appear here..."
                        style={{width:'100%',minWidth:'320px',maxWidth:'100%',marginBottom:'0',resize:'vertical'}}
                        aria-label="Extracted Text"
                        autoFocus={isProcessing}
                      />
                      {isProcessing && (
                        <div style={{position:'absolute',top:8,right:8,background:'rgba(30,30,40,0.85)',borderRadius:8,padding:'6px 14px',color:'#fff',fontWeight:600,boxShadow:'0 2px 8px #0003',zIndex:2,display:'flex',alignItems:'center',gap:'8px'}}>
                          <span className="spinner" style={{width:18,height:18,border:'3px solid #7a89a8',borderTop:'3px solid #fff',borderRadius:'50%',display:'inline-block',animation:'spin 1s linear infinite'}}></span>
                          Processing...
                        </div>
                      )}
                    </div>
                    <div className="controls" style={{display:'flex',flexDirection:'row',alignItems:'flex-start',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                      <button
                        className="control-button summarize"
                        onClick={generateSummary}
                        disabled={!transcript.trim() || isProcessing}
                        aria-label="Generate Summary"
                      >
                        <span className="button-icon">📝</span>
                        {isProcessing ? 'Processing...' : 'Generate Summary'}
                      </button>
                      <button
                        className="control-button clear"
                        onClick={clearSession}
                        disabled={!transcript.trim() && !summary.trim()}
                        aria-label="Clear All"
                      >
                        <span className="button-icon">🗑️</span>
                        Clear All
                      </button>
                      <button
                        className="control-button download"
                        onClick={downloadResults}
                        disabled={!transcript.trim()}
                        aria-label="Download Results"
                      >
                        <span className="button-icon">📥</span>
                        Download Results
                      </button>
                      <button
                        className="control-button video-suggest"
                        onClick={generateVideoSuggestions}
                        disabled={!transcript.trim() || isGeneratingVideos}
                        aria-label="Suggest YouTube Videos"
                      >
                        <span className="button-icon">📺</span>
                        {isGeneratingVideos ? 'Generating...' : 'Suggest Videos'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Summary Display */}
              {summary && (
                <div className="summary-section">
                  <h3>📋 Summary</h3>
                  <div className="summary-display">
                    <pre>{summary}</pre>
                  </div>
                </div>
              )}
              {/* Error Display */}
              {error && (
                <div className="error-display">
                  <span className="error-icon">❌</span>
                  <span className="error-message">{error}</span>
                </div>
              )}
            </div>
          )}
          {activeTab === 'text' && (
            <div className="tab-content">
              <h2>📝 Text Input & Processing</h2>
              <div className="text-input-section">
                <h3>✍️ Enter Text to Process</h3>
                <div className="text-input-container">
                  <textarea
                    className="text-input-area"
                    placeholder="Type or paste your text here for processing and summarization..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows="12"
                  />
                  <div className="text-input-stats">
                    <span>Words: {textInput.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                    <span>Characters: {textInput.length}</span>
                    <span>Lines: {textInput.split('\n').length}</span>
                  </div>
                </div>
                <div className="text-controls">
                  <button
                    className="control-button process"
                    onClick={processTextInput}
                    disabled={!textInput.trim() || isProcessing}
                  >
                    <span className="button-icon">📝</span>
                    {isProcessing ? 'Processing...' : 'Process Text'}
                  </button>
                  <button
                    className="control-button clear"
                    onClick={() => setTextInput('')}
                    disabled={!textInput.trim()}
                  >
                    <span className="button-icon">🗑️</span>
                    Clear Input
                  </button>
                  <button
                    className="control-button video-suggest"
                    onClick={generateVideoSuggestions}
                    disabled={!textInput.trim() || isGeneratingVideos}
                  >
                    <span className="button-icon">📺</span>
                    {isGeneratingVideos ? 'Generating...' : 'Suggest Videos'}
                  </button>
                </div>
              </div>
              {/* Results Display */}
              {transcript && (
                <div className="results-section" tabIndex={-1} ref={el => { if (el && isProcessing) el.scrollIntoView({behavior:'smooth',block:'center'}); }}>
                  <h3>📝 Processed Text ({totalWords} words)</h3>
                  <div className="results-container" style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap: '10px',width:'100%'}}>
                    <div style={{display:'flex',gap:'12px',marginBottom:'4px',flexWrap:'wrap'}}>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Words: {totalWords}</span>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Characters: {transcript.length}</span>
                      <span className="results-stats" style={{background:'#7a89a8',color:'#fff',borderRadius:'8px',padding:'4px 14px',fontWeight:500}}>Lines: {transcript.split('\n').length}</span>
                    </div>
                    <div style={{width:'100%',position:'relative'}}>
                      <textarea
                        className="results-display"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows="10"
                        placeholder="Processed text will appear here..."
                        style={{width:'100%',minWidth:'320px',maxWidth:'100%',marginBottom:'0',resize:'vertical'}}
                        aria-label="Processed Text"
                        autoFocus={isProcessing}
                      />
                      {isProcessing && (
                        <div style={{position:'absolute',top:8,right:8,background:'rgba(30,30,40,0.85)',borderRadius:8,padding:'6px 14px',color:'#fff',fontWeight:600,boxShadow:'0 2px 8px #0003',zIndex:2,display:'flex',alignItems:'center',gap:'8px'}}>
                          <span className="spinner" style={{width:18,height:18,border:'3px solid #7a89a8',borderTop:'3px solid #fff',borderRadius:'50%',display:'inline-block',animation:'spin 1s linear infinite'}}></span>
                          Processing...
                        </div>
                      )}
                    </div>
                    <div className="controls" style={{display:'flex',flexDirection:'row',alignItems:'flex-start',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                      <button
                        className="control-button summarize"
                        onClick={generateSummary}
                        disabled={!transcript.trim() || isProcessing}
                        aria-label="Generate Summary"
                      >
                        <span className="button-icon">📝</span>
                        {isProcessing ? 'Processing...' : 'Generate Summary'}
                      </button>
                      <button
                        className="control-button clear"
                        onClick={clearSession}
                        disabled={!transcript.trim() && !summary.trim()}
                        aria-label="Clear All"
                      >
                        <span className="button-icon">🗑️</span>
                        Clear All
                      </button>
                      <button
                        className="control-button download"
                        onClick={downloadResults}
                        disabled={!transcript.trim()}
                        aria-label="Download Results"
                      >
                        <span className="button-icon">📥</span>
                        Download Results
                      </button>
                      <button
                        className="control-button video-suggest"
                        onClick={generateVideoSuggestions}
                        disabled={!transcript.trim() || isGeneratingVideos}
                        aria-label="Suggest YouTube Videos"
                      >
                        <span className="button-icon">📺</span>
                        {isGeneratingVideos ? 'Generating...' : 'Suggest Videos'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Summary Display */}
              {summary && (
                <div className="summary-section">
                  <h3>📋 Summary</h3>
                  <div className="summary-display">
                    <pre>{summary}</pre>
                  </div>
                </div>
              )}
              {/* Error Display */}
              {error && (
                <div className="error-display">
                  <span className="error-icon">❌</span>
                  <span className="error-message">{error}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Emotion Detection V4 Tab */}
          {activeTab === 'emotions' && (
            <div className="tab-content">
              <EmotionDetectionIntegration />
            </div>
          )}
          


          {/* Students Study Pack Tab */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <StudentStudyAssistant />
            </div>
          )}
        </div>
        
        {/* YouTube Video Suggestions - Global Section */}
        {showVideoSuggestions && videoSuggestions.length > 0 && (
          <div className="video-suggestions-section" style={{
            background: 'linear-gradient(120deg, #ff6b6b 0%, #ee5a24 100%)',
            borderRadius: '18px',
            padding: '24px 20px',
            marginTop: '24px',
            boxShadow: '0 4px 24px rgba(255, 107, 107, 0.15)',
            border: '2px solid #ff9ff3'
          }}>
            <h3 style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.4em',
              marginBottom: '18px',
              letterSpacing: '1px',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📺 YouTube Video Suggestions
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.7em',
                fontWeight: 600
              }}>
                Based on your content
              </span>
            </h3>
            
            <div className="video-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginTop: '20px'
            }}>
              {videoSuggestions.map((video) => (
                <div key={video.id} className="video-card" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                onClick={() => openYouTubeSearch(video.searchQuery)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                }}>
                  <div className="video-header" style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div className="video-thumbnail" style={{
                      fontSize: '2.5em',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      borderRadius: '8px',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(238, 90, 36, 0.3)'
                    }}>
                      {video.thumbnail}
                    </div>
                    <div className="video-info" style={{ flex: 1 }}>
                      <h4 style={{
                        color: '#2c3e50',
                        fontWeight: 700,
                        fontSize: '1.1em',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {video.title}
                      </h4>
                      <div className="video-meta" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '0.85em',
                        color: '#7f8c8d'
                      }}>
                        <span style={{ fontWeight: 600, color: '#e74c3c' }}>{video.channel}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span>⏱️ {video.duration}</span>
                          <span>👁️ {video.views}</span>
                          <span style={{
                            background: `linear-gradient(90deg, #27ae60 0%, #2ecc71 ${video.relevance}%, #95a5a6 ${video.relevance}%, #bdc3c7 100%)`,
                            borderRadius: '10px',
                            padding: '2px 8px',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.8em'
                          }}>
                            {video.relevance}% Match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p style={{
                    color: '#34495e',
                    fontSize: '0.9em',
                    lineHeight: '1.4',
                    margin: '0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {video.description}
                  </p>
                  <div className="video-action" style={{
                    marginTop: '12px',
                    textAlign: 'center'
                  }}>
                    <button style={{
                      background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      fontSize: '0.9em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={(e) => {
                      e.stopPropagation();
                      openYouTubeSearch(video.searchQuery);
                    }}>
                      🔍 Search on YouTube
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="video-suggestions-footer" style={{
              marginTop: '20px',
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                margin: '0 0 12px 0',
                fontSize: '0.95em',
                fontWeight: 500
              }}>
                💡 These suggestions are generated based on your transcript content analysis
              </p>
              <button
                onClick={() => setShowVideoSuggestions(false)}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
              >
                Hide Suggestions
              </button>
            </div>
          </div>
        )}
        
        {/* Step 5: Advanced Export System */}
        {activeTab === 'export' && (
          <AdvancedExportSystem 
            analysisData={viewedAnalysis}
            analysisHistory={analysisHistory}
            isVisible={true}
          />
        )}

        {/* BERT Summary & Insights */}
        {activeTab === 'bertsummary' && (
          <div className="tab-content">
            <BERTSummaryInsights 
              key={transcript || viewedAnalysis?.transcript || 'empty'}
              transcript={transcript || (viewedAnalysis ? viewedAnalysis.transcript : '')} 
            />
          </div>
        )}

        {/* Novel BERT Real-World Problem Solver */}
        {activeTab === 'novelbert' && (
          <div className="tab-content">
            <NovelBERTProblemSolver />
          </div>
        )}

        {/* Training Center */}
        {activeTab === 'training' && (
          <div className="tab-content">
            <TrainingCenter externalTrainingSamples={externalTrainingSamples} />
          </div>
        )}

        {/* Enhanced Voice Emotion Analyzer */}
        {activeTab === 'voiceemotion' && (
          <div className="tab-content">
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '10px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                🎤 Enhanced Voice Emotion Analysis
              </h2>
              <p style={{
                fontSize: '1.2rem',
                opacity: 0.9,
                marginBottom: '20px'
              }}>
                Advanced multi-modal emotion detection with BERT integration, voice analysis, and pattern recognition
              </p>
              
              {enhancedResults && (
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginTop: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>
                    🧠 Latest Enhanced Analysis Results
                  </h3>
                  
                  {enhancedResults.fusedAnalysis && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4>🎯 Multi-Modal Fusion Analysis:</h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '10px',
                        marginTop: '10px'
                      }}>
                        {Object.entries(enhancedResults.fusedAnalysis.emotions || {}).map(([emotion, score]) => (
                          <div key={emotion} style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                              {emotion}
                            </div>
                            <div style={{ fontSize: '1.2rem', color: '#ffd700' }}>
                              {(score * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                        Confidence: {((enhancedResults.fusedAnalysis.confidence || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  
                  {enhancedResults.bertAnalysis && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4>📝 Enhanced BERT Analysis:</h4>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Primary Emotion: <strong>{enhancedResults.bertAnalysis.primaryEmotion}</strong> 
                        ({((enhancedResults.bertAnalysis.confidence || 0) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  )}
                  
                  {enhancedResults.voiceAnalysis && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4>🔊 Voice Emotion Analysis:</h4>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Detected: <strong>{enhancedResults.voiceAnalysis.dominantEmotion}</strong>
                        <br />
                        Features: Pitch, Energy, Spectral Analysis
                      </div>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7, 
                    marginTop: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '10px'
                  }}>
                    Analysis completed: {new Date(enhancedResults.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
              
              {!enhancedResults && (
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginTop: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ marginBottom: '10px' }}>📁 Upload or Record Audio</h3>
                  <p style={{ opacity: 0.8, marginBottom: '15px' }}>
                    Upload an audio file or record your voice to see enhanced emotion analysis in action
                  </p>
                  <button
                    onClick={handleFileUpload}
                    style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    📁 Upload Audio File
                  </button>
                  
                  {/* Test Button for Generated Audio */}
                  <button
                    onClick={async () => {
                      try {
                        // Create a test audio file
                        const sampleRate = 16000;
                        const duration = 2; // 2 seconds
                        const samples = sampleRate * duration;
                        const buffer = new ArrayBuffer(44 + samples * 2);
                        const view = new DataView(buffer);
                        
                        // WAV header
                        const writeString = (offset, string) => {
                          for (let i = 0; i < string.length; i++) {
                            view.setUint8(offset + i, string.charCodeAt(i));
                          }
                        };
                        
                        writeString(0, 'RIFF');
                        view.setUint32(4, 36 + samples * 2, true);
                        writeString(8, 'WAVE');
                        writeString(12, 'fmt ');
                        view.setUint32(16, 16, true);
                        view.setUint16(20, 1, true);
                        view.setUint16(22, 1, true);
                        view.setUint32(24, sampleRate, true);
                        view.setUint32(28, sampleRate * 2, true);
                        view.setUint16(32, 2, true);
                        view.setUint16(34, 16, true);
                        writeString(36, 'data');
                        view.setUint32(40, samples * 2, true);
                        
                        // Generate test audio (sine wave)
                        for (let i = 0; i < samples; i++) {
                          const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
                          view.setInt16(44 + i * 2, sample * 0x7FFF, true);
                        }
                        
                        const testFile = new File([buffer], 'test-audio.wav', { type: 'audio/wav' });
                        
                        // Process the test file
                        setIsProcessingFile(true);
                        const result = await processAudioFileV3(testFile);
                        console.log('🎵 Test audio result:', result);
                        
                        if (result && result.transcript) {
                          setTranscript(result.transcript);
                          setProcessingProgress('✅ Test audio processed successfully!');
                        }
                      } catch (error) {
                        console.error('Test audio error:', error);
                        setError('Test failed: ' + error.message);
                      } finally {
                        setIsProcessingFile(false);
                      }
                    }}
                    style={{
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      transition: 'transform 0.2s',
                      marginLeft: '10px'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    🧪 Test Generated Audio
                  </button>
                </div>
              )}
            </div>
            
            {/* Ultra-Enhanced Voice Emotion System with 18+ emotions, test samples, and advanced visualizations */}
            <VoiceEmotionSystem 
              onEmotionDetected={(data) => {
                console.log('🎭 Ultra-Enhanced Emotion Detected:', data);
                // You can add additional handling here if needed
              }}
              onTrainingData={(trainingData) => {
                console.log('🎓 Training Data Received:', trainingData);
                // Append to external training samples state so TrainingCenter can consume
                setExternalTrainingSamples(prev => {
                  // Avoid duplicates by id if present
                  if (!trainingData || !trainingData.id) return prev;
                  if (prev.find(p => p.id === trainingData.id)) return prev;
                  return [...prev, trainingData];
                });
              }}
              isVisible={true}
            />
          </div>
        )}

        {/* Vosk Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="tab-content">
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                color: '#1f2937',
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🔧 Vosk Model Diagnostics
              </h2>
              
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem',
                marginBottom: '25px',
                lineHeight: '1.6'
              }}>
                Test your Vosk speech recognition models to identify and resolve issues with audio file transcription.
              </p>

              <button
                onClick={async () => {
                  setRunningDiagnostics(true);
                  setProcessingProgress('🔍 Running Vosk diagnostics...');
                  try {
                    const diagnosticsResult = await runVoskDiagnostics(
                      (progress) => setProcessingProgress(progress)
                    );
                    setVoskDiagnostics(diagnosticsResult);
                    if (diagnosticsResult.overallStatus === 'success') {
                      setProcessingProgress('✅ Vosk diagnostics completed successfully');
                    } else {
                      setError(`Vosk diagnostics failed: ${diagnosticsResult.summary}`);
                      setProcessingProgress('❌ Vosk diagnostics failed');
                    }
                  } catch (error) {
                    setError(`Diagnostics error: ${error.message}`);
                    setProcessingProgress('❌ Diagnostics failed');
                  } finally {
                    setRunningDiagnostics(false);
                  }
                }}
                disabled={runningDiagnostics}
                style={{
                  background: runningDiagnostics 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #dc2626, #991b1b)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: runningDiagnostics ? 'not-allowed' : 'pointer',
                  boxShadow: runningDiagnostics ? 'none' : '0 6px 20px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {runningDiagnostics ? '🔄 Running Diagnostics...' : '🚀 Run Vosk Diagnostics'}
              </button>

              {/* Test Real Vosk Button */}
              <button
                onClick={async () => {
                  setProcessingProgress('🔍 Testing real Vosk transcription...');
                  try {
                    // Import the tester
                    const { testVoskAvailability, testModelLoading } = await import('./utils/voskTester.js');
                    
                    // Test Vosk availability
                    const voskTest = await testVoskAvailability();
                    if (voskTest.success) {
                      setProcessingProgress('✅ Vosk library available - Testing model...');
                      
                      // Test model loading with extended timeout
                      setProcessingProgress('⏳ Loading model (may take up to 60 seconds)...');
                      const modelTest = await testModelLoading();
                      if (modelTest.success) {
                        setProcessingProgress('✅ Real Vosk model loaded successfully! You can now upload audio files for real transcription.');
                      } else {
                        setProcessingProgress(`❌ Model loading failed: ${modelTest.error}`);
                      }
                    } else {
                      setProcessingProgress(`❌ Vosk library test failed: ${voskTest.error}`);
                    }
                  } catch (error) {
                    setProcessingProgress(`❌ Real Vosk test failed: ${error.message}`);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  marginLeft: '15px'
                }}
              >
                🎤 Test Real Vosk
              </button>

              {/* Test Alternative Vosk Button */}
              <button
                onClick={async () => {
                  setProcessingProgress('🔍 Testing alternative Vosk method...');
                  try {
                    const { alternativeVoskManager } = await import('./utils/alternativeVoskManager.js');
                    
                    await alternativeVoskManager.initialize((progress) => {
                      setProcessingProgress(progress);
                    });
                    
                    if (alternativeVoskManager.isReady) {
                      setProcessingProgress('✅ Alternative Vosk method works! You can now upload audio files.');
                    } else {
                      setProcessingProgress('❌ Alternative Vosk method also failed');
                    }
                  } catch (error) {
                    setProcessingProgress(`❌ Alternative Vosk test failed: ${error.message}`);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  marginLeft: '15px'
                }}
              >
                🔧 Test Alternative
              </button>

              {/* Test Model Files Button */}
              <button
                onClick={async () => {
                  setProcessingProgress('🔍 Testing model files accessibility...');
                  try {
                    const { testModelFiles } = await import('./utils/voskTester.js');
                    const fileTest = await testModelFiles();
                    
                    if (fileTest.success) {
                      const accessibleFiles = Object.entries(fileTest.results)
                        .filter(([_, result]) => result.accessible).length;
                      const totalFiles = Object.keys(fileTest.results).length;
                      
                      setProcessingProgress(`✅ Model files test complete: ${accessibleFiles}/${totalFiles} files accessible. Check console for details.`);
                    } else {
                      setProcessingProgress(`❌ Model files test failed: ${fileTest.error}`);
                    }
                  } catch (error) {
                    setProcessingProgress(`❌ Model files test failed: ${error.message}`);
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  marginLeft: '15px'
                }}
              >
                📁 Test Model Files
              </button>

              {/* Progress Display */}
              {processingProgress && (
                <div style={{
                  background: processingProgress.includes('❌') ? '#fef2f2' : 
                             processingProgress.includes('✅') ? '#f0fdf4' : '#fef3c7',
                  border: processingProgress.includes('❌') ? '2px solid #ef4444' : 
                          processingProgress.includes('✅') ? '2px solid #10b981' : '2px solid #f59e0b',
                  color: processingProgress.includes('❌') ? '#dc2626' : 
                         processingProgress.includes('✅') ? '#059669' : '#d97706',
                  padding: '15px',
                  borderRadius: '12px',
                  marginTop: '20px',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {processingProgress}
                </div>
              )}

              {/* Vosk Diagnostics Display */}
              {voskDiagnostics && (
                <div style={{
                  marginTop: '25px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <h3 style={{
                    color: '#374151',
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    marginBottom: '15px'
                  }}>
                    🔍 Vosk Diagnostics Results
                  </h3>
                  
                  <div style={{
                    background: voskDiagnostics.overallStatus === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${voskDiagnostics.overallStatus === 'success' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      marginRight: '10px'
                    }}>
                      {voskDiagnostics.overallStatus === 'success' ? '✅' : '❌'}
                    </span>
                    <span style={{
                      color: voskDiagnostics.overallStatus === 'success' ? '#065f46' : '#991b1b',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      {voskDiagnostics.summary}
                    </span>
                  </div>
                  
                  {voskDiagnostics.tests && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '15px'
                    }}>
                      {voskDiagnostics.tests.map((test, index) => (
                        <div 
                          key={index}
                          style={{
                            background: test.status === 'success' ? '#f0fdf4' : test.status === 'warning' ? '#fef3c7' : '#fef2f2',
                            border: `1px solid ${test.status === 'success' ? '#10b981' : test.status === 'warning' ? '#f59e0b' : '#ef4444'}`,
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                        >
                          <div style={{
                            color: test.status === 'success' ? '#065f46' : test.status === 'warning' ? '#d97706' : '#991b1b',
                            fontWeight: '600',
                            marginBottom: '5px'
                          }}>
                            {test.status === 'success' ? '✅' : test.status === 'warning' ? '⚠️' : '❌'} {test.test}
                          </div>
                          <div style={{
                            color: '#6b7280',
                            fontSize: '0.9rem'
                          }}>
                            {test.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* Global Analysis Section - Available across all tabs when analysis data exists */}
      {(transcript || viewedAnalysis) && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '24px',
          margin: '24px 0',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '1.8em',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              📊 Transcript Analysis & Insights
            </h2>
            <button
              className="control-button analyze"
              onClick={() => setShowAnalysis(!showAnalysis)}
              disabled={!transcript.trim() && !viewedAnalysis}
              style={{
                background: showAnalysis ? '#f39c12' : '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ marginRight: '8px' }}>
                {showAnalysis ? '🙈' : '📊'}
              </span>
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          </div>
          
          {/* Enhanced Transcript Analysis - Fast & Progressive */}
          {showAnalysis && transcript && (
            <div className="analysis-section">
              <EnhancedTranscriptAnalysis
                transcript={transcript}
                isVisible={showAnalysis}
                onAnalysisComplete={({ fast, progressive, transcript: analyzedTranscript, processingTime }) => {
                  if (!analyzedTranscript) return;
                  
                  // Create comprehensive analysis object from fast + progressive results
                  const combinedAnalysis = {
                    basic: fast,
                    advanced: progressive,
                    transcript: analyzedTranscript,
                    processingTime,
                    timestamp: Date.now(),
                    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  };
                  
                  setViewedAnalysis(combinedAnalysis);
                  
                  // Add to analysis history
                  addToAnalysisHistory(combinedAnalysis);
                }}
              />
              
              {/* Optional: Original Analysis for comparison */}
              <details style={{
                marginTop: '20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <summary style={{
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.1em'
                }}>
                  🔍 Show Original Analysis (for comparison)
                </summary>
                <TranscriptAnalysis
                  transcript={transcript}
                  isVisible={true}
                  onAnalysisComplete={({ analysis, chartData, transcript: analyzedTranscript }) => {
                    // Original analysis callback (optional)
                  }}
                />
              </details>
            </div>
          )}
          
          {/* Show previous analysis if available */}
          {showAnalysis && !transcript && viewedAnalysis && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <p style={{
                color: '#fff',
                fontSize: '1.1em',
                textAlign: 'center',
                margin: '0 0 16px 0'
              }}>
                📋 Viewing Previous Analysis
              </p>
              <EnhancedTranscriptAnalysis
                transcript={viewedAnalysis.transcript}
                isVisible={true}
                initialAnalysis={viewedAnalysis}
                onAnalysisComplete={() => {}} // Read-only mode
              />
            </div>
          )}
        </div>
      )}
      
      {/* Step 5: Real-time Collaboration Component */}
      <RealTimeCollaboration 
        currentAnalysis={viewedAnalysis}
        onAnalysisUpdate={(analysis) => {
          setViewedAnalysis(analysis);
          // Add to history if it's a new analysis
          if (analysis && !analysisHistory.find(h => h.id === analysis.id)) {
            addToAnalysisHistory(analysis);
          }
        }}
      />
    </div>
  );
}

export default App;
