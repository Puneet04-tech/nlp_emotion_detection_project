import React, { useState, useRef, useEffect } from 'react';
import { analyzeEmotionWithBERT } from '../utils/bertEmotionApi';
import { fuseEmotionScores } from '../utils/emotionFusion';
import { extractSpectralFeatures } from '../utils/spectralFeatures';
import { emotionLabels } from '../utils/multilingualEmotionLabels';
import EmotionRadarChart from './EmotionRadarChart';

// Main Enhanced Voice Emotion Analyzer Component
const EnhancedVoiceEmotionAnalyzer = () => {

		// State and refs
		const [isRecording, setIsRecording] = useState(false);
		const [transcript, setTranscript] = useState('');
		const [audioData, setAudioData] = useState(null);
		const [analysisHistory, setAnalysisHistory] = useState([]);
		const [currentAnalysis, setCurrentAnalysis] = useState(null);
		const [isAnalyzing, setIsAnalyzing] = useState(false);
		const [bertIntegration, setBertIntegration] = useState(true);
		const [pitchCalibration, setPitchCalibration] = useState({ userBaseline: null, calibrated: false });
		const [lang, setLang] = useState('en');
		const [fusedScores, setFusedScores] = useState({});
		const [radarVisible, setRadarVisible] = useState(true);
		const [error, setError] = useState('');
		const mediaRecorderRef = useRef(null);
		const audioContextRef = useRef(null);
		const recognitionRef = useRef(null);

		// Main analysis pipeline
		const processAudioAndAnalyze = async (audioBlob, transcriptText) => {
			setIsAnalyzing(true);
			setError('');
			try {
				// Decode audio
				const arrayBuffer = await audioBlob.arrayBuffer();
				const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
				// Extract voice features (pitch, energy, etc.)
				// ...existing pitch/energy extraction logic...
				// Extract spectral features
				const spectralScores = extractSpectralFeatures(audioBuffer);
				// Call BERT API for semantic emotion analysis
						let bertScores = {};
						if (bertIntegration && transcriptText) {
							try {
								const bertResult = await analyzeEmotionWithBERT(transcriptText, lang);
								bertResult.labels.forEach((label, i) => {
									bertScores[label] = bertResult.scores[i];
								});
							} catch (e) {
								setError('BERT API error: ' + e.message);
							}
						}
						// Sarcasm pattern detection
						const sarcasmPatterns = [
							/oh (great|wonderful|fantastic|perfect|brilliant)/i,
							/yeah right/i,
							/as if/i,
							/just perfect/i,
							/sure thing/i,
							/obviously/i,
							/clearly the best/i,
							/what a genius/i,
							/i'm so lucky/i,
							/how original/i
						];
						let sarcasmScore = 0;
						sarcasmPatterns.forEach(pattern => {
							if (pattern.test(transcriptText)) sarcasmScore += 0.7;
						});
						// If BERT detects sarcasm, boost score
						if (bertScores.sarcasm && bertScores.sarcasm > 0.5) sarcasmScore += bertScores.sarcasm;
						// Voice scores (stub: use spectral centroid as proxy for energy/brightness)
						const voiceScores = {
							anger: spectralScores.spectralCentroid > 0.5 ? 1 : 0,
							joy: spectralScores.spectralCentroid < 0.2 ? 1 : 0,
							sarcasm: sarcasmScore,
							// ...other emotions...
						};

						// Lightweight text-based cues (helps reduce false positives)
						const textLower = transcriptText.toLowerCase();
						const textScores = {};
						const joyMarkersMini = ['excited', 'thrilled', 'amazing', 'awesome', 'happy', 'joyful', 'delighted', 'fantastic'];
						const sadMarkersMini = ['sad', 'unhappy', 'depressed', 'miserable', 'tears', 'cry'];
						const fearMarkersMini = ['scared', 'afraid', 'terrified', 'worried', 'panic', 'fear'];
						const surpriseMarkersMini = ['wow', 'really', 'unexpected', 'surprise', 'what a'];
						textScores.joy = joyMarkersMini.some(m => textLower.includes(m)) ? 1 : 0;
						textScores.sadness = sadMarkersMini.some(m => textLower.includes(m)) ? 1 : 0;
						textScores.fear = fearMarkersMini.some(m => textLower.includes(m)) ? 1 : 0;
						textScores.surprise = surpriseMarkersMini.some(m => textLower.includes(m)) ? 1 : 0;
						textScores.anger = (/\b(damn|hell|shit|fuck|annoyed|angry|rage|infuriated|destroyed|ruined)\b/i).test(transcriptText) ? 1 : 0;
						textScores.sarcasm = sarcasmScore > 0.6 ? 1 : 0;

						// Fuse scores (include text cues)
						let fused = fuseEmotionScores({ bertScores, voiceScores, spectralScores, textScores });

						// Sarcasm override: if sarcasm score is high and negative context is present, always suppress joy
						const joyMarkers = [
							'congratulations', 'excited', 'thrilled', 'amazing', 'awesome', 'wonderful', 'happy', 'joyful', 'delighted', 'fantastic', 'great', 'love', 'smile', 'success', 'achievement', 'win', 'celebrate', 'party', 'fun', 'enjoy', 'pleased', 'satisfied', 'grateful', 'thankful', 'cheerful', 'optimistic', 'positive', 'hopeful', 'lucky', 'blessed'
						];
						const hasJoyMarker = joyMarkers.some(marker => transcriptText.toLowerCase().includes(marker));
						const negativeMarkers = ['destroyed', 'ruined', 'lost', 'broken', 'sad', 'hurt', 'pain', 'world', 'gone', 'devastated', 'crushed', 'wrecked', 'hopeless', 'miserable', 'suffer', 'cry', 'tears', 'alone', 'empty', 'nothing'];
						const hasNegativeMarker = negativeMarkers.some(marker => transcriptText.toLowerCase().includes(marker));
						// Final override: forcibly suppress joy if sarcasm is high and negative context is present
						if (fused.sarcasm > 0.5 && hasNegativeMarker && !hasJoyMarker) {
							Object.keys(fused).forEach(label => {
								if (label === 'joy') fused[label] = 0.01;
							});
							fused.sarcasm = Math.max(fused.sarcasm, 0.95);
						}
						setFusedScores(fused);
						setCurrentAnalysis({ transcript: transcriptText, fusedScores: fused });
						setAnalysisHistory(prev => [
							{ transcript: transcriptText, fusedScores: fused, timestamp: Date.now() },
							...prev
						].slice(0, 30));
			} catch (e) {
				setError('Analysis error: ' + e.message);
			}
			setIsAnalyzing(false);
		};

		// UI
		return (
			<div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
				<h2>🎤 Enhanced Voice Emotion Analyzer (Advanced)</h2>
				<div style={{ marginBottom: 16 }}>
					<label>Language: </label>
					<select value={lang} onChange={e => setLang(e.target.value)}>
						{Object.keys(emotionLabels).map(l => (
							<option key={l} value={l}>{l}</option>
						))}
					</select>
					<label style={{ marginLeft: 16 }}>
						<input type="checkbox" checked={bertIntegration} onChange={e => setBertIntegration(e.target.checked)} /> Use BERT
					</label>
				</div>
				<div style={{ marginBottom: 16 }}>
					<textarea
						rows={3}
						style={{ width: '100%' }}
						value={transcript}
						onChange={e => setTranscript(e.target.value)}
						placeholder="Type or speak your text here..."
					/>
					<button
						disabled={isAnalyzing || !transcript}
						onClick={() => {
							// Simulate audio blob for demo (replace with real recording)
							const dummyBlob = new Blob([new Uint8Array(44100)], { type: 'audio/wav' });
							processAudioAndAnalyze(dummyBlob, transcript);
						}}
						style={{ marginTop: 8 }}
					>Analyze</button>
					{error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
				</div>
				{radarVisible && fusedScores && Object.keys(fusedScores).length > 0 && (
					<div style={{ marginBottom: 24 }}>
						<EmotionRadarChart scores={fusedScores} />
					</div>
				)}
				<div>
					<h4>Recent Analyses</h4>
					<ul>
						{analysisHistory.map((a, i) => (
							<li key={i}>
								<strong>{new Date(a.timestamp).toLocaleString()}:</strong> {a.transcript}
								<br />
								{Object.entries(a.fusedScores).map(([label, score]) => (
									<span key={label} style={{ marginRight: 8 }}>{label}: {(score * 100).toFixed(1)}%</span>
								))}
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	};

	export default EnhancedVoiceEmotionAnalyzer;
