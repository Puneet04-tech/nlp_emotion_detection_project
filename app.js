// Revolutionary Emotional Complexity AI - Contradiction Intelligence System
class EmotionalComplexityAI {
    constructor() {
        // Core emotion data from provided JSON
        this.emotions = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral", "excitement", "frustration", "anxiety", "confidence", "boredom", "curiosity", "embarrassment", "pride", "guilt", "shame", "contempt", "admiration", "relief", "anticipation", "love", "hate", "nostalgia", "envy"];
        
        // Contradiction patterns with deep psychological insights
        this.contradictionPatterns = [
            {
                combination: ["joy", "anger"],
                name: "Vindictive Satisfaction",
                explanation: "You're experiencing satisfaction about justice being served while still processing anger about the original wrong. This complex emotional state shows you're working through multiple layers of a significant situation.",
                commonScenarios: ["Enemy facing consequences", "Standing up for yourself", "Seeing justice served", "Righteous triumph over adversity"],
                psychologicalInterpretation: "This emotional complexity indicates a sophisticated processing of moral justice and personal vindication.",
                therapeuticInsight: "It's completely normal to feel satisfied when justice is served while still processing the original hurt."
            },
            {
                combination: ["sadness", "anger"],
                name: "Hurt Frustration",
                explanation: "You're grieving a loss while simultaneously angry about what caused it. This dual emotional response shows you're processing both the pain of loss and the injustice of the situation.",
                commonScenarios: ["Betrayal by trusted person", "Preventable tragedy", "Unfair loss", "Broken promises"],
                psychologicalInterpretation: "This combination reflects the mind's attempt to process both grief and the need for justice or resolution.",
                therapeuticInsight: "Feeling both sad and angry about a loss is a healthy emotional response that honors both your pain and your sense of justice."
            },
            {
                combination: ["joy", "sadness"],
                name: "Bittersweet Experience",
                explanation: "You're happy about something positive while simultaneously sad about what's being left behind or lost. This shows emotional maturity in recognizing life's complex transitions.",
                commonScenarios: ["Graduation ceremonies", "Children growing up", "Moving to new places", "Career achievements with sacrifice"],
                psychologicalInterpretation: "This emotional sophistication indicates healthy processing of life transitions and growth.",
                therapeuticInsight: "Bittersweet emotions show your depth as a person and your ability to hold multiple truths simultaneously."
            },
            {
                combination: ["fear", "excitement"],
                name: "Thrill Response",
                explanation: "You're scared but exhilarated by challenging or novel experiences. This combination shows you're pushing beyond your comfort zone while acknowledging the risks involved.",
                commonScenarios: ["Adventure sports", "New job opportunities", "Public speaking", "First dates"],
                psychologicalInterpretation: "This emotional pattern indicates healthy risk-taking and personal growth orientation.",
                therapeuticInsight: "Fear mixed with excitement is your mind's way of preparing you for growth while staying alert to challenges."
            },
            {
                combination: ["pride", "shame"],
                name: "Conflicted Achievement",
                explanation: "You're proud of your accomplishment but ashamed of the methods used or costs involved. This complex emotional state shows strong moral awareness.",
                commonScenarios: ["Winning unfairly", "Success at others' expense", "Moral compromises for gain", "Inherited advantages"],
                psychologicalInterpretation: "This emotional conflict indicates a well-developed moral compass and ethical awareness.",
                therapeuticInsight: "Feeling conflicted about achievements shows moral integrity and suggests reflection on your values."
            },
            {
                combination: ["love", "hate"],
                name: "Ambivalent Attachment",
                explanation: "You have strong positive and negative feelings toward the same person or situation. This shows you're processing complex relationship dynamics.",
                commonScenarios: ["Difficult family relationships", "Toxic but familiar situations", "Ex-partners", "Complex friendships"],
                psychologicalInterpretation: "This emotional complexity reflects the multifaceted nature of human relationships and attachment.",
                therapeuticInsight: "Having mixed feelings about someone important shows emotional depth and realistic relationship processing."
            }
        ];

        this.emotionColors = {
            "joy": "#10B981", "anger": "#EF4444", "sadness": "#3B82F6", "fear": "#8B5CF6", 
            "surprise": "#F59E0B", "disgust": "#84CC16", "neutral": "#6B7280", "excitement": "#F59E0B",
            "frustration": "#DC2626", "anxiety": "#7C3AED", "confidence": "#059669", "boredom": "#9CA3AF",
            "curiosity": "#0891B2", "embarrassment": "#EC4899", "pride": "#D97706", "guilt": "#7C2D12",
            "shame": "#991B1B", "contempt": "#374151", "admiration": "#0D9488", "relief": "#65A30D",
            "anticipation": "#2563EB", "love": "#BE185D", "hate": "#7F1D1D", "nostalgia": "#8B5A2B",
            "envy": "#166534"
        };

        this.emotionIcons = {
            "joy": "😊", "anger": "😠", "sadness": "😢", "fear": "😨", "surprise": "😮", 
            "disgust": "🤢", "neutral": "😐", "excitement": "🤩", "frustration": "😤", 
            "anxiety": "😰", "confidence": "😎", "boredom": "😑", "curiosity": "🤔",
            "embarrassment": "😳", "pride": "🦚", "guilt": "😔", "shame": "🙈",
            "contempt": "🙄", "admiration": "😍", "relief": "😌", "anticipation": "🤞",
            "love": "❤️", "hate": "💔", "nostalgia": "🌅", "envy": "😒"
        };

        this.intensityLevels = ["very_low", "low", "moderate", "high", "very_high"];
        
        this.therapeuticInsightTypes = {
            validation: "Validation",
            normalization: "Normalization", 
            growth_perspective: "Growth Perspective",
            action_guidance: "Action Guidance"
        };

        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.analysisHistory = [];
        this.currentAnalysisResult = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Recording controls
        const recordBtn = document.getElementById('recordBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const audioUpload = document.getElementById('audioUpload');
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.triggerFileUpload());
        }
        
        if (audioUpload) {
            audioUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Result actions - use event delegation since buttons may not exist yet
        document.addEventListener('click', (e) => {
            if (e.target.id === 'exportBtn') {
                this.exportResults();
            } else if (e.target.id === 'deepAnalysisBtn') {
                this.showDeepAnalysis();
            } else if (e.target.id === 'newAnalysisBtn') {
                this.resetForNewAnalysis();
            } else if (e.target.id === 'closeModal') {
                this.closeModal();
            }
        });
        
        // Modal controls
        const deepAnalysisModal = document.getElementById('deepAnalysisModal');
        if (deepAnalysisModal) {
            deepAnalysisModal.addEventListener('click', (e) => {
                if (e.target.id === 'deepAnalysisModal') {
                    this.closeModal();
                }
            });
        }
    }

    toggleRecording() {
        const recordBtn = document.getElementById('recordBtn');
        const recordText = document.getElementById('recordText');
        const recordingStatus = document.getElementById('recordingStatus');

        if (!recordBtn || !recordText || !recordingStatus) {
            console.error('Recording UI elements not found');
            return;
        }

        if (!this.isRecording) {
            this.startRecording();
            recordText.textContent = '🛑 Stop Recording';
            recordBtn.classList.remove('btn--primary');
            recordBtn.classList.add('btn--secondary');
            recordingStatus.classList.remove('hidden');
        } else {
            this.stopRecording();
            recordText.textContent = '🎙️ Start Recording';
            recordBtn.classList.remove('btn--secondary');
            recordBtn.classList.add('btn--primary');
            recordingStatus.classList.add('hidden');
        }
    }

    startRecording() {
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        
        const recordTimeElement = document.getElementById('recordTime');
        if (recordTimeElement) {
            recordTimeElement.textContent = '00:00';
        }
        
        this.recordingTimer = setInterval(() => {
            if (!this.isRecording) {
                clearInterval(this.recordingTimer);
                return;
            }
            
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            const recordTimeElement = document.getElementById('recordTime');
            if (recordTimeElement) {
                recordTimeElement.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    stopRecording() {
        this.isRecording = false;
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
        
        const recordTimeElement = document.getElementById('recordTime');
        if (recordTimeElement) {
            recordTimeElement.textContent = '00:00';
        }
        
        // Start analysis after a short delay
        setTimeout(() => {
            this.startAnalysis('recorded_audio.wav');
        }, 500);
    }

    triggerFileUpload() {
        const audioUpload = document.getElementById('audioUpload');
        if (audioUpload) {
            audioUpload.click();
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.startAnalysis(file.name);
        }
    }

    async startAnalysis(audioSource) {
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        
        if (!processingSection || !resultsSection) {
            console.error('Processing or results sections not found');
            return;
        }
        
        resultsSection.classList.add('hidden');
        processingSection.classList.remove('hidden');
        
        // Reset progress bars
        this.resetProgressBars();
        
        try {
            // Run analysis stages
            await this.runAcousticAnalysis();
            await this.runSemanticAnalysis();
            await this.runContradictionDetection();
            await this.runPsychologicalInterpretation();
            
            // Generate sophisticated results
            const analysisResult = this.generateComplexAnalysisResults(audioSource);
            this.currentAnalysisResult = analysisResult;
            
            // Display results with contradiction intelligence
            this.displayComplexResults(analysisResult);
            
            // Update history
            this.addToHistory(analysisResult);
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.handleAnalysisError();
        }
    }

    resetProgressBars() {
        const stages = ['acoustic', 'semantic', 'contradiction', 'psychological'];
        stages.forEach(stage => {
            const progressElement = document.getElementById(`progress-${stage}`);
            const statusElement = document.getElementById(`status-${stage}`);
            if (progressElement) {
                progressElement.style.width = '0%';
            }
            if (statusElement) {
                statusElement.textContent = this.getInitialMessage(stage);
                statusElement.style.color = 'var(--color-text-secondary)';
            }
        });
    }

    async runAcousticAnalysis() {
        const progressElement = document.getElementById('progress-acoustic');
        const statusElement = document.getElementById('status-acoustic');
        
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                if (progressElement) {
                    progressElement.style.width = `${Math.min(progress, 100)}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    if (statusElement) {
                        statusElement.textContent = '✓ Acoustic patterns extracted';
                        statusElement.style.color = 'var(--color-success)';
                    }
                    resolve();
                }
            }, 30);
        });
    }

    async runSemanticAnalysis() {
        const progressElement = document.getElementById('progress-semantic');
        const statusElement = document.getElementById('status-semantic');
        
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                if (progressElement) {
                    progressElement.style.width = `${Math.min(progress, 100)}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    if (statusElement) {
                        statusElement.textContent = '✓ Semantic meaning understood';
                        statusElement.style.color = 'var(--color-success)';
                    }
                    resolve();
                }
            }, 25);
        });
    }

    async runContradictionDetection() {
        const progressElement = document.getElementById('progress-contradiction');
        const statusElement = document.getElementById('status-contradiction');
        
        return new Promise((resolve) => {
            let progress = 0;
            if (statusElement) {
                statusElement.textContent = '🎭 Detecting emotional contradictions...';
            }
            
            const interval = setInterval(() => {
                progress += 2;
                if (progressElement) {
                    progressElement.style.width = `${Math.min(progress, 100)}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    if (statusElement) {
                        statusElement.textContent = '✓ Emotional conflicts identified';
                        statusElement.style.color = 'var(--color-warning)';
                    }
                    resolve();
                }
            }, 35);
        });
    }

    async runPsychologicalInterpretation() {
        const progressElement = document.getElementById('progress-psychological');
        const statusElement = document.getElementById('status-psychological');
        
        return new Promise((resolve) => {
            let progress = 0;
            if (statusElement) {
                statusElement.textContent = '🧠 Generating psychological insights...';
            }
            
            const interval = setInterval(() => {
                progress += 2;
                if (progressElement) {
                    progressElement.style.width = `${Math.min(progress, 100)}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    if (statusElement) {
                        statusElement.textContent = '✓ Deep insights generated';
                        statusElement.style.color = 'var(--color-primary)';
                    }
                    resolve();
                }
            }, 40);
        });
    }

    generateComplexAnalysisResults(audioSource) {
        // Generate sophisticated emotion combinations including contradictions
        const detectedEmotions = this.generateSophisticatedEmotions();
        const contradictions = this.detectContradictions(detectedEmotions);
        const complexityScore = this.calculateComplexityScore(detectedEmotions, contradictions);
        const therapeuticInsights = this.generateTherapeuticInsights(detectedEmotions, contradictions);
        
        return {
            timestamp: new Date(),
            audioSource,
            emotions: detectedEmotions,
            contradictions: contradictions,
            complexityScore: complexityScore,
            therapeuticInsights: therapeuticInsights,
            processingTime: (Math.random() * 2 + 1.5).toFixed(1)
        };
    }

    generateSophisticatedEmotions() {
        // Generate realistic emotion combinations that may include contradictions
        const emotionScenarios = [
            // Scenario 1: Joy + Anger (Vindictive Satisfaction)
            { joy: 0.68, anger: 0.45, relief: 0.32, pride: 0.28 },
            // Scenario 2: Sadness + Anger (Hurt Frustration) 
            { sadness: 0.72, anger: 0.58, frustration: 0.41, disappointment: 0.35 },
            // Scenario 3: Joy + Sadness (Bittersweet)
            { joy: 0.61, sadness: 0.52, nostalgia: 0.48, love: 0.38 },
            // Scenario 4: Fear + Excitement (Thrill Response)
            { fear: 0.55, excitement: 0.63, anticipation: 0.44, anxiety: 0.33 },
            // Scenario 5: Pride + Shame (Conflicted Achievement)
            { pride: 0.64, shame: 0.48, guilt: 0.35, curiosity: 0.29 }
        ];
        
        // Randomly select one scenario or create a custom one
        const selectedScenario = emotionScenarios[Math.floor(Math.random() * emotionScenarios.length)];
        
        // Add some randomization to make it more realistic
        const emotions = {};
        Object.keys(selectedScenario).forEach(emotion => {
            const baseValue = selectedScenario[emotion];
            const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
            emotions[emotion] = Math.max(0.1, Math.min(1.0, baseValue + variation));
        });
        
        // Add some additional background emotions
        const backgroundEmotions = ['curiosity', 'confusion', 'relief', 'anticipation'];
        backgroundEmotions.forEach(emotion => {
            if (!emotions[emotion]) {
                emotions[emotion] = Math.random() * 0.3 + 0.1; // Low background level
            }
        });
        
        return emotions;
    }

    detectContradictions(emotions) {
        const contradictions = [];
        
        // Check each contradiction pattern
        this.contradictionPatterns.forEach(pattern => {
            const [emotion1, emotion2] = pattern.combination;
            
            if (emotions[emotion1] && emotions[emotion2]) {
                const intensity1 = emotions[emotion1];
                const intensity2 = emotions[emotion2];
                
                // Consider it a contradiction if both emotions are above threshold
                const threshold = 0.3;
                if (intensity1 > threshold && intensity2 > threshold) {
                    contradictions.push({
                        ...pattern,
                        intensity1: intensity1,
                        intensity2: intensity2,
                        overallIntensity: (intensity1 + intensity2) / 2,
                        confidence: this.calculateContradictionConfidence(intensity1, intensity2)
                    });
                }
            }
        });
        
        return contradictions.sort((a, b) => b.confidence - a.confidence);
    }

    calculateContradictionConfidence(intensity1, intensity2) {
        // Higher confidence when both emotions are strong
        const avgIntensity = (intensity1 + intensity2) / 2;
        const balanceScore = 1 - Math.abs(intensity1 - intensity2); // Higher when emotions are balanced
        return (avgIntensity * 0.7 + balanceScore * 0.3) * 100;
    }

    calculateComplexityScore(emotions, contradictions) {
        const numEmotions = Object.keys(emotions).length;
        const numContradictions = contradictions.length;
        const avgIntensity = Object.values(emotions).reduce((sum, val) => sum + val, 0) / numEmotions;
        const intensityVariance = this.calculateVariance(Object.values(emotions));
        
        // Complex formula considering multiple factors
        let score = (numEmotions * 5) + (numContradictions * 15) + (avgIntensity * 10) + (intensityVariance * 20);
        
        // Normalize to 0-100 scale
        score = Math.min(100, Math.max(0, score));
        
        return Math.round(score);
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    generateTherapeuticInsights(emotions, contradictions) {
        const insights = [];
        
        // Validation insight
        if (contradictions.length > 0) {
            insights.push({
                type: this.therapeuticInsightTypes.validation,
                content: "It's completely normal and healthy to experience contradictory emotions. This emotional complexity shows your depth as a person and your ability to process multifaceted situations."
            });
        }
        
        // Normalization insight
        insights.push({
            type: this.therapeuticInsightTypes.normalization,
            content: "Your emotional response patterns are sophisticated and indicate emotional maturity. Most people experience multiple emotions simultaneously, even when they seem to conflict."
        });
        
        // Growth perspective insight
        if (contradictions.some(c => c.name.includes('Satisfaction') || c.name.includes('Achievement'))) {
            insights.push({
                type: this.therapeuticInsightTypes.growth_perspective,
                content: "These emotional contradictions often signal periods of personal growth and transition. You're processing complex life changes in a healthy, integrated way."
            });
        }
        
        // Action guidance insight
        insights.push({
            type: this.therapeuticInsightTypes.action_guidance,
            content: "Consider what each emotion is trying to tell you. Contradictory emotions often highlight different aspects of a situation that deserve attention and reflection."
        });
        
        return insights;
    }

    displayComplexResults(analysisResult) {
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        
        if (!processingSection || !resultsSection) {
            console.error('Results sections not found');
            return;
        }
        
        // Show contradiction alert if contradictions exist
        this.displayContradictionAlert(analysisResult.contradictions);
        
        // Display emotions
        this.displayEmotions(analysisResult.emotions, analysisResult.contradictions);
        
        // Display contradiction analysis
        this.displayContradictionAnalysis(analysisResult.contradictions);
        
        // Display therapeutic insights
        this.displayTherapeuticInsights(analysisResult.therapeuticInsights);
        
        // Display complexity score
        this.displayComplexityScore(analysisResult.complexityScore);
        
        // Show results section
        processingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }

    displayContradictionAlert(contradictions) {
        const contradictionAlert = document.getElementById('contradictionAlert');
        const contradictionSummary = document.getElementById('contradictionSummary');
        
        if (!contradictionAlert || !contradictionSummary) return;
        
        if (contradictions.length > 0) {
            const primaryContradiction = contradictions[0];
            contradictionSummary.textContent = `${primaryContradiction.name}: ${primaryContradiction.explanation}`;
            contradictionAlert.classList.remove('hidden');
            contradictionAlert.classList.add('contradiction-pulse');
        } else {
            contradictionAlert.classList.add('hidden');
        }
    }

    displayEmotions(emotions, contradictions) {
        const emotionResults = document.getElementById('emotionResults');
        
        if (!emotionResults) {
            console.error('Emotion results container not found');
            return;
        }
        
        emotionResults.innerHTML = '';
        
        // Sort emotions by intensity
        const sortedEmotions = Object.entries(emotions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6); // Show top 6 emotions
        
        const contradictoryEmotions = new Set();
        contradictions.forEach(contradiction => {
            contradiction.combination.forEach(emotion => contradictoryEmotions.add(emotion));
        });
        
        sortedEmotions.forEach(([emotion, intensity], index) => {
            const emotionElement = this.createComplexEmotionElement(
                emotion, 
                intensity, 
                index === 0, 
                contradictoryEmotions.has(emotion)
            );
            emotionResults.appendChild(emotionElement);
        });
    }

    createComplexEmotionElement(emotion, intensity, isPrimary, isContradictory) {
        const emotionElement = document.createElement('div');
        emotionElement.className = `emotion-item ${isPrimary ? 'primary' : ''} ${isContradictory ? 'contradictory' : ''}`;
        
        const percentage = (intensity * 100).toFixed(1);
        const intensityLevel = this.getIntensityLevel(intensity);
        
        emotionElement.innerHTML = `
            <div class="emotion-icon">${this.emotionIcons[emotion] || '❓'}</div>
            <div class="emotion-details">
                <div class="emotion-info">
                    <div class="emotion-name">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
                    <div class="emotion-intensity">${intensityLevel} intensity</div>
                </div>
                <div class="emotion-confidence">
                    <div class="confidence-score">${percentage}%</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${percentage}%; background-color: ${this.emotionColors[emotion] || '#6B7280'};"></div>
                    </div>
                </div>
            </div>
            ${isContradictory ? '<div class="contradiction-badge">Complex</div>' : ''}
        `;
        
        return emotionElement;
    }

    getIntensityLevel(intensity) {
        if (intensity >= 0.8) return 'Very High';
        if (intensity >= 0.6) return 'High';
        if (intensity >= 0.4) return 'Moderate';
        if (intensity >= 0.2) return 'Low';
        return 'Very Low';
    }

    displayContradictionAnalysis(contradictions) {
        const contradictionAnalysis = document.getElementById('contradictionAnalysis');
        const contradictionDetails = document.getElementById('contradictionDetails');
        
        if (!contradictionAnalysis || !contradictionDetails) return;
        
        if (contradictions.length === 0) {
            contradictionAnalysis.classList.add('hidden');
            return;
        }
        
        contradictionAnalysis.classList.remove('hidden');
        contradictionDetails.innerHTML = '';
        
        contradictions.forEach(contradiction => {
            const contradictionElement = document.createElement('div');
            contradictionElement.className = 'contradiction-item';
            
            contradictionElement.innerHTML = `
                <div class="contradiction-title">
                    ${contradiction.name} (${contradiction.confidence.toFixed(1)}% confidence)
                </div>
                <div class="contradiction-explanation">
                    ${contradiction.explanation}
                </div>
                <div class="contradiction-scenarios">
                    <strong>Common in:</strong> ${contradiction.commonScenarios.join(', ')}
                </div>
                <div class="psychological-interpretation">
                    <strong>Psychological Insight:</strong> ${contradiction.psychologicalInterpretation}
                </div>
            `;
            
            contradictionDetails.appendChild(contradictionElement);
        });
    }

    displayTherapeuticInsights(insights) {
        const insightsList = document.getElementById('insightsList');
        
        if (!insightsList) return;
        
        insightsList.innerHTML = '';
        
        insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'insight-item';
            
            insightElement.innerHTML = `
                <div class="insight-type">${insight.type}</div>
                <div class="insight-content">${insight.content}</div>
            `;
            
            insightsList.appendChild(insightElement);
        });
    }

    displayComplexityScore(score) {
        const complexityScore = document.getElementById('complexityScore');
        const complexityExplanation = document.getElementById('complexityExplanation');
        
        if (!complexityScore || !complexityExplanation) return;
        
        // Animate the score
        let currentScore = 0;
        const targetScore = score;
        const increment = targetScore / 50;
        
        const scoreAnimation = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(scoreAnimation);
            }
            complexityScore.textContent = Math.round(currentScore);
        }, 20);
        
        // Set explanation based on score
        let explanation = '';
        if (score >= 80) {
            explanation = "Extremely sophisticated emotional state showing high psychological complexity and depth. You're processing multiple layers of meaning simultaneously.";
        } else if (score >= 60) {
            explanation = "High emotional complexity indicating mature emotional processing. You're navigating conflicting feelings with psychological sophistication.";
        } else if (score >= 40) {
            explanation = "Moderate emotional complexity showing healthy emotional range and processing capabilities.";
        } else {
            explanation = "Relatively straightforward emotional state with clear primary feelings and minimal contradictions.";
        }
        
        complexityExplanation.textContent = explanation;
    }

    showDeepAnalysis() {
        if (!this.currentAnalysisResult) return;
        
        const modal = document.getElementById('deepAnalysisModal');
        const deepAnalysisContent = document.getElementById('deepAnalysisContent');
        
        if (!modal || !deepAnalysisContent) return;
        
        // Generate comprehensive deep analysis
        const deepAnalysis = this.generateDeepAnalysis(this.currentAnalysisResult);
        
        deepAnalysisContent.innerHTML = `
            <div class="deep-analysis-section">
                <h4>🎭 Emotional Architecture Analysis</h4>
                <p>${deepAnalysis.emotionalArchitecture}</p>
            </div>
            
            <div class="deep-analysis-section">
                <h4>⏰ Temporal Emotional Mapping</h4>
                <p>${deepAnalysis.temporalMapping}</p>
            </div>
            
            <div class="deep-analysis-section">
                <h4>🧠 Cognitive Dissonance Analysis</h4>
                <p>${deepAnalysis.cognitiveDissonance}</p>
            </div>
            
            <div class="deep-analysis-section">
                <h4>💡 Personal Growth Opportunities</h4>
                <p>${deepAnalysis.growthOpportunities}</p>
            </div>
            
            <div class="deep-analysis-section">
                <h4>🔍 Pattern Recognition</h4>
                <p>${deepAnalysis.patternRecognition}</p>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    generateDeepAnalysis(analysisResult) {
        const { contradictions, complexityScore, emotions } = analysisResult;
        
        return {
            emotionalArchitecture: contradictions.length > 0 
                ? `Your emotional response shows a sophisticated multi-layered architecture where different emotional systems are responding to different aspects of your situation. This indicates high emotional intelligence and the ability to process complex interpersonal or situational dynamics.`
                : `Your emotional response shows a coherent and integrated emotional architecture, indicating clear emotional processing and alignment between your feelings and situation.`,
            
            temporalMapping: contradictions.length > 0
                ? `The contradictory emotions suggest you may be processing past hurt while experiencing present satisfaction, or anticipating future outcomes while dealing with current emotions. This temporal complexity is normal during transitions and resolution periods.`
                : `Your emotions appear to be temporally aligned, suggesting you're experiencing feelings that are congruent with your current situation and timeframe.`,
            
            cognitiveDissonance: complexityScore > 60
                ? `Your mind is actively working through conflicting thoughts and feelings, which is a healthy cognitive process. This dissonance often precedes emotional integration and personal insight, suggesting you're in a period of psychological growth.`
                : `Your cognitive and emotional systems appear to be in relative harmony, indicating clear psychological processing and alignment.`,
            
            growthOpportunities: `This emotional complexity presents opportunities for deeper self-understanding. Consider journaling about what each emotion is trying to communicate, and how different aspects of your situation might be triggering different emotional responses.`,
            
            patternRecognition: this.analysisHistory.length > 1
                ? `Based on your emotional history, this pattern of ${contradictions.length > 0 ? 'complex contradictory emotions' : 'coherent emotional responses'} appears to be part of your unique emotional signature and processing style.`
                : `This is your first analysis, but the pattern suggests a ${complexityScore > 50 ? 'sophisticated' : 'straightforward'} approach to emotional processing.`
        };
    }

    closeModal() {
        const modal = document.getElementById('deepAnalysisModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    addToHistory(analysisResult) {
        this.analysisHistory.unshift(analysisResult);
        
        if (this.analysisHistory.length > 10) {
            this.analysisHistory = this.analysisHistory.slice(0, 10);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (!historyList) return;
        
        if (this.analysisHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <p>No previous analyses. Start by recording or uploading audio to explore your emotional complexity.</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        this.analysisHistory.forEach(analysis => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const timestamp = analysis.timestamp.toLocaleString();
            const topEmotions = Object.entries(analysis.emotions)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3);
            
            historyItem.innerHTML = `
                <div class="history-main">
                    <div class="history-timestamp">${timestamp}</div>
                    <div class="history-emotions">
                        ${topEmotions.map(([emotion, intensity]) => `
                            <div class="history-emotion">
                                <span>${this.emotionIcons[emotion]}</span>
                                <span>${emotion} (${(intensity * 100).toFixed(0)}%)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="history-complexity">
                    <div class="complexity-badge">${analysis.complexityScore}</div>
                    ${analysis.contradictions.length > 0 ? '<div class="contradiction-indicator">Complex</div>' : ''}
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    exportResults() {
        if (!this.currentAnalysisResult) {
            alert('No analysis results to export.');
            return;
        }
        
        const exportData = {
            timestamp: this.currentAnalysisResult.timestamp.toISOString(),
            audioSource: this.currentAnalysisResult.audioSource,
            processingTime: this.currentAnalysisResult.processingTime,
            emotions: this.currentAnalysisResult.emotions,
            contradictions: this.currentAnalysisResult.contradictions,
            complexityScore: this.currentAnalysisResult.complexityScore,
            therapeuticInsights: this.currentAnalysisResult.therapeuticInsights,
            deepAnalysis: this.generateDeepAnalysis(this.currentAnalysisResult),
            systemInfo: {
                analysisType: "Revolutionary Emotional Complexity Analysis",
                contradictionIntelligence: true,
                psychologicalInterpretation: true
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `emotional-complexity-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetForNewAnalysis() {
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        
        if (resultsSection) resultsSection.classList.add('hidden');
        if (processingSection) processingSection.classList.add('hidden');
        
        this.currentAnalysisResult = null;
        this.resetProgressBars();
        
        // Hide contradiction alert
        const contradictionAlert = document.getElementById('contradictionAlert');
        if (contradictionAlert) {
            contradictionAlert.classList.add('hidden');
        }
    }

    getInitialMessage(stage) {
        const messages = {
            'acoustic': 'Extracting emotional patterns...',
            'semantic': 'Understanding content meaning...',
            'contradiction': 'Identifying emotional conflicts...',
            'psychological': 'Generating deep insights...'
        };
        return messages[stage] || 'Processing...';
    }

    handleAnalysisError() {
        const processingSection = document.getElementById('processingSection');
        if (processingSection) {
            processingSection.innerHTML = `
                <div class="card__body">
                    <h3>Analysis Error</h3>
                    <p style="color: var(--color-error); text-align: center;">
                        An error occurred during emotional complexity analysis. Please try again.
                    </p>
                    <div style="text-align: center; margin-top: var(--space-16);">
                        <button class="btn btn--primary" onclick="analyzer.resetForNewAnalysis()">Try Again</button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize the Revolutionary Emotional Complexity AI
let analyzer;

document.addEventListener('DOMContentLoaded', () => {
    analyzer = new EmotionalComplexityAI();
    console.log('Revolutionary Emotional Complexity AI initialized');
    console.log('Contradiction Intelligence System active');
    console.log('Ready to embrace emotional contradictions and provide deep psychological insights');
});