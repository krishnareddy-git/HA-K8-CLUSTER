#!/usr/bin/env python3
"""
Kubernetes API Bridge - Provides real cluster data to the dashboard
"""

import json
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class K8sAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            if path == '/api/cluster':
                data = self.get_cluster_data()
            elif path == '/api/pods':
                data = self.get_pods()
            elif path == '/api/services':
                data = self.get_services()
            elif path == '/api/nodes':
                data = self.get_nodes()
            elif path == '/api/deployments':
                data = self.get_deployments()
            else:
                data = {'error': 'Unknown endpoint'}
            
            self.wfile.write(json.dumps(data).encode())
        except Exception as e:
            error_data = {'error': str(e)}
            self.wfile.write(json.dumps(error_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass
    
    def run_kubectl(self, args):
        """Run kubectl command and return output"""
        try:
            result = subprocess.run(
                ['kubectl'] + args,
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout, result.returncode
        except subprocess.TimeoutExpired:
            return '', 1
        except Exception as e:
            return str(e), 1
    
    def get_cluster_data(self):
        """Get overall cluster statistics"""
        # Get nodes
        nodes_output, _ = self.run_kubectl(['get', 'nodes', '--no-headers'])
        nodes = nodes_output.strip().split('\n') if nodes_output else []
        total_nodes = len([n for n in nodes if n])
        ready_nodes = len([n for n in nodes if 'Ready' in n and 'NotReady' not in n])
        
        # Get pods
        pods_output, _ = self.run_kubectl(['get', 'pods', '-A', '--no-headers'])
        pods = pods_output.strip().split('\n') if pods_output else []
        total_pods = len([p for p in pods if p])
        running_pods = len([p for p in pods if 'Running' in p])
        
        # Get services
        services_output, _ = self.run_kubectl(['get', 'services', '-A', '--no-headers'])
        services = services_output.strip().split('\n') if services_output else []
        total_services = len([s for s in services if s])
        
        # Get deployments
        deps_output, _ = self.run_kubectl(['get', 'deployments', '-A', '--no-headers'])
        deployments = deps_output.strip().split('\n') if deps_output else []
        total_deployments = len([d for d in deployments if d])
        ready_deployments = len([d for d in deployments if d and '/' in d and d.split()[2].split('/')[0] == d.split()[2].split('/')[1]])
        
        return {
            'nodes': {
                'total': total_nodes,
                'ready': ready_nodes
            },
            'pods': {
                'running': running_pods,
                'healthy': running_pods,
                'pending': total_pods - running_pods,
                'failed': 0
            },
            'services': {
                'total': total_services
            },
            'deployments': {
                'total': total_deployments,
                'ready': ready_deployments
            },
            'events': self.get_recent_events()
        }
    
    def get_pods(self):
        """Get all pods"""
        output, returncode = self.run_kubectl(['get', 'pods', '-A', '--no-headers'])
        
        if returncode != 0:
            return []
        
        pods = []
        for line in output.strip().split('\n'):
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 5:
                pods.append({
                    'namespace': parts[0],
                    'name': parts[1],
                    'status': parts[3],
                    'restarts': parts[4],
                    'age': parts[5] if len(parts) > 5 else 'Unknown'
                })
        
        return pods
    
    def get_services(self):
        """Get all services"""
        output, returncode = self.run_kubectl(['get', 'services', '-A', '--no-headers'])
        
        if returncode != 0:
            return []
        
        services = []
        for line in output.strip().split('\n'):
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 5:
                services.append({
                    'namespace': parts[0],
                    'name': parts[1],
                    'type': parts[2],
                    'clusterIP': parts[3],
                    'ports': parts[5] if len(parts) > 5 else 'N/A',
                    'age': parts[6] if len(parts) > 6 else 'Unknown'
                })
        
        return services
    
    def get_nodes(self):
        """Get all nodes"""
        output, returncode = self.run_kubectl(['get', 'nodes', '--no-headers'])
        
        if returncode != 0:
            return []
        
        nodes = []
        for line in output.strip().split('\n'):
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 5:
                nodes.append({
                    'name': parts[0],
                    'status': parts[1],
                    'roles': parts[2],
                    'age': parts[3],
                    'version': parts[4],
                    'cpu': 'N/A',
                    'memory': 'N/A'
                })
        
        return nodes
    
    def get_deployments(self):
        """Get all deployments"""
        output, returncode = self.run_kubectl(['get', 'deployments', '-A', '--no-headers'])
        
        if returncode != 0:
            return []
        
        deployments = []
        for line in output.strip().split('\n'):
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 6:
                deployments.append({
                    'namespace': parts[0],
                    'name': parts[1],
                    'ready': parts[2],
                    'upToDate': parts[3],
                    'available': parts[4],
                    'age': parts[5]
                })
        
        return deployments
    
    def get_recent_events(self):
        """Get recent cluster events"""
        output, returncode = self.run_kubectl(['get', 'events', '-A', '--sort-by=.lastTimestamp', '--no-headers'])
        
        if returncode != 0:
            return []
        
        events = []
        lines = output.strip().split('\n')[-5:]  # Last 5 events
        
        for line in lines:
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 6:
                event_type = 'success' if 'Normal' in line else 'warning'
                events.append({
                    'type': event_type,
                    'title': parts[5] if len(parts) > 5 else 'Event',
                    'description': ' '.join(parts[6:]) if len(parts) > 6 else 'No description',
                    'time': parts[0]
                })
        
        return events

def run_server(port=9000):
    """Run the API server"""
    server = HTTPServer(('localhost', port), K8sAPIHandler)
    print(f'🚀 Kubernetes API Bridge running on http://localhost:{port}')
    print(f'📊 Dashboard can now fetch REAL cluster data!')
    print(f'Press Ctrl+C to stop...')
    server.serve_forever()

if __name__ == '__main__':
    port = 9000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    try:
        run_server(port)
    except KeyboardInterrupt:
        print('\n\n✋ Server stopped')
        sys.exit(0)
