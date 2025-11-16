// Dashboard JavaScript - K8s Cluster Monitoring

// Configuration
const REFRESH_INTERVAL = 5000; // 5 seconds
let refreshTimer = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeData();
    startAutoRefresh();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Get page name
            const pageName = this.getAttribute('data-page');
            
            // Update page title
            const titles = {
                'overview': 'Cluster Overview',
                'nodes': 'Cluster Nodes',
                'pods': 'Pods',
                'services': 'Services',
                'deployments': 'Deployments',
                'health': 'Health Check'
            };
            
            document.getElementById('page-title').textContent = titles[pageName];
            document.querySelector('.breadcrumb').textContent = `Dashboard / ${titles[pageName]}`;
            
            // Show selected page
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${pageName}-page`).classList.add('active');
            
            // Load page specific data
            loadPageData(pageName);
        });
    });
}

// Data Loading
async function initializeData() {
    await loadOverviewData();
    updateTimestamp();
}

async function loadPageData(pageName) {
    switch(pageName) {
        case 'overview':
            await loadOverviewData();
            break;
        case 'nodes':
            await loadNodesData();
            break;
        case 'pods':
            await loadPodsData();
            break;
        case 'services':
            await loadServicesData();
            break;
        case 'deployments':
            await loadDeploymentsData();
            break;
        case 'health':
            await loadHealthData();
            break;
    }
    updateTimestamp();
}

async function loadOverviewData() {
    try {
        // Simulate API calls - In production, replace with actual kubectl commands
        const data = await fetchClusterData();
        
        // Update stats
        document.getElementById('total-nodes').textContent = data.nodes.total;
        document.getElementById('ready-nodes').textContent = data.nodes.ready;
        document.getElementById('total-pods').textContent = data.pods.running;
        document.getElementById('healthy-pods').textContent = data.pods.healthy;
        document.getElementById('total-services').textContent = data.services.total;
        document.getElementById('total-deployments').textContent = data.deployments.total;
        document.getElementById('ready-deployments').textContent = data.deployments.ready;
        
        // Load charts
        renderHealthChart(data);
        renderResourceChart(data);
        
        // Load events
        renderEvents(data.events);
        
    } catch (error) {
        console.error('Error loading overview data:', error);
        showError('Failed to load cluster data');
    }
}

async function loadNodesData() {
    try {
        const nodes = await fetchNodes();
        renderNodesTable(nodes);
    } catch (error) {
        console.error('Error loading nodes:', error);
    }
}

async function loadPodsData() {
    try {
        const pods = await fetchPods();
        renderPodsTable(pods);
        populateNamespaceFilter(pods);
    } catch (error) {
        console.error('Error loading pods:', error);
    }
}

async function loadServicesData() {
    try {
        const services = await fetchServices();
        renderServicesTable(services);
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function loadDeploymentsData() {
    try {
        const deployments = await fetchDeployments();
        renderDeploymentsTable(deployments);
    } catch (error) {
        console.error('Error loading deployments:', error);
    }
}

async function loadHealthData() {
    try {
        const health = await fetchHealthStatus();
        updateHealthStatus(health);
        renderLogs(health.logs);
    } catch (error) {
        console.error('Error loading health data:', error);
    }
}

// Fetch Functions (Simulated - Replace with actual API calls)
async function fetchClusterData() {
    // Simulate API delay
    await sleep(500);
    
    return {
        nodes: {
            total: 1,
            ready: 1
        },
        pods: {
            running: 12,
            healthy: 11,
            pending: 1,
            failed: 0
        },
        services: {
            total: 8
        },
        deployments: {
            total: 5,
            ready: 4
        },
        events: [
            {
                type: 'success',
                title: 'Pod Created',
                description: 'Pod "nginx-deployment-7d8b9c8" created successfully',
                time: '2 minutes ago'
            },
            {
                type: 'success',
                title: 'Node Ready',
                description: 'Node "master-node" is ready',
                time: '5 minutes ago'
            },
            {
                type: 'warning',
                title: 'High Memory Usage',
                description: 'Node memory usage at 75%',
                time: '10 minutes ago'
            }
        ]
    };
}

async function fetchNodes() {
    await sleep(300);
    return [
        {
            name: 'master-node',
            status: 'Ready',
            roles: 'control-plane,master',
            age: '5d',
            version: 'v1.30.0',
            cpu: '45%',
            memory: '62%'
        }
    ];
}

async function fetchPods() {
    await sleep(300);
    return [
        { name: 'coredns-5d78c9869d-abcd1', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'coredns-5d78c9869d-efgh2', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'etcd-master-node', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'kube-apiserver-master-node', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'kube-controller-manager', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'kube-proxy-xyz123', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'kube-scheduler-master-node', namespace: 'kube-system', status: 'Running', restarts: 0, age: '5d' },
        { name: 'weave-net-abc123', namespace: 'kube-system', status: 'Running', restarts: 1, age: '5d' }
    ];
}

async function fetchServices() {
    await sleep(300);
    return [
        { name: 'kubernetes', namespace: 'default', type: 'ClusterIP', clusterIP: '10.96.0.1', ports: '443/TCP', age: '5d' },
        { name: 'kube-dns', namespace: 'kube-system', type: 'ClusterIP', clusterIP: '10.96.0.10', ports: '53/UDP,53/TCP', age: '5d' }
    ];
}

async function fetchDeployments() {
    await sleep(300);
    return [
        { name: 'coredns', namespace: 'kube-system', ready: '2/2', upToDate: 2, available: 2, age: '5d' }
    ];
}

async function fetchHealthStatus() {
    await sleep(300);
    return {
        apiServer: 'healthy',
        etcd: 'healthy',
        controllerManager: 'healthy',
        scheduler: 'healthy',
        logs: [
            { level: 'success', message: '[2024-11-16 10:30:15] API Server: Healthy' },
            { level: 'success', message: '[2024-11-16 10:30:15] ETCD: Cluster is healthy' },
            { level: 'success', message: '[2024-11-16 10:30:15] Controller Manager: Running' },
            { level: 'success', message: '[2024-11-16 10:30:15] Scheduler: Running' },
            { level: 'info', message: '[2024-11-16 10:29:45] All system checks passed' }
        ]
    };
}

// Render Functions
function renderHealthChart(data) {
    const container = document.getElementById('health-chart');
    const healthy = data.pods.healthy;
    const total = data.pods.running;
    const percentage = Math.round((healthy / total) * 100);
    
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
                <svg width="200" height="200" style="transform: rotate(-90deg);">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#2D3748" stroke-width="20"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#00C851" stroke-width="20"
                            stroke-dasharray="${(percentage / 100) * 502} 502" stroke-linecap="round"/>
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <div style="font-size: 40px; font-weight: 700; color: #00C851;">${percentage}%</div>
                    <div style="font-size: 14px; color: #A0A8B7;">Healthy</div>
                </div>
            </div>
            <div style="margin-top: 20px; color: #A0A8B7;">
                ${healthy} of ${total} pods are healthy
            </div>
        </div>
    `;
}

function renderResourceChart(data) {
    const container = document.getElementById('resource-chart');
    const resources = [
        { label: 'Pods', value: data.pods.running, color: '#00D4FF' },
        { label: 'Services', value: data.services.total, color: '#00C851' },
        { label: 'Deployments', value: data.deployments.total, color: '#FFB300' }
    ];
    
    const total = resources.reduce((sum, r) => sum + r.value, 0);
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px;">
            ${resources.map(r => {
                const percentage = Math.round((r.value / total) * 100);
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #A0A8B7;">${r.label}</span>
                            <span style="color: #FFFFFF; font-weight: 600;">${r.value} (${percentage}%)</span>
                        </div>
                        <div style="height: 8px; background: #2D3748; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; height: 100%; background: ${r.color}; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderEvents(events) {
    const container = document.getElementById('events-list');
    container.innerHTML = events.map(event => `
        <div class="event-item ${event.type}">
            <div class="event-header">
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.time}</div>
            </div>
            <div class="event-description">${event.description}</div>
        </div>
    `).join('');
}

function renderNodesTable(nodes) {
    const container = document.getElementById('nodes-table');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Roles</th>
                    <th>Age</th>
                    <th>Version</th>
                    <th>CPU</th>
                    <th>Memory</th>
                </tr>
            </thead>
            <tbody>
                ${nodes.map(node => `
                    <tr>
                        <td>${node.name}</td>
                        <td><span class="status-badge ${node.status.toLowerCase()}">${node.status}</span></td>
                        <td>${node.roles}</td>
                        <td>${node.age}</td>
                        <td>${node.version}</td>
                        <td>${node.cpu}</td>
                        <td>${node.memory}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPodsTable(pods) {
    const container = document.getElementById('pods-table');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Namespace</th>
                    <th>Status</th>
                    <th>Restarts</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tbody>
                ${pods.map(pod => `
                    <tr>
                        <td>${pod.name}</td>
                        <td>${pod.namespace}</td>
                        <td><span class="status-badge ${pod.status.toLowerCase()}">${pod.status}</span></td>
                        <td>${pod.restarts}</td>
                        <td>${pod.age}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderServicesTable(services) {
    const container = document.getElementById('services-table');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Namespace</th>
                    <th>Type</th>
                    <th>Cluster IP</th>
                    <th>Ports</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tbody>
                ${services.map(svc => `
                    <tr>
                        <td>${svc.name}</td>
                        <td>${svc.namespace}</td>
                        <td>${svc.type}</td>
                        <td>${svc.clusterIP}</td>
                        <td>${svc.ports}</td>
                        <td>${svc.age}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderDeploymentsTable(deployments) {
    const container = document.getElementById('deployments-table');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Namespace</th>
                    <th>Ready</th>
                    <th>Up-to-date</th>
                    <th>Available</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tbody>
                ${deployments.map(dep => `
                    <tr>
                        <td>${dep.name}</td>
                        <td>${dep.namespace}</td>
                        <td>${dep.ready}</td>
                        <td>${dep.upToDate}</td>
                        <td>${dep.available}</td>
                        <td>${dep.age}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateHealthStatus(health) {
    const statuses = {
        'apiServer': 'api-status',
        'etcd': 'etcd-status',
        'controllerManager': 'controller-status',
        'scheduler': 'scheduler-status'
    };
    
    for (const [key, elementId] of Object.entries(statuses)) {
        const element = document.getElementById(elementId);
        const status = health[key];
        element.innerHTML = `<span class="status-badge ${status}">${status}</span>`;
    }
}

function renderLogs(logs) {
    const container = document.getElementById('logs-container');
    container.innerHTML = logs.map(log => `
        <div class="log-entry ${log.level}">${log.message}</div>
    `).join('');
}

function populateNamespaceFilter(pods) {
    const namespaces = [...new Set(pods.map(p => p.namespace))];
    const filter = document.getElementById('namespace-filter');
    
    namespaces.forEach(ns => {
        const option = document.createElement('option');
        option.value = ns;
        option.textContent = ns;
        filter.appendChild(option);
    });
}

// Utility Functions
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-update').textContent = timeString;
}

async function refreshData() {
    const btn = document.querySelector('.refresh-btn');
    btn.style.pointerEvents = 'none';
    
    const activePage = document.querySelector('.nav-item.active').getAttribute('data-page');
    await loadPageData(activePage);
    
    setTimeout(() => {
        btn.style.pointerEvents = 'auto';
    }, 1000);
}

function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        const activePage = document.querySelector('.nav-item.active').getAttribute('data-page');
        loadPageData(activePage);
    }, REFRESH_INTERVAL);
}

function clearLogs() {
    document.getElementById('logs-container').innerHTML = '<div class="log-entry">Logs cleared...</div>';
}

function showError(message) {
    console.error(message);
    // Could add a toast notification here
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});
