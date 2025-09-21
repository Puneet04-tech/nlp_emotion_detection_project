# Project Architecture — AI Voice Emotion Detection

This document describes the overall architecture for the nlp_emotion_detection_project. It includes a high-level Mermaid diagram, component responsibilities, data flows, and deployment notes to help engineers reason about the system and plan improvements.

## Mermaid diagram (copy into mermaid.live or supported viewers)

```mermaid
flowchart TD
  subgraph Frontend [React SPA - Vite]
    A1[App-simple.jsx] --> A2[Tabs & Routing]
    A2 --> A3[VoiceEmotionSystem.jsx]
    A2 --> A4[TestVoiceEmotionRunner.jsx]
    A3 --> A5[VoiceEmotionSystem-simple.jsx]
  end

  subgraph ClientUtils [Browser / Client Utils]
    C1[Media Recorder / File Input]
    C2[Audio Preview / Playback]
  end

  subgraph Engines [Client-side Engines]
    E1[UltraEnhancedEmotionEngine]
    E2[EnhancedAudioProcessorV3]
    E3[SentimentFusionEngine]
    E4[EnhancedBERTAnalyzer (client wrapper)]
  end

  subgraph Server [Backend - Node/Express (optional)]
    S1[Training Data API / stats]
    S2[Model Training Queue]
    S3[Storage: uploads, meta]
  end

  subgraph Models [ML Models]
    M1[VOSK / local ASR models (vosk-models/)]
    M2[BERT/NLP (remote or service)]
    M3[Fine-tuned Emotion Classifier]
  end

  %% Flows
  C1 -->|audio blob| A3
  A3 -->|calls| E1
  A3 -->|send transcript| E3
  E1 -->|features & voice-emotion| A3
  A3 -->|text| E4
  E4 -->|emotion probs| A3
  A3 -->|fused result| A2

  A3 -->|optional upload| S3
  A3 -->|training record| S1
  S1 --> S2
  S2 --> M3
  S3 --> M3
  M2 --> E4
  M1 --> E1

  style Frontend fill:#f8fafc,stroke:#cbd5e1
  style Engines fill:#eef2ff,stroke:#c7d2fe
  style Server fill:#ecfccb,stroke:#bbf7d0
  style Models fill:#fff7ed,stroke:#ffedd5
```

## Components and responsibilities

- Frontend (React + Vite)
  - `App-simple.jsx`: main shell, tab routing, test runner wiring.
  - `VoiceEmotionSystem.jsx`: orchestration component. Receives audio, orchestrates engines, runs fusion, and renders results.
  - `VoiceEmotionSystem-simple.jsx`: a simplified/testing-focused implementation used by the Test runner and quick demos.
  - `TestVoiceEmotionRunner.jsx`: test harness used to simulate audio and validate `onEmotionDetected` callbacks.

- Client-side Engines (in `src/utils`)
  - `UltraEnhancedEmotionEngine`: voice-based emotion extraction, feature extraction (pitch, energy, MFCC), lexical heuristics.
  - `EnhancedAudioProcessorV3`: audio pre-processing, silence trimming, resampling.
  - `SentimentFusionEngine`: text sentiment/emotion scoring and lightweight fusion utilities.
  - `EnhancedBERTAnalyzer` / `analyzeEmotionWithEnhancedBERT`: client-side wrapper that calls the BERT service or an internal analyzer and returns calibrated emotion probabilities.

- Server (optional / auxiliary)
  - Training API (`/api/stats`, `/api/training-data`) - collects training samples and metadata and triggers model updates.
  - Model training queue & storage — stores training audio, metadata, and triggers retraining for improved models (e.g., `M3: Fine-tuned Emotion Classifier`).

- Models
  - `M1 (VOSK)`: local speech recognition models used for transcription offline.
  - `M2 (BERT)`: remote or local BERT-based NLP model for emotion extraction and context-aware analysis.
  - `M3`: specialized fine-tuned classifier built from training data (optional; may be trained offline on server).

## Data flow (short)
1. User records audio or uploads a file → `VoiceEmotionSystem.jsx` receives `Blob`/File
2. Local pre-processing (`EnhancedAudioProcessorV3`) normalizes audio and extracts voice features
3. `UltraEnhancedEmotionEngine` analyzes voice features and emits preliminary emotion probabilities
4. If transcript available (ASR via VOSK), transcript is sent to `EnhancedBERTAnalyzer` and `SentimentFusionEngine`
5. Result fusion: voice + text + BERT probabilities are combined (confidence-calibrated) to produce final emotion result
6. Results are displayed in UI and optionally sent to server for training/analytics

## Deployment & Notes
- Frontend: Vite dev server for development; build static for deployment to Netlify / Vercel / static CDN
- Server: Node/Express server for data collection, queuing training tasks, and model hosting
- Models: VOSK models live in `public/models` or `public/models/vosk-*`; BERT can be remote (API) or local via a lightweight inference server
- Privacy & security: avoid sending raw audio to third-party services unless consented. Consider client-side feature extraction + hashed features for server-side training if privacy constraints exist.

## Next steps (practical)
- Add a simple architecture diagram image (SVG) using the Mermaid above inside `docs/ARCHITECTURE.md` (done).
- Add a short README excerpt on how to run the test harness and where to place VOSK models.
- Implement telemetry logging for fusion decisions to tune weights automatically.

---
If you want, I can also:
- Generate a PNG/SVG image of the Mermaid diagram and add it to `docs/assets/architecture.png` (I can create a static SVG approximation), or
- Add a step-by-step runbook for setting up a small local BERT inference endpoint (docker-compose + huggingface/transformers server), or
- Expand the diagram to include deployment topology (CI, staging, GPU training runners).
