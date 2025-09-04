// Complete file processing utilities with real-time extraction
import Tesseract from 'tesseract.js';
import { voskManager } from './voskModelManager.js';

// Import simple processors to avoid loops


// Initialize PDF.js dynamically
let pdfjsLib = null;

const initializePDFJS = async () => {
  if (!pdfjsLib) {
    try {
      // Use CDN for PDF.js to avoid import issues
      if (typeof window !== 'undefined' && !window.pdfjsLib) {
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        
        // Set worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfjsLib = window.pdfjsLib;
      } else {
        pdfjsLib = window.pdfjsLib;
      }
      
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PDF.js:', error);
      throw new Error('PDF.js initialization failed. Please ensure you have internet connection.');
    }
  }
  return pdfjsLib;
};

/**
 * Enhanced language detection and mapping for global English support
 */
const getEnglishLanguageCode = (language) => {
  // Map all English variants to appropriate speech recognition codes
  const englishVariants = {
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-GB',
    'en-AU': 'en-AU',
    'en-CA': 'en-CA',
    'en-IN': 'en-IN',
    'en-IE': 'en-IE',
    'en-NZ': 'en-NZ',
    'en-ZA': 'en-ZA',
    'en-SG': 'en-SG',
    'en-HK': 'en-HK',
    'en-PH': 'en-PH',
    'en-JM': 'en-JM',
    'en-TT': 'en-TT',
    'en-BZ': 'en-BZ',
    'en-GH': 'en-GH',
    'en-KE': 'en-KE',
    'en-NG': 'en-NG',
    'en-PK': 'en-PK',
    'en-LK': 'en-LK',
    'en-MY': 'en-MY',
    'en-MT': 'en-MT',
    'en-CY': 'en-CY'
  };
  
  // Return specific variant if available, otherwise default to US English
  return englishVariants[language] || 'en-US';
};

/**
 * Get language display name and flag
 */
const getLanguageInfo = (language) => {
  const languageInfo = {
    'en-US': { name: 'English (US)', flag: '🇺🇸' },
    'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
    'en-AU': { name: 'English (Australia)', flag: '🇦🇺' },
    'en-CA': { name: 'English (Canada)', flag: '🇨🇦' },
    'en-IN': { name: 'English (India)', flag: '🇮🇳' },
    'en-IE': { name: 'English (Ireland)', flag: '🇮🇪' },
    'en-NZ': { name: 'English (New Zealand)', flag: '🇳🇿' },
    'en-ZA': { name: 'English (South Africa)', flag: '🇿🇦' },
    'en-SG': { name: 'English (Singapore)', flag: '🇸🇬' },
    'en-HK': { name: 'English (Hong Kong)', flag: '🇭🇰' },
    'en-PH': { name: 'English (Philippines)', flag: '🇵🇭' },
    'en-JM': { name: 'English (Jamaica)', flag: '🇯🇲' },
    'en-TT': { name: 'English (Trinidad)', flag: '🇹🇹' },
    'en-BZ': { name: 'English (Belize)', flag: '🇧🇿' },
    'en-GH': { name: 'English (Ghana)', flag: '🇬🇭' },
    'en-KE': { name: 'English (Kenya)', flag: '🇰🇪' },
    'en-NG': { name: 'English (Nigeria)', flag: '🇳🇬' },
    'en-PK': { name: 'English (Pakistan)', flag: '🇵🇰' },
    'en-LK': { name: 'English (Sri Lanka)', flag: '🇱🇰' },
    'en-MY': { name: 'English (Malaysia)', flag: '🇲🇾' },
    'en-MT': { name: 'English (Malta)', flag: '🇲🇹' },
    'en-CY': { name: 'English (Cyprus)', flag: '🇨🇾' },
    'hi-IN': { name: 'Hindi (हिंदी)', flag: '🇮🇳' }
  };
  
  return languageInfo[language] || { name: 'English (US)', flag: '🇺🇸' };
};

/**
 * Process PDF files with real-time text extraction
 */
export const processPDFFile = async (file, onProgress = null, language = 'en-US', maxPages = 50) => {
  if (onProgress) {
    onProgress(`📄 Initializing PDF processing for: ${file.name}...`);
  }
  
  try {
    // Initialize PDF.js
    const pdfjs = await initializePDFJS();
    
    if (onProgress) {
      onProgress(`📄 Loading PDF document: ${file.name}...`);
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) {
      onProgress(`🔍 Analyzing PDF structure: ${file.name}...`);
    }
    
    // Load PDF document
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pagesToProcess = Math.min(totalPages, maxPages);
    let fullText = '';
    let pageTexts = [];
    let pagesWithText = 0;
    
    if (totalPages > maxPages) {
      if (onProgress) {
        onProgress(`⚠️ PDF "${file.name}" has ${totalPages} pages. Processing first ${maxPages} pages only...`);
      }
    }
    
    if (onProgress) {
      onProgress(`📖 Processing ${pagesToProcess} of ${totalPages} pages from: ${file.name}...`);
    }
    
    // Process each page
    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      if (onProgress) {
        const progress = Math.round((pageNum / pagesToProcess) * 100);
        onProgress(`📄 Extracting text from "${file.name}" - page ${pageNum}/${pagesToProcess} (${progress}%)...`);
      }
      
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const textItems = textContent.items.map(item => {
          if (typeof item === 'string') {
            return item;
          } else if (item.str) {
            return item.str;
          }
          return '';
        });
        
        const pageText = textItems
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText && pageText.length > 0) {
          pageTexts.push({
            pageNumber: pageNum,
            text: pageText,
            wordCount: pageText.split(/\s+/).length
          });
          fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
          pagesWithText++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum} of ${file.name}:`, pageError);
        if (onProgress) {
          onProgress(`⚠️ Skipping page ${pageNum} of "${file.name}" due to error...`);
        }
      }
    }
    
    if (onProgress) {
      onProgress(`✅ PDF text extraction completed for: ${file.name}!`);
    }
    
    pdf.destroy();
    
    if (!fullText.trim() || pagesWithText === 0) {
      return `📄 PDF PROCESSING COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}
• Total Pages: ${totalPages}
• Pages processed: ${pagesToProcess}
• Pages with text: ${pagesWithText}

⚠️ NO READABLE TEXT FOUND IN PDF
This PDF appears to be:
• A scanned document (image-based PDF)
• Contains only images, graphics, or charts
• Has encrypted or password-protected text
• Uses non-standard text encoding

🔄 ALTERNATIVE SOLUTIONS:
1. If it's a scanned PDF, convert pages to images and use OCR
2. Try using a different PDF viewer to verify text content
3. Check if the PDF requires password authentication
4. Use a PDF with standard text (not scanned images)

💡 For scanned PDFs, extract pages as images and use the OCR feature.

📊 Processing Statistics:
• Total pages processed: ${pagesToProcess}
• Pages with extractable text: ${pagesWithText}
• Processing method: PDF.js Direct Text Extraction
• Status: No text content found`;
    }
    
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = fullText.length;
    const estimatedReadingTime = Math.ceil(wordCount / 200);
    
    const pageBreakdown = pageTexts.map(page => 
      `Page ${page.pageNumber}: ${page.wordCount} words`
    ).join('\n• ');
    
    const truncationWarning = totalPages > maxPages ? 
      `\n⚠️ NOTE: This PDF has ${totalPages} pages, but only the first ${maxPages} pages were processed to prevent memory issues.\n` : '';
    
    const formattedResult = `📄 PDF TEXT EXTRACTION COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}
• Total Pages: ${totalPages}
• Pages processed: ${pagesToProcess}
• Pages with text: ${pagesWithText}
${truncationWarning}
📝 EXTRACTED TEXT FROM PDF:
${fullText.trim()}

📊 Extraction Statistics:
• Total words: ${wordCount.toLocaleString()}
• Total characters: ${charCount.toLocaleString()}
• Pages with text: ${pagesWithText}/${pagesToProcess}
• Estimated reading time: ${estimatedReadingTime} minute(s)
• Processing method: PDF.js Direct Text Extraction

📋 Page Breakdown:
• ${pageBreakdown}

✅ PDF text extraction completed successfully!
📝 This is the actual text content from your PDF document: ${file.name}`;

    return formattedResult;
    
  } catch (error) {
    console.error(`PDF processing error for ${file.name}:`, error);
    
    let errorMessage = `PDF processing failed for "${file.name}"`;
    if (error.message.includes('worker')) {
      errorMessage = `PDF worker initialization failed for "${file.name}". Please try refreshing the page.`;
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = `Invalid PDF file: "${file.name}". Please try a different PDF.`;
    } else if (error.message.includes('password')) {
      errorMessage = `PDF "${file.name}" is password protected. Please use an unprotected PDF.`;
    }
    
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

/**
 * Process Word documents with real-time text extraction
 */
export const processWordFile = async (file, onProgress = null) => {
  if (onProgress) {
    onProgress(`📄 Loading Word document: ${file.name}...`);
  }
  
  try {
    // Load mammoth from CDN if not available
    let mammoth;
    if (typeof window !== 'undefined' && !window.mammoth) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      
      mammoth = window.mammoth;
    } else {
      mammoth = window.mammoth;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) {
      onProgress(`🔍 Analyzing document structure: ${file.name}...`);
    }
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (onProgress) {
      onProgress(`📝 Extracting text content from: ${file.name}...`);
    }
    
    const extractedText = result.value.trim();
    
    if (!extractedText || extractedText.length === 0) {
      return `📄 WORD DOCUMENT PROCESSING COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}

⚠️ NO TEXT FOUND IN DOCUMENT
This document appears to be:
• Empty or contains only formatting elements
• Contains only images, graphics, or tables
• Has protected or encrypted content

🔄 ALTERNATIVE SOLUTIONS:
1. Check if document has actual text content
2. Try opening in Microsoft Word and saving as plain text
3. Copy text manually and paste into a text file

💡 For documents with images, save images separately and use OCR.

📊 Processing Statistics:
• Processing method: Mammoth.js Direct Text Extraction
• Status: No text content found`;
    }
    
    if (onProgress) {
      onProgress(`✅ Word document processing completed for: ${file.name}!`);
    }
    
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = extractedText.length;
    const estimatedReadingTime = Math.ceil(wordCount / 200);
    const paragraphs = extractedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    const formattedResult = `📄 WORD DOCUMENT EXTRACTION COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}

📝 EXTRACTED TEXT FROM DOCUMENT:
${extractedText}

📊 Extraction Statistics:
• Total words: ${wordCount.toLocaleString()}
• Total characters: ${charCount.toLocaleString()}
• Paragraphs: ${paragraphs}
• Estimated reading time: ${estimatedReadingTime} minute(s)
• Processing method: Mammoth.js Direct Text Extraction

✅ Word document text extraction completed successfully!
📝 This is the actual text content from your Word document: ${file.name}`;

    return formattedResult;
    
  } catch (error) {
    console.error(`Word processing error for ${file.name}:`, error);
    
    if (error.message.includes('not supported')) {
      throw new Error(`Word document format not supported for "${file.name}". Please try a .docx file.`);
    }
    
    throw new Error(`Word document processing failed for "${file.name}": ${error.message}`);
  }
};

/**
 * Process image files with OCR to extract text - Enhanced language mapping
 */
export const processImageFile = async (file, onProgress = null, language = 'eng') => {
  console.log(`Processing image file: ${file.name}`);
  
  if (onProgress) {
    onProgress(`🔍 Initializing OCR engine for: ${file.name}...`);
  }
  
  try {
    const imageUrl = URL.createObjectURL(file);
    
    // Enhanced language mapping for OCR
    const languageMap = {
      'en': 'eng',
      'en-US': 'eng',
      'en-GB': 'eng',
      'en-AU': 'eng',
      'en-CA': 'eng',
      'en-IN': 'eng',
      'en-IE': 'eng',
      'en-NZ': 'eng',
      'en-ZA': 'eng',
      'en-SG': 'eng',
      'en-HK': 'eng',
      'en-PH': 'eng',
      'en-JM': 'eng',
      'en-TT': 'eng',
      'en-BZ': 'eng',
      'en-GH': 'eng',
      'en-KE': 'eng',
      'en-NG': 'eng',
      'en-PK': 'eng',
      'en-LK': 'eng',
      'en-MY': 'eng',
      'en-MT': 'eng',
      'en-CY': 'eng',
      'hi-IN': 'hin',
      'es-ES': 'spa',
      'fr-FR': 'fra',
      'de-DE': 'deu',
      'zh-CN': 'chi_sim',
      'ja-JP': 'jpn',
      'ar-SA': 'ara'
    };
    
    const ocrLanguage = languageMap[language] || 'eng';
    
    const result = await Tesseract.recognize(imageUrl, ocrLanguage, {
      logger: (info) => {
        if (onProgress && info.status) {
          switch (info.status) {
            case 'recognizing text':
              onProgress(`🔍 Recognizing text in "${file.name}": ${Math.round(info.progress * 100)}%`);
              break;
            case 'loading image':
              onProgress(`📷 Loading image: ${file.name}...`);
              break;
            case 'loading tesseract core':
              onProgress(`⚙️ Loading OCR engine for "${file.name}"...`);
              break;
            case 'initializing tesseract':
              onProgress(`🚀 Initializing text recognition for "${file.name}"...`);
              break;
            case 'loading language traineddata':
              onProgress(`📚 Loading ${ocrLanguage.toUpperCase()} language data for "${file.name}"...`);
              break;
            case 'initializing api':
              onProgress(`🔧 Setting up recognition API for "${file.name}"...`);
              break;
            default:
              onProgress(`🔄 Processing "${file.name}": ${info.status}`);
          }
        }
      }
    });
    
    URL.revokeObjectURL(imageUrl);
    
    const extractedText = result.data.text.trim();
    const confidence = Math.round(result.data.confidence);
    
    if (!extractedText || extractedText.length < 3) {
      return `📷 IMAGE PROCESSING COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}
• OCR Language: ${ocrLanguage.toUpperCase()}

⚠️ NO TEXT FOUND IN IMAGE
This image appears to be:
• Contains no readable text
• Has handwritten text (limited support)
• Text is too small, blurry, or low resolution
• Image quality is poor or corrupted

🔄 ALTERNATIVE SOLUTIONS:
1. Use images with clear, printed text
2. Ensure good image quality and resolution (minimum 300 DPI)
3. Try images with high contrast text (black text on white background)
4. Use images with standard fonts (avoid decorative fonts)

💡 For best results, use high-quality scanned documents or clear photos of text.

📊 Processing Statistics:
• OCR Language: ${ocrLanguage.toUpperCase()}
• Processing method: Tesseract.js OCR
• Status: No text content found`;
    }
    
    if (onProgress) {
      onProgress(`✅ Text extraction completed for: ${file.name}!`);
    }
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = extractedText.length;
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0).length;
    
    const formattedResult = `📷 IMAGE TEXT EXTRACTION COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${fileSize} MB
• Format: ${file.type}
• OCR Language: ${ocrLanguage.toUpperCase()}

🔍 EXTRACTED TEXT FROM IMAGE:
${extractedText}

📊 Extraction Statistics:
• Total words: ${wordCount.toLocaleString()}
• Total characters: ${charCount.toLocaleString()}
• Lines of text: ${lines}
• Recognition confidence: ${confidence}%
• Processing method: Tesseract.js OCR
• Language detected: ${language || 'Auto-detected'}

✅ Image text extraction completed successfully!
📝 This is the actual text found in your image: ${file.name}`;

    return formattedResult;
    
  } catch (error) {
    console.error(`Image processing error for ${file.name}:`, error);
    throw new Error(`OCR processing failed for "${file.name}": ${error.message}`);
  }
};


/**
 * Process text files
 */
export const processTextFile = async (file, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;
        const fileSize = (file.size / 1024).toFixed(2);
        const lines = text.split('\n').length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        
        const formattedResult = `📄 TEXT FILE PROCESSING COMPLETE

📁 File Information:
• Name: ${file.name}
• Size: ${fileSize} KB
• Format: ${file.type}
• Encoding: UTF-8

📝 FILE CONTENT:
${text}

📊 Content Statistics:
• Total words: ${wordCount.toLocaleString()}
• Total characters: ${charCount.toLocaleString()}
• Lines: ${lines}
• Paragraphs: ${paragraphs}
• Processing method: Direct file reading
• File type: Plain text

✅ Text file processing completed successfully!
📝 This is the content from your text file: ${file.name}`;

        resolve(formattedResult);
      } catch (error) {
        reject(new Error(`Failed to process text file "${file.name}": ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read text file: ${file.name}`));
    };
    
    if (onProgress) {
      onProgress(`📄 Reading text file: ${file.name}...`);
    }
    
    reader.readAsText(file);
  });
};


/**
 * Process audio files using Web Speech API - ENHANCED for all English variants
 */
export const processAudioFile = async (file, onProgress = null, language = 'en-US', translationSettings = {}, forceVosk = false) => {
  if (onProgress) onProgress(`🎵 Processing audio file: ${file.name}...`);

  // Always use Vosk for file uploads. Do not use browser SpeechRecognition.

  try {
    // Check if Vosk models are available first
    const modelPaths = [
      '/models/vosk-model-small-en-us-0.15',
      '/models/vosk-model-small-hi-0.22'
    ];

    if (onProgress) onProgress('� Checking Vosk model availability...');

    // Try to import Vosk
    let vosk;
    try {
      vosk = await import('vosk-browser');
    } catch (voskImportError) {
      console.warn('❌ Vosk-browser import failed:', voskImportError);
      throw new Error('Vosk library not available');
    }

    const { createModel, createRecognizer } = vosk;
    let model = null;
    let modelPath = null;

    // Try to load available models
    for (const path of modelPaths) {
      try {
        if (onProgress) onProgress(`📥 Trying Vosk model: ${path}...`);
        console.log(`🔍 Attempting to load Vosk model from: ${path}`);
        model = await createModel(path);
        modelPath = path;
        console.log(`✅ Successfully loaded Vosk model from: ${path}`);
        break;
      } catch (modelError) {
        console.warn(`⚠️ Failed to load model from ${path}:`, modelError.message);
        
        // Provide specific error information
        if (modelError.message.includes('archive format') || modelError.message.includes('Unrecognized')) {
          console.warn(`   📁 Model archive format issue at ${path}`);
        } else if (modelError.message.includes('fetch') || modelError.message.includes('network')) {
          console.warn(`   🌐 Network issue accessing ${path}`);
        } else if (modelError.message.includes('permission') || modelError.message.includes('access')) {
          console.warn(`   🔒 Permission issue accessing ${path}`);
        }
        
        continue;
      }
    }

    if (!model) {
      const errorMsg = 'No Vosk models could be loaded. Issues found:\n' +
        '1. Model files may be corrupted or incomplete\n' +
        '2. Network connectivity issues for remote models\n' +
        '3. Model format not recognized by vosk-browser\n' +
        'The system will continue with audio analysis only.';
      console.error('❌ Vosk model loading failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // Increase timeout guard to 120s for slower environments
    let voskTimedOut = false;
    const voskTimeout = setTimeout(() => {
      voskTimedOut = true;
      if (onProgress) onProgress('❌ Vosk transcription timed out (120s).');
    }, 120000);
    if (voskTimedOut) throw new Error('Vosk model load timed out');

    if (onProgress) onProgress('♻️ Resampling audio to 16kHz for Vosk...');

    const ab = await file.arrayBuffer();
    const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await tmpCtx.decodeAudioData(ab.slice(0));
    if (voskTimedOut) throw new Error('Vosk audio decode timed out');

    const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
    const src = offlineCtx.createBufferSource();
    src.buffer = decoded;
    src.connect(offlineCtx.destination);
    src.start(0);
    const rendered = await offlineCtx.startRendering();
    if (voskTimedOut) throw new Error('Vosk audio render timed out');
    const samples = rendered.getChannelData(0);

    // Convert float32 [-1,1] to Int16 PCM
    const int16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    if (onProgress) onProgress('🧠 Creating Vosk recognizer and feeding audio...');
    const recognizer = await createRecognizer({ model, sampleRate: 16000 });
    if (voskTimedOut) throw new Error('Vosk recognizer create timed out');

    const chunk = 4096;
    for (let i = 0; i < int16.length; i += chunk) {
      if (voskTimedOut) throw new Error('Vosk waveform feed timed out');
      const slice = int16.subarray(i, Math.min(i + chunk, int16.length));
      recognizer.acceptWaveform(slice);
      if (onProgress && i % (chunk * 25) === 0) {
        const pct = Math.round((i / int16.length) * 100);
        onProgress(`🧾 Feeding audio to Vosk: ${pct}%`);
      }
    }

    const final = recognizer.finalResult ? recognizer.finalResult() : (recognizer.result ? recognizer.result() : null);
    let voskTranscript = final && final.text ? final.text : '';

    // free model resources if possible
    if (model && typeof model.free === 'function') {
      try { model.free(); } catch (e) { /* ignore */ }
    }

    clearTimeout(voskTimeout);
    if (voskTimedOut) throw new Error('Vosk transcription timed out');
    if (onProgress) onProgress('✅ Vosk transcription attempt completed');

    if (!voskTranscript || !voskTranscript.trim()) {
      if (onProgress) onProgress('⚠️ No speech detected in audio file.');
      return '';
    }

    const cleanTranscript = voskTranscript.trim().replace(/\s+/g, ' ').replace(/([.!?])\s*([a-z])/g, '$1 $2');
    const wordCount = cleanTranscript.split(/\s+/).filter(w => w.length > 0).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200);
    const durationSec = Math.round(decoded.duration);

    const result = `🎵 AUDIO SPEECH EXTRACTION COMPLETE (Vosk)

📁 File Information:
• Name: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Format: ${file.type}
• Duration: ${durationSec}s
• Detected Language: ${getLanguageInfo(language).name}
• Processing method: Vosk local transcription

${getLanguageInfo(language).flag} 🎤 EXTRACTED SPEECH TRANSCRIPT (Vosk):
"${cleanTranscript}"

📊 Transcription Statistics:
• Total words: ${wordCount.toLocaleString()}
• Estimated reading time: ${estimatedReadingTime} minute(s)

✅ Audio-to-text extraction completed successfully using Vosk.`;

    return result;

  } catch (error) {
    console.error('Vosk transcription error:', error);
    if (onProgress) onProgress('❌ Vosk transcription failed: ' + (error.message || error));
  // If Vosk fails for any reason, show error and do not fall back
  throw new Error(`Transcription failed: ${error.message || error}`);
  }
};

// Lightweight browser SpeechRecognition fallback used if Vosk is unavailable or times out
async function speechRecognitionFallback(file, onProgress = null, language = 'en-US') {
  if (onProgress) onProgress('🔁 Starting browser SpeechRecognition fallback...');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onProgress) onProgress('❌ Browser SpeechRecognition not supported.');
    throw new Error('Speech Recognition API not supported in this browser.');
  }

  return new Promise(async (resolve, reject) => {
    const audio = new Audio();
    const audioURL = URL.createObjectURL(file);
    audio.src = audioURL;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';

    let finalTranscript = '';
    let isProcessing = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getEnglishLanguageCode(language);

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal && res[0] && res[0].transcript) {
          finalTranscript += res[0].transcript + ' ';
        }
      }
      if (onProgress) onProgress(`🔄 Browser interim transcript: ${finalTranscript.trim().substring(0,60)}...`);
    };

    recognition.onerror = (e) => {
      console.warn('SpeechRecognition fallback error:', e.error);
    };

    recognition.onend = async () => {
      attempts++;
      if (finalTranscript.trim()) {
        audio.pause();
        URL.revokeObjectURL(audioURL);
        resolve(finalTranscript.trim());
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        audio.pause();
        URL.revokeObjectURL(audioURL);
        resolve(null);
        return;
      }
      // try again
      try {
        recognition.start();
      } catch (e) {
        console.warn('Fallback recognition restart failed:', e);
      }
    };

    audio.oncanplaythrough = async () => {
      try {
        isProcessing = true;
        recognition.start();
        await audio.play();
      } catch (e) {
        console.error('Fallback playback/recognition failed:', e);
        try { recognition.stop(); } catch (_) {}
        resolve(null);
      }
    };

    audio.onerror = (err) => {
      console.error('Fallback audio play error:', err);
      resolve(null);
    };

    // Safety timeout to avoid hangs
    const overallTimeout = setTimeout(() => {
      try { recognition.stop(); } catch (_) {}
      try { audio.pause(); } catch (_) {}
      URL.revokeObjectURL(audioURL);
      resolve(null);
    }, 2 * 60 * 1000); // 2 minutes

    audio.load();
  });
}
// ...existing code...

// Remove the duplicate processVideoFile declaration and replace with this:

/**
 * Process video files with ENHANCED transcription using Web Audio API
 * Optimized for compatibility and better resource management
 */
export const processVideoFile = async (file, onProgress = null, language = 'en-US', translationSettings = {}) => {
  if (onProgress) {
    onProgress(`🎬 Initializing advanced video transcription: ${file.name}...`);
  }
  
  try {
    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('🎤 Speech Recognition not supported. Please use Chrome or Edge browser.');
    }
    
    // Check Web Audio API support
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      throw new Error('🎵 Web Audio API not supported. Please use a modern browser.');
    }
    
    const recognitionLang = getEnglishLanguageCode(language);
    const langInfo = getLanguageInfo(recognitionLang);
    
    return new Promise((resolve, reject) => {
      // Create completely isolated audio context
      const audioContext = new AudioContext();
      const videoURL = URL.createObjectURL(file);
      
      // Create video element in memory (not in DOM)
      const video = document.createElement('video');
      video.src = videoURL;
      video.muted = true; // Start muted to avoid conflicts
      video.preload = 'auto';
      video.controls = false;
      video.autoplay = false;
      video.crossOrigin = 'anonymous';
      
      // Create audio elements for speech recognition
      const audioForRecognition = document.createElement('audio');
      audioForRecognition.src = videoURL;
      audioForRecognition.preload = 'auto';
      audioForRecognition.volume = 0.7;
      audioForRecognition.crossOrigin = 'anonymous';
      
      // Add audio to isolated container
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'fixed';
      hiddenContainer.style.top = '-2000px';
      hiddenContainer.style.left = '-2000px';
      hiddenContainer.style.width = '1px';
      hiddenContainer.style.height = '1px';
      hiddenContainer.style.opacity = '0';
      hiddenContainer.style.pointerEvents = 'none';
      hiddenContainer.style.zIndex = '-99999';
      hiddenContainer.appendChild(audioForRecognition);
      document.body.appendChild(hiddenContainer);
      
      let recognition = null;
      let finalTranscript = '';
      let segments = [];
      let isProcessing = false;
      let noSpeechDetected = true;
      let recognitionActive = false;
      let processingStartTime = Date.now();
      let recognitionRestartCount = 0;
      let lastTranscriptTime = 0;
      let audioSource = null;
      
      // Enhanced language fallback
      const fallbackLanguages = [
        recognitionLang,
        'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-IE'
      ];
      const uniqueLanguages = [...new Set(fallbackLanguages)];
      let currentLangIndex = 0;
      
      const cleanup = () => {
        try {
          if (recognition && recognitionActive) {
            recognition.stop();
            recognition = null;
            recognitionActive = false;
          }
          
          if (audioForRecognition) {
            audioForRecognition.pause();
            audioForRecognition.src = '';
          }
          
          if (video) {
            video.pause();
            video.src = '';
          }
          
          if (audioSource) {
            audioSource.disconnect();
          }
          
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
          }
          
          if (hiddenContainer && hiddenContainer.parentNode) {
            hiddenContainer.parentNode.removeChild(hiddenContainer);
          }
          
          URL.revokeObjectURL(videoURL);
          
          // Force cleanup
          if (window.gc) {
            window.gc();
          }
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      };
      
      const tryNextLanguage = () => {
        currentLangIndex++;
        if (currentLangIndex < uniqueLanguages.length) {
          const nextLang = uniqueLanguages[currentLangIndex];
          const nextLangInfo = getLanguageInfo(nextLang);

          if (onProgress) {
            onProgress(`🔄 Trying ${nextLangInfo.name} recognition...`);
          }

          setTimeout(() => {
            if (isProcessing && recognitionAttempts < MAX_RECOGNITION_ATTEMPTS) {
              startRecognition(nextLang);
            }
          }, 1000);

          return true;
        }
        return false;
      };
      
      // reuse centralized restart helper in this scope as well
      const attemptRestart = (langCode) => {
        if (recognitionAttempts >= MAX_RECOGNITION_ATTEMPTS) {
          console.warn('Max recognition attempts reached; will not restart.');
          if (onProgress) onProgress('⚠️ Max recognition attempts reached. Stopping automatic restarts.');
          return false;
        }
        try {
          startRecognition(langCode);
          return true;
        } catch (e) {
          console.error('attemptRestart failed to start recognition:', e);
          return false;
        }
      };

      const startRecognition = (langCode = recognitionLang) => {
        if (recognitionActive) {
          return;
        }
        
        try {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = langCode;
          recognition.maxAlternatives = 3;
          
          recognition.onstart = () => {
            recognitionActive = true;
            recognitionRestartCount++;
            
            if (onProgress) {
              const currentLangInfo = getLanguageInfo(langCode);
              onProgress(`🎤 ${currentLangInfo.flag} Listening: ${currentLangInfo.name} - "${file.name}"`);
            }
          };
          
          recognition.onresult = (event) => {
            const now = Date.now();
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              const transcript = result[0].transcript;
              const confidence = result[0].confidence || 0.8;
              
              if (result.isFinal && transcript.trim()) {
                // Find best alternative
                let bestTranscript = transcript;
                let bestConfidence = confidence;
                
                for (let j = 0; j < result.length; j++) {
                  if (result[j].confidence > bestConfidence) {
                    bestTranscript = result[j].transcript;
                    bestConfidence = result[j].confidence;
                  }
                }
                
                // Accept lower confidence for better capture
                if (bestTranscript.trim() && bestConfidence > 0.1) {
                  noSpeechDetected = false;
                  lastTranscriptTime = now;
                  
                  const cleanTranscript = bestTranscript.trim()
                    .replace(/\s+/g, ' ')
                    .replace(/([.!?])\s*([a-z])/gi, '$1 $2');
                  
                  finalTranscript += cleanTranscript + ' ';
                  
                  segments.push({
                    text: cleanTranscript,
                    confidence: bestConfidence,
                    timestamp: Math.round(video.currentTime || audioForRecognition.currentTime),
                    language: langCode
                  });
                  
                  if (onProgress) {
                    const currentTime = Math.round(video.currentTime || audioForRecognition.currentTime);
                    const totalTime = Math.round(video.duration || audioForRecognition.duration);
                    const progress = totalTime > 0 ? Math.round((currentTime / totalTime) * 100) : 0;
                    const shortText = cleanTranscript.substring(0, 40) + (cleanTranscript.length > 40 ? '...' : '');
                    const confPercent = Math.round(bestConfidence * 100);
                    onProgress(`🎯 "${shortText}" (${confPercent}%, ${progress}%)`);
                  }
                }
              }
            }
          };
          
          recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
              // Check if we haven't had speech for a while
              if (Date.now() - lastTranscriptTime > 10000) {
                if (!tryNextLanguage()) {
                  currentLangIndex = 0; // Reset to first language
                }
              }
              return;
            }
            
            if (event.error === 'language-not-supported') {
              if (!tryNextLanguage()) {
                setTimeout(() => {
                  if (isProcessing) {
                    attemptRestart('en-US');
                  }
                }, 1000);
              }
              return;
            }
            
            if (event.error === 'not-allowed') {
              cleanup();
              reject(new Error('🎤 Microphone access denied. Please enable microphone permissions.'));
              return;
            }
            
            if (event.error === 'network') {
              setTimeout(() => {
                if (isProcessing) {
                  attemptRestart(langCode);
                }
              }, 2000);
              return;
            }
            
            if (event.error === 'audio-capture') {
              // Try adjusting audio settings
              audioForRecognition.volume = Math.min(audioForRecognition.volume + 0.1, 1.0);
              setTimeout(() => {
                if (isProcessing) {
                  attemptRestart(langCode);
                }
              }, 1000);
              return;
            }
          };
          
          recognition.onend = () => {
            recognitionActive = false;

            // Restart if still processing
            if (isProcessing) {
              setTimeout(() => {
                if (isProcessing) {
                  attemptRestart(langCode);
                }
              }, 300);
            }
          };
          
          recognition.start();
          
        } catch (e) {
          console.error('Recognition start failed:', e);
          setTimeout(() => {
            if (isProcessing) {
              attemptRestart(langCode);
            }
          }, 2000);
        }
      };
      
      // Setup Web Audio API for better audio processing
      const setupAudioProcessing = async () => {
        try {
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          audioSource = audioContext.createMediaElementSource(audioForRecognition);
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 1.0;
          
          audioSource.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
        } catch (e) {
          console.log('Audio processing setup failed:', e);
        }
      };
      
      // Enhanced video loading
      video.onloadedmetadata = () => {
        if (onProgress) {
          const duration = Math.round(video.duration);
          const fileSize = (file.size / 1024 / 1024).toFixed(2);
          onProgress(`📹 Video loaded: ${duration}s, ${fileSize}MB`);
        }
      };
      
      // Enhanced audio loading
      audioForRecognition.onloadedmetadata = () => {
        if (onProgress) {
          onProgress(`🎵 Audio track ready for ${langInfo.name} recognition`);
        }
      };
      
      // Synchronized playback
      video.oncanplaythrough = async () => {
        if (onProgress) {
          onProgress(`🎬 Starting synchronized transcription: ${file.name}`);
        }
        
        try {
          // Setup audio processing
          await setupAudioProcessing();
          
          // Start both video and audio
          const videoPlayPromise = video.play();
          const audioPlayPromise = audioForRecognition.play();
          
          await Promise.all([videoPlayPromise, audioPlayPromise]);
          
          isProcessing = true;
          lastTranscriptTime = Date.now();
          
          // Start recognition after delay
          setTimeout(() => {
            startRecognition();
          }, 1000);
          
        } catch (error) {
          console.error('Playback failed:', error);
          
          // Fallback: try audio only
          try {
            await audioForRecognition.play();
            isProcessing = true;
            lastTranscriptTime = Date.now();
            
            setTimeout(() => {
              startRecognition();
            }, 1000);
            
          } catch (fallbackError) {
            cleanup();
            reject(new Error(`Failed to start video/audio playback: ${fallbackError.message}`));
          }
        }
      };
      
      // Progress tracking
      const updateProgress = () => {
        if (onProgress && (video.duration > 0 || audioForRecognition.duration > 0)) {
          const currentTime = Math.round(video.currentTime || audioForRecognition.currentTime);
          const totalTime = Math.round(video.duration || audioForRecognition.duration);
          const progress = totalTime > 0 ? Math.round((currentTime / totalTime) * 100) : 0;
          
          if (finalTranscript.trim()) {
            const wordCount = finalTranscript.trim().split(/\s+/).length;
            const currentLangInfo = getLanguageInfo(uniqueLanguages[currentLangIndex] || recognitionLang);
            onProgress(`⏱️ ${progress}% (${currentTime}s/${totalTime}s) - ${wordCount} words - ${currentLangInfo.name}`);
          } else {
            onProgress(`⏱️ ${progress}% (${currentTime}s/${totalTime}s) - Listening for speech...`);
          }
        }
      };
      
      video.ontimeupdate = updateProgress;
      audioForRecognition.ontimeupdate = updateProgress;
      
      // Handle completion
      const handleCompletion = () => {
        console.log('Video transcription completed');
        isProcessing = false;
        
        if (recognition && recognitionActive) {
          recognition.stop();
        }
        
        setTimeout(() => {
          cleanup();
          
          const processingTime = Math.round((Date.now() - processingStartTime) / 1000);
          
          if (noSpeechDetected || !finalTranscript.trim()) {
            const result = `🎬 VIDEO TRANSCRIPTION COMPLETE

📁 Video Information:
• File: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Duration: ${Math.round(video.duration || audioForRecognition.duration || 0)}s
• Target Language: ${langInfo.name}
• Processing Time: ${processingTime}s

❌ NO SPEECH DETECTED

🔍 This video contains:
• Only background music/sound effects
• Unclear or very quiet speech
• No audio track
• Speech in different language
• Heavy background noise

🛠️ TROUBLESHOOTING:
1. ✅ Ensure video has clear human speech
2. ✅ Check audio volume is sufficient
3. ✅ Try videos with dialogue/narration
4. ✅ Use Chrome or Edge browser
5. ✅ Grant microphone permissions
6. ✅ Try different English variants

🌍 SUPPORTED LANGUAGES:
${uniqueLanguages.map(lang => {
  const info = getLanguageInfo(lang);
  return `• ${info.flag} ${info.name}`;
}).join('\n')}

📊 PROCESSING STATS:
• Recognition attempts: ${recognitionRestartCount}
• Languages tried: ${currentLangIndex + 1}/${uniqueLanguages.length}
• Method: Enhanced Web Audio + Speech Recognition
• Compatible: ✅
• Status: No speech detected`;
            
            resolve(result);
          } else {
            // Format successful result
            const wordCount = finalTranscript.trim().split(/\s+/).length;
            const averageConfidence = segments.length > 0 
              ? (segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length * 100).toFixed(1)
              : '85.0';
            
            const cleanTranscript = finalTranscript.trim()
              .replace(/\s+/g, ' ')
              .replace(/([.!?])\s*([a-z])/gi, '$1 $2')
              .replace(/\b(um|uh|ah|like|you know)\b/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            // Create timeline
            let timeline = '';
            if (segments.length > 0) {
              timeline = '\n📅 TRANSCRIPT TIMELINE:\n';
              segments.forEach((segment, index) => {
                const minutes = Math.floor(segment.timestamp / 60);
                const seconds = segment.timestamp % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                const confidence = Math.round(segment.confidence * 100);
                const text = segment.text.length > 50 ? segment.text.substring(0, 50) + '...' : segment.text;
                const langInfo = getLanguageInfo(segment.language);
                timeline += `[${timeStr}] "${text}" (${confidence}%, ${langInfo.name})\n`;
              });
            }
            
            const result = `🎬 VIDEO TRANSCRIPTION COMPLETE

📁 Video Information:
• File: ${file.name}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Duration: ${Math.round(video.duration || audioForRecognition.duration || 0)}s
• Detected Language: ${langInfo.name}
• Processing Time: ${processingTime}s

${langInfo.flag} 🎤 EXTRACTED SPEECH:
"${cleanTranscript}"
${timeline}
📊 TRANSCRIPTION STATS:
• Words: ${wordCount.toLocaleString()}
• Characters: ${cleanTranscript.length.toLocaleString()}
• Speech segments: ${segments.length}
• Average confidence: ${averageConfidence}%
• Recognition attempts: ${recognitionRestartCount}
• Languages tried: ${currentLangIndex + 1}/${uniqueLanguages.length}

🎯 TECHNICAL DETAILS:
• Processing method: Enhanced Web Audio + Multi-Language Speech Recognition
• Browser optimization: Enabled
• Fully compatible
• Resource isolation: ✅ Isolated audio context
• Memory management: ✅ Optimized cleanup

✅ Video transcription completed successfully!
📝 Complete transcript from: ${file.name}`;
            
            resolve(result);
          }
        }, 5000); // Extended wait for better accuracy
      };
      
      video.onended = handleCompletion;
      audioForRecognition.onended = handleCompletion;
      
      // Error handling
      video.onerror = (error) => {
        console.error('Video error:', error);
        cleanup();
        reject(new Error(`Video processing failed: ${error.message || 'Unknown error'}`));
      };
      
      audioForRecognition.onerror = (error) => {
        console.error('Audio error:', error);
        cleanup();
        reject(new Error(`Audio processing failed: ${error.message || 'Unknown error'}`));
      };
      
      // Extended timeout
      setTimeout(() => {
        if (isProcessing) {
          cleanup();
          reject(new Error('Video processing timeout after 40 minutes'));
        }
      }, 40 * 60 * 1000);
      
      // Load both video and audio
      video.load();
      audioForRecognition.load();
    });
    
  } catch (error) {
    console.error('Video processing error:', error);
    throw new Error(`Video processing failed: ${error.message}`);
  }
};

/**
 * Main file processor that routes to appropriate handler
 */
export const processFile = async (file, onProgress = null, language = 'en-US', translationSettings = {}) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  const maxSizeBytes = 100 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size for "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 100MB`);
  }
  
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Normalize language for consistency
  const normalizedLanguage = getEnglishLanguageCode(language);
  
  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await processTextFile(file, onProgress);
    }
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await processPDFFile(file, onProgress, normalizedLanguage);
    }
    
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')) {
      return await processWordFile(file, onProgress);
    }
    
    if (fileType.startsWith('image/') || 
        fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) {
      return await processImageFile(file, onProgress, normalizedLanguage);
    }
    
    if (fileType.startsWith('audio/') || 
        fileName.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/)) {
      return await processAudioFile(file, onProgress, normalizedLanguage, translationSettings);
    }
    
    if (fileType.startsWith('video/') || 
        fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
      
      // Check if user wants offline-only processing
      if (translationSettings && translationSettings.videoProcessingMode === 'offline') {
        return await processVideoSpeechOfflineSimple(file, onProgress, normalizedLanguage);
      }
      
      // Check if user wants smart processing (offline first, online fallback)
      if (translationSettings && translationSettings.videoProcessingMode === 'smart') {
        return await processVideoSpeechSmartSimple(file, onProgress, normalizedLanguage);
      }
      
      // Check if user wants online-only processing
      if (translationSettings && translationSettings.videoProcessingMode === 'online') {
        return await processVideoSpeechSimple(file, onProgress, normalizedLanguage);
      }
      
      // Check if user wants speech-only processing (online)
      if (translationSettings && translationSettings.videoProcessingMode === 'speechOnly') {
        return await processVideoSpeechSimple(file, onProgress, normalizedLanguage);
      }
      
      // Check if user wants advanced processing (both audio and text extraction)
      if (translationSettings && translationSettings.videoProcessingMode === 'advanced') {
        return await processVideoFileAdvanced(file, onProgress, normalizedLanguage, translationSettings);
      }
      
      // Check if user wants only text extraction from video
      if (translationSettings && translationSettings.videoProcessingMode === 'textOnly') {
        return await processVideoFileTextOnly(file, onProgress);
      }
      
      // Check if user wants complete processing (both audio and text)
      if (translationSettings && translationSettings.videoProcessingMode === 'complete') {
        return await processVideoFileComplete(file, onProgress);
      }
      
      // Default to smart processing (tries offline first, falls back to online)
      return await processVideoSpeechSmartSimple(file, onProgress, normalizedLanguage);
    }
    
    throw new Error(`Unsupported file type for "${file.name}": ${fileType || 'unknown'}. Supported types: PDF, Word, Images, Audio, Video, Text files.`);
    
  } catch (error) {
    console.error(`File processing error for ${file.name}:`, error);
    throw error;
  }
};

/**
 * Get supported file types for file input accept attribute
 */
export const getSupportedFileTypes = () => {
  return [
    '.txt',
    '.pdf', 
    '.docx',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp',
    '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac',
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'
  ].join(',');
};

/**
 * Check if file type is supported
 */
export const isFileTypeSupported = (file) => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return (
    fileType === 'text/plain' || fileName.endsWith('.txt') ||
    fileType === 'application/pdf' || fileName.endsWith('.pdf') ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx') ||
    fileType.startsWith('image/') || 
    fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/) ||
    fileType.startsWith('audio/') || 
    fileName.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/) ||
    fileType.startsWith('video/') || 
    fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)
  );
};

/**
 * Get file information
 */
export const getFileInfo = (file) => {
  return {
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleDateString(),
    supported: isFileTypeSupported(file)
  };
};

/**
 * Get file type category
 */
export const getFileTypeCategory = (file) => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) return 'text';
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf';
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) return 'word';
  if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) return 'image';
  if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/)) return 'audio';
  if (fileType.startsWith('video/') || fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) return 'video';
  
  return 'unknown';
};

/**
 * Validate file size (configurable max size)
 */
export const validateFileSize = (file, maxSizeMB = 100) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File "${file.name}" size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  return true;
};

/**
 * Get processing estimate for file
 */
export const getProcessingEstimate = (file) => {
  const fileType = getFileTypeCategory(file);
  const sizeMB = file.size / 1024 / 1024;
  
  let estimatedTime = 'Unknown';
  let complexity = 'Low';
  
  switch (fileType) {
    case 'text':
      estimatedTime = '< 1 second';
      complexity = 'Low';
      break;
    case 'pdf':
      estimatedTime = sizeMB < 10 ? '10-30 seconds' : '30-60 seconds';
      complexity = 'Medium';
      break;
    case 'word':
      estimatedTime = '5-15 seconds';
      complexity = 'Low';
      break;
    case 'image':
      estimatedTime = '10-30 seconds';
      complexity = 'Medium';
      break;
    case 'audio':
      estimatedTime = `${Math.ceil(sizeMB / 5)} minutes`;
      complexity = 'High';
      break;
    case 'video':
      estimatedTime = `${Math.ceil(sizeMB / 10)} minutes`;
      complexity = 'High';
      break;
  }
  
  return {
    fileName: file.name,
    fileType: fileType,
    estimatedTime: estimatedTime,
    complexity: complexity,
    requiresInternet: ['audio', 'video'].includes(fileType)
  };
};

/**
 * Get video processing options for the UI
 */
export const getVideoProcessingOptions = () => {
  return [
    {
      id: 'smart',
      name: 'Smart Processing (Recommended)',
      description: 'Tries offline first, falls back to online if needed',
      icon: '🧠',
      speed: 'Fast',
      features: ['Offline first', 'Online fallback', 'Best of both worlds', 'Automatic selection']
    },
    {
      id: 'offline',
      name: 'Offline Only',
      description: 'Works without internet using local speech models',
      icon: '🔌',
      speed: 'Fast',
      features: ['No internet required', 'Privacy focused', 'Local processing', 'Vosk models']
    },
    {
      id: 'online',
      name: 'Online Only',
      description: 'Uses cloud-based speech recognition (higher accuracy)',
      icon: '🌐',
      speed: 'Fast',
      features: ['High accuracy', 'Cloud processing', 'Google Speech API', 'Internet required']
    },
    {
      id: 'advanced',
      name: 'Advanced (Speech + Text)',
      description: 'Extract both spoken words and visual text',
      icon: '🎬',
      speed: 'Medium',
      features: ['Audio transcription', 'OCR text extraction', 'Combined results']
    },
    {
      id: 'textOnly',
      name: 'Text Only (OCR)',
      description: 'Extract only visual text from video frames',
      icon: '📝',
      speed: 'Medium',
      features: ['OCR text extraction', 'Subtitle extraction', 'Frame analysis']
    },
    {
      id: 'complete',
      name: 'Complete Analysis',
      description: 'Comprehensive video analysis with all features',
      icon: '🔍',
      speed: 'Slow',
      features: ['Audio transcription', 'OCR text extraction', 'Timeline analysis', 'Best quality']
    }
  ];
};

/**
 * Process video with specific mode
 */
export const processVideoWithMode = async (file, mode, onProgress = null, language = 'en-US') => {
  const translationSettings = {
    videoProcessingMode: mode
  };
  
  return await processFile(file, onProgress, language, translationSettings);
};