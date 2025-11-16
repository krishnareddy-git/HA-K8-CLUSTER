#!/bin/bash

# K8s Dashboard Server Script
# This script starts a simple HTTP server for the dashboard

PORT=${1:-8080}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "================================================"
echo "   HA Kubernetes Cluster Dashboard"
echo "================================================"
echo ""
echo "Starting dashboard server on port $PORT..."
echo ""
echo "Dashboard URL: http://localhost:$PORT"
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
    echo "Error: Python is not installed. Please install Python to run the dashboard."
    exit 1
fi
