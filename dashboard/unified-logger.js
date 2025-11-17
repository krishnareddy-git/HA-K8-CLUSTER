/**
 * Unified Logger - Centralized logging system for all dashboard components
 * This logger works across both main dashboard and load balancer demo
 */

class UnifiedLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 500; // Keep last 500 logs
        this.storageKey = 'k8s-dashboard-logs';
        this.subscribers = new Set();
        this.filters = {
            level: 'all', // all, info, success, warning, error
            source: 'all', // all, dashboard, loadbalancer
            search: ''
        };
        
        // Load existing logs from localStorage
        this.loadLogs();
        
        // Set up periodic save
        this.setupAutoSave();
        
        console.log('%c✓ Unified Logger initialized', 'color: #10b981; font-weight: bold');
    }

    /**
     * Log a message
     * @param {string} level - Log level: info, success, warning, error
     * @param {string} message - Log message
     * @param {string} source - Source of log: dashboard, loadbalancer
     * @param {object} metadata - Additional metadata
     */
    log(level, message, source = 'dashboard', metadata = {}) {
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            source: source,
            metadata: metadata
        };

        // Add to logs array
        this.logs.unshift(logEntry); // Add to beginning

        // Trim logs if exceeded max
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Notify subscribers
        this.notifySubscribers(logEntry);

        // Save to localStorage (throttled)
        this.scheduleSave();

        // Also log to console for debugging
        this.consoleLog(logEntry);

        return logEntry;
    }

    /**
     * Shorthand methods for different log levels
     */
    info(message, source = 'dashboard', metadata = {}) {
        return this.log('info', message, source, metadata);
    }

    success(message, source = 'dashboard', metadata = {}) {
        return this.log('success', message, source, metadata);
    }

    warning(message, source = 'dashboard', metadata = {}) {
        return this.log('warning', message, source, metadata);
    }

    error(message, source = 'dashboard', metadata = {}) {
        return this.log('error', message, source, metadata);
    }

    /**
     * Get filtered logs
     */
    getFilteredLogs() {
        let filtered = [...this.logs];

        // Filter by level
        if (this.filters.level !== 'all') {
            filtered = filtered.filter(log => log.level === this.filters.level);
        }

        // Filter by source
        if (this.filters.source !== 'all') {
            filtered = filtered.filter(log => log.source === this.filters.source);
        }

        // Filter by search term
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(log => 
                log.message.toLowerCase().includes(searchLower) ||
                log.source.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    /**
     * Set filter
     */
    setFilter(filterType, value) {
        this.filters[filterType] = value;
        this.notifySubscribers();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = {
            level: 'all',
            source: 'all',
            search: ''
        };
        this.notifySubscribers();
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.saveLogs();
        this.notifySubscribers();
        this.info('Logs cleared', 'system');
    }

    /**
     * Subscribe to log updates
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback); // Return unsubscribe function
    }

    /**
     * Notify all subscribers
     */
    notifySubscribers(newLog = null) {
        this.subscribers.forEach(callback => {
            try {
                callback(this.getFilteredLogs(), newLog);
            } catch (error) {
                console.error('Error in log subscriber:', error);
            }
        });
    }

    /**
     * Load logs from localStorage
     */
    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
                console.log(`Loaded ${this.logs.length} logs from storage`);
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            this.logs = [];
        }
    }

    /**
     * Save logs to localStorage
     */
    saveLogs() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error saving logs:', error);
            // If quota exceeded, remove old logs and try again
            if (error.name === 'QuotaExceededError') {
                this.logs = this.logs.slice(0, Math.floor(this.maxLogs / 2));
                localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
            }
        }
    }

    /**
     * Schedule save (throttled)
     */
    scheduleSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveLogs();
        }, 1000); // Save after 1 second of inactivity
    }

    /**
     * Setup auto-save interval
     */
    setupAutoSave() {
        // Save every 30 seconds
        setInterval(() => {
            this.saveLogs();
        }, 30000);
    }

    /**
     * Console log with color coding
     */
    consoleLog(logEntry) {
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };

        const color = colors[logEntry.level] || '#6b7280';
        const time = new Date(logEntry.timestamp).toLocaleTimeString();
        
        console.log(
            `%c[${time}] %c[${logEntry.source.toUpperCase()}] %c${logEntry.message}`,
            'color: #9ca3af',
            `color: ${color}; font-weight: bold`,
            `color: ${color}`
        );
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `k8s-logs-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.success('Logs exported successfully', 'system');
    }

    /**
     * Get statistics
     */
    getStats() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const recentLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo);

        return {
            total: this.logs.length,
            lastHour: recentLogs.length,
            byLevel: {
                info: this.logs.filter(l => l.level === 'info').length,
                success: this.logs.filter(l => l.level === 'success').length,
                warning: this.logs.filter(l => l.level === 'warning').length,
                error: this.logs.filter(l => l.level === 'error').length
            },
            bySource: {
                dashboard: this.logs.filter(l => l.source === 'dashboard').length,
                loadbalancer: this.logs.filter(l => l.source === 'loadbalancer').length,
                system: this.logs.filter(l => l.source === 'system').length
            }
        };
    }
}

// Create global instance
window.unifiedLogger = new UnifiedLogger();

// Expose convenience methods globally
window.logInfo = (msg, source) => window.unifiedLogger.info(msg, source);
window.logSuccess = (msg, source) => window.unifiedLogger.success(msg, source);
window.logWarning = (msg, source) => window.unifiedLogger.warning(msg, source);
window.logError = (msg, source) => window.unifiedLogger.error(msg, source);

console.log('%c📊 Global logging functions available:', 'font-weight: bold; color: #326CE5');
console.log('  logInfo(message, source)');
console.log('  logSuccess(message, source)');
console.log('  logWarning(message, source)');
console.log('  logError(message, source)');
console.log('  unifiedLogger.getStats()');
console.log('  unifiedLogger.exportLogs()');
