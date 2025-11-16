#!/bin/bash

# Load Balancing Demo Launcher

PORT=${1:-8081}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "================================================"
echo "   Kubernetes Load Balancing Demo"
echo "================================================"
echo ""
echo "🎯 Interactive demonstration of load balancing"
echo "   in Kubernetes environments"
echo ""
echo "Starting demo server on port $PORT..."
echo ""
echo "📊 Demo URL: http://localhost:$PORT/load-balancing-demo.html"
echo ""
echo "✨ Features:"
echo "   • Visual request flow animation"
echo "   • Multiple LB algorithms (Round Robin, Least Connections, etc.)"
echo "   • Pod failure simulation"
echo "   • Real-time statistics"
echo "   • HAProxy & Ingress architecture views"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    cd "$SCRIPT_DIR" && python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    cd "$SCRIPT_DIR" && python -m SimpleHTTPServer $PORT
else
    echo "Error: Python is not installed. Please install Python to run the demo."
    exit 1
fi
