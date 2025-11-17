// Load Balancing Demo JavaScript

// State
let state = {
    totalRequests: 0,
    pods: {
        1: { active: true, requests: 0, connections: 0 },
        2: { active: true, requests: 0, connections: 0 },
        3: { active: true, requests: 0, connections: 0 }
    },
    algorithm: 'round-robin',
    currentPod: 0,
    autoRequesting: false,
    autoTimer: null,
    requestTimes: [],
    chart: null
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeAlgorithmSelector();
    initializeChart();
    drawConnections();
    updateStats();
});

// Tab Navigation
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const archType = this.getAttribute('data-arch');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active view
            document.querySelectorAll('.architecture-view').forEach(v => v.classList.remove('active'));
            document.getElementById(`${archType}-view`).classList.add('active');
        });
    });
}

// Algorithm Selector
function initializeAlgorithmSelector() {
    const selector = document.getElementById('lb-algorithm');
    selector.addEventListener('change', function() {
        state.algorithm = this.value;
        document.getElementById('algorithm-type').textContent = 
            this.options[this.selectedIndex].text;
        logMessage('info', `Switched to ${this.options[this.selectedIndex].text} algorithm`);
    });
}

// Send Single Request
function sendSingleRequest() {
    if (!hasActivePods()) {
        logMessage('error', 'No active pods available!');
        return;
    }

    const targetPod = selectPod();
    animateRequest(targetPod);
    state.totalRequests++;
    state.pods[targetPod].requests++;
    
    // Simulate response time
    const responseTime = Math.floor(Math.random() * 50) + 50;
    state.requestTimes.push(responseTime);
    if (state.requestTimes.length > 100) state.requestTimes.shift();
    
    logMessage('success', `Request #${state.totalRequests} → Pod ${targetPod} (${responseTime}ms)`);
    updateStats();
    updateChart();
}

// Send Burst Requests
function sendBurstRequests() {
    if (!hasActivePods()) {
        logMessage('error', 'No active pods available!');
        return;
    }

    let count = 0;
    const interval = setInterval(() => {
        if (count < 10) {
            sendSingleRequest();
            count++;
        } else {
            clearInterval(interval);
        }
    }, 100);
}

// Toggle Auto Requests
function toggleAutoRequests() {
    const toggle = document.getElementById('auto-request-toggle');
    state.autoRequesting = toggle.checked;
    
    if (state.autoRequesting) {
        document.getElementById('auto-status').textContent = 'On';
        document.getElementById('auto-status').style.color = 'var(--success)';
        state.autoTimer = setInterval(() => {
            sendSingleRequest();
        }, 2000);
        logMessage('info', 'Auto-request enabled (every 2 seconds)');
    } else {
        document.getElementById('auto-status').textContent = 'Off';
        document.getElementById('auto-status').style.color = 'var(--text-secondary)';
        if (state.autoTimer) {
            clearInterval(state.autoTimer);
            state.autoTimer = null;
        }
        logMessage('info', 'Auto-request disabled');
    }
}

// Pod Selection Algorithms
function selectPod() {
    const activePods = Object.keys(state.pods).filter(id => state.pods[id].active);
    
    switch (state.algorithm) {
        case 'round-robin':
            return roundRobin(activePods);
        
        case 'least-connections':
            return leastConnections(activePods);
        
        case 'random':
            return random(activePods);
        
        case 'ip-hash':
            return ipHash(activePods);
        
        default:
            return roundRobin(activePods);
    }
}

function roundRobin(activePods) {
    state.currentPod = (state.currentPod + 1) % activePods.length;
    return parseInt(activePods[state.currentPod]);
}

function leastConnections(activePods) {
    let minConnections = Infinity;
    let selectedPod = activePods[0];
    
    activePods.forEach(podId => {
        if (state.pods[podId].requests < minConnections) {
            minConnections = state.pods[podId].requests;
            selectedPod = podId;
        }
    });
    
    return parseInt(selectedPod);
}

function random(activePods) {
    const randomIndex = Math.floor(Math.random() * activePods.length);
    return parseInt(activePods[randomIndex]);
}

function ipHash(activePods) {
    // Simulate IP hash - sticky to same pod for demonstration
    const hash = state.totalRequests % activePods.length;
    return parseInt(activePods[hash]);
}

// Toggle Pod
function togglePod(podId) {
    const btn = event.target.closest('.btn-pod');
    const podElement = document.getElementById(`pod-${podId}`);
    
    state.pods[podId].active = !state.pods[podId].active;
    
    if (state.pods[podId].active) {
        btn.classList.remove('disabled');
        podElement.classList.remove('disabled');
        logMessage('success', `Pod ${podId} is now ACTIVE`);
    } else {
        btn.classList.add('disabled');
        podElement.classList.add('disabled');
        logMessage('warning', `Pod ${podId} is now DISABLED`);
    }
    
    updateStats();
    
    // Warn if no pods active
    if (!hasActivePods()) {
        logMessage('error', 'WARNING: All pods are disabled! Service unavailable!');
    }
}

// Animate Request
function animateRequest(targetPod) {
    // Highlight client
    const client = document.getElementById('client');
    client.classList.add('highlight');
    setTimeout(() => client.classList.remove('highlight'), 600);
    
    // Highlight service
    setTimeout(() => {
        const service = document.getElementById('service');
        service.classList.add('highlight');
        setTimeout(() => service.classList.remove('highlight'), 600);
    }, 300);
    
    // Highlight target pod
    setTimeout(() => {
        const pod = document.getElementById(`pod-${targetPod}`);
        pod.classList.add('highlight');
        setTimeout(() => pod.classList.remove('highlight'), 600);
        
        // Create particle animation
        createParticle(targetPod);
    }, 600);
}

// Create Particle
function createParticle(targetPod) {
    const service = document.getElementById('service');
    const pod = document.getElementById(`pod-${targetPod}`);
    
    if (!service || !pod) return;
    
    const serviceRect = service.getBoundingClientRect();
    const podRect = pod.getBoundingClientRect();
    
    const particle = document.createElement('div');
    particle.className = 'request-particle';
    particle.style.left = serviceRect.left + serviceRect.width / 2 + 'px';
    particle.style.top = serviceRect.top + serviceRect.height / 2 + 'px';
    
    document.body.appendChild(particle);
    
    // Animate to pod
    const deltaX = podRect.left + podRect.width / 2 - (serviceRect.left + serviceRect.width / 2);
    const deltaY = podRect.top + podRect.height / 2 - (serviceRect.top + serviceRect.height / 2);
    
    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).onfinish = () => particle.remove();
}

// Draw Connections
function drawConnections() {
    // This is a placeholder - in production, use SVG lines to connect nodes
    // For now, the visual connections are implied by the layout
}

// Update Stats
function updateStats() {
    // Update header stats
    document.getElementById('total-requests').textContent = state.totalRequests;
    
    const activePods = Object.values(state.pods).filter(p => p.active).length;
    document.getElementById('active-pods').textContent = activePods;
    
    // Update pod request counts and load bars
    Object.keys(state.pods).forEach(podId => {
        const pod = state.pods[podId];
        const podElement = document.getElementById(`pod-${podId}`);
        
        if (podElement) {
            const countElement = podElement.querySelector('.request-count');
            if (countElement) {
                countElement.textContent = `${pod.requests} requests`;
            }
            
            // Update load bar
            const maxRequests = Math.max(...Object.values(state.pods).map(p => p.requests), 1);
            const percentage = (pod.requests / maxRequests) * 100;
            const loadFill = podElement.querySelector('.load-fill');
            if (loadFill) {
                loadFill.style.width = percentage + '%';
            }
        }
    });
    
    // Update client counter
    const clientCounter = document.querySelector('.request-counter');
    if (clientCounter) {
        clientCounter.textContent = `${state.totalRequests} requests`;
    }
    
    // Calculate statistics
    const avgResponseTime = state.requestTimes.length > 0
        ? Math.round(state.requestTimes.reduce((a, b) => a + b, 0) / state.requestTimes.length)
        : 0;
    
    document.getElementById('avg-response-time').textContent = avgResponseTime + 'ms';
    
    // Calculate requests per second (approximation)
    const rps = state.requestTimes.length > 0 ? (state.requestTimes.length / 10).toFixed(1) : 0;
    document.getElementById('requests-per-sec').textContent = rps;
    
    // Calculate load balance efficiency
    const activePodsArray = Object.values(state.pods).filter(p => p.active);
    if (activePodsArray.length > 0) {
        const avgLoad = state.totalRequests / activePodsArray.length;
        const variance = activePodsArray.reduce((sum, pod) => {
            return sum + Math.pow(pod.requests - avgLoad, 2);
        }, 0) / activePodsArray.length;
        const stdDev = Math.sqrt(variance);
        const efficiency = Math.max(0, 100 - (stdDev / avgLoad * 100));
        document.getElementById('load-balance').textContent = 
            isNaN(efficiency) ? '100%' : efficiency.toFixed(0) + '%';
    }
}

// Initialize Chart
function initializeChart() {
    const ctx = document.getElementById('distribution-chart');
    
    state.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pod 1', 'Pod 2', 'Pod 3'],
            datasets: [{
                label: 'Requests Handled',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(50, 108, 229, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 200, 81, 0.8)'
                ],
                borderColor: [
                    '#326CE5',
                    '#00D4FF',
                    '#00C851'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#A0A8B7',
                    borderColor: '#2D3748',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#A0A8B7',
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: '#2D3748'
                    }
                },
                x: {
                    ticks: {
                        color: '#A0A8B7',
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: '#2D3748'
                    }
                }
            }
        }
    });
}

// Update Chart
function updateChart() {
    if (state.chart) {
        state.chart.data.datasets[0].data = [
            state.pods[1].requests,
            state.pods[2].requests,
            state.pods[3].requests
        ];
        state.chart.update();
    }
}

// Logging
function logMessage(level, message) {
    // Log to local display
    const logsContainer = document.getElementById('logs-container');
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${level}`;
    logEntry.innerHTML = `
        <span class="log-time">[${timeString}]</span>
        <span class="log-message">${message}</span>
    `;
    
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);
    
    // Keep only last 50 logs
    while (logsContainer.children.length > 50) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
    
    // Also log to unified logger for cross-dashboard visibility
    if (window.unifiedLogger) {
        window.unifiedLogger.log(level, message, 'loadbalancer', {
            algorithm: state.algorithm,
            totalRequests: state.totalRequests,
            activePods: Object.keys(state.pods).filter(id => state.pods[id].active).length
        });
    }
}

function clearLogs() {
    const logsContainer = document.getElementById('logs-container');
    logsContainer.innerHTML = '<div class="log-entry info"><span class="log-time">[00:00:00]</span><span class="log-message">Logs cleared.</span></div>';
}

// Reset Demo
function resetDemo() {
    // Stop auto-requesting
    if (state.autoRequesting) {
        document.getElementById('auto-request-toggle').checked = false;
        toggleAutoRequests();
    }
    
    // Reset state
    state.totalRequests = 0;
    state.pods = {
        1: { active: true, requests: 0, connections: 0 },
        2: { active: true, requests: 0, connections: 0 },
        3: { active: true, requests: 0, connections: 0 }
    };
    state.currentPod = 0;
    state.requestTimes = [];
    
    // Reset UI
    document.querySelectorAll('.btn-pod').forEach(btn => btn.classList.remove('disabled'));
    document.querySelectorAll('.pod-node').forEach(pod => pod.classList.remove('disabled'));
    
    updateStats();
    updateChart();
    clearLogs();
    
    logMessage('info', 'Demo reset successfully');
}

// Helper Functions
function hasActivePods() {
    return Object.values(state.pods).some(pod => pod.active);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === '1') sendSingleRequest();
    if (e.key === 'b') sendBurstRequests();
    if (e.key === 'r') resetDemo();
    if (e.key === 'a') {
        document.getElementById('auto-request-toggle').click();
    }
});

// Info tooltip
console.log('%c🚀 Load Balancing Demo Controls', 'font-size: 16px; font-weight: bold; color: #326CE5');
console.log('%cKeyboard Shortcuts:', 'font-size: 14px; font-weight: bold');
console.log('  1 - Send single request');
console.log('  B - Send burst of 10 requests');
console.log('  A - Toggle auto-requests');
console.log('  R - Reset demo');
