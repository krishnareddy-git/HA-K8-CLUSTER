// Real Kubernetes Monitoring - Live cluster operations logging

class KubernetesMonitor {
    constructor() {
        this.pollingInterval = 2000; // Poll every 2 seconds
        this.intervalId = null;
        this.previousState = null;
        this.isMonitoring = false;
        
        console.log('%c✓ Kubernetes Monitor initialized', 'color: #10b981; font-weight: bold');
    }

    /**
     * Start monitoring Kubernetes cluster
     */
    async startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        logInfo('Starting Kubernetes cluster monitoring', 'k8s-monitor');
        
        // Initial state capture
        await this.captureClusterState();
        
        // Start polling
        this.intervalId = setInterval(async () => {
            await this.captureClusterState();
        }, this.pollingInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isMonitoring = false;
        logInfo('Stopped Kubernetes cluster monitoring', 'k8s-monitor');
    }

    /**
     * Capture current cluster state and detect changes
     */
    async captureClusterState() {
        try {
            const currentState = await this.fetchClusterState();
            
            if (this.previousState) {
                this.detectChanges(this.previousState, currentState);
            } else {
                // First time capture
                logSuccess(`Cluster monitoring started - ${currentState.pods.length} pods, ${currentState.services.length} services`, 'k8s-monitor');
            }
            
            this.previousState = currentState;
        } catch (error) {
            logError(`Failed to capture cluster state: ${error.message}`, 'k8s-monitor');
        }
    }

    /**
     * Fetch current cluster state (simulated - will be replaced with real kubectl)
     */
    async fetchClusterState() {
        // This will be replaced with actual kubectl API calls
        // For now, simulate based on dashboard data
        return {
            timestamp: new Date().toISOString(),
            pods: await this.fetchPods(),
            services: await this.fetchServices(),
            nodes: await this.fetchNodes(),
            deployments: await this.fetchDeployments()
        };
    }

    /**
     * Fetch pods from REAL Kubernetes API
     */
    async fetchPods() {
        try {
            const response = await fetch('http://localhost:9000/api/pods');
            if (!response.ok) return [];
            const pods = await response.json();
            return pods.map(p => ({
                name: p.name,
                namespace: p.namespace,
                status: p.status,
                restarts: parseInt(p.restarts) || 0
            }));
        } catch (error) {
            console.error('Error fetching pods:', error);
            return [];
        }
    }

    /**
     * Fetch services from REAL Kubernetes API
     */
    async fetchServices() {
        try {
            const response = await fetch('http://localhost:9000/api/services');
            if (!response.ok) return [];
            const services = await response.json();
            return services.map(s => ({
                name: s.name,
                namespace: s.namespace,
                type: s.type,
                clusterIP: s.clusterIP
            }));
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }

    /**
     * Fetch nodes from REAL Kubernetes API
     */
    async fetchNodes() {
        try {
            const response = await fetch('http://localhost:9000/api/nodes');
            if (!response.ok) return [];
            const nodes = await response.json();
            return nodes.map(n => ({
                name: n.name,
                status: n.status,
                roles: n.roles
            }));
        } catch (error) {
            console.error('Error fetching nodes:', error);
            return [];
        }
    }

    /**
     * Fetch deployments from REAL Kubernetes API
     */
    async fetchDeployments() {
        try {
            const response = await fetch('http://localhost:9000/api/deployments');
            if (!response.ok) return [];
            const deployments = await response.json();
            return deployments.map(d => {
                const ready = d.ready.split('/');
                return {
                    name: d.name,
                    namespace: d.namespace,
                    replicas: parseInt(ready[1]) || 0,
                    available: parseInt(ready[0]) || 0
                };
            });
        } catch (error) {
            console.error('Error fetching deployments:', error);
            return [];
        }
    }

    /**
     * Detect changes between states
     */
    detectChanges(previous, current) {
        // Compare pods
        this.comparePods(previous.pods, current.pods);
        
        // Compare services
        this.compareServices(previous.services, current.services);
        
        // Compare nodes
        this.compareNodes(previous.nodes, current.nodes);
        
        // Compare deployments
        this.compareDeployments(previous.deployments, current.deployments);
    }

    /**
     * Compare pod states
     */
    comparePods(prevPods, currPods) {
        const prevMap = new Map(prevPods.map(p => [p.name, p]));
        const currMap = new Map(currPods.map(p => [p.name, p]));

        // Check for new pods
        currPods.forEach(pod => {
            if (!prevMap.has(pod.name)) {
                logSuccess(`Pod created: ${pod.name} in ${pod.namespace}`, 'k8s-monitor', {
                    podName: pod.name,
                    namespace: pod.namespace,
                    status: pod.status
                });
            }
        });

        // Check for removed pods
        prevPods.forEach(pod => {
            if (!currMap.has(pod.name)) {
                logWarning(`Pod deleted: ${pod.name} from ${pod.namespace}`, 'k8s-monitor', {
                    podName: pod.name,
                    namespace: pod.namespace
                });
            }
        });

        // Check for status changes
        currPods.forEach(pod => {
            const prev = prevMap.get(pod.name);
            if (prev) {
                if (prev.status !== pod.status) {
                    const level = pod.status === 'Running' ? 'success' : 
                                 pod.status === 'Pending' ? 'info' : 'warning';
                    unifiedLogger.log(level, 
                        `Pod ${pod.name}: ${prev.status} → ${pod.status}`, 
                        'k8s-monitor',
                        {
                            podName: pod.name,
                            previousStatus: prev.status,
                            currentStatus: pod.status
                        }
                    );
                }
                
                if (prev.restarts !== pod.restarts) {
                    logWarning(`Pod ${pod.name} restarted (${pod.restarts} times)`, 'k8s-monitor', {
                        podName: pod.name,
                        restarts: pod.restarts
                    });
                }
            }
        });
    }

    /**
     * Compare service states
     */
    compareServices(prevServices, currServices) {
        const prevMap = new Map(prevServices.map(s => [s.name, s]));
        const currMap = new Map(currServices.map(s => [s.name, s]));

        // New services
        currServices.forEach(svc => {
            if (!prevMap.has(svc.name)) {
                logSuccess(`Service created: ${svc.name} (${svc.type})`, 'k8s-monitor', {
                    serviceName: svc.name,
                    type: svc.type,
                    clusterIP: svc.clusterIP
                });
            }
        });

        // Removed services
        prevServices.forEach(svc => {
            if (!currMap.has(svc.name)) {
                logWarning(`Service deleted: ${svc.name}`, 'k8s-monitor', {
                    serviceName: svc.name
                });
            }
        });

        // Service changes
        currServices.forEach(svc => {
            const prev = prevMap.get(svc.name);
            if (prev && prev.type !== svc.type) {
                logInfo(`Service ${svc.name}: type changed ${prev.type} → ${svc.type}`, 'k8s-monitor');
            }
        });
    }

    /**
     * Compare node states
     */
    compareNodes(prevNodes, currNodes) {
        const prevMap = new Map(prevNodes.map(n => [n.name, n]));
        const currMap = new Map(currNodes.map(n => [n.name, n]));

        // Node status changes
        currNodes.forEach(node => {
            const prev = prevMap.get(node.name);
            if (prev && prev.status !== node.status) {
                const level = node.status === 'Ready' ? 'success' : 'error';
                unifiedLogger.log(level, 
                    `Node ${node.name}: ${prev.status} → ${node.status}`, 
                    'k8s-monitor',
                    {
                        nodeName: node.name,
                        previousStatus: prev.status,
                        currentStatus: node.status
                    }
                );
            }
        });

        // New nodes
        currNodes.forEach(node => {
            if (!prevMap.has(node.name)) {
                logSuccess(`Node joined: ${node.name}`, 'k8s-monitor', {
                    nodeName: node.name,
                    roles: node.roles
                });
            }
        });

        // Removed nodes
        prevNodes.forEach(node => {
            if (!currMap.has(node.name)) {
                logError(`Node left: ${node.name}`, 'k8s-monitor', {
                    nodeName: node.name
                });
            }
        });
    }

    /**
     * Compare deployment states
     */
    compareDeployments(prevDeps, currDeps) {
        const prevMap = new Map(prevDeps.map(d => [d.name, d]));
        const currMap = new Map(currDeps.map(d => [d.name, d]));

        // New deployments
        currDeps.forEach(dep => {
            if (!prevMap.has(dep.name)) {
                logSuccess(`Deployment created: ${dep.name} (${dep.replicas} replicas)`, 'k8s-monitor', {
                    deploymentName: dep.name,
                    replicas: dep.replicas
                });
            }
        });

        // Removed deployments
        prevDeps.forEach(dep => {
            if (!currMap.has(dep.name)) {
                logWarning(`Deployment deleted: ${dep.name}`, 'k8s-monitor', {
                    deploymentName: dep.name
                });
            }
        });

        // Replica changes
        currDeps.forEach(dep => {
            const prev = prevMap.get(dep.name);
            if (prev) {
                if (prev.replicas !== dep.replicas) {
                    logInfo(`Deployment ${dep.name}: replicas ${prev.replicas} → ${dep.replicas}`, 'k8s-monitor', {
                        deploymentName: dep.name,
                        previousReplicas: prev.replicas,
                        currentReplicas: dep.replicas
                    });
                }
                
                if (prev.available !== dep.available) {
                    const level = dep.available === dep.replicas ? 'success' : 'warning';
                    unifiedLogger.log(level, 
                        `Deployment ${dep.name}: ${dep.available}/${dep.replicas} pods available`, 
                        'k8s-monitor',
                        {
                            deploymentName: dep.name,
                            available: dep.available,
                            desired: dep.replicas
                        }
                    );
                }
            }
        });
    }

    /**
     * Log manual operations
     */
    logOperation(operation, resource, details = {}) {
        const messages = {
            'create': `Created ${resource.type}: ${resource.name}`,
            'delete': `Deleted ${resource.type}: ${resource.name}`,
            'update': `Updated ${resource.type}: ${resource.name}`,
            'scale': `Scaled ${resource.type} ${resource.name} to ${details.replicas} replicas`,
            'restart': `Restarted ${resource.type}: ${resource.name}`
        };

        const level = operation === 'delete' ? 'warning' : 
                     operation === 'create' ? 'success' : 'info';

        unifiedLogger.log(level, messages[operation], 'k8s-monitor', {
            operation,
            resourceType: resource.type,
            resourceName: resource.name,
            ...details
        });
    }
}

// Create global monitor instance
window.k8sMonitor = new KubernetesMonitor();

// Auto-start monitoring when logger is ready
if (window.unifiedLogger) {
    setTimeout(() => {
        window.k8sMonitor.startMonitoring();
    }, 1000);
}

console.log('%c📊 Kubernetes Monitor available:', 'font-weight: bold; color: #326CE5');
console.log('  k8sMonitor.startMonitoring()');
console.log('  k8sMonitor.stopMonitoring()');
console.log('  k8sMonitor.logOperation(op, resource, details)');
