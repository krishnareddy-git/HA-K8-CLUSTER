#!/bin/bash

# Start All Dashboards with REAL Kubernetes Data
# This script starts the API bridge, main dashboard, load balancer demo, and log viewer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PORT_API=9000
PORT_DASHBOARD=8080
PORT_LB_DEMO=8081
PORT_LOG_VIEWER=8082

echo "========================================="
echo "  K8s HA Cluster - Dashboard Launcher"
echo "  NOW WITH REAL KUBERNETES DATA!"
echo "========================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed"
    exit 1
fi

echo "📊 Starting all dashboards with REAL Kubernetes data..."
echo ""

# Function to start a simple HTTP server
start_server() {
    local port=$1
    local name=$2
    
    echo "▶️  Starting $name on port $port..."
    cd "$SCRIPT_DIR"
    python3 -m http.server $port > /dev/null 2>&1 &
    local pid=$!
    echo "   PID: $pid"
    echo $pid >> /tmp/k8s-dashboard-pids.txt
}

# Clean up any existing servers
if [ -f /tmp/k8s-dashboard-pids.txt ]; then
    echo "🧹 Cleaning up previous dashboard instances..."
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
        fi
    done < /tmp/k8s-dashboard-pids.txt
    rm /tmp/k8s-dashboard-pids.txt
fi

# Start Kubernetes API Bridge (CRITICAL - provides real data!)
echo "▶️  Starting Kubernetes API Bridge on port $PORT_API..."
cd "$SCRIPT_DIR"
python3 k8s-api-bridge.py > /dev/null 2>&1 &
API_PID=$!
echo "   PID: $API_PID"
echo $API_PID >> /tmp/k8s-dashboard-pids.txt
echo ""
sleep 2

# Start all dashboard servers
start_server $PORT_DASHBOARD "Main Dashboard"
echo ""

start_server $PORT_LB_DEMO "Load Balancer Demo"
echo ""

start_server $PORT_LOG_VIEWER "Log Viewer"
echo ""

echo "========================================="
echo "✅ All dashboards started successfully!"
echo "========================================="
echo ""
echo "📍 Access URLs:"
echo ""
echo "   🔗 Kubernetes API Bridge: http://localhost:$PORT_API/api/cluster"
echo "   🔗 Main Dashboard:        http://localhost:$PORT_DASHBOARD/index.html"
echo "   🔗 Load Balancer Demo:    http://localhost:$PORT_LB_DEMO/load-balancing-demo.html"
echo "   🔗 Log Viewer:            http://localhost:$PORT_LOG_VIEWER/log-viewer.html"
echo ""
echo "🎯 The dashboard now shows REAL DYNAMIC data from your cluster!"
echo "   Create/delete pods and watch the numbers change live!"
echo ""
echo "🛑 To stop all dashboards, run: ./stop-all-dashboards.sh"
echo ""
