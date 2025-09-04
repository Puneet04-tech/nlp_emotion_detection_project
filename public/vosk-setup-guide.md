# Vosk Model Setup Guide

## Issue: "Unrecognized archive format" Error

If you're seeing this error when uploading audio files, it means the Vosk speech recognition models are not properly set up.

## Quick Fix Solutions:

### Option 1: Download and Extract Models (Recommended)

1. **Download English Model:**
   ```
   https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
   ```

2. **Extract to Public Folder:**
   - Extract the downloaded ZIP file
   - Copy the extracted folder to: `public/models/`
   - Final path should be: `public/models/vosk-model-small-en-us-0.15/`

3. **Verify Files:**
   Make sure these files exist:
   - `public/models/vosk-model-small-en-us-0.15/mfcc.conf`
   - `public/models/vosk-model-small-en-us-0.15/final.mdl`
   - `public/models/vosk-model-small-en-us-0.15/phones.txt`

### Option 2: Use Audio Analysis Only

If you don't need speech-to-text transcription:
- The system will automatically fall back to audio-only emotion analysis
- This still provides excellent emotion detection using audio features
- No setup required

### Option 3: Alternative Models

Try these alternative models if the main one doesn't work:
- Hindi: `https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip`
- Other languages: `https://alphacephei.com/vosk/models/`

## How It Works:

1. **With Vosk Models:** Audio → Speech-to-Text → Enhanced Emotion Analysis (Audio + Text + BERT)
2. **Without Models:** Audio → Audio-Only Emotion Analysis (Still very accurate!)

## Note:

The emotion detection system is designed to work excellently even without speech transcription. You'll still get:
- ✅ Audio feature analysis (pitch, volume, spectral features)
- ✅ Enhanced AI emotion detection
- ✅ Confidence scoring
- ✅ BERT analysis (if text is available)

The transcription feature is an enhancement, not a requirement!
