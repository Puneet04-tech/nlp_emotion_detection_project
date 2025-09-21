class AdvancedVoiceEmotionDetection {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.audioContext = null;
        this.mediaStream = null;
        this.analyzer = null;
        
        // System status
        this.systemStatus = {
            browser: { supported: false, reason: '', details: '' },
            security: { secure: false, reason: '', details: '' },
            permissions: { granted: false, reason: '', details: '' },
            speechTest: { passed: false, reason: '', details: '' }
        };
        
        // Session data
        this.sessionData = {
            startTime: null,
            emotions: [],
            totalWords: 0,
            averageConfidence: 0,
            dominantEmotion: 'neutral'
        };
        
        // Audio features
        this.audioFeatures = {
            volume: 0,
            speechRate: 0,
            pauseCount: 0,
            totalDuration: 0,
            lastSpeechTime: 0
        };
        
        // Settings
        this.settings = {
            language: 'en-US',
            sensitivity: 1.0,
            textWeight: 0.7,
            audioWeight: 0.3
        };
        
        // Application data
        this.appData = {
            browserSupport: {
                chrome: { supported: true, prefix: "webkitSpeechRecognition", notes: "Best support, requires vendor prefix" },
                safari: { supported: "partial", prefix: "webkitSpeechRecognition", notes: "iOS 14.5+ only, limited functionality" },
                edge: { supported: false, prefix: "webkitSpeechRecognition", notes: "Claims support but doesn't work properly" },
                firefox: { supported: false, notes: "Disabled by default, no practical support" }
            },
            errorSolutions: {
                "not-allowed": {
                    title: "Microphone Permission Denied",
                    description: "The browser has blocked access to the microphone",
                    solutions: [
                        "Click the microphone icon in browser address bar",
                        "Go to browser Settings > Privacy & Security > Microphone",
                        "Refresh the page after granting permission",
                        "Clear browser data if permission is stuck"
                    ]
                },
                "network": {
                    title: "HTTPS Required",
                    description: "Speech recognition requires a secure connection",
                    solutions: [
                        "Access site via https:// instead of http://",
                        "Use localhost for local development",
                        "Configure SSL certificate for your domain",
                        "Use a secure hosting service"
                    ]
                },
                "language-not-supported": {
                    title: "Language Not Supported",
                    description: "The selected language is not available",
                    solutions: [
                        "Try 'en-US' (most widely supported)",
                        "Check the supported languages list",
                        "Update your browser to latest version"
                    ]
                },
                "no-speech": {
                    title: "No Speech Detected",
                    description: "The microphone is not picking up your voice",
                    solutions: [
                        "Check microphone is connected and working",
                        "Test microphone in system sound settings",
                        "Speak louder and closer to microphone",
                        "Check for background noise interference"
                    ]
                }
            },
            troubleshootingSteps: [
                { step: 1, title: "Check Browser Compatibility", description: "Ensure your browser supports speech recognition", action: "Use Chrome or Safari for best results" },
                { step: 2, title: "Verify HTTPS Connection", description: "Speech API requires secure connection", action: "Use https:// or localhost" },
                { step: 3, title: "Grant Microphone Permission", description: "Allow browser to access microphone", action: "Click Allow when prompted or reset in settings" },
                { step: 4, title: "Test Microphone Hardware", description: "Verify microphone works in system settings", action: "Check Windows Sound settings or Mac System Preferences" }
            ]
        };
        
        // Emotion keywords
        this.emotionKeywords = {
            happy: ["happy", "joy", "excited", "love", "great", "awesome", "fantastic", "wonderful", "amazing", "excellent", "cheerful", "delighted", "pleased", "glad", "thrilled"],
            sad: ["sad", "unhappy", "depressed", "miserable", "down", "gloomy", "melancholy", "sorrowful", "dejected", "heartbroken", "disappointed", "upset"],
            angry: ["angry", "mad", "furious", "enraged", "irritated", "annoyed", "frustrated", "outraged", "livid", "irate", "hostile", "agitated"],
            fear: ["scared", "afraid", "terrified", "anxious", "worried", "nervous", "panic", "frightened", "fearful", "apprehensive", "uneasy", "concerned"],
            surprise: ["wow", "amazing", "incredible", "unbelievable", "shocking", "astonishing", "surprised", "stunned", "amazed", "astounded", "speechless"],
            neutral: ["okay", "fine", "normal", "regular", "standard", "usual", "typical", "ordinary", "common", "average", "moderate"],
            disgust: ["disgusting", "revolting", "repulsive", "gross", "nasty", "awful", "horrible", "terrible", "sickening", "appalling"]
        };
        
        this.emotionColors = {
            happy: '#4CAF50', sad: '#2196F3', angry: '#F44336', fear: '#9C27B0',
            surprise: '#FF9800', neutral: '#9E9E9E', disgust: '#795548'
        };
        
        // Chart instance
        this.emotionChart = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.initializeElements();
        this.setupEventListeners();
        this.populateTroubleshootingContent();
        this.runSystemDiagnostics();
    }
    
    initializeElements() {
        this.elements = {
            // System status elements
            overallStatus: document.getElementById('overallStatus'),
            browserStatus: document.getElementById('browserStatus'),
            browserDetails: document.getElementById('browserDetails'),
            securityStatus: document.getElementById('securityStatus'),
            securityDetails: document.getElementById('securityDetails'),
            permissionStatus: document.getElementById('permissionStatus'),
            permissionDetails: document.getElementById('permissionDetails'),
            speechTestStatus: document.getElementById('speechTestStatus'),
            speechTestDetails: document.getElementById('speechTestDetails'),
            
            // Control buttons
            runDiagnostics: document.getElementById('runDiagnostics'),
            testMicrophone: document.getElementById('testMicrophone'),
            toggleTroubleshooting: document.getElementById('toggleTroubleshooting'),
            closeTroubleshooting: document.getElementById('closeTroubleshooting'),
            
            // Panels
            errorPanel: document.getElementById('errorPanel'),
            errorsList: document.getElementById('errorsList'),
            troubleshootingPanel: document.getElementById('troubleshootingPanel'),
            recordingInterface: document.getElementById('recordingInterface'),
            
            // Recording elements
            micButton: document.getElementById('micButton'),
            recordingStatus: document.getElementById('recordingStatus'),
            transcription: document.getElementById('transcription'),
            
            // Emotion display
            currentEmotion: document.getElementById('currentEmotion'),
            confidenceLevel: document.getElementById('confidenceLevel'),
            emotionMeter: document.getElementById('emotionMeter'),
            emotionHistory: document.getElementById('emotionHistory'),
            
            // Statistics
            totalWords: document.getElementById('totalWords'),
            avgConfidence: document.getElementById('avgConfidence'),
            dominantEmotion: document.getElementById('dominantEmotion'),
            sessionDuration: document.getElementById('sessionDuration'),
            
            // Settings
            languageSelect: document.getElementById('languageSelect'),
            sensitivitySlider: document.getElementById('sensitivitySlider'),
            clearHistory: document.getElementById('clearHistory'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Status message
            statusMessage: document.getElementById('statusMessage'),
            
            // Troubleshooting content
            troubleshootingSteps: document.getElementById('troubleshootingSteps'),
            errorSolutions: document.getElementById('errorSolutions')
        };
    }
    
    setupEventListeners() {
        // System control buttons
        if (this.elements.runDiagnostics) {
            this.elements.runDiagnostics.addEventListener('click', () => {
                console.log('Running diagnostics...');
                this.runSystemDiagnostics();
            });
        }
        
        if (this.elements.testMicrophone) {
            this.elements.testMicrophone.addEventListener('click', () => {
                console.log('Testing microphone...');
                this.testMicrophone();
            });
        }
        
        if (this.elements.toggleTroubleshooting) {
            this.elements.toggleTroubleshooting.addEventListener('click', () => {
                console.log('Toggling troubleshooting panel...');
                this.toggleTroubleshooting();
            });
        }
        
        if (this.elements.closeTroubleshooting) {
            this.elements.closeTroubleshooting.addEventListener('click', () => {
                console.log('Closing troubleshooting panel...');
                this.toggleTroubleshooting();
            });
        }
        
        // Recording controls
        if (this.elements.micButton) {
            this.elements.micButton.addEventListener('click', () => {
                console.log('Microphone button clicked...');
                this.toggleRecording();
            });
        }
        
        // Settings
        if (this.elements.languageSelect) {
            this.elements.languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.showStatus('Language updated to ' + e.target.selectedOptions[0].text, 'success');
            });
        }
        
        if (this.elements.sensitivitySlider) {
            this.elements.sensitivitySlider.addEventListener('input', (e) => {
                this.settings.sensitivity = parseFloat(e.target.value);
                const valueElement = document.querySelector('.sensitivity-value');
                if (valueElement) {
                    valueElement.textContent = e.target.value + 'x';
                }
            });
        }
        
        // Other controls
        if (this.elements.clearHistory) {
            this.elements.clearHistory.addEventListener('click', () => this.clearHistory());
        }
        
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportResults());
        }
    }
    
    // System diagnostics methods
    async runSystemDiagnostics() {
        this.showStatus('Running comprehensive system diagnostics...', 'info');
        
        // Check browser compatibility
        this.checkBrowserSupport();
        
        // Check security context
        this.checkSecurityContext();
        
        // Check microphone permissions
        await this.checkMicrophonePermissions();
        
        // Test speech recognition
        await this.testSpeechRecognition();
        
        // Update overall status
        this.updateOverallStatus();
        
        // Show errors if any
        this.displayErrors();
        
        // Show/hide recording interface based on readiness
        this.toggleRecordingInterface();
    }
    
    checkBrowserSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const userAgent = navigator.userAgent;
        
        if (!SpeechRecognition) {
            this.systemStatus.browser = {
                supported: false,
                reason: 'not_available',
                details: 'Speech recognition API not available in this browser'
            };
            this.updateStatusIndicator('browserStatus', 'error', '❌ Not Supported');
            if (this.elements.browserDetails) {
                this.elements.browserDetails.textContent = 'Please use Chrome or Safari for speech recognition support';
            }
            return;
        }
        
        // Detect Edge specifically
        if (userAgent.includes('Edg/')) {
            this.systemStatus.browser = {
                supported: false,
                reason: 'edge_issue',
                details: 'Edge browser has known compatibility issues with speech recognition'
            };
            this.updateStatusIndicator('browserStatus', 'error', '❌ Edge Issue');
            if (this.elements.browserDetails) {
                this.elements.browserDetails.textContent = 'Edge browser detected - please use Chrome for better compatibility';
            }
            return;
        }
        
        // Test if we can actually create an instance
        try {
            const test = new SpeechRecognition();
            this.systemStatus.browser = {
                supported: true,
                constructor: SpeechRecognition,
                details: 'Speech recognition API is available and working'
            };
            this.updateStatusIndicator('browserStatus', 'success', '✅ Supported');
            
            if (this.elements.browserDetails) {
                if (userAgent.includes('Chrome')) {
                    this.elements.browserDetails.textContent = 'Chrome detected - excellent speech recognition support';
                } else if (userAgent.includes('Safari')) {
                    this.elements.browserDetails.textContent = 'Safari detected - good speech recognition support';
                } else {
                    this.elements.browserDetails.textContent = 'Speech recognition API available';
                }
            }
        } catch (error) {
            this.systemStatus.browser = {
                supported: false,
                reason: 'creation_failed',
                error: error.message,
                details: 'Failed to create speech recognition instance'
            };
            this.updateStatusIndicator('browserStatus', 'error', '❌ Creation Failed');
            if (this.elements.browserDetails) {
                this.elements.browserDetails.textContent = `Error: ${error.message}`;
            }
        }
    }
    
    checkSecurityContext() {
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        
        this.systemStatus.security = {
            secure: isSecure,
            protocol: location.protocol,
            hostname: location.hostname
        };
        
        if (isSecure) {
            this.updateStatusIndicator('securityStatus', 'success', '✅ Secure');
            if (this.elements.securityDetails) {
                this.elements.securityDetails.textContent = `Running on ${location.protocol}//${location.hostname} - secure context confirmed`;
            }
        } else {
            this.systemStatus.security.reason = 'insecure_context';
            this.systemStatus.security.details = 'Speech recognition requires HTTPS or localhost';
            this.updateStatusIndicator('securityStatus', 'error', '❌ Insecure');
            if (this.elements.securityDetails) {
                this.elements.securityDetails.textContent = 'Speech recognition requires HTTPS connection. Please access via https:// or use localhost';
            }
        }
    }
    
    async checkMicrophonePermissions() {
        try {
            // Check using Permissions API if available
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                
                if (permissionStatus.state === 'granted') {
                    this.systemStatus.permissions = {
                        granted: true,
                        status: 'granted',
                        details: 'Microphone permission already granted'
                    };
                    this.updateStatusIndicator('permissionStatus', 'success', '✅ Granted');
                    if (this.elements.permissionDetails) {
                        this.elements.permissionDetails.textContent = 'Microphone access granted';
                    }
                } else if (permissionStatus.state === 'denied') {
                    this.systemStatus.permissions = {
                        granted: false,
                        status: 'denied',
                        reason: 'permission_denied',
                        details: 'Microphone permission denied by user'
                    };
                    this.updateStatusIndicator('permissionStatus', 'error', '❌ Denied');
                    if (this.elements.permissionDetails) {
                        this.elements.permissionDetails.textContent = 'Microphone permission denied - click to reset permissions';
                    }
                } else {
                    this.systemStatus.permissions = {
                        granted: false,
                        status: 'prompt',
                        details: 'Microphone permission will be requested'
                    };
                    this.updateStatusIndicator('permissionStatus', 'warning', '⚠️ Will Prompt');
                    if (this.elements.permissionDetails) {
                        this.elements.permissionDetails.textContent = 'Permission will be requested when recording starts';
                    }
                }
                return;
            }
            
            // Fallback: try to request permissions
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
            this.systemStatus.permissions = {
                granted: true,
                status: 'granted',
                details: 'Microphone access test successful'
            };
            this.updateStatusIndicator('permissionStatus', 'success', '✅ Granted');
            if (this.elements.permissionDetails) {
                this.elements.permissionDetails.textContent = 'Microphone access confirmed';
            }
            
        } catch (error) {
            const isPermissionError = error.name === 'NotAllowedError';
            this.systemStatus.permissions = {
                granted: false,
                status: isPermissionError ? 'denied' : 'error',
                reason: error.name,
                error: error.message,
                details: isPermissionError ? 'Microphone permission denied' : `Microphone error: ${error.message}`
            };
            
            if (isPermissionError) {
                this.updateStatusIndicator('permissionStatus', 'error', '❌ Denied');
                if (this.elements.permissionDetails) {
                    this.elements.permissionDetails.textContent = 'Microphone permission denied - please allow in browser settings';
                }
            } else {
                this.updateStatusIndicator('permissionStatus', 'error', '❌ Error');
                if (this.elements.permissionDetails) {
                    this.elements.permissionDetails.textContent = `Microphone error: ${error.message}`;
                }
            }
        }
    }
    
    async testSpeechRecognition() {
        if (!this.systemStatus.browser.supported || !this.systemStatus.security.secure) {
            this.systemStatus.speechTest = {
                passed: false,
                reason: 'prerequisites_not_met',
                details: 'Cannot test - browser or security requirements not met'
            };
            this.updateStatusIndicator('speechTestStatus', 'error', '❌ Cannot Test');
            if (this.elements.speechTestDetails) {
                this.elements.speechTestDetails.textContent = 'Prerequisites not met for speech recognition test';
            }
            return;
        }
        
        try {
            const SpeechRecognition = this.systemStatus.browser.constructor;
            const testRecognition = new SpeechRecognition();
            
            // Test basic configuration
            testRecognition.continuous = false;
            testRecognition.interimResults = false;
            testRecognition.lang = this.settings.language;
            
            this.systemStatus.speechTest = {
                passed: true,
                details: 'Speech recognition instance created and configured successfully'
            };
            this.updateStatusIndicator('speechTestStatus', 'success', '✅ Ready');
            if (this.elements.speechTestDetails) {
                this.elements.speechTestDetails.textContent = 'Speech recognition ready for use';
            }
            
        } catch (error) {
            this.systemStatus.speechTest = {
                passed: false,
                reason: 'configuration_failed',
                error: error.message,
                details: `Failed to configure speech recognition: ${error.message}`
            };
            this.updateStatusIndicator('speechTestStatus', 'error', '❌ Failed');
            if (this.elements.speechTestDetails) {
                this.elements.speechTestDetails.textContent = `Configuration error: ${error.message}`;
            }
        }
    }
    
    updateStatusIndicator(elementId, type, text) {
        const element = this.elements[elementId];
        if (element) {
            element.className = `status-indicator status--${type}`;
            element.textContent = text;
        }
    }
    
    updateOverallStatus() {
        const allPassed = this.systemStatus.browser.supported && 
                          this.systemStatus.security.secure && 
                          this.systemStatus.permissions.granted && 
                          this.systemStatus.speechTest.passed;
        
        if (allPassed) {
            this.updateStatusIndicator('overallStatus', 'success', '✅ System Ready');
        } else {
            const criticalIssues = [];
            if (!this.systemStatus.browser.supported) criticalIssues.push('Browser');
            if (!this.systemStatus.security.secure) criticalIssues.push('Security');
            if (!this.systemStatus.permissions.granted) criticalIssues.push('Permissions');
            if (!this.systemStatus.speechTest.passed) criticalIssues.push('Speech Test');
            
            this.updateStatusIndicator('overallStatus', 'error', `❌ Issues: ${criticalIssues.join(', ')}`);
        }
    }
    
    displayErrors() {
        const errors = [];
        
        // Collect all errors
        if (!this.systemStatus.browser.supported) {
            const errorKey = this.systemStatus.browser.reason === 'edge_issue' ? 'browser_edge' : 'browser_unsupported';
            errors.push({
                title: 'Browser Compatibility Issue',
                description: this.systemStatus.browser.details,
                solutions: errorKey === 'browser_edge' ? 
                    ['Use Chrome for best compatibility', 'Try Safari as an alternative', 'Avoid Edge browser for speech recognition'] :
                    ['Install Chrome or Chromium browser', 'Update your current browser', 'Try Safari on iOS/macOS']
            });
        }
        
        if (!this.systemStatus.security.secure) {
            errors.push(this.appData.errorSolutions.network);
        }
        
        if (!this.systemStatus.permissions.granted && this.systemStatus.permissions.status === 'denied') {
            errors.push(this.appData.errorSolutions['not-allowed']);
        }
        
        // Display errors
        if (errors.length > 0 && this.elements.errorsList) {
            this.elements.errorsList.innerHTML = '';
            errors.forEach(error => {
                const errorElement = this.createErrorElement(error);
                this.elements.errorsList.appendChild(errorElement);
            });
            if (this.elements.errorPanel) {
                this.elements.errorPanel.classList.remove('hidden');
            }
        } else {
            if (this.elements.errorPanel) {
                this.elements.errorPanel.classList.add('hidden');
            }
        }
    }
    
    createErrorElement(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-item';
        
        errorDiv.innerHTML = `
            <div class="error-title">${error.title}</div>
            <div class="error-description">${error.description}</div>
            <div class="error-solutions">
                ${error.solutions.map(solution => `<div class="error-solution">• ${solution}</div>`).join('')}
            </div>
        `;
        
        return errorDiv;
    }
    
    toggleRecordingInterface() {
        const isReady = this.systemStatus.browser.supported && 
                       this.systemStatus.security.secure && 
                       this.systemStatus.speechTest.passed;
        
        if (this.elements.recordingInterface) {
            if (isReady) {
                this.elements.recordingInterface.classList.remove('hidden');
            } else {
                // Show recording interface but keep mic button disabled
                this.elements.recordingInterface.classList.remove('hidden');
            }
        }
        
        if (this.elements.micButton) {
            this.elements.micButton.disabled = !isReady;
        }
    }
    
    async testMicrophone() {
        try {
            this.showStatus('Testing microphone access...', 'info');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create audio context to analyze audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzer = audioContext.createAnalyser();
            source.connect(analyzer);
            
            analyzer.fftSize = 256;
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            
            // Monitor audio for 3 seconds
            let maxVolume = 0;
            const startTime = Date.now();
            
            const checkAudio = () => {
                analyzer.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                maxVolume = Math.max(maxVolume, volume);
                
                if (Date.now() - startTime < 3000) {
                    requestAnimationFrame(checkAudio);
                } else {
                    // Cleanup
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                    
                    if (maxVolume > 10) {
                        this.showStatus('Microphone test successful! Audio detected.', 'success');
                    } else {
                        this.showStatus('Microphone connected but no audio detected. Try speaking.', 'warning');
                    }
                }
            };
            
            checkAudio();
            
        } catch (error) {
            this.showStatus(`Microphone test failed: ${error.message}`, 'error');
        }
    }
    
    toggleTroubleshooting() {
        console.log('Toggle troubleshooting called');
        if (this.elements.troubleshootingPanel) {
            const isHidden = this.elements.troubleshootingPanel.classList.contains('hidden');
            console.log('Panel is currently hidden:', isHidden);
            
            if (isHidden) {
                this.elements.troubleshootingPanel.classList.remove('hidden');
                if (this.elements.toggleTroubleshooting) {
                    this.elements.toggleTroubleshooting.textContent = 'Hide Troubleshooting Guide';
                }
                this.showStatus('Troubleshooting guide opened', 'info');
            } else {
                this.elements.troubleshootingPanel.classList.add('hidden');
                if (this.elements.toggleTroubleshooting) {
                    this.elements.toggleTroubleshooting.textContent = 'Show Troubleshooting Guide';
                }
                this.showStatus('Troubleshooting guide closed', 'info');
            }
        } else {
            console.log('Troubleshooting panel element not found');
        }
    }
    
    populateTroubleshootingContent() {
        // Populate troubleshooting steps
        if (this.elements.troubleshootingSteps) {
            this.elements.troubleshootingSteps.innerHTML = '';
            this.appData.troubleshootingSteps.forEach(step => {
                const stepElement = document.createElement('div');
                stepElement.className = 'troubleshooting-step';
                stepElement.innerHTML = `
                    <div class="step-number">${step.step}</div>
                    <div class="step-content">
                        <h5>${step.title}</h5>
                        <p>${step.description}</p>
                        <div class="step-action">${step.action}</div>
                    </div>
                `;
                this.elements.troubleshootingSteps.appendChild(stepElement);
            });
        }
        
        // Populate error solutions
        if (this.elements.errorSolutions) {
            this.elements.errorSolutions.innerHTML = '';
            Object.values(this.appData.errorSolutions).forEach(solution => {
                const solutionElement = document.createElement('div');
                solutionElement.className = 'error-item';
                solutionElement.innerHTML = `
                    <div class="error-title">${solution.title}</div>
                    <div class="error-description">${solution.description}</div>
                    <div class="error-solutions">
                        ${solution.solutions.map(sol => `<div class="error-solution">• ${sol}</div>`).join('')}
                    </div>
                `;
                this.elements.errorSolutions.appendChild(solutionElement);
            });
        }
    }
    
    // Recording functionality
    async toggleRecording() {
        console.log('Toggle recording called, currently recording:', this.isRecording);
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            this.showStatus('Requesting microphone access...', 'info');
            
            // Request microphone permission
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Initialize audio context for audio analysis
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyzer = this.audioContext.createAnalyser();
            source.connect(this.analyzer);
            
            this.analyzer.fftSize = 256;
            this.bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Initialize speech recognition
            const SpeechRecognition = this.systemStatus.browser.constructor;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.settings.language;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.sessionData.startTime = Date.now();
                if (this.elements.micButton) {
                    this.elements.micButton.classList.add('recording');
                }
                if (this.elements.recordingStatus) {
                    this.elements.recordingStatus.textContent = 'Recording... Speak now!';
                }
                this.showStatus('Recording started successfully', 'success');
                this.startAudioAnalysis();
                this.initializeChart();
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        this.processTranscript(transcript);
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (this.elements.transcription) {
                    this.elements.transcription.textContent = finalTranscript + interimTranscript;
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.handleSpeechError(event.error);
            };
            
            this.recognition.onend = () => {
                if (this.isRecording) {
                    // Restart recognition if still supposed to be recording
                    setTimeout(() => {
                        if (this.isRecording) {
                            this.recognition.start();
                        }
                    }, 100);
                }
            };
            
            this.recognition.start();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showStatus('Failed to start recording: ' + error.message, 'error');
            this.handleStartupError(error);
        }
    }
    
    handleSpeechError(errorType) {
        const errorSolution = this.appData.errorSolutions[errorType];
        if (errorSolution) {
            this.showDetailedError(errorSolution);
        } else {
            this.showStatus(`Speech recognition error: ${errorType}`, 'error');
        }
    }
    
    handleStartupError(error) {
        let errorType = 'unknown';
        if (error.name === 'NotAllowedError') {
            errorType = 'not-allowed';
        } else if (error.name === 'NotSecureError') {
            errorType = 'network';
        }
        
        const errorSolution = this.appData.errorSolutions[errorType];
        if (errorSolution) {
            this.showDetailedError(errorSolution);
        }
    }
    
    showDetailedError(errorSolution) {
        // Show error in status message with first solution
        this.showStatus(`${errorSolution.title}: ${errorSolution.solutions[0]}`, 'error');
        
        // Also show in error panel
        if (this.elements.errorsList) {
            this.elements.errorsList.innerHTML = '';
            const errorElement = this.createErrorElement(errorSolution);
            this.elements.errorsList.appendChild(errorElement);
        }
        if (this.elements.errorPanel) {
            this.elements.errorPanel.classList.remove('hidden');
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.elements.micButton) {
            this.elements.micButton.classList.remove('recording');
        }
        if (this.elements.recordingStatus) {
            this.elements.recordingStatus.textContent = 'System Ready - Click to Start';
        }
        this.showStatus('Recording stopped', 'info');
        this.updateSessionStatistics();
    }
    
    startAudioAnalysis() {
        if (!this.isRecording) return;
        
        this.analyzer.getByteFrequencyData(this.dataArray);
        
        // Calculate volume level
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        this.audioFeatures.volume = sum / this.bufferLength / 255;
        
        // Continue analysis
        requestAnimationFrame(() => this.startAudioAnalysis());
    }
    
    processTranscript(transcript) {
        const words = transcript.trim().split(/\s+/);
        this.sessionData.totalWords += words.length;
        
        // Calculate speech rate
        const currentTime = Date.now();
        if (this.audioFeatures.lastSpeechTime > 0) {
            const timeDiff = (currentTime - this.audioFeatures.lastSpeechTime) / 1000;
            this.audioFeatures.speechRate = words.length / timeDiff;
        }
        this.audioFeatures.lastSpeechTime = currentTime;
        
        // Analyze emotion
        const emotionResult = this.analyzeEmotion(transcript);
        
        // Add to session data
        this.sessionData.emotions.push({
            emotion: emotionResult.emotion,
            confidence: emotionResult.confidence,
            timestamp: currentTime,
            text: transcript,
            audioFeatures: { ...this.audioFeatures }
        });
        
        // Update UI
        this.updateCurrentEmotion(emotionResult);
        this.updateEmotionHistory(emotionResult, transcript);
        this.updateChart();
    }
    
    analyzeEmotion(text) {
        const textAnalysis = this.analyzeTextEmotion(text);
        const audioAnalysis = this.analyzeAudioEmotion();
        
        // Combine text and audio analysis
        const combinedScores = {};
        
        // Apply weights
        Object.keys(textAnalysis.scores).forEach(emotion => {
            combinedScores[emotion] = 
                (textAnalysis.scores[emotion] * this.settings.textWeight) +
                (audioAnalysis.scores[emotion] * this.settings.audioWeight);
        });
        
        // Apply sensitivity multiplier
        Object.keys(combinedScores).forEach(emotion => {
            combinedScores[emotion] *= this.settings.sensitivity;
        });
        
        // Find dominant emotion
        let maxEmotion = 'neutral';
        let maxScore = combinedScores.neutral || 0;
        
        Object.keys(combinedScores).forEach(emotion => {
            if (combinedScores[emotion] > maxScore) {
                maxScore = combinedScores[emotion];
                maxEmotion = emotion;
            }
        });
        
        // Calculate confidence (normalize to 0-100)
        const confidence = Math.min(Math.max(maxScore * 100, 0), 100);
        
        return {
            emotion: maxEmotion,
            confidence: Math.round(confidence),
            scores: combinedScores
        };
    }
    
    analyzeTextEmotion(text) {
        const words = text.toLowerCase().split(/\s+/);
        const emotionScores = {
            happy: 0, sad: 0, angry: 0, fear: 0, 
            surprise: 0, neutral: 0, disgust: 0
        };
        
        let totalMatches = 0;
        
        // Count keyword matches
        words.forEach(word => {
            Object.keys(this.emotionKeywords).forEach(emotion => {
                if (this.emotionKeywords[emotion].includes(word)) {
                    emotionScores[emotion] += 1;
                    totalMatches += 1;
                }
            });
        });
        
        // Normalize scores
        if (totalMatches > 0) {
            Object.keys(emotionScores).forEach(emotion => {
                emotionScores[emotion] = emotionScores[emotion] / totalMatches;
            });
        } else {
            emotionScores.neutral = 1.0;
        }
        
        return { scores: emotionScores };
    }
    
    analyzeAudioEmotion() {
        const audioScores = {
            happy: 0, sad: 0, angry: 0, fear: 0,
            surprise: 0, neutral: 0.5, disgust: 0
        };
        
        const volume = this.audioFeatures.volume;
        const speechRate = this.audioFeatures.speechRate;
        
        // Volume-based analysis
        if (volume > 0.7) {
            audioScores.angry += 0.3;
            audioScores.happy += 0.2;
            audioScores.surprise += 0.2;
        } else if (volume < 0.3) {
            audioScores.sad += 0.3;
            audioScores.fear += 0.2;
        }
        
        // Speech rate analysis
        if (speechRate > 4) { // Fast speech
            audioScores.angry += 0.2;
            audioScores.happy += 0.2;
            audioScores.surprise += 0.3;
        } else if (speechRate < 2) { // Slow speech
            audioScores.sad += 0.3;
            audioScores.fear += 0.2;
        }
        
        return { scores: audioScores };
    }
    
    updateCurrentEmotion(emotionResult) {
        if (this.elements.currentEmotion) {
            this.elements.currentEmotion.textContent = this.capitalizeFirst(emotionResult.emotion);
            this.elements.currentEmotion.className = `emotion-text emotion-${emotionResult.emotion}`;
        }
        if (this.elements.confidenceLevel) {
            this.elements.confidenceLevel.textContent = `${emotionResult.confidence}% Confidence`;
        }
        if (this.elements.emotionMeter) {
            this.elements.emotionMeter.style.width = `${emotionResult.confidence}%`;
            this.elements.emotionMeter.style.background = `linear-gradient(90deg, ${this.emotionColors[emotionResult.emotion]}, ${this.emotionColors[emotionResult.emotion]}88)`;
        }
    }
    
    updateEmotionHistory(emotionResult, text) {
        if (!this.elements.emotionHistory) return;
        
        if (this.elements.emotionHistory.querySelector('.timeline-empty')) {
            this.elements.emotionHistory.innerHTML = '';
        }
        
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item emotion-${emotionResult.emotion} fade-in`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        timelineItem.innerHTML = `
            <div class="timeline-emotion">${this.capitalizeFirst(emotionResult.emotion)}</div>
            <div class="timeline-confidence">${emotionResult.confidence}%</div>
            <div class="timeline-text">${text.substring(0, 100)}${text.length > 100 ? '...' : ''}</div>
            <div class="timeline-time">${timestamp}</div>
        `;
        
        this.elements.emotionHistory.insertBefore(timelineItem, this.elements.emotionHistory.firstChild);
        
        // Limit history to 50 items
        const items = this.elements.emotionHistory.querySelectorAll('.timeline-item');
        if (items.length > 50) {
            items[items.length - 1].remove();
        }
        
        // Auto-scroll to top
        this.elements.emotionHistory.scrollTop = 0;
    }
    
    initializeChart() {
        if (this.emotionChart) {
            this.emotionChart.destroy();
        }
        
        const chartElement = document.getElementById('emotionChart');
        if (!chartElement) return;
        
        const ctx = chartElement.getContext('2d');
        this.emotionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral', 'Disgust'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 1, 0],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    updateChart() {
        if (!this.emotionChart) return;
        
        const emotionCounts = {
            happy: 0, sad: 0, angry: 0, fear: 0,
            surprise: 0, neutral: 0, disgust: 0
        };
        
        this.sessionData.emotions.forEach(emotion => {
            emotionCounts[emotion.emotion]++;
        });
        
        const data = [
            emotionCounts.happy, emotionCounts.sad, emotionCounts.angry,
            emotionCounts.fear, emotionCounts.surprise, emotionCounts.neutral,
            emotionCounts.disgust
        ];
        
        this.emotionChart.data.datasets[0].data = data;
        this.emotionChart.update();
    }
    
    updateSessionStatistics() {
        // Total words
        if (this.elements.totalWords) {
            this.elements.totalWords.textContent = this.sessionData.totalWords;
        }
        
        // Average confidence
        if (this.sessionData.emotions.length > 0 && this.elements.avgConfidence) {
            const avgConf = this.sessionData.emotions.reduce((sum, e) => sum + e.confidence, 0) / this.sessionData.emotions.length;
            this.elements.avgConfidence.textContent = Math.round(avgConf) + '%';
            this.sessionData.averageConfidence = avgConf;
        }
        
        // Dominant emotion
        const emotionCounts = {};
        this.sessionData.emotions.forEach(e => {
            emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
        });
        
        let dominantEmotion = 'neutral';
        let maxCount = 0;
        Object.keys(emotionCounts).forEach(emotion => {
            if (emotionCounts[emotion] > maxCount) {
                maxCount = emotionCounts[emotion];
                dominantEmotion = emotion;
            }
        });
        
        this.sessionData.dominantEmotion = dominantEmotion;
        if (this.elements.dominantEmotion) {
            this.elements.dominantEmotion.textContent = this.capitalizeFirst(dominantEmotion);
            this.elements.dominantEmotion.className = `stat-value emotion-${dominantEmotion}`;
        }
        
        // Session duration
        if (this.sessionData.startTime && this.elements.sessionDuration) {
            const duration = Math.round((Date.now() - this.sessionData.startTime) / 1000);
            this.elements.sessionDuration.textContent = this.formatDuration(duration);
        }
    }
    
    clearHistory() {
        this.sessionData.emotions = [];
        this.sessionData.totalWords = 0;
        this.sessionData.averageConfidence = 0;
        this.sessionData.dominantEmotion = 'neutral';
        
        if (this.elements.emotionHistory) {
            this.elements.emotionHistory.innerHTML = '<div class="timeline-empty">No emotions detected yet. Start recording to see your emotion timeline!</div>';
        }
        
        // Reset chart
        if (this.emotionChart) {
            this.emotionChart.data.datasets[0].data = [0, 0, 0, 0, 0, 1, 0];
            this.emotionChart.update();
        }
        
        // Reset statistics
        if (this.elements.totalWords) this.elements.totalWords.textContent = '0';
        if (this.elements.avgConfidence) this.elements.avgConfidence.textContent = '0%';
        if (this.elements.dominantEmotion) {
            this.elements.dominantEmotion.textContent = 'Neutral';
            this.elements.dominantEmotion.className = 'stat-value emotion-neutral';
        }
        if (this.elements.sessionDuration) this.elements.sessionDuration.textContent = '0s';
        
        // Reset current emotion
        if (this.elements.currentEmotion) {
            this.elements.currentEmotion.textContent = 'Neutral';
            this.elements.currentEmotion.className = 'emotion-text emotion-neutral';
        }
        if (this.elements.confidenceLevel) this.elements.confidenceLevel.textContent = '0% Confidence';
        if (this.elements.emotionMeter) this.elements.emotionMeter.style.width = '0%';
        
        this.showStatus('History cleared successfully', 'success');
    }
    
    exportResults() {
        const exportData = {
            sessionInfo: {
                startTime: this.sessionData.startTime ? new Date(this.sessionData.startTime).toISOString() : null,
                endTime: new Date().toISOString(),
                totalWords: this.sessionData.totalWords,
                averageConfidence: this.sessionData.averageConfidence,
                dominantEmotion: this.sessionData.dominantEmotion
            },
            systemStatus: this.systemStatus,
            emotions: this.sessionData.emotions.map(e => ({
                emotion: e.emotion,
                confidence: e.confidence,
                timestamp: new Date(e.timestamp).toISOString(),
                text: e.text
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emotion-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('Results exported successfully', 'success');
    }
    
    showStatus(message, type = 'info') {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = `status-message status--${type}`;
            this.elements.statusMessage.classList.remove('hidden');
            
            setTimeout(() => {
                if (this.elements.statusMessage) {
                    this.elements.statusMessage.classList.add('hidden');
                }
            }, 5000);
        }
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Voice Emotion Detection App...');
    window.voiceEmotionApp = new AdvancedVoiceEmotionDetection();
});

// Update session duration periodically
setInterval(() => {
    const app = window.voiceEmotionApp;
    if (app && app.sessionData.startTime && app.isRecording) {
        const duration = Math.round((Date.now() - app.sessionData.startTime) / 1000);
        const durationElement = document.getElementById('sessionDuration');
        if (durationElement) {
            durationElement.textContent = app.formatDuration(duration);
        }
    }
}, 1000);