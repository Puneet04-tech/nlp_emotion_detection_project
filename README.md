
# VoiceStudy — Speech Transcription & Emotion Intelligence

VoiceStudy combines high-quality speech transcription with advanced voice-emotion intelligence. It provides realtime speech recognition, transcript summarization, file-based audio analysis, BERT-enhanced semantic emotion detection, and tools to collect and train voice samples for improved emotion classifiers.

This README documents run instructions, architecture, features, and troubleshooting for local development.

## Quick links

- Frontend (Vite) dev server: [http://localhost:3001/](http://localhost:3001/)

- Training / backend server: [http://localhost:4000/](http://localhost:4000/) (default in `server/train-server.js`)

## Key features (high level)

- Real-time microphone capture + continuous speech-to-text

- Intelligent extractive summaries and transcript analysis

- BERT-enhanced semantic emotion scoring (configurable inference endpoint or local browser-side fallback)

- Voice-based emotion detection (pitch, spectral, volume, MFCC estimators)

- File upload processing: audio, video, PDF, images, and OCR support

- Offline/local ML: loadable TensorFlow.js voice classifier and ability to import/export local models

- Training Center: collect labeled samples and update local weights

- UI components: emotion dashboards, training panels, charts, and export/import utilities

## What’s in this repo (high-level)

- `src/` — React frontend code and components

  - `components/` — main UI components (VoiceEmotionSystem, EnhancedVoiceEmotionAnalyzer, BERT components, TrainingCenter, etc.)

  - `utils/` — helpers and analysis engines (bertEmotionApi.js, bertEmotionEnhancer.js, improvedVoiceEmotionEngine.js, fileProcessors.js, tfVoiceClassifier.js, etc.)

  - `workers/` — web workers (trainer.worker.js) for background processing

- `server/` — small Node.js backend utilities (e.g., `train-server.js` for model training endpoints)

- `public/` — static assets and sample data (includes VOSK models under `public/models`)

## Requirements

- Node.js 16+ (recommended) and npm

- Browser with Web Audio & Web Speech APIs (Chrome/Edge recommended for best support)

## Install (local dev)

1. Clone the repository and open the project root.

1. Install dependencies:

```powershell
npm install
```

1. (Optional) If you see vulnerabilities from `npm audit`, you can run:

```powershell
npm audit fix
# or, to force upgrades (may include breaking changes):
npm audit fix --force
```

## Run (frontend + backend)

- Start the frontend dev server (Vite):

```powershell
npm run dev
```

- Start the training/backend server (simple Node process):

```powershell
node server/train-server.js
```

The app frontend is typically available at `http://localhost:3001/` and the training server at `http://localhost:4000/`.

## Usage guide (voice + file workflows)

- Realtime microphone emotion detection

  - Open the app, go to the Voice Emotion / Detection tab, click the microphone button to start recording.

  - Live transcript appears (if browser SpeechRecognition is available) and the UI updates emotion cards in realtime using the voice engine.

- Upload audio files for analysis

  - In the Detection tab, use the Upload Audio control to choose an audio file (wav/mp3/m4a).

  - The app will try to extract a transcript using `processAudioFile` and will compute voice features (RMS, ZCR, spectral centroid) to run emotion detection and show results.

- BERT / semantics

  - The app calls `src/utils/bertEmotionApi.js` to analyze text using either a configured Hugging Face-like endpoint (provide endpoint + API key via environment or `localStorage`) or a local lexical fallback.

  - You can configure remote inference by setting `hf_endpoint` and `hf_api_key` in `localStorage` or environment variables.

- Local ML model

  - A TF.js compatible local voice classifier can be loaded via the UI (see Training / Load model buttons).

  - Training samples are stored in `localStorage` and can be exported/imported as JSON.

## Important implementation notes

- File processing is centralized in `src/utils/fileProcessors.js` — it handles audio decoding, Vosk-based transcription, PDF text extraction, and OCR fallbacks.

- BERT handling occurs in `src/utils/bertEmotionApi.js` with a safe lexical fallback to ensure the app still works without external inference.

- Voice feature extraction and realtime analysis live in `src/utils/improvedVoiceEmotionEngine.js` and component-level analyzers (e.g., `EnhancedVoiceEmotionAnalyzer.jsx`).

## Configuration & environment

- Provide an external BERT inference endpoint (optional):

  - Set `localStorage.setItem('hf_endpoint', '<your_endpoint>')` and `localStorage.setItem('hf_api_key', '<key>')` in the browser, or set `HF_ENDPOINT`/`HF_API_KEY` environment vars for build-time usage.

- Vosk models for offline audio transcription are under `public/models/` — ensure they remain available if you want local transcription.

## Troubleshooting


1. No emotions appear when uploading audio

- Ensure you uploaded an audio file (wav/mp3/m4a). The Detection tab shows an Upload control.

- Open the browser console and look for errors from `processAudioFile`, audio decoding, or `detectEmotion` calls.

- If transcript extraction fails, the app will still run voice-feature-based detection — check computed `voiceFeatures` in console.

1. Microphone recording issues

- Check browser microphone permissions.

- Close other apps using the microphone (or reboot). Chrome/Edge are recommended.

1. BERT integration not working

- If using a remote endpoint, verify `hf_endpoint` and `hf_api_key` are correct. For local runs, the lexical fallback will still produce results.

1. Backend/training server issues

- Start `server/train-server.js` and watch the terminal. Default port: 4000.

- If your frontend needs to call backend endpoints, ensure the port and URL match (update constants in code if needed).

1. npm audit / vulnerabilities

- The repo may show some dependency warnings (esbuild, pdfjs-dist, etc.). Run `npm audit fix` or `npm audit fix --force` to upgrade; be aware `--force` may bump breaking versions.

## Developer notes & where to look in code

- Frontend entry: `src/main.jsx` and `src/App-simple.jsx` or `App.jsx` variants

- Voice UI: `src/components/VoiceEmotionSystem.jsx`, `EnhancedVoiceEmotionAnalyzer.jsx`

- BERT helpers: `src/utils/bertEmotionApi.js`, `bertEmotionEnhancer.js`

- File processors: `src/utils/fileProcessors.js`

- Local TF classifier helpers: `src/utils/tfVoiceClassifier.js`

- Worker training: `src/workers/trainer.worker.js`

- Server: `server/train-server.js`

## Contributing

- Please open issues for bugs or feature requests. Fork the repo, add a branch per feature, and send a PR.

## Quick Git workflow (commit & push)

Use these commands locally to create a feature branch, commit changes, and push to the remote repository. Replace <branch-name> and <your-message> as appropriate.

```powershell
# create and switch to a new branch
git checkout -b feature/<branch-name>

# stage all changes
git add -A

# commit with a message
git commit -m "<your-message>"

# push the branch to origin
git push -u origin feature/<branch-name>

# create a pull request on your Git hosting provider (GitHub/GitLab/etc.)
```

If you simply need to update the current branch and push:

```powershell
git add -A
git commit -m "fix: short description of changes"
git push
```


Notes:

- To change the remote URL (if not set): `git remote add origin <url>`

- If you must force-push (dangerous for shared branches), use `git push --force-with-lease` instead of `--force` to reduce accidental overwrite risk.

- Create small, focused commits and descriptive commit messages to make reviews easier.
Notes:
- To change the remote URL (if not set): `git remote add origin <url>`
- If you must force-push (dangerous for shared branches), use `git push --force-with-lease` instead of `--force` to reduce accidental overwrite risk.
- Create small, focused commits and descriptive commit messages to make reviews easier.

## License

- MIT

---

If you want, I can also:

- Add a short developer README for running only the backend.

- Add a small troubleshooting script to run a playback + analysis smoke test.

- Improve README with screenshots or a quick video GIF.

Tell me which follow-up you'd like.

## Consolidated project notes

This repository previously contained several separate summary and notes files. Their key information has been consolidated into this main README where applicable. The files present in the repository include:

- `VOICE_EMOTION_RESTRUCTURING_SUMMARY.md` (summary of voice-emotion refactor)
- `VOICE_EMOTION_RESTRUCTURING_FINAL.md` (final notes)
- `PROJECT_CLEANUP_SUMMARY.md` (project cleanup notes)
- `REACT_CLEANUP_SUMMARY.md` (React cleanup notes)
- `AI_RECOMMENDATION_REMOVAL_SUMMARY.md` (recommendation removals)
- `IMPORT_FIXES_SUMMARY.md` / `EXPORT_SYSTEM_FIX_SUMMARY.md` (import/export fixes)
- `PITCH_INTEGRATION_TEST_GUIDE.md` (pitch integration testing)
- `server/README-backend.md` (backend-specific notes)

Note: many of these files are currently empty or short; where meaningful content existed it was merged into the sections above (architecture, implementation notes, troubleshooting). If you want me to pull specific content from any of them into a dedicated subsection in this README, point to the file(s) and I'll extract and embed the details.
