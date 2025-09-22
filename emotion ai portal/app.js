// Ultimate Emotion AI Portal - Professional JavaScript Application
class EmotionAIPortal {
    constructor() {
        // System configuration from provided JSON data
        this.systems = [
            {
                name: "UltraFusion EmotionNet",
                url: "https://ultimateemotion.netlify.app/",
                description: "Flagship comprehensive emotion analysis system",
                features: ["Multi-model ensemble", "25+ emotions", "Highest accuracy", "Professional reports"],
                category: "comprehensive",
                accuracy: "99.3%",
                icon: "🧠"
            },
            {
                name: "Per-Second Emotion Analyzer",
                url: "https://emotion-per-second.netlify.app/",
                description: "Granular per-second emotion tracking",
                features: ["Second-by-second analysis", "Multimodal evidence", "Timeline visualization", "Transition tracking"],
                category: "temporal",
                accuracy: "98.7%",
                icon: "⏱️"
            },
            {
                name: "Enhanced Multimodal System",
                url: "https://enhancedemotionwithdescription.netlify.app/",
                description: "Advanced prosody and linguistic analysis",
                features: ["Prosody analysis", "Semantic processing", "Detailed explanations", "Evidence descriptions"],
                category: "descriptive",
                accuracy: "97.9%",
                icon: "🔍"
            },
            {
                name: "Contradictory Emotion Detector",
                url: "https://contradictryemotions.netlify.app/",
                description: "Specialized contradiction and mixed emotion detection",
                features: ["Contradiction detection", "Mixed emotions", "Complexity assessment", "Conflict analysis"],
                category: "specialized",
                accuracy: "96.4%",
                icon: "⚖️"
            },
            {
                name: "Live Recording Analyzer",
                url: "https://liverecording.netlify.app/",
                description: "Real-time live recording emotion analysis",
                features: ["Real-time processing", "Live visualization", "Instant feedback", "Streaming analysis"],
                category: "realtime",
                accuracy: "95.8%",
                icon: "🔴"
            }
        ];

        // Portal analytics
        this.analytics = {
            systemLaunches: {},
            totalLaunches: 0,
            sessionStart: Date.now(),
            userInteractions: []
        };

        // Initialize portal
        this.initialize();
    }

    initialize() {
        console.log('🚀 Ultimate Emotion AI Portal initializing...');
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeAnalytics();
            });
        } else {
            this.setupEventListeners();
            this.initializeAnalytics();
        }

        console.log('✅ Portal initialization complete');
    }

    setupEventListeners() {
        // Setup launch button event listeners
        const launchButtons = document.querySelectorAll('.launch-btn');
        
        launchButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSystemLaunch(button);
            });

            // Add keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleSystemLaunch(button);
                }
            });

            // Add hover effects for analytics
            button.addEventListener('mouseenter', () => {
                const systemName = button.getAttribute('data-system');
                this.trackUserInteraction('hover', systemName);
            });
        });

        // Setup system card interactions
        const systemCards = document.querySelectorAll('.system-card');
        systemCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.trackUserInteraction('card_hover', card.querySelector('.system-title')?.textContent);
            });
        });

        // Setup smooth scrolling for internal links
        this.setupSmoothScrolling();

        // Setup comparison table interactions
        this.setupComparisonTable();

        console.log(`✅ Event listeners setup complete - ${launchButtons.length} launch buttons initialized`);
    }

    handleSystemLaunch(button) {
        const systemUrl = button.getAttribute('data-url');
        const systemName = button.getAttribute('data-system');

        if (!systemUrl || !systemName) {
            console.error('❌ Missing system URL or name:', { systemUrl, systemName });
            this.showErrorMessage('System information missing. Please try again.');
            return;
        }

        console.log(`🚀 Launching system: ${systemName}`);
        console.log(`🔗 URL: ${systemUrl}`);
        
        // Show loading state
        this.showLaunchingState(button);

        // Track the launch
        this.trackSystemLaunch(systemName, systemUrl);

        // Simple and reliable window.open approach
        try {
            // Use window.open with target="_blank" - most reliable approach
            window.open(systemUrl, '_blank');
            
            console.log(`✅ Successfully launched ${systemName}`);
            this.showSuccessMessage(`${systemName} opened in new tab`);
            
            // Reset button state after delay
            setTimeout(() => {
                this.resetLaunchButton(button);
            }, 1500);
            
        } catch (error) {
            console.error('❌ Failed to launch system:', error);
            
            // Fallback: try creating a link and clicking it
            try {
                const link = document.createElement('a');
                link.href = systemUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log(`✅ Fallback launch successful for ${systemName}`);
                this.showSuccessMessage(`${systemName} opened in new tab`);
                
                setTimeout(() => {
                    this.resetLaunchButton(button);
                }, 1500);
                
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                this.showErrorMessage('Unable to open system. Please manually visit: ' + systemUrl);
                this.resetLaunchButton(button);
            }
        }
    }

    showLaunchingState(button) {
        const originalText = button.textContent;
        button.setAttribute('data-original-text', originalText);
        button.textContent = '🚀 Opening...';
        button.disabled = true;
        button.style.opacity = '0.8';
        button.style.cursor = 'not-allowed';
    }

    resetLaunchButton(button) {
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.textContent = originalText;
            button.removeAttribute('data-original-text');
        }
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }

    trackSystemLaunch(systemName, systemUrl) {
        // Update analytics
        this.analytics.totalLaunches++;
        this.analytics.systemLaunches[systemName] = (this.analytics.systemLaunches[systemName] || 0) + 1;
        
        // Track detailed interaction
        this.trackUserInteraction('system_launch', systemName, {
            url: systemUrl,
            timestamp: Date.now(),
            sessionDuration: Date.now() - this.analytics.sessionStart
        });

        // Update UI statistics if needed
        this.updatePortalStats();

        console.log(`📊 Analytics updated: ${systemName} launched (${this.analytics.systemLaunches[systemName]} times)`);
    }

    trackUserInteraction(action, target, additionalData = {}) {
        const interaction = {
            action,
            target,
            timestamp: Date.now(),
            sessionDuration: Date.now() - this.analytics.sessionStart,
            ...additionalData
        };

        this.analytics.userInteractions.push(interaction);

        // Keep only last 100 interactions to prevent memory issues
        if (this.analytics.userInteractions.length > 100) {
            this.analytics.userInteractions = this.analytics.userInteractions.slice(-100);
        }
    }

    updatePortalStats() {
        // Update any dynamic statistics on the page
        const totalLaunchesElement = document.getElementById('totalLaunches');
        if (totalLaunchesElement) {
            totalLaunchesElement.textContent = this.analytics.totalLaunches;
        }

        // Update popular system indicator
        const mostPopularSystem = this.getMostPopularSystem();
        if (mostPopularSystem) {
            this.highlightPopularSystem(mostPopularSystem);
        }
    }

    getMostPopularSystem() {
        if (Object.keys(this.analytics.systemLaunches).length === 0) return null;

        return Object.entries(this.analytics.systemLaunches)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    highlightPopularSystem(systemName) {
        // Add visual indicator to most popular system
        const systemCards = document.querySelectorAll('.system-card');
        systemCards.forEach(card => {
            const titleElement = card.querySelector('.system-title');
            if (titleElement && titleElement.textContent.includes(systemName)) {
                if (!card.classList.contains('popular')) {
                    card.classList.add('popular');
                    // Add popular badge if not already present
                    if (!card.querySelector('.popular-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'popular-badge';
                        badge.textContent = '🔥 Popular';
                        card.querySelector('.card-header').appendChild(badge);
                    }
                }
            }
        });
    }

    setupSmoothScrolling() {
        // Handle smooth scrolling for internal navigation
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    this.trackUserInteraction('internal_navigation', targetId);
                }
            });
        });
    }

    setupComparisonTable() {
        const comparisonTable = document.querySelector('.comparison-table');
        if (!comparisonTable) return;

        // Add click handlers for table rows to highlight systems
        const tableRows = comparisonTable.querySelectorAll('tbody tr');
        
        tableRows.forEach(row => {
            row.addEventListener('click', () => {
                // Remove previous highlights
                tableRows.forEach(r => r.classList.remove('selected'));
                
                // Highlight selected row
                row.classList.add('selected');
                
                // Track interaction
                const feature = row.cells[0]?.textContent;
                this.trackUserInteraction('comparison_focus', feature);
            });
        });

        // Add column header interactions
        const headerCells = comparisonTable.querySelectorAll('thead th');
        headerCells.forEach((header, index) => {
            if (index === 0) return; // Skip first column (features)
            
            header.addEventListener('click', () => {
                const systemName = header.textContent;
                this.highlightSystemInComparison(systemName, index);
                this.trackUserInteraction('comparison_system_focus', systemName);
            });
        });
    }

    highlightSystemInComparison(systemName, columnIndex) {
        const table = document.querySelector('.comparison-table');
        if (!table) return;

        // Remove previous column highlights
        table.querySelectorAll('.column-highlight').forEach(cell => {
            cell.classList.remove('column-highlight');
        });

        // Highlight selected column
        table.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 1})`).forEach(cell => {
            cell.classList.add('column-highlight');
        });

        // Highlight header
        table.querySelector(`thead th:nth-child(${columnIndex + 1})`).classList.add('column-highlight');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add styles
        this.addNotificationStyles();

        // Add to DOM
        document.body.appendChild(notification);

        // Setup close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 4000);

        // Animate in
        setTimeout(() => {
            notification.classList.add('notification--show');
        }, 100);

        console.log(`📢 Notification shown: ${type} - ${message}`);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.remove('notification--show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    addNotificationStyles() {
        // Only add styles once
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--color-surface);
                border: 1px solid var(--color-card-border);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform var(--duration-normal) var(--ease-standard);
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification--show {
                transform: translateX(0);
            }
            
            .notification--success {
                border-left: 4px solid var(--color-success);
            }
            
            .notification--error {
                border-left: 4px solid var(--color-error);
            }
            
            .notification--warning {
                border-left: 4px solid var(--color-warning);
            }
            
            .notification--info {
                border-left: 4px solid var(--color-info);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: var(--space-16);
                gap: var(--space-12);
            }
            
            .notification-icon {
                font-size: var(--font-size-lg);
                flex-shrink: 0;
            }
            
            .notification-message {
                flex: 1;
                font-size: var(--font-size-base);
                color: var(--color-text);
                font-weight: var(--font-weight-medium);
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: var(--font-size-lg);
                color: var(--color-text-secondary);
                cursor: pointer;
                padding: var(--space-4);
                border-radius: var(--radius-sm);
                transition: background-color var(--duration-fast) var(--ease-standard);
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                background-color: var(--color-secondary);
                color: var(--color-text);
            }
            
            .column-highlight {
                background-color: var(--color-bg-4) !important;
                font-weight: var(--font-weight-semibold);
            }
            
            .popular-badge {
                padding: var(--space-2) var(--space-8);
                background-color: var(--color-warning);
                color: var(--color-btn-primary-text);
                border-radius: var(--radius-full);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-bold);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .system-card.popular {
                box-shadow: 0 0 0 2px var(--color-warning);
            }
            
            .comparison-table tbody tr.selected {
                background-color: var(--color-bg-3);
            }
            
            .comparison-table tbody tr {
                cursor: pointer;
                transition: background-color var(--duration-fast) var(--ease-standard);
            }
            
            .comparison-table thead th {
                cursor: pointer;
                transition: background-color var(--duration-fast) var(--ease-standard);
            }
            
            .comparison-table thead th:hover {
                background-color: var(--color-bg-3);
            }
        `;

        document.head.appendChild(styles);
    }

    initializeAnalytics() {
        // Initialize analytics tracking
        this.analytics.sessionStart = Date.now();
        this.trackUserInteraction('session_start', 'portal_load');

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackUserInteraction('page_hidden', 'tab_switch');
            } else {
                this.trackUserInteraction('page_visible', 'tab_return');
            }
        });

        // Track beforeunload for session analytics
        window.addEventListener('beforeunload', () => {
            this.trackUserInteraction('session_end', 'page_unload', {
                sessionDuration: Date.now() - this.analytics.sessionStart,
                totalLaunches: this.analytics.totalLaunches
            });
        });

        console.log('📊 Analytics initialized');
    }

    // Public method to get analytics (for debugging/development)
    getAnalytics() {
        return {
            ...this.analytics,
            sessionDuration: Date.now() - this.analytics.sessionStart,
            popularSystem: this.getMostPopularSystem()
        };
    }

    // Public method to export analytics
    exportAnalytics() {
        const analytics = this.getAnalytics();
        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `emotion-ai-portal-analytics-${Date.now()}.json`;
        link.click();
        
        console.log('📊 Analytics exported');
    }

    // Error handling for uncaught errors
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('❌ Portal error:', event.error);
            this.trackUserInteraction('error', 'javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled promise rejection:', event.reason);
            this.trackUserInteraction('error', 'promise_rejection', {
                reason: event.reason?.toString()
            });
        });
    }
}

// Initialize the portal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create global instance
        window.emotionPortal = new EmotionAIPortal();
        
        // Setup error handling
        window.emotionPortal.setupErrorHandling();
        
        console.log('🚀 Ultimate Emotion AI Portal successfully initialized');
        
        // Development helper - expose analytics to console
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 Development mode: Access analytics via window.emotionPortal.getAnalytics()');
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize Ultimate Emotion AI Portal:', error);
        
        // Fallback: Simple functionality for basic launch buttons
        console.log('🔄 Activating fallback mode...');
        
        setTimeout(() => {
            const launchButtons = document.querySelectorAll('.launch-btn');
            console.log(`🔧 Setting up ${launchButtons.length} launch buttons in fallback mode`);
            
            launchButtons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = button.getAttribute('data-url');
                    const systemName = button.getAttribute('data-system') || `System ${index + 1}`;
                    
                    if (url) {
                        console.log(`🚀 Fallback launch: ${systemName} -> ${url}`);
                        
                        // Simple window.open
                        const newWindow = window.open(url, '_blank');
                        
                        if (newWindow) {
                            console.log(`✅ Fallback launch successful: ${systemName}`);
                        } else {
                            // If window.open fails, try link click method
                            const link = document.createElement('a');
                            link.href = url;
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            console.log(`✅ Fallback link method used: ${systemName}`);
                        }
                    } else {
                        console.error('❌ No URL found for button:', button);
                    }
                });
            });
            
            console.log('✅ Fallback functionality enabled');
        }, 100);
    }
});

// Additional keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Alt + number keys for quick system launch (1-5)
    if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const systemIndex = parseInt(e.key) - 1;
        const launchButtons = document.querySelectorAll('.launch-btn');
        if (launchButtons[systemIndex]) {
            console.log(`⌨️ Keyboard shortcut: Alt+${e.key} -> Launching system ${systemIndex + 1}`);
            launchButtons[systemIndex].click();
        }
    }
});

// Enhanced accessibility features
document.addEventListener('DOMContentLoaded', () => {
    // Add accessibility attributes to launch buttons
    const launchButtons = document.querySelectorAll('.launch-btn');
    launchButtons.forEach((button, index) => {
        const systemName = button.getAttribute('data-system') || `System ${index + 1}`;
        button.setAttribute('aria-label', `Launch ${systemName} in new tab`);
        button.setAttribute('title', `${systemName} - Press Alt+${index + 1} for keyboard shortcut`);
    });

    console.log('♿ Accessibility enhancements loaded');
});