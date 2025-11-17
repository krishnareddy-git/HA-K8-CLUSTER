// Log Viewer JavaScript

let state = {
    autoScroll: true,
    paused: false,
    unsubscribe: null
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeControls();
    subscribeToLogs();
    updateStats();
    
    // Welcome message
    unifiedLogger.info('Log viewer initialized', 'system');
});

// Subscribe to log updates
function subscribeToLogs() {
    state.unsubscribe = unifiedLogger.subscribe((logs, newLog) => {
        if (!state.paused) {
            renderLogs(logs);
            updateStats();
            
            // Auto-scroll to bottom if enabled
            if (state.autoScroll && newLog) {
                scrollToBottom();
            }
        }
    });
    
    // Initial render
    renderLogs(unifiedLogger.getFilteredLogs());
}

// Initialize Filters
function initializeFilters() {
    const sourceFilter = document.getElementById('source-filter');
    const levelFilter = document.getElementById('level-filter');
    const searchInput = document.getElementById('log-search');
    
    sourceFilter.addEventListener('change', function() {
        unifiedLogger.setFilter('source', this.value);
    });
    
    levelFilter.addEventListener('change', function() {
        unifiedLogger.setFilter('level', this.value);
    });
    
    searchInput.addEventListener('input', function() {
        unifiedLogger.setFilter('search', this.value);
    });
}

// Initialize Controls
function initializeControls() {
    const autoScrollBtn = document.getElementById('auto-scroll-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    autoScrollBtn.addEventListener('click', function() {
        state.autoScroll = !state.autoScroll;
        this.classList.toggle('active', state.autoScroll);
        
        if (state.autoScroll) {
            scrollToBottom();
            unifiedLogger.info('Auto-scroll enabled', 'system');
        } else {
            unifiedLogger.info('Auto-scroll disabled', 'system');
        }
    });
    
    pauseBtn.addEventListener('click', function() {
        state.paused = !state.paused;
        this.classList.toggle('active', state.paused);
        
        const icon = this.querySelector('i');
        const pausedIndicator = document.getElementById('paused-indicator');
        const liveIndicator = document.getElementById('live-indicator');
        
        if (state.paused) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            pausedIndicator.style.display = 'inline-block';
            liveIndicator.style.display = 'none';
            unifiedLogger.info('Logging paused', 'system');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            pausedIndicator.style.display = 'none';
            liveIndicator.style.display = 'inline-block';
            unifiedLogger.info('Logging resumed', 'system');
            
            // Refresh display
            renderLogs(unifiedLogger.getFilteredLogs());
        }
    });
    
    // Set auto-scroll as active by default
    autoScrollBtn.classList.add('active');
}

// Render Logs
function renderLogs(logs) {
    const container = document.getElementById('logs-container');
    
    // Remove placeholder if exists
    const placeholder = container.querySelector('.log-placeholder');
    if (placeholder && logs.length > 0) {
        placeholder.remove();
    }
    
    // If no logs and no placeholder, show placeholder
    if (logs.length === 0 && !placeholder) {
        container.innerHTML = `
            <div class="log-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No logs match the current filters</p>
                <small>Try adjusting your filters or clearing them</small>
            </div>
        `;
        return;
    }
    
    // Clear and render logs
    container.innerHTML = '';
    
    logs.forEach(log => {
        const logElement = createLogElement(log);
        container.appendChild(logElement);
    });
    
    // Update filtered count
    document.getElementById('filtered-count').textContent = logs.length;
}

// Create Log Element
function createLogElement(log) {
    const div = document.createElement('div');
    div.className = `log-entry ${log.level}`;
    div.setAttribute('data-log-id', log.id);
    
    const timestamp = new Date(log.timestamp);
    const timeString = timestamp.toLocaleTimeString();
    const dateString = timestamp.toLocaleDateString();
    
    const sourceIcon = getSourceIcon(log.source);
    const levelIcon = getLevelIcon(log.level);
    
    div.innerHTML = `
        <div class="log-time" title="${dateString} ${timeString}">
            ${timeString}
        </div>
        <div class="log-level" title="${log.level}">
            <i class="${levelIcon}"></i>
        </div>
        <div class="log-source" title="${log.source}">
            <i class="${sourceIcon}"></i>
            <span>${log.source}</span>
        </div>
        <div class="log-message">${escapeHtml(log.message)}</div>
        ${log.metadata && Object.keys(log.metadata).length > 0 ? 
            `<div class="log-metadata" title="Click to view metadata">
                <i class="fas fa-info-circle"></i>
            </div>` : ''}
    `;
    
    // Add click handler for metadata
    if (log.metadata && Object.keys(log.metadata).length > 0) {
        div.querySelector('.log-metadata').addEventListener('click', function() {
            showMetadata(log);
        });
    }
    
    return div;
}

// Get Source Icon
function getSourceIcon(source) {
    const icons = {
        dashboard: 'fas fa-tachometer-alt',
        'k8s-monitor': 'fas fa-dharmachakra',
        loadbalancer: 'fas fa-balance-scale',
        system: 'fas fa-cog'
    };
    return icons[source] || 'fas fa-circle';
}

// Get Level Icon
function getLevelIcon(level) {
    const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
    };
    return icons[level] || 'fas fa-circle';
}

// Show Metadata
function showMetadata(log) {
    const metadataStr = JSON.stringify(log.metadata, null, 2);
    alert(`Metadata for log:\n\n${metadataStr}`);
}

// Update Statistics
function updateStats() {
    const stats = unifiedLogger.getStats();
    
    // Header stats
    document.getElementById('total-logs').textContent = stats.total;
    document.getElementById('recent-logs').textContent = stats.lastHour;
    document.getElementById('error-count').textContent = stats.byLevel.error;
    
    // Sidebar stats - by level
    document.getElementById('info-count').textContent = stats.byLevel.info;
    document.getElementById('success-count').textContent = stats.byLevel.success;
    document.getElementById('warning-count').textContent = stats.byLevel.warning;
    document.getElementById('error-count-stat').textContent = stats.byLevel.error;
    
    // Sidebar stats - by source
    document.getElementById('dashboard-count').textContent = stats.bySource.dashboard || 0;
    document.getElementById('k8s-monitor-count').textContent = stats.bySource['k8s-monitor'] || 0;
    document.getElementById('loadbalancer-count').textContent = stats.bySource.loadbalancer || 0;
    document.getElementById('system-count').textContent = stats.bySource.system || 0;
}

// Quick Filter Functions
function filterByLevel(level) {
    document.getElementById('level-filter').value = level;
    unifiedLogger.setFilter('level', level);
}

function filterBySource(source) {
    document.getElementById('source-filter').value = source;
    unifiedLogger.setFilter('source', source);
}

function clearFilters() {
    document.getElementById('source-filter').value = 'all';
    document.getElementById('level-filter').value = 'all';
    document.getElementById('log-search').value = '';
    unifiedLogger.clearFilters();
}

// Clear All Logs
function clearAllLogs() {
    if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
        unifiedLogger.clearLogs();
    }
}

// Export Logs
function exportLogs() {
    unifiedLogger.exportLogs();
}

// Scroll to Bottom
function scrollToBottom() {
    const container = document.getElementById('logs-container');
    container.scrollTop = container.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle window beforeunload
window.addEventListener('beforeunload', function() {
    if (state.unsubscribe) {
        state.unsubscribe();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to clear search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('log-search').focus();
    }
    
    // Ctrl/Cmd + L to clear logs
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearAllLogs();
    }
    
    // Space to toggle pause
    if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('pause-btn').click();
    }
    
    // Escape to clear filters
    if (e.key === 'Escape') {
        clearFilters();
    }
});

console.log('%c🎹 Keyboard Shortcuts:', 'font-weight: bold; color: #326CE5');
console.log('  Ctrl/Cmd + K - Focus search');
console.log('  Ctrl/Cmd + L - Clear logs');
console.log('  Space - Pause/Resume');
console.log('  Escape - Clear filters');
